(() => {
  const form = document.querySelector("#guide-form");
  const log = document.querySelector("#guide-messages");
  if (!form || !log) return;

  const input = document.querySelector("#guide-input");
  const status = document.querySelector("#guide-status");
  const hint = document.querySelector("#guide-hint");
  const submit = form.querySelector("button[type=submit]");
  const chat = document.querySelector(".guide-chat");
  const laneButtons = [...document.querySelectorAll("[data-guide-lane]")];
  let lane = "about";
  let knowledgePromise;
  const endpoint = String(window.VIRTUAL_CHRIS_CONFIG?.endpoint || "").replace(/\/$/, "");

  if (endpoint) {
    chat.classList.remove("is-preview");
    status.textContent = "Cloudflare AI · source-grounded answers";
    hint.textContent = "Questions aren’t saved by this site · Cloudflare processes the request.";
    document.querySelector(".guide-disclosure").textContent = "AI-generated answers · source links are shown when available · personal project details are added only after Chris confirms them.";
  } else {
    chat.classList.add("is-preview");
  }

  function setLane(nextLane) {
    lane = nextLane === "learn" ? "learn" : "about";
    laneButtons.forEach((button) => {
      const active = button.dataset.guideLane === lane;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    input.placeholder = lane === "learn" ? "Ask about RAG, embeddings, or ML…" : "Ask about my work, projects, or skills…";
    input.focus();
  }

  function addMessage(text, role, sources = [], note = "") {
    const article = document.createElement("article");
    article.className = `guide-message ${role === "user" ? "guide-user" : "guide-assistant"}`;
    const label = document.createElement("span");
    label.className = "message-label";
    label.textContent = role === "user" ? "YOU" : "VIRTUAL CHRIS · AI";
    const paragraph = document.createElement("p");
    paragraph.textContent = text;
    article.append(label, paragraph);

    if (sources.length) {
      const links = document.createElement("div");
      links.className = "guide-sources";
      links.setAttribute("aria-label", "Sources used");
      sources.forEach((source, index) => {
        const link = document.createElement("a");
        link.href = source.url;
        link.target = "_blank";
        link.rel = "noreferrer";
        link.textContent = `[${index + 1}] ${source.title || source.source}`;
        links.append(link);
      });
      article.append(links);
    }
    if (note) {
      const preview = document.createElement("p");
      preview.className = "guide-preview-note";
      preview.textContent = note;
      article.append(preview);
    }
    log.append(article);
    log.scrollTop = log.scrollHeight;
  }

  function showThinking() {
    const item = document.createElement("div");
    item.className = "guide-thinking";
    item.id = "guide-thinking";
    item.setAttribute("role", "status");
    item.append(document.createTextNode("Looking through the notes"));
    for (let i = 0; i < 3; i += 1) item.append(document.createElement("i"));
    log.append(item);
    log.scrollTop = log.scrollHeight;
  }

  function clearThinking() {
    document.querySelector("#guide-thinking")?.remove();
  }

  function tokenize(value) {
    return String(value || "").toLowerCase().match(/[a-z0-9][a-z0-9+#.-]{1,}/g) || [];
  }

  async function localPreview(question) {
    knowledgePromise ||= fetch("./assistant-knowledge.json", { cache: "no-store" }).then((response) => {
      if (!response.ok) throw new Error("The local knowledge notes are unavailable.");
      return response.json();
    });
    const library = await knowledgePromise;
    const terms = [...new Set(tokenize(question))];
    const matches = library.items.filter((item) => item.lane === lane).map((item) => {
      const haystack = tokenize(`${item.title} ${item.content}`);
      const count = terms.reduce((sum, term) => sum + haystack.filter((word) => word === term).length, 0);
      const titleBoost = terms.some((term) => item.title.toLowerCase().includes(term)) ? 2 : 0;
      return { item, score: count + titleBoost };
    }).filter((entry) => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 2);
    if (!matches.length) {
      return {
        answer: lane === "about"
          ? "I don’t have a source for that detail yet. I’m keeping project claims open until Chris confirms them."
          : "I don’t have a matching lesson for that yet. Try RAG, embeddings, retrieval, evaluation, or model training.",
        sources: [],
        note: "Preview mode uses local source matching. Live generative answers connect after the Cloudflare Worker is deployed."
      };
    }
    const lead = matches[0].item;
    return {
      answer: `I found a note that may help: “${lead.content}”`,
      sources: matches.map(({ item }) => ({ title: item.title, source: item.source, url: item.sourceUrl })),
      note: "Source matching preview · this passage is shown directly, not rewritten by an AI model."
    };
  }

  async function ask(question) {
    addMessage(question, "user");
    showThinking();
    submit.disabled = true;
    try {
      let result;
      if (endpoint) {
        const response = await fetch(`${endpoint}/api/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: question, lane })
        });
        result = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(result.error || "The guide could not answer just now.");
      } else {
        result = await localPreview(question);
      }
      clearThinking();
      addMessage(result.answer || "I couldn’t find a grounded answer for that yet.", "assistant", result.sources || [], result.note || "");
    } catch (error) {
      clearThinking();
      addMessage(error.message || "The guide couldn’t reach its knowledge notes. Try again in a moment.", "assistant");
    } finally {
      submit.disabled = false;
      input.focus();
    }
  }

  laneButtons.forEach((button) => button.addEventListener("click", () => setLane(button.dataset.guideLane)));
  document.querySelectorAll("[data-guide-prompt]").forEach((button) => button.addEventListener("click", () => {
    if (button.dataset.guideMode) setLane(button.dataset.guideMode);
    input.value = button.dataset.guidePrompt;
    form.requestSubmit();
  }));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const question = input.value.trim();
    if (!question || submit.disabled) return;
    if (question.length > 700) {
      addMessage("Keep the question under 700 characters and I’ll take a look.", "assistant");
      return;
    }
    input.value = "";
    ask(question);
  });
})();
