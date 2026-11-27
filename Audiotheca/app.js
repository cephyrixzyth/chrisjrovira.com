/* Audiotheca site interactions. No dependencies. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ------------------------------------------------------------ Themes
     bg, text, muted and accent come from ui/src/themes/presets.ts in the Audiotheca
     repo; panel is lifted slightly where the app uses the same value as bg. */
  const THEMES = [
    ["tape-room", "Tape Room", "#181817", "#242421", "#fcf6ea", "#c7c2b7", "#ff9a63"],
    ["patch-bay", "Patch Bay", "#0d1815", "#182923", "#edf9ed", "#b5cbbd", "#83efb1"],
    ["paper-archive", "Paper Archive", "#f3ecdf", "#fffaf0", "#30291f", "#665846", "#903e21"],
    ["listening-room", "Listening Room", "#0d1424", "#17243a", "#eff4ff", "#bac9e5", "#9fc7ff"],
    ["audiotheca-green", "Audiotheca Green", "#080b0a", "#0f1412", "#e8f0ec", "#8aa396", "#48e09a"],
    ["midnight-blue", "Midnight Blue", "#060a12", "#0d1320", "#e4eaf5", "#8a9bb8", "#5eb8ff"],
    ["solarized-dark", "Solarized Dark", "#002b36", "#073642", "#fdf6e3", "#93a1a1", "#2aa198"],
    ["dracula", "Dracula", "#1e1f29", "#282a36", "#f8f8f2", "#bd93f9", "#ff79c6"],
    ["nord", "Nord", "#2e3440", "#3b4252", "#eceff4", "#d8dee9", "#88c0d0"],
    ["amber-terminal", "Amber Terminal", "#0a0804", "#16120a", "#ffd080", "#c9a050", "#ffb020"],
    ["rose-dusk", "Rose Dusk", "#120c10", "#1e1520", "#f5e8ee", "#c8a0b0", "#f0a0c0"],
    ["graphite-light", "Graphite Light", "#f4f5f7", "#ffffff", "#1a1e24", "#5a6470", "#1a8a5c"],
    ["tokyo-night", "Tokyo Night", "#1a1b26", "#1f2335", "#c0caf5", "#9aa5ce", "#7aa2f7"],
    ["catppuccin-mocha", "Catppuccin Mocha", "#1e1e2e", "#262637", "#cdd6f4", "#a6adc8", "#cba6f7"],
    ["gruvbox-dark", "Gruvbox Dark", "#282828", "#32302f", "#ebdbb2", "#bdae93", "#fabd2f"],
    ["one-dark-pro", "One Dark Pro", "#282c34", "#2f343d", "#abb2bf", "#828997", "#61afef"],
    ["monokai-pro", "Monokai Pro", "#2d2a2e", "#363337", "#fcfcfa", "#939293", "#ffd866"],
    ["cyberpunk-neon", "Cyberpunk Neon", "#0a0612", "#140c20", "#f0e8ff", "#b898d8", "#ff2a6d"],
    ["forest-moss", "Forest Moss", "#0c120e", "#141e18", "#dce8dc", "#94b094", "#8ec840"],
    ["ocean-deep", "Ocean Deep", "#041018", "#0a1c2a", "#d0e8f8", "#78a8c8", "#20d0c0"],
    ["lavender-haze", "Lavender Haze", "#141018", "#1e1826", "#ece4f4", "#b8a8c8", "#c090e8"],
    ["high-contrast-mono", "High Contrast Mono", "#000000", "#0d0d0d", "#ffffff", "#c0c0c0", "#ffffff"],
  ].map(([id, name, bg, panel, text, muted, accent]) => ({ id, name, bg, panel, text, muted, accent }));

  const luminance = (hex) => {
    const n = parseInt(hex.slice(1), 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
  };

  function applyTheme(id, persist) {
    const t = THEMES.find((x) => x.id === id) || THEMES[0];
    const root = document.documentElement;
    for (const k of ["bg", "panel", "text", "muted", "accent"]) root.style.setProperty(`--${k}`, t[k]);
    root.dataset.theme = t.id;
    if (luminance(t.bg) > 0.5) root.setAttribute("data-light", ""); else root.removeAttribute("data-light");
    // Accent-on-accent text: dark ink unless the accent itself is dark.
    root.style.setProperty("--accent-ink", luminance(t.accent) > 0.55 ? (luminance(t.bg) > 0.5 ? "#111" : t.bg) : "#fff");
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t.bg;
    $$(".theme-card").forEach((c) => c.setAttribute("aria-checked", String(c.dataset.id === t.id)));
    if (persist) store.set("audiotheca-site-theme", t.id);
    drawWave && drawWave();
  }

  const grid = $("#themeGrid");
  THEMES.forEach((t) => {
    const b = document.createElement("button");
    b.className = "theme-card reveal";
    b.type = "button";
    b.setAttribute("role", "radio");
    b.dataset.id = t.id;
    b.innerHTML = `<img src="assets/rooms/${t.id}.webp" alt="" loading="lazy" width="488" height="488">
      <span class="meta"><b>${esc(t.name)}</b><span class="sw">${[t.bg, t.panel, t.accent, t.text].map((c) => `<i style="background:${c}"></i>`).join("")}</span></span>`;
    b.addEventListener("click", () => applyTheme(t.id, true));
    grid.appendChild(b);
  });

  /* ------------------------------------------------------------ Nav */
  const menuBtn = $("#menuToggle"), nav = $("#mainnav");
  menuBtn.addEventListener("click", () => {
    const open = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(open));
  });
  $$("a", nav).forEach((a) => a.addEventListener("click", () => { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); }));
  const navLinks = new Map($$("a", nav).map((a) => [a.getAttribute("href").slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      navLinks.forEach((a) => a.classList.remove("active"));
      const id = e.target.id === "walkthroughs" ? "tour" : e.target.id === "safety" ? "install" : e.target.id;
      navLinks.get(id)?.classList.add("active");
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$("main section[id]").forEach((s) => spy.observe(s));

  /* ------------------------------------------------------------ Hero waveform */
  const heroCanvas = $("#heroWave");
  let drawWave = null;
  if (heroCanvas) {
    const ctx = heroCanvas.getContext("2d");
    let w = 0, h = 0, t0 = performance.now();
    const resize = () => {
      const dpr = Math.min(devicePixelRatio || 1, 2);
      w = heroCanvas.clientWidth; h = heroCanvas.clientHeight;
      heroCanvas.width = w * dpr; heroCanvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    drawWave = (now = performance.now()) => {
      const t = (now - t0) / 1000;
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim();
      ctx.clearRect(0, 0, w, h);
      const bars = Math.floor(w / 6);
      ctx.fillStyle = accent;
      for (let i = 0; i < bars; i++) {
        const x = i * 6;
        const env = Math.sin((i / bars) * Math.PI);
        const a = Math.abs(Math.sin(i * 0.21 + t * 1.6) * Math.cos(i * 0.053 - t * 0.7)) * env;
        const bh = 4 + a * (h * 0.75);
        ctx.globalAlpha = 0.25 + a * 0.6;
        ctx.fillRect(x, h - bh, 3, bh);
      }
      ctx.globalAlpha = 1;
    };
    resize();
    addEventListener("resize", resize);
    if (reduceMotion) drawWave();
    else {
      let visible = true;
      new IntersectionObserver(([e]) => { visible = e.isIntersecting; }).observe(heroCanvas);
      const loop = (now) => { if (visible) drawWave(now); requestAnimationFrame(loop); };
      requestAnimationFrame(loop);
    }
  }

  /* ------------------------------------------------------------ Dry scan demo
     Vendors and products are fictional. */
  const ITEMS = [
    { id: "synth", name: "SynthOne", ico: "▸", vendor: "AcmeAudio", product: "SynthOne 2.0", method: "PE header", tier: "HIGH", route: "a/AcmeAudio/SynthOne", dupe: "synth" },
    { id: "synthcopy", name: "SynthOne Copy", ico: "▸", vendor: "AcmeAudio", product: "SynthOne 2.0", method: "hash match", tier: "HIGH", route: null, dupe: "synth" },
    { id: "orbit30", name: "Orbit Reverb 3.0", ico: "▸", vendor: "Northwind", product: "Orbit Reverb", method: "filename", tier: "HIGH", route: "b/Northwind/Orbit Reverb 3.0", dupe: "orbit" },
    { id: "orbit32", name: "Orbit.Reverb.v3.2.x64-SCENE", ico: "▸", vendor: "Northwind", product: "Orbit Reverb", method: "NFO text", tier: "HIGH", route: "b/Northwind/Orbit Reverb 3.2", dupe: "orbit", rename: "Orbit Reverb 3.2" },
    { id: "hash", name: "a3f9c2e1d07b44f1", ico: "▸", vendor: "Meridian Sound", product: "Tidal Drums 1.4", method: "archive peek", tier: "MEDIUM", route: "=/Meridian Sound/Tidal Drums 1.4", needsPeek: true, rename: "Tidal Drums 1.4" },
    { id: "rar", name: "Tidal_Drums_1.4.rar", ico: "▤", vendor: "Meridian Sound", product: "Tidal Drums 1.4", method: "archive peek", tier: "HIGH", route: null, needsPeek: true, redundantOf: "hash" },
    { id: "7z", name: "Strings_Lite_Kontakt.7z", ico: "▤", vendor: "Halcyon", product: "Strings Lite", method: "archive peek", tier: "HIGH", route: "=/Halcyon/Strings Lite", needsPeek: true },
    { id: "exe", name: "Setup_x64_final(2).exe", ico: "◆", vendor: null, product: null, method: "no match", tier: "LOW", route: null, suggest: "Velvet Keys 1.1 by Halcyon" },
    { id: "nfo", name: "readme_FIRST.nfo", ico: "≡", vendor: null, product: null, method: "loose file", tier: "LOW", route: null, suggest: "Attach to Strings Lite" },
    { id: "under", name: "_8Dio", ico: "▸", skipped: true },
  ];
  const PHASES = [
    { id: "walk", name: "Walk library", ms: 900 },
    { id: "identify", name: "Identify vendors", ms: 1500 },
    { id: "peek", name: "Archive peek", ms: 1300, skippable: true },
    { id: "dedupe", name: "Find duplicates", ms: 1100, skippable: true },
    { id: "route", name: "Plan routes", ms: 900, skippable: true },
    { id: "report", name: "Write report", ms: 600 },
  ];
  const tree = $("#demoTree"), phaseList = $("#phaseList"), log = $("#demoLog"), results = $("#results");
  const runBtn = $("#runScan"), resetBtn = $("#resetScan"), dry = $("#dryToggle"), eta = $("#demoEta");
  const skipped = new Set();
  let state = null; // results after a run
  let running = false;
  let activeTab = "routes";

  function renderTree(applied) {
    if (applied) {
      const lines = [];
      ITEMS.forEach((it) => {
        if (it.skipped) lines.push({ ico: "▸", name: it.name, tag: "skipped", cls: "" });
      });
      state.routes.filter((r) => r.approved).forEach((r) => lines.push({ ico: "▸", name: r.to, tag: "moved", cls: "ok" }));
      state.dupeStaged.forEach((n) => lines.push({ ico: "▸", name: `_delete-canidates/${n}`, tag: "staged", cls: "warn" }));
      state.inv.forEach((i) => lines.push({ ico: "◆", name: `_requiresinvestigation/${i.name}`, tag: "review", cls: "warn" }));
      tree.innerHTML = lines.map((l) => `<li class="done"><span class="ico">${l.ico}</span><span class="name" title="${esc(l.name)}">${esc(l.name)}</span><span class="tag ${l.cls}">${l.tag}</span></li>`).join("");
      return;
    }
    tree.innerHTML = ITEMS.map((it) => `<li data-id="${it.id}"><span class="ico">${it.ico}</span><span class="name" title="${esc(it.name)}">${esc(it.name)}</span><span class="tag"></span></li>`).join("");
  }

  function renderPhases() {
    phaseList.innerHTML = PHASES.map((p) => `<li data-phase="${p.id}" class="${skipped.has(p.id) ? "skipped" : ""}">
      <span class="st">○</span><span>${p.name}</span>
      ${p.skippable ? `<button class="skip-btn" type="button" data-skip="${p.id}" aria-pressed="${skipped.has(p.id)}">${skipped.has(p.id) ? "include" : "skip"}</button>` : "<span></span>"}
      <span class="bar"><i></i></span></li>`).join("");
  }
  phaseList.addEventListener("click", (e) => {
    const b = e.target.closest("[data-skip]");
    if (!b || running) return;
    const id = b.dataset.skip;
    skipped.has(id) ? skipped.delete(id) : skipped.add(id);
    renderPhases();
  });

  const logLine = (html) => { log.innerHTML += html + "\n"; log.scrollTop = log.scrollHeight; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduceMotion ? Math.min(ms, 60) : ms));
  const tagItem = (id, text, cls) => {
    const li = $(`li[data-id="${id}"]`, tree);
    if (!li) return;
    const tag = $(".tag", li);
    tag.textContent = text; tag.className = `tag ${cls || ""}`;
    li.classList.remove("scanning"); li.classList.add("done");
  };

  async function runPhase(p, fn) {
    const li = $(`li[data-phase="${p.id}"]`, phaseList);
    if (skipped.has(p.id)) { logLine(`<span class="warn">skip</span>  ${p.name}`); return; }
    li.classList.add("active"); $(".st", li).textContent = "◐";
    const bar = $(".bar i", li);
    logLine(`<span class="hl">phase</span> ${p.name}`);
    const steps = 10;
    const extra = fn ? fn() : null;
    for (let i = 1; i <= steps; i++) {
      bar.style.width = `${i * 10}%`;
      eta.textContent = `${p.name} · ETA ${Math.max(0, ((steps - i) * p.ms) / steps / 1000).toFixed(1)}s`;
      if (extra && extra[i - 1]) extra[i - 1]();
      await sleep(p.ms / steps);
    }
    li.classList.remove("active"); li.classList.add("done"); $(".st", li).textContent = "✓";
  }

  async function runScan() {
    if (running) return;
    running = true; runBtn.disabled = true; resetBtn.hidden = true;
    log.innerHTML = ""; state = null; renderTree(); renderPhases();
    results.innerHTML = `<p class="empty">Scanning…</p>`;
    const peek = !skipped.has("peek"), dedupe = !skipped.has("dedupe"), route = !skipped.has("route");
    logLine(`audiotheca ${dry.checked ? "--dry-run" : "--live (confirm_live required)"} · root=/library/_software/_audio`);

    await runPhase(PHASES[0], () => ITEMS.map((it) => () => {
      const li = $(`li[data-id="${it.id}"]`, tree); li?.classList.add("scanning");
      if (it.skipped) { tagItem(it.id, "skipped", ""); logLine(`  skip  ${it.name} (underscore folder)`); }
    }));
    await runPhase(PHASES[1], () => ITEMS.filter((i) => !i.skipped).map((it) => () => {
      if (it.needsPeek && !peek) { tagItem(it.id, "needs peek", "warn"); logLine(`  ?     ${it.name} → NEEDS_PEEK`); return; }
      if (it.needsPeek) return; // identified during peek
      if (!it.vendor) { tagItem(it.id, "unknown", "bad"); logLine(`  ?     ${it.name} → unknown`); return; }
      tagItem(it.id, it.vendor, "ok"); logLine(`  id    ${it.name} → <span class="ok">${it.vendor}</span> (${it.method}, ${it.tier})`);
    }));
    await runPhase(PHASES[2], () => ITEMS.filter((i) => i.needsPeek).map((it) => () => {
      tagItem(it.id, it.vendor, "ok"); logLine(`  peek  ${it.name} → <span class="ok">${it.product}</span> (no extraction)`);
    }));
    await runPhase(PHASES[3], () => [() => {
      logLine(`  dup   SynthOne ≡ SynthOne Copy  <span class="warn">SAME_VERSION, HIGH</span>`);
      tagItem("synthcopy", "duplicate", "warn");
    }, null, () => {
      logLine(`  dup   Orbit Reverb 3.0 → 3.2  <span class="warn">VERSION_UPGRADE</span>`);
    }, null, () => {
      if (peek) { logLine(`  arch  Tidal_Drums_1.4.rar matches extracted folder → redundant`); tagItem("rar", "redundant", "warn"); }
    }]);
    await runPhase(PHASES[4]);
    await runPhase(PHASES[5], () => [null, null, () => logLine(`<span class="ok">report</span> dedupe_reports/Run_Summary_${new Date().toISOString().slice(0, 10).replace(/-/g, "")}.txt`)]);

    // Build results
    const known = (it) => !it.skipped && it.vendor && (!it.needsPeek || peek);
    state = {
      live: !dry.checked,
      routes: route ? ITEMS.filter((it) => known(it) && it.route).map((it) => ({ id: it.id, from: it.name, to: it.route, why: `${it.vendor} · ${it.method} · ${it.tier}${it.rename ? " · scene rename" : ""}`, approved: false })) : [],
      dupes: dedupe ? [
        { key: "acme-synthone", kind: "SAME_VERSION", tier: "HIGH", members: [{ n: "SynthOne", sz: "120.4 MB", pick: true }, { n: "SynthOne Copy", sz: "120.4 MB" }] },
        { key: "northwind-orbit-reverb", kind: "VERSION_UPGRADE", tier: "HIGH", members: [{ n: "Orbit Reverb 3.0", sz: "84.1 MB" }, { n: "Orbit.Reverb.v3.2.x64-SCENE", sz: "86.7 MB", pick: true }] },
        ...(peek ? [{ key: "meridian-tidal-drums", kind: "ARCHIVE_EXTRACTED", tier: "HIGH", members: [{ n: "a3f9c2e1d07b44f1", sz: "2.31 GB", pick: true }, { n: "Tidal_Drums_1.4.rar", sz: "2.29 GB" }] }] : []),
      ] : [],
      inv: ITEMS.filter((it) => !it.skipped && !known(it)).map((it) => ({ id: it.id, name: it.name, why: it.vendor ? "Archive not peeked. Run again with archive peek on." : it.id === "exe" ? "No vendor in filename, PE header or archive listing." : "Loose file with no product folder.", suggest: it.suggest, resolved: null })),
      dupeStaged: [],
    };
    eta.textContent = "complete";
    running = false; runBtn.disabled = false; resetBtn.hidden = false;
    runBtn.textContent = dry.checked ? "Run dry scan again" : "Run live scan again";
    renderResults();
  }

  function dupeFate(g) {
    const keep = g.members.find((m) => m.pick);
    return g.members.map((m) => ({ ...m, fate: m === keep ? "keep" : "stage" }));
  }

  function renderResults() {
    $$("#resultTabs button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === activeTab)));
    if (!state) return;
    let html = "";
    if (activeTab === "routes") {
      if (!state.routes.length) html = `<p class="empty">Route planning was skipped. Include it in the processing flow and run again.</p>`;
      else {
        html = state.routes.map((r, i) => `<div class="route" style="animation-delay:${i * 60}ms"><span class="from">${esc(r.from)}</span><span class="to">${esc(r.to)}</span><span class="why">${esc(r.why)}${r.approved ? ' · <b style="color:var(--ok)">moved</b>' : ""}</span></div>`).join("");
        html += state.live
          ? (state.routes.every((r) => r.approved)
              ? `<div class="summary"><b>Section executed.</b> Moves applied to the library on the left. Duplicates you staged are in <b>_delete-canidates</b>.</div>`
              : `<div class="live-note">Live run. Approving executes these moves for real (<code>confirm_live: true</code>).<div class="cta-row" style="margin-top:10px"><button class="btn btn-primary btn-sm" id="approveAll">Approve section and execute</button></div></div>`)
          : `<div class="summary"><b>${state.routes.length} proposed moves.</b> Dry run, so nothing moved. Turn dry run off and run again to approve sections.</div>`;
      }
    } else if (activeTab === "dupes") {
      if (!state.dupes.length) html = `<p class="empty">Duplicate detection was skipped this run.</p>`;
      else {
        html = state.dupes.map((g, gi) => `<div class="dupe-group" style="animation-delay:${gi * 80}ms"><header><b>${g.key}</b><span class="pill">${g.tier}</span><span class="pill">${g.kind}</span></header>
          ${dupeFate(g).map((m, mi) => `<label class="keeper ${m.fate}"><input type="radio" name="g${gi}" data-g="${gi}" data-m="${mi}" ${m.pick ? "checked" : ""}><span class="mono">${esc(m.n)}</span><span class="kmeta"><span class="sz">${m.sz}</span><span class="fate">${m.fate === "keep" ? "keeper" : "→ staging"}</span></span></label>`).join("")}</div>`).join("");
        const n = state.dupes.reduce((a, g) => a + g.members.length - 1, 0);
        html += `<div class="summary">${state.dupes.length} groups · <b>${n}</b> copies would move to <b>_delete-canidates</b>, never deleted. Pick a different keeper to change the plan.</div>`;
      }
    } else {
      if (!state.inv.length) html = `<p class="empty">Nothing needs investigation. Everything was identified.</p>`;
      else html = state.inv.map((it, i) => `<div class="inv ${it.resolved ? "resolved" : ""}" style="animation-delay:${i * 60}ms"><span class="tag warn" style="opacity:1;transform:none">?</span><div>
        <div class="name">${esc(it.name)}</div><p>${it.resolved ? esc(it.resolved) : esc(it.why)}</p>
        ${it.resolved ? "" : `<div class="acts">${it.suggest ? `<button data-inv="${i}" data-act="accept">Accept: ${esc(it.suggest)}</button>` : ""}<button data-inv="${i}" data-act="vendor">Set vendor…</button><button data-inv="${i}" data-act="leave">Leave for later</button></div>`}
      </div></div>`).join("");
    }
    results.innerHTML = html;
  }

  results.addEventListener("change", (e) => {
    const r = e.target.closest("input[data-g]");
    if (!r) return;
    const g = state.dupes[+r.dataset.g];
    g.members.forEach((m, i) => { m.pick = i === +r.dataset.m; });
    renderResults();
  });
  results.addEventListener("click", (e) => {
    if (e.target.id === "approveAll") {
      state.routes.forEach((r) => { r.approved = true; });
      state.dupeStaged = state.dupes.flatMap((g) => dupeFate(g).filter((m) => m.fate === "stage").map((m) => m.n));
      state.inv = state.inv.filter((i) => !i.resolved || i.resolved.startsWith("Left"));
      renderTree(true);
      logLine(`<span class="ok">live</span>  executed ${state.routes.length} approved moves · staged ${state.dupeStaged.length} duplicates`);
      renderResults();
      return;
    }
    const b = e.target.closest("[data-inv]");
    if (!b) return;
    const it = state.inv[+b.dataset.inv];
    if (b.dataset.act === "accept") it.resolved = `Accepted: ${it.suggest}. Saved to feedback for the next run.`;
    else if (b.dataset.act === "vendor") it.resolved = "Vendor set to Halcyon. Saved to dedupe_reports/feedback/.";
    else it.resolved = "Left in _requiresinvestigation for later.";
    renderResults();
  });
  $("#resultTabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-tab]");
    if (!b) return;
    activeTab = b.dataset.tab; renderResults();
  });
  dry.addEventListener("change", () => {
    $(".switch-label").textContent = dry.checked ? "Dry run" : "Live (confirm)";
    runBtn.textContent = dry.checked ? "Run dry scan" : "Run live scan";
  });
  runBtn.addEventListener("click", runScan);
  resetBtn.addEventListener("click", () => {
    state = null; log.innerHTML = ""; eta.textContent = "idle"; resetBtn.hidden = true;
    runBtn.textContent = dry.checked ? "Run dry scan" : "Run live scan";
    renderTree(); renderPhases();
    results.innerHTML = `<p class="empty">Run the scan to see proposed moves, duplicate groups and anything that needs a human.</p>`;
  });
  renderTree(); renderPhases();
  log.textContent = "Waiting. Skip phases above if you like, then press run.";

  /* ------------------------------------------------------------ Tour */
  const TOUR = [
    { id: "dashboard", name: "Dashboard", sub: "Your stations at a glance", shots: [
      ["ui-overview", "Overview", "Workspace stations, recent scans and review queues."],
      ["dashboard-gauges", "Run analysis", "Route-ready and identification gauges, throughput tiles and reorderable widgets."] ] },
    { id: "scan", name: "Scan", sub: "Flows, phases, live log", shots: [
      ["scan-panel", "Processing flow", "Processing flow presets, skippable phases, a live WebSocket log and the AI lookup analyzer."] ] },
    { id: "review", name: "Review", sub: "Triage before anything moves", shots: [
      ["investigation-inbox", "Investigation", "Investigation inbox with bucket chips and a bucket filter."],
      ["investigation-lookup", "Lookup", "Investigation lookup with web search, tag generation, NFO parsing and an anonymization gate."],
      ["duplicates-review", "Duplicates", "A duplicate group with keeper selection and a stage-delete preview."],
      ["restructure-preview", "Restructure", "Planned vendor-folder moves with a destination preview before live execute."],
      ["scene-renames", "Scene renames", "Hash folder to product name renames with per-item approval."],
      ["skipped-files", "Skipped", "Scan failures, coverage gaps, cache hits, coexistence and targeted rescans."] ] },
    { id: "library", name: "Library", sub: "Browse, peek, audition", shots: [
      ["file-explorer", "Explorer", "Folder tree, inline archive listing and the audio preview strip on WAV rows."],
      ["audio-preview", "Audio preview", "The library inspector while auditioning a selected WAV."],
      ["archive-diff-wizard", "Archive diff", "Diff wizard comparing archive contents to an extracted sibling folder."],
      ["dropzone-overlay", "DropZone", "The result of dropping a folder and an archive into the library."] ] },
    { id: "studio", name: "Studio", sub: "Arrange and mix in 3D", shots: [
      ["spatial-studio", "Spatial studio", "Arrange clips on a timeline, place speakers in a listening room, and export a stereo WAV. WebXR ready."] ] },
    { id: "system", name: "System", sub: "Security and environment", shots: [
      ["security-malware", "Security", "Malware heuristics and ClamAV scan setup for the local library."],
      ["environment-themes", "Theme studio", "Theme studio and toolchain health panels."],
      ["environment-spec-catalog", "Spec catalog", "The 94-code architecture spec registry with status per code."] ] },
    { id: "help", name: "Help", sub: "Offline field guide", shots: [
      ["help-panel", "Field guide", "Searchable offline task guides with screenshots and walkthroughs."] ] },
  ];
  const tourNav = $("#tourNav"), tourImg = $("#tourImg"), tourCap = $("#tourCaption"), tourSub = $("#tourSub"), tourUrl = $("#tourUrl");
  let tourSec = 0, tourShot = 0;
  tourNav.innerHTML = TOUR.map((s, i) => `<button role="tab" aria-selected="${i === 0}" data-i="${i}">${s.name}<small>${s.sub}</small></button>`).join("");
  function showTour(si, hi = 0) {
    tourSec = si; tourShot = hi;
    const s = TOUR[si], [file, label, cap] = s.shots[hi];
    $$("button", tourNav).forEach((b, i) => b.setAttribute("aria-selected", String(i === si)));
    tourSub.innerHTML = s.shots.length > 1 ? s.shots.map((x, i) => `<button class="chip" role="tab" aria-selected="${i === hi}" data-h="${i}">${x[1]}</button>`).join("") : "";
    tourUrl.textContent = `localhost:4210/#/${s.id}${s.shots.length > 1 ? "/" + label.toLowerCase().replace(/\s+/g, "-") : ""}`;
    tourCap.textContent = cap;
    tourImg.classList.add("fading");
    const next = new Image();
    next.onload = () => { tourImg.src = next.src; tourImg.alt = `${s.name}: ${cap}`; tourImg.classList.remove("fading"); };
    next.src = `assets/shots/${file}.webp`;
  }
  tourNav.addEventListener("click", (e) => { const b = e.target.closest("button[data-i]"); if (b) showTour(+b.dataset.i); });
  tourNav.addEventListener("keydown", (e) => {
    if (!["ArrowDown", "ArrowUp", "ArrowLeft", "ArrowRight"].includes(e.key)) return;
    e.preventDefault();
    const d = e.key === "ArrowDown" || e.key === "ArrowRight" ? 1 : -1;
    const n = (tourSec + d + TOUR.length) % TOUR.length;
    showTour(n); $$("button", tourNav)[n].focus();
  });
  tourSub.addEventListener("click", (e) => { const b = e.target.closest("button[data-h]"); if (b) showTour(tourSec, +b.dataset.h); });
  $("#tourFigure .window").addEventListener("click", () => openLightbox(tourImg.src, tourCap.textContent));
  showTour(0);

  /* ------------------------------------------------------------ Video playlist */
  const VIDEOS = [
    ["first-scan-walkthrough", "Start a dry scan and read its report"],
    ["scan-phases-and-flow", "Scan phases and processing flow presets"],
    ["investigation-and-vendors", "Investigation triage and vendor keywords"],
    ["investigation-lookup", "Investigation lookup"],
    ["restructure-live-staging", "Restructure preview and staged live execute"],
    ["file-explorer-and-archives", "File explorer and archive peek"],
    ["archive-diff-wizard", "Archive diff wizard"],
    ["audio-preview-library", "Audition a library recording"],
    ["ai-lookup-review", "Review a local identification suggestion"],
    ["security-and-space-recovery", "Security scan and space recovery"],
    ["environment-and-spec-catalog", "Environment, cloud and spec catalog"],
    ["spatial-studio-mix", "Trim and solo a take in the spatial studio"],
  ];
  const video = $("#video"), playlist = $("#playlist"), vcap = $("#videoCaption");
  playlist.innerHTML = VIDEOS.map(([, t], i) => `<li><button data-v="${i}" aria-current="${i === 0}"><span>${String(i + 1).padStart(2, "0")}</span>${t}</button></li>`).join("");
  vcap.textContent = VIDEOS[0][1];
  playlist.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-v]");
    if (!b) return;
    const [file, title] = VIDEOS[+b.dataset.v];
    $$("button", playlist).forEach((x) => x.setAttribute("aria-current", String(x === b)));
    video.removeAttribute("poster");
    video.src = `assets/videos/${file}.mp4`;
    vcap.textContent = title;
    video.play().catch(() => {});
  });

  /* ------------------------------------------------------------ Audio preview (Web Audio) */
  const LOOPS = {
    kick: { file: "kick_120bpm_C.wav", key: "C maj", root: 65.41, pattern: [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0], kind: "kick" },
    keys: { file: "glass_keys_Am.wav", key: "A min", root: 220, pattern: [1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0], kind: "keys", notes: [0, 3, 7, 10, 12, 7, 3, 0] },
    pulse: { file: "brush_pulse_D.wav", key: "D dor", root: 146.83, pattern: [1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1], kind: "pulse" },
  };
  let loopId = "kick", actx = null, master = null, analyser = null, playing = false, step = 0, nextTime = 0, timer = null;
  const tempoEl = $("#tempo"), pitchEl = $("#pitch"), playBtn = $("#playBtn"), wc = $("#waveCanvas");
  const wctx = wc.getContext("2d");
  const semis = () => +pitchEl.value;
  const KEYS = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
  function shiftKey(k, s) {
    const [n, mode] = k.split(" ");
    return `${KEYS[(KEYS.indexOf(n) + s + 120) % 12]} ${mode}`;
  }
  function updateBadges() {
    $("#tempoVal").textContent = tempoEl.value;
    $("#pitchVal").textContent = `${semis() > 0 ? "+" : ""}${semis()} st`;
    $("#badgeBpm").textContent = `${tempoEl.value} BPM`;
    $("#badgeKey").textContent = shiftKey(LOOPS[loopId].key, semis());
    $("#inspFile").textContent = LOOPS[loopId].file;
    if (!playing) drawStatic();
  }
  function voice(time, i) {
    const L = LOOPS[loopId], ratio = Math.pow(2, semis() / 12);
    const o = actx.createOscillator(), g = actx.createGain();
    o.connect(g); g.connect(master);
    if (L.kind === "kick") {
      o.type = "sine";
      o.frequency.setValueAtTime(L.root * 2.4 * ratio, time);
      o.frequency.exponentialRampToValueAtTime(L.root * ratio * 0.7, time + 0.12);
      g.gain.setValueAtTime(0.9, time); g.gain.exponentialRampToValueAtTime(0.001, time + 0.35);
      o.start(time); o.stop(time + 0.4);
    } else if (L.kind === "keys") {
      o.type = "triangle";
      const n = L.notes[(i / 2 | 0) % L.notes.length];
      o.frequency.setValueAtTime(L.root * ratio * Math.pow(2, n / 12), time);
      g.gain.setValueAtTime(0.0001, time); g.gain.exponentialRampToValueAtTime(0.35, time + 0.01); g.gain.exponentialRampToValueAtTime(0.001, time + 0.6);
      o.start(time); o.stop(time + 0.65);
    } else {
      // Filtered noise burst for a brush pulse
      o.disconnect();
      const len = actx.sampleRate * 0.12, buf = actx.createBuffer(1, len, actx.sampleRate), d = buf.getChannelData(0);
      for (let j = 0; j < len; j++) d[j] = (Math.random() * 2 - 1) * (1 - j / len);
      const src = actx.createBufferSource(), f = actx.createBiquadFilter();
      src.buffer = buf; f.type = "bandpass"; f.frequency.value = L.root * 16 * ratio; f.Q.value = 1.2;
      src.connect(f); f.connect(g); g.gain.value = i % 4 === 0 ? 0.9 : 0.45;
      src.start(time);
    }
  }
  function schedule() {
    const spb = 60 / +tempoEl.value / 4; // 16th notes
    while (nextTime < actx.currentTime + 0.12) {
      if (LOOPS[loopId].pattern[step % 16]) voice(nextTime, step % 16);
      nextTime += spb; step++;
    }
  }
  function drawLive() {
    if (!playing) return;
    const css = getComputedStyle(document.documentElement);
    const w = wc.width = wc.clientWidth * 2, h = wc.height = 280;
    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    wctx.clearRect(0, 0, w, h);
    wctx.strokeStyle = css.getPropertyValue("--accent").trim(); wctx.lineWidth = 3;
    wctx.beginPath();
    for (let i = 0; i < data.length; i++) {
      const x = (i / data.length) * w, y = (data[i] / 255) * h;
      i ? wctx.lineTo(x, y) : wctx.moveTo(x, y);
    }
    wctx.stroke();
    // playhead
    const pos = ((step % 16) / 16) * w;
    wctx.fillStyle = css.getPropertyValue("--text").trim(); wctx.globalAlpha = 0.5;
    wctx.fillRect(pos, 0, 2, h); wctx.globalAlpha = 1;
    requestAnimationFrame(drawLive);
  }
  function drawStatic() {
    const css = getComputedStyle(document.documentElement);
    const w = wc.width = wc.clientWidth * 2, h = wc.height = 280, L = LOOPS[loopId];
    wctx.clearRect(0, 0, w, h);
    wctx.fillStyle = css.getPropertyValue("--accent").trim();
    const bars = 160;
    for (let i = 0; i < bars; i++) {
      const s = Math.floor((i / bars) * 16), local = ((i / bars) * 16) % 1;
      let a = L.pattern[s] ? Math.exp(-local * (L.kind === "keys" ? 1.6 : 4)) : 0.04;
      a *= 0.75 + 0.25 * Math.sin(i * 1.7);
      const bh = Math.max(2, a * h * 0.85);
      wctx.globalAlpha = 0.85;
      wctx.fillRect((i / bars) * w, (h - bh) / 2, (w / bars) * 0.6, bh);
    }
    wctx.globalAlpha = 1;
  }
  function stop() {
    playing = false; clearInterval(timer);
    playBtn.textContent = "▶ Play"; playBtn.setAttribute("aria-pressed", "false");
    drawStatic();
  }
  playBtn.addEventListener("click", async () => {
    if (playing) return stop();
    if (!actx) {
      actx = new (window.AudioContext || window.webkitAudioContext)();
      master = actx.createGain(); master.gain.value = 0.5;
      analyser = actx.createAnalyser(); analyser.fftSize = 2048;
      master.connect(analyser); analyser.connect(actx.destination);
    }
    await actx.resume();
    playing = true; step = 0; nextTime = actx.currentTime + 0.05;
    timer = setInterval(schedule, 25);
    playBtn.textContent = "■ Stop"; playBtn.setAttribute("aria-pressed", "true");
    drawLive();
  });
  $$(".loop-pick .chip").forEach((c) => c.addEventListener("click", () => {
    loopId = c.dataset.loop;
    $$(".loop-pick .chip").forEach((x) => x.setAttribute("aria-checked", String(x === c)));
    updateBadges();
  }));
  tempoEl.addEventListener("input", updateBadges);
  pitchEl.addEventListener("input", updateBadges);
  addEventListener("resize", () => { if (!playing) drawStatic(); });
  new IntersectionObserver(([e]) => { if (!e.isIntersecting && playing) stop(); }).observe($("#inspector"));

  /* ------------------------------------------------------------ Install */
  $("#installTabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-pane]");
    if (!b) return;
    $$("#installTabs button").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
    $$(".install .pane").forEach((p) => { p.hidden = p.dataset.pane !== b.dataset.pane; });
  });
  const hex = () => [...crypto.getRandomValues(new Uint8Array(32))].map((x) => x.toString(16).padStart(2, "0")).join("");
  let secrets = { token: hex(), proxy: hex() };
  const shq = (s) => (/^[\w@%+=:,./-]+$/.test(s) ? s : `'${s.replace(/'/g, "'\\''")}'`);
  function buildDocker() {
    const lib = $("#fLib").value.trim() || "/mnt/user/audio";
    const data = $("#fData").value.trim() || "/mnt/user/appdata/audiotheca";
    const port = ($("#fPort").value.match(/\d+/) || ["4210"])[0];
    const mode = $("#fRw").checked ? "rw" : "ro";
    $("#dockerCmd").textContent = [
      "docker run -d --name audiotheca \\",
      `  -p ${port}:80 \\`,
      `  -v ${shq(data)}:/data \\`,
      `  -v ${shq(lib)}:/library:${mode} \\`,
      `  -e AUDIOTHECA_API_TOKEN=${secrets.token} \\`,
      `  -e AUDIOTHECA_PROXY_SECRET=${secrets.proxy} \\`,
      "  -e AUDIOTHECA_HOME=/data \\",
      "  -e AUDIOTHECA_LIBRARY_ROOT=/library \\",
      "  -e AUDIOTHECA_LIBRARY_ROOTS=/library \\",
      "  -e AUDIOTHECA_DISABLE_TOKEN_BOOTSTRAP=1 \\",
      "  --restart unless-stopped \\",
      "  ghcr.io/cephyrixzyth/audiotheca:latest",
      "",
      `# then open http://<server-ip>:${port}/`,
    ].join("\n");
  }
  ["#fLib", "#fData", "#fPort", "#fRw"].forEach((s) => $(s).addEventListener("input", buildDocker));
  $("#regen").addEventListener("click", () => { secrets = { token: hex(), proxy: hex() }; buildDocker(); });
  buildDocker();
  $$(".copy").forEach((b) => b.addEventListener("click", async () => {
    const text = $(b.dataset.copy).textContent;
    try { await navigator.clipboard.writeText(text); }
    catch {
      const r = document.createRange(); r.selectNodeContents($(b.dataset.copy));
      const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); document.execCommand("copy"); sel.removeAllRanges();
    }
    b.textContent = "Copied"; b.classList.add("copied");
    setTimeout(() => { b.textContent = "Copy"; b.classList.remove("copied"); }, 1600);
  }));

  /* ------------------------------------------------------------ Rollout stages */
  const STAGES = [
    { t: "Restructure and investigation", d: "Execute approved vendor-folder moves one section at a time, and send unknowns to investigation buckets. Scene renames stay off.", c: "DRY_RUN=False\nACTION_MODE=section\nSCENE_AUTO_RENAME=False" },
    { t: "Scene renames", d: "Turn on hash-folder to product-name renames and approve them item by item.", c: "SCENE_AUTO_RENAME=True\nACTION_MODE=item" },
    { t: "Redundant archives", d: "Move archives whose contents already exist as an extracted folder, using the generated script once you have read it.", c: "move_redundant_archives_{stamp}.ps1\n$Execute = $true" },
    { t: "Duplicate staging", d: "Export your keeper picks from the Duplicates tab, then stage the other copies into _delete-canidates. You delete them yourself, when you are sure.", c: "UI keeper export → live stage\n→ _delete-canidates/" },
  ];
  const stageDetail = $("#stageDetail");
  function showStage(i) {
    $$("#stages button").forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.stage === i)));
    const s = STAGES[i];
    stageDetail.innerHTML = `<p class="eyebrow">Stage ${i + 1} of 4</p><h3>${s.t}</h3><p>${s.d}</p><div class="code-block"><pre><code>${esc(s.c)}</code></pre></div>`;
  }
  $("#stages").addEventListener("click", (e) => { const b = e.target.closest("button[data-stage]"); if (b) showStage(+b.dataset.stage); });
  showStage(0);

  /* ------------------------------------------------------------ Lightbox */
  const lb = $("#lightbox");
  function openLightbox(src, cap) {
    $("img", lb).src = src; $("img", lb).alt = cap || ""; $("figcaption", lb).textContent = cap || "";
    lb.hidden = false; $(".lightbox-close", lb).focus();
    document.body.style.overflow = "hidden";
  }
  const closeLb = () => { lb.hidden = true; document.body.style.overflow = ""; };
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.closest(".lightbox-close")) closeLb(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !lb.hidden) closeLb(); });
  $$("[data-lightbox]").forEach((el) => el.addEventListener("click", () => openLightbox(el.dataset.lightbox, el.dataset.caption)));

  /* ------------------------------------------------------------ Reveal on scroll */
  $$(".feature, .stat, .section-head, .demo-panel, .guarantees li").forEach((el) => el.classList.add("reveal"));
  if (reduceMotion || !("IntersectionObserver" in window)) $$(".reveal").forEach((el) => el.classList.add("in"));
  else {
    const ro = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); ro.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    $$(".reveal").forEach((el) => ro.observe(el));
  }

  /* ------------------------------------------------------------ Init */
  applyTheme(store.get("audiotheca-site-theme") || "tape-room", false);
  updateBadges();
})();
