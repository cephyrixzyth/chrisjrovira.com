(() => {
  const content = window.PORTFOLIO_CONTENT;
  const projectGrid = document.querySelector("#project-grid");
  const experienceList = document.querySelector("#experience-list");
  const skillCloud = document.querySelector("#skill-cloud");
  const credentialsList = document.querySelector("#credentials-list");
  const storyMedia = document.querySelector("#story-media");
  const storyDetail = document.querySelector("#story-detail");
  const storyIndex = document.querySelector("#story-index");
  const storyCount = document.querySelector("#story-count");

  const projectCard = (project) => `
    <article class="project-card ${project.featured ? "project-featured" : ""}" data-category="${project.category}">
      <div class="project-visual ${project.visual}">
        <div class="visual-grid" aria-hidden="true"></div>
        <div class="visual-mark" aria-hidden="true">${project.mark}</div>
        <span class="visual-number mono">${project.number} / ${String(content.projects.length).padStart(2, "0")}</span>
        ${project.id === "roku-ops" ? `<div class="visual-pills"><span>ASSETS</span><span>METADATA</span><span>DELIVERY</span></div><div class="visual-monitor"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>` : ""}
        ${project.id === "oneirodex" ? `<div class="mini-library"><span>✳</span><span>◉</span><span>✦</span><span>◈</span><span>⌁</span></div><div class="library-label mono">ONEIRODEX / HOME LIBRARY</div>` : ""}
        ${project.id === "oneirodex-web" ? `<div class="web-preview"><span class="web-preview-nav"></span><span class="web-preview-title"></span><span class="web-preview-title web-preview-title-short"></span><span class="web-preview-button"></span><span class="web-preview-shot"><i></i><i></i><i></i></span></div><div class="library-label mono">A PRODUCT STORY, MADE CLEAR</div>` : ""}
        ${project.id === "launches" ? `<div class="launch-visual-lines"><span>01 / INGEST</span><span>02 / PREPARE</span><span>03 / PLAY</span></div><div class="launch-spark" aria-hidden="true">✳</div>` : ""}
      </div>
      <div class="project-body">
        <div class="project-eyebrow mono"><span></span>${project.eyebrow}</div>
        <h3>${project.title}</h3>
        <p>${project.description}</p>
        <div class="tag-row">${project.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <a class="project-link" href="${project.href}" target="_blank" rel="noreferrer">${project.linkLabel}<span aria-hidden="true">↗</span></a>
      </div>
    </article>`;

  function renderProjects(filter = "all") {
    const visible = content.projects.filter((project) => filter === "all" || project.category === filter);
    projectGrid.innerHTML = visible.map(projectCard).join("");
    projectGrid.classList.toggle("is-filtered", filter !== "all");
  }

  function storyPoster(story, index) {
    return `
      <div class="story-poster ${story.visual}" role="img" aria-label="Artwork for ${story.shortTitle}; a full-width video can be added for this story">
        <div class="story-poster-grid" aria-hidden="true"></div>
        <span class="story-poster-brand mono">CJR <i>·</i> FIELD NOTES</span>
        <span class="story-poster-number" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <div class="story-poster-copy"><span class="mono">${story.eyebrow}</span><strong>${story.shortTitle}</strong></div>
        <span class="story-poster-hint"><i aria-hidden="true"></i> No clip linked yet · story first</span>
      </div>`;
  }

  function renderStory(index = 0) {
    if (!content.stories?.length || !storyMedia || !storyDetail || !storyIndex || !storyCount) return;
    const story = content.stories[index];
    const media = story.media;
    let mediaMarkup = storyPoster(story, index);
    if (media?.type === "video" && media.src) {
      const poster = media.poster ? ` poster="${media.poster}"` : "";
      mediaMarkup = `<video class="story-video" controls playsinline preload="metadata"${poster}><source src="${media.src}" />Your browser does not support embedded video.</video>`;
    } else if (media?.type === "embed" && media.src) {
      mediaMarkup = `<iframe class="story-video" src="${media.src}" title="${story.title}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    }
    storyMedia.innerHTML = mediaMarkup;
    storyDetail.innerHTML = `
      <div class="story-detail-top"><p class="eyebrow"><span class="eyebrow-line"></span>${story.eyebrow}</p><p class="story-highlight">${story.highlight}</p></div>
      <h3>${story.title}</h3>
      <div class="story-detail-copy">${story.paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div>
      ${story.links?.length ? `<div class="story-detail-links" aria-label="Related links">${story.links.map((link) => `<a class="text-link" href="${link.url}" target="_blank" rel="noreferrer">${link.label} <span aria-hidden="true">↗</span></a>`).join("")}</div>` : ""}`;
    storyCount.textContent = `STORY ${String(index + 1).padStart(2, "0")} OF ${String(content.stories.length).padStart(2, "0")}`;
    storyIndex.querySelectorAll("[data-story-index]").forEach((button) => {
      const active = Number(button.dataset.storyIndex) === index;
      button.setAttribute("aria-pressed", String(active));
      button.classList.toggle("is-active", active);
      if (active) {
        const track = button.parentElement;
        const left = button.offsetLeft - track.offsetLeft - (track.clientWidth - button.clientWidth) / 2;
        track.scrollTo({ left, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    });
    storyMedia.dataset.activeStory = story.id;
  }

  function renderStoryIndex() {
    if (!storyIndex || !content.stories?.length) return;
    storyIndex.innerHTML = content.stories.map((story, index) => `
      <button class="story-index-item ${index === 0 ? "is-active" : ""}" type="button" data-story-index="${index}" aria-pressed="${index === 0}">
        <span class="story-index-number mono">${String(index + 1).padStart(2, "0")}</span>
        <span class="story-index-copy"><strong>${story.shortTitle}</strong><span>${story.eyebrow}</span></span>
        <span class="story-index-arrow" aria-hidden="true">↗</span>
      </button>`).join("");
    storyIndex.addEventListener("click", (event) => {
      const button = event.target.closest("[data-story-index]");
      if (button) renderStory(Number(button.dataset.storyIndex));
    });
    storyIndex.addEventListener("keydown", (event) => {
      if (!(["ArrowLeft", "ArrowRight"].includes(event.key))) return;
      const current = event.target.closest("[data-story-index]");
      if (!current) return;
      event.preventDefault();
      const direction = event.key === "ArrowRight" ? 1 : -1;
      const next = (Number(current.dataset.storyIndex) + direction + content.stories.length) % content.stories.length;
      renderStory(next);
      storyIndex.querySelector(`[data-story-index="${next}"]`)?.focus();
    });
    renderStory();
  }

  function renderExperience() {
    experienceList.innerHTML = content.experience.map((item, index) => `
      <article class="timeline-item ${item.current ? "is-current" : ""}">
        <div class="timeline-rail"><span class="timeline-dot"></span>${index < content.experience.length - 1 ? `<span class="timeline-stem"></span>` : ""}</div>
        <div class="timeline-content">
          <div class="timeline-top"><span class="timeline-date mono">${item.dates}</span>${item.current ? `<span class="current-badge"><i></i> PROFILE ROLE</span>` : ""}</div>
          <h3>${item.company}</h3><div class="timeline-role">${item.title}</div><p>${item.summary}</p>
          <details class="timeline-details"><summary>What that looked like <span aria-hidden="true">+</span></summary><ul>${item.points.map((point) => `<li>${point}</li>`).join("")}</ul></details>
        </div>
      </article>`).join("");
  }

  renderProjects();
  renderStoryIndex();
  renderExperience();
  skillCloud.innerHTML = content.skills.map((skill) => `<span>${skill}</span>`).join("");
  credentialsList.innerHTML = content.credentials.map((item) => `<li>${item}</li>`).join("");

  document.querySelectorAll(".filter-chip").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".filter-chip").forEach((chip) => {
        const active = chip === button;
        chip.classList.toggle("is-active", active);
        chip.setAttribute("aria-pressed", String(active));
      });
      renderProjects(button.dataset.filter);
    });
  });

  document.querySelector("#story-previous")?.addEventListener("click", () => {
    const active = Number(storyMedia?.dataset.activeStory ? content.stories.findIndex((story) => story.id === storyMedia.dataset.activeStory) : 0);
    renderStory((active - 1 + content.stories.length) % content.stories.length);
  });
  document.querySelector("#story-next")?.addEventListener("click", () => {
    const active = Number(storyMedia?.dataset.activeStory ? content.stories.findIndex((story) => story.id === storyMedia.dataset.activeStory) : 0);
    renderStory((active + 1) % content.stories.length);
  });

  const root = document.documentElement;
  const themePicker = document.querySelector(".theme-picker");
  const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
  const availableThemes = new Set(themeOptions.map((option) => option.dataset.themeOption));
  let savedTheme = "dark";
  try {
    const storedTheme = localStorage.getItem("cjr-theme") || localStorage.getItem("cr-theme");
    if (availableThemes.has(storedTheme)) savedTheme = storedTheme;
  } catch {}
  function setTheme(theme) {
    if (!availableThemes.has(theme)) return;
    root.dataset.theme = theme;
    themeOptions.forEach((option) => option.setAttribute("aria-pressed", String(option.dataset.themeOption === theme)));
    const themeStyles = getComputedStyle(root);
    const themeColor = themeStyles.getPropertyValue("--bg").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
    const favicon = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
    if (favicon) {
      const background = themeStyles.getPropertyValue("--bg-soft").trim();
      const accent = themeStyles.getPropertyValue("--accent").trim();
      const accent2 = themeStyles.getPropertyValue("--accent-2").trim();
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="${background}"/><text x="32" y="40" text-anchor="middle" fill="${accent}" font-family="Arial,sans-serif" font-size="23" font-weight="800" letter-spacing="-1.4">CJR</text><circle cx="51" cy="46" r="3" fill="${accent2}"/></svg>`;
      favicon.href = `data:image/svg+xml,${encodeURIComponent(svg)}`;
    }
    try { localStorage.setItem("cjr-theme", theme); } catch {}
  }
  setTheme(savedTheme);
  themeOptions.forEach((option) => option.addEventListener("click", () => {
    setTheme(option.dataset.themeOption);
    themePicker.open = false;
    themePicker.querySelector("summary").focus();
  }));
  document.addEventListener("click", (event) => {
    if (!themePicker.contains(event.target)) themePicker.open = false;
  });

  const menuButton = document.querySelector(".menu-toggle");
  const mobileMenu = document.querySelector("#mobile-menu");
  const closeMenu = () => {
    mobileMenu.hidden = true;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
  };
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    mobileMenu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
      if (themePicker.open) {
        themePicker.open = false;
        themePicker.querySelector("summary").focus();
      }
    }
  });

  const copyButton = document.querySelector(".copy-email");
  const copyStatus = document.querySelector(".copy-status");
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.email);
      copyStatus.textContent = "Email copied to clipboard.";
    } catch {
      copyStatus.textContent = copyButton.dataset.email;
    }
    window.setTimeout(() => { copyStatus.textContent = ""; }, 3500);
  });

  document.querySelector("#year").textContent = new Date().getFullYear();

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".desktop-nav a")];
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          navLinks.forEach((link) => link.classList.toggle("is-active", link.hash === `#${entry.target.id}`));
        } else {
          navLinks.find((link) => link.hash === `#${entry.target.id}`)?.classList.remove("is-active");
        }
      });
    }, { rootMargin: "-25% 0px -65% 0px" });
    sections.forEach((section) => observer.observe(section));
  }

  const revealItems = document.querySelectorAll(".fact, .project-card, .story-viewer, .timeline-item, .expertise-panel");
  if ("IntersectionObserver" in window && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealItems.forEach((item) => { item.classList.add("reveal-ready"); revealObserver.observe(item); });
  }
})();
