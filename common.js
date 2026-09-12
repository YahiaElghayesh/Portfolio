// ---------- Shared ledger utilities: nav, reveal, count-up, spec legend, exhibit rendering ----------

function formatEntryNum(n) {
  return String(n).padStart(3, "0");
}

// Fixed icon legend — each glyph always means the same spec everywhere it appears.
const SPEC_ICONS = {
  ip: `<svg class="legend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3l7 3v5c0 4.5-3 8.2-7 9.5-4-1.3-7-5-7-9.5V6l7-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
  weight: `<svg class="legend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M7 4h10l2 5H5l2-5z"/><path d="M5 9h14l-1.5 11h-11L5 9z"/></svg>`,
  power: `<svg class="legend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8z"/></svg>`,
  temp: `<svg class="legend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3a2 2 0 0 0-2 2v9.3a4 4 0 1 0 4 0V5a2 2 0 0 0-2-2z"/></svg>`,
  accuracy: `<svg class="legend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`,
  size: `<svg class="legend-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="4" y="4" width="16" height="16" rx="1"/><path d="M4 9h2M4 15h2M18 9h2M18 15h2M9 4v2M15 4v2M9 18v2M15 18v2"/></svg>`,
};

function specChip(iconKey, label) {
  const icon = SPEC_ICONS[iconKey] || "";
  return `<span class="spec-chip">${icon}<span>${label}</span></span>`;
}

// ---------- Exhibit (photo) rendering, driven by the image's own "kind" ----------
function exhibitClass(kind) {
  if (kind === "cutout") return "is-cutout";
  if (kind === "light") return "is-context";
  if (kind === "dark") return "is-context";
  return "is-context";
}

function renderExhibit(image, alt, extraClass) {
  if (!image) return "";
  const cls = exhibitClass(image.kind);
  return `<div class="exhibit ${cls} ${extraClass || ""}"><img src="${image.file}" alt="${alt || ""}"></div>`;
}

// ---------- Ledger rendering (shared by index.html and work.html) ----------
const SPEC_HIGHLIGHT = {
  "neurosurgery-frame": { icon: "accuracy", label: "100 validation trials" },
  "inos-watcher::V3": { icon: "ip", label: "IP66 / IP68" },
  "inos-watcher::V2": { icon: "power", label: "150W cooling" },
  "inos-lite::V2": { icon: "size", label: "12 phones" },
  "inos-lite::V1": { icon: "temp", label: "30-day build" },
  "inos-gauge::V3": { icon: "size", label: "16 phones" },
  "inos-gauge::V2": { icon: "size", label: "20 phones" },
  "inos-gauge::V1": { icon: "temp", label: "5-day build" },
  "minesweeping-robot": { icon: "accuracy", label: "2nd place, 2016" },
  "water-quality-sonde": { icon: "size", label: "4 sensors" },
  "rain-monitoring": { icon: "accuracy", label: "Presented at COP27" },
  "gpr": { icon: "accuracy", label: "Research grant awarded" },
};

function specFor(unit, versionLabel) {
  const key = versionLabel ? `${unit.id}::${versionLabel}` : unit.id;
  return SPEC_HIGHLIGHT[key] || SPEC_HIGHLIGHT[unit.id] || null;
}

function projectHref(unitId, versionIndex) {
  return `project.html?unit=${unitId}${versionIndex ? `&v=${versionIndex}` : ""}`;
}

function renderEntry(unit, entryNum) {
  const latest = unit.versions[0];
  const hero = getHeroImage(unit, 0);
  const spec = specFor(unit, latest.versionLabel);
  const tags = PROJECT_TAGS[unit.id] || [];
  const older = unit.versions.slice(1);

  const specHtml = spec
    ? `<div class="entry-spec">${specChip(spec.icon, spec.label)}<span class="spec-label">${latest.versionLabel ? `Rev ${latest.versionLabel}` : "spec"}</span></div>`
    : latest.versionLabel
    ? `<div class="entry-spec"><span class="spec-label">Rev ${latest.versionLabel}</span></div>`
    : "";

  const versionsHtml = older.length
    ? `<div class="versions">
        <details>
          <summary class="version-toggle"><svg class="chev" width="10" height="10" viewBox="0 0 10 10"><path d="M2 1l6 4-6 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
            ${older.length} earlier revision${older.length > 1 ? "s" : ""} on record</summary>
          <div class="version-list">
            ${older
              .map(
                (v, i) => `
              <div class="version-item">
                <div class="v-label"><strong>Rev ${v.versionLabel}</strong> <span class="sep">·</span> supersedes entry ${formatEntryNum(entryNum)}</div>
                <a href="${projectHref(unit.id, i + 1)}">${v.title}</a>
                <p class="v-desc">${v.desc}</p>
              </div>`
              )
              .join("")}
          </div>
        </details>
      </div>`
    : "";

  return `
    <li class="entry">
      <a class="entry-row" href="${projectHref(unit.id, 0)}">
        <span class="entry-num mono mono-num">${formatEntryNum(entryNum)}</span>
        <span class="entry-main">
          <span class="entry-title-row">
            <span class="entry-title">${unit.title}</span>
            ${unit.subtitle ? `<span class="entry-subtitle">${unit.subtitle}</span>` : ""}
          </span>
          <p class="entry-desc">${latest.desc}</p>
          <span class="entry-tags">${tags.map((t) => `<span class="tag">${t}</span>`).join("")}</span>
        </span>
        ${specHtml}
      </a>
      ${hero ? `<div class="entry-thumb ${hero.kind === "cutout" ? "is-cutout" : "is-context"}"><img src="${hero.file}" alt="${unit.title}"></div>` : ""}
      ${versionsHtml}
    </li>`;
}

function renderFieldSection(field, startNum) {
  let n = startNum;
  const rows = field.units
    .map((unit) => {
      const html = renderEntry(unit, n);
      n += 1;
      return html;
    })
    .join("");
  return {
    html: `
    <section class="section field-section container" id="${field.category}">
      <div class="section-head">
        <h2>${field.categoryLabel}</h2>
        <span class="count mono">${String(field.units.length).padStart(2, "0")} entries</span>
      </div>
      <ul class="ledger">${rows}</ul>
    </section>`,
    nextNum: n,
  };
}

function renderLedgerAllFields() {
  let n = 1;
  return FIELDS.map((field) => {
    const { html, nextNum } = renderFieldSection(field, n);
    n = nextNum;
    return html;
  }).join("");
}

function countAll() {
  let projects = 0,
    versions = 0;
  FIELDS.forEach((f) => f.units.forEach((u) => { projects += 1; versions += u.versions.length; }));
  return { projects, versions, fields: FIELDS.length };
}

// ---------- Instrument-style count-up (the one restrained ambient/entrance moment) ----------
function initCountUp(root) {
  const els = (root || document).querySelectorAll("[data-count-to]");
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  els.forEach((el) => {
    const target = parseInt(el.getAttribute("data-count-to"), 10);
    if (prefersReduced || Number.isNaN(target)) {
      el.textContent = String(target);
      return;
    }
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = String(Math.round(eased * target));
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

// ---------- Top bar: mobile nav + active link ----------
function initTopbar() {
  const btn = document.querySelector(".topbar-menu-btn");
  const nav = document.querySelector(".topbar-nav");
  if (btn && nav) {
    btn.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    nav.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", () => {
        nav.classList.remove("is-open");
        btn.setAttribute("aria-expanded", "false");
      })
    );
  }
  const path = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".topbar-nav a[data-page]").forEach((a) => {
    if (a.getAttribute("data-page") === path) a.setAttribute("aria-current", "page");
  });
}

function initPage() {
  initTopbar();
  initCountUp();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initPage);
} else {
  initPage();
}
