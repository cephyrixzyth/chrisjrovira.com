(() => {
  const projectGrid = document.querySelector("#project-grid");
  const filters = [...document.querySelectorAll("[data-filter]")];
  document.querySelector(".filter-row").hidden = false;
  filters.forEach(button => button.addEventListener("click", () => {
    filters.forEach(chip => {
      chip.classList.toggle("is-active", chip === button);
      chip.setAttribute("aria-pressed", String(chip === button));
    });
    const category = button.dataset.filter;
    for (const card of projectGrid.children) {
      card.hidden = category !== "all" && category !== card.dataset.category;
    }
    projectGrid.classList.toggle("is-filtered", category !== "all");
  }));

  const links = [...document.querySelectorAll("[data-story-index]")];
  const chapters = links.map(link => document.getElementById(link.hash.slice(1)));
  const count = document.getElementById("story-count");
  let current = 0;
  function selectChapter(index) {
    current = index;
    chapters.forEach((chapter, i) => {
      chapter.hidden = i !== index;
      links[i].classList.toggle("is-active", i === index);
      if (i === index) links[i].setAttribute("aria-current", "true");
      else links[i].removeAttribute("aria-current");
      if (chapter.hidden) chapter.querySelector("video")?.pause();
    });
    count.textContent = "STORY " + String(index + 1).padStart(2, "0") + " OF " + String(chapters.length).padStart(2, "0");
    const active = links[index], rail = active.parentElement;
    rail.scrollLeft += active.getBoundingClientRect().left - rail.getBoundingClientRect().left - (rail.clientWidth - active.clientWidth) / 2;
  }
  function selectFromHash() {
    const index = links.findIndex(link => link.hash === location.hash || "#" + link.id === location.hash);
    selectChapter(index < 0 ? 0 : index);
  }
  function go(index) {
    const next = (index + chapters.length) % chapters.length;
    if (location.hash !== links[next].hash) history.pushState(null, "", links[next].hash);
    selectChapter(next);
  }
  if (links.length) {
    document.querySelector(".story-rail-controls").hidden = false;
    selectFromHash();
    window.addEventListener("hashchange", selectFromHash);
    window.addEventListener("popstate", selectFromHash);
    links.forEach((link, index) => {
      link.addEventListener("click", event => {
        if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        go(index);
        chapters[index].focus({preventScroll:true});
      });
      link.addEventListener("keydown", event => {
        if (!["ArrowLeft", "ArrowRight"].includes(event.key)) return;
        event.preventDefault();
        go(index + (event.key === "ArrowLeft" ? -1 : 1));
        links[current].focus({preventScroll:true});
      });
    });
    document.getElementById("story-previous").addEventListener("click", () => go(current - 1));
    document.getElementById("story-next").addEventListener("click", () => go(current + 1));
  }

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
  window.matchMedia("(min-width: 681px)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
  menuButton.addEventListener("click", () => {
    const open = menuButton.getAttribute("aria-expanded") !== "true";
    mobileMenu.hidden = !open;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  });
  mobileMenu.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (!mobileMenu.hidden) {
        closeMenu();
        menuButton.focus();
      }
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

})();
