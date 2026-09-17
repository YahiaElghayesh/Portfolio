// ---------- Work (work.html): projects as clearly compartmentalized cards ----------

// Version history is always visible, never hidden behind a click: the current
// version reads as the project's main text, older ones list below it as their
// own labeled entries, so it's obvious right away that revisions exist.
function renderVersionHistory(unit) {
  const [current, ...older] = unit.versions;
  if (!older.length) return "";
  return `<div class="version-history">
    <div class="vh-head">
      <span class="vh-badge is-current">${current.versionLabel}</span>
      <span class="vh-head-label">Current &middot; ${older.length} earlier revision${older.length > 1 ? "s" : ""} below</span>
    </div>
    <div class="vh-list">
      ${older
        .map(
          (v) => `<div class="vh-item">
            <span class="vh-badge">${v.versionLabel}</span>
            <div class="vh-item-body">
              <div class="vh-label">${v.title}</div>
              <p>${v.desc}</p>
            </div>
          </div>`
        )
        .join("")}
    </div>
  </div>`;
}

function renderStageSlide(unit, field, i) {
  const latest = unit.versions[0];
  const gallery = getGalleryImages(unit, 0).slice(0, 6);
  const tags = PROJECT_TAGS[unit.id] || [];
  return `<article class="stage-slide" id="${unit.id}" data-reveal>
    <span class="stage-index">${String(i + 1).padStart(2, "0")}</span>
    <div class="stage-grid">
      ${renderStageVisual(gallery, unit.title)}
      <div class="stage-text">
        <h3>${unit.title}${unit.subtitle ? `<span class="subtitle">${unit.subtitle}</span>` : ""}</h3>
        <div class="stage-body">
          <p>${latest.desc}</p>
          <ul>${latest.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
        </div>
        <div class="stage-tags">${tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        ${renderVersionHistory(unit)}
      </div>
    </div>
  </article>`;
}

function renderFieldStage(field) {
  const n = field.units.length;
  return `
    <section class="field-stage" data-field="${field.category}">
      <div class="container">
        <div class="field-stage-head">
          <h2 id="${field.category}-nav">${field.categoryLabel}</h2>
          <span class="field-count">${String(n).padStart(2, "0")} projects</span>
        </div>
        <div class="stage-slides">${field.units.map((u, i) => renderStageSlide(u, field, i)).join("")}</div>
      </div>
    </section>`;
}

document.getElementById("work-intro").innerHTML = `
  <div class="container">
    <h1 data-reveal-text>Featured work</h1>
    <div class="field-nav">${FIELDS.map((f) => `<a href="#${f.category}-nav">${f.categoryLabel}</a>`).join("")}</div>
  </div>`;

document.getElementById("field-stages-root").innerHTML = FIELDS.map(renderFieldStage).join("");

renderContact("contact-section");
renderFooter("site-footer");

window.addEventListener("load", function () {
  document.querySelectorAll("[data-reveal-text]").forEach(splitLines);
  initHeadingReveals();
  initFadeUps();
  initTilt();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
