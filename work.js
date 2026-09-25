// ---------- Work (work.html): a menu of projects, click one for full detail ----------

function renderTileVisual(image, alt) {
  const cls = isCutout(image) ? "is-cutout" : "is-context";
  return `<span class="tile-visual ${cls}"><img src="${image.file}" alt="${alt || ""}"></span>`;
}

// Versions are visible from the menu itself, not just once you're inside a
// project — every version label shown right on its tile.
function renderTileVersions(unit) {
  if (unit.versions.length < 2) return "";
  return `<span class="tile-versions">${unit.versions.map((v) => v.versionLabel).join(" &middot; ")}</span>`;
}

function renderProjectTile(unit) {
  const hero = getHeroImage(unit, 0);
  // Two transform layers, deliberately on two different elements: the outer
  // button is carried through depth by the scroll, the inner surface tilts to
  // the pointer. On one element the two would overwrite each other.
  return `<button type="button" class="project-tile" id="${unit.id}" data-unit="${unit.id}" aria-haspopup="dialog">
    <span class="tile-inner sheen" data-tilt="8" data-tilt-lift="40">
      ${renderTileVisual(hero, unit.title)}
      <span class="tile-title">${unit.title}${unit.subtitle ? `<span class="subtitle">${unit.subtitle}</span>` : ""}</span>
      ${renderTileVersions(unit)}
    </span>
  </button>`;
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
        <div class="project-grid">${field.units.map(renderProjectTile).join("")}</div>
      </div>
    </section>`;
}

// Versions get the same visual weight as the project itself: real tabs that
// swap in that version's own full title, description, highlights, and
// photos — never a compressed footnote under the current one.
function renderVersionTabs(unit, activeIndex) {
  if (unit.versions.length < 2) return "";
  return `<div class="version-tabs" role="tablist">
    ${unit.versions
      .map(
        (v, i) =>
          `<button type="button" class="version-tab${i === activeIndex ? " is-active" : ""}" role="tab" aria-selected="${i === activeIndex}" data-version-index="${i}">${v.versionLabel}${i === 0 ? " &middot; Current" : ""}</button>`
      )
      .join("")}
  </div>`;
}

function renderProjectDetail(unit, versionIndex) {
  const idx = versionIndex || 0;
  const v = unit.versions[idx];
  const gallery = getGalleryImages(unit, idx).slice(0, 6);
  return `
    <h3 class="detail-title" id="project-modal-title">${unit.title}${unit.subtitle ? `<span class="subtitle">${unit.subtitle}</span>` : ""}</h3>
    ${renderVersionTabs(unit, idx)}
    <div class="stage-grid">
      ${renderStageVisual(gallery, unit.title)}
      <div class="stage-text">
        <div class="stage-body">
          <p>${v.desc}</p>
          <ul>${v.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
        </div>
      </div>
    </div>`;
}

// ---------- Modal open/close + version switching ----------
const modal = document.getElementById("project-modal");
const modalBody = document.getElementById("project-modal-body");
let lastFocused = null;

function paintDetail(unit, versionIndex) {
  modalBody.innerHTML = renderProjectDetail(unit, versionIndex);
  modal.querySelector(".project-modal-panel").scrollTop = 0;
  initGalleries(modalBody);
  initTilt(modalBody);
  modalBody.querySelectorAll(".version-tab").forEach((tab) => {
    tab.addEventListener("click", () => paintDetail(unit, parseInt(tab.getAttribute("data-version-index"), 10)));
  });
}

function openProject(unitId, focusOrigin) {
  const found = findUnitById(unitId);
  if (!found) return;
  lastFocused = focusOrigin || document.activeElement;
  paintDetail(found.unit, 0);
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector(".project-modal-close").focus();
  if (location.hash !== "#" + unitId) history.replaceState(null, "", "#" + unitId);

  // The panel comes forward out of the page rather than just fading in, so
  // opening a project reads as the same depth move as the rest of the site.
  const panel = modal.querySelector(".project-modal-panel");
  if (typeof gsap !== "undefined" && !prefersReduced) {
    gsap.fromTo(
      panel,
      { z: -320, rotationX: 7, opacity: 0, transformPerspective: 1400, transformOrigin: "50% 40%" },
      { z: 0, rotationX: 0, opacity: 1, duration: 0.55, ease: "power3.out", clearProps: "transform" }
    );
  }
}

function closeProject() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  if (lastFocused && typeof lastFocused.focus === "function") lastFocused.focus();
}

document.addEventListener("click", (e) => {
  const tile = e.target.closest(".project-tile");
  if (tile) {
    openProject(tile.getAttribute("data-unit"), tile);
    return;
  }
  if (e.target.closest("[data-modal-close]")) closeProject();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("is-open")) closeProject();
});

document.getElementById("work-intro").innerHTML = `
  <div class="container">
    <h1 data-reveal-text>Featured work</h1>
    <div class="field-nav">${FIELDS.map((f) => `<a href="#${f.category}-nav">${f.categoryLabel}</a>`).join("")}</div>
  </div>`;

document.getElementById("field-stages-root").innerHTML = FIELDS.map(renderFieldStage).join("");

renderContact("contact");
renderFooter("site-footer");

// Arriving via a work.html#unit-id link opens that project's detail directly.
if (location.hash) {
  const unitId = location.hash.slice(1);
  if (findUnitById(unitId)) openProject(unitId, document.getElementById(unitId));
}

window.addEventListener("load", function () {
  document.querySelectorAll("[data-reveal-text]").forEach(splitLines);
  initHeadingReveals();
  initFadeUps();
  initDepthBackdrop();
  initDepthFloor();
  initScrollVelocity();
  initDepthFlow();
  initPhotoParallax();
  initTilt();
  initMagnetic();
  initWebGL();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
