(() => {
  const content = window.PORTFOLIO_CONTENT;
  const projectGrid = document.querySelector("#project-grid");
  const experienceList = document.querySelector("#experience-list");
  const skillCloud = document.querySelector("#skill-cloud");
  const credentialsList = document.querySelector("#credentials-list");

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

  const root = document.documentElement;
  const themePicker = document.querySelector(".theme-picker");
  const themeOptions = [...document.querySelectorAll("[data-theme-option]")];
  const availableThemes = new Set(themeOptions.map((option) => option.dataset.themeOption));
  let savedTheme = "dark";
  try {
    const storedTheme = localStorage.getItem("cr-theme");
    if (availableThemes.has(storedTheme)) savedTheme = storedTheme;
  } catch {}
  function setTheme(theme) {
    if (!availableThemes.has(theme)) return;
    root.dataset.theme = theme;
    themeOptions.forEach((option) => option.setAttribute("aria-pressed", String(option.dataset.themeOption === theme)));
    const themeColor = getComputedStyle(root).getPropertyValue("--bg").trim();
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", themeColor);
    try { localStorage.setItem("cr-theme", theme); } catch {}
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

  const revealItems = document.querySelectorAll(".fact, .project-card, .story-step, .timeline-item, .expertise-panel");
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
