// ---------- Work (work.html): a menu of projects, click one for full detail ----------

function renderTileVisual(image, alt) {
  const cls = isCutout(image) ? "is-cutout" : "is-context";
  return `<span class="tile-visual ${cls}" data-img="${image.file}" data-kind="${image.kind}"><img class="tile-img" src="${image.file}" alt="${alt || ""}" loading="lazy"></span>`;
}

// Versions are visible from the menu itself, not just once you're inside a
// project: every version label shown right on its tile.
function renderTileVersions(unit) {
  if (unit.versions.length < 2) return "";
  return `<span class="tile-versions">${unit.versions.map((v) => v.versionLabel).join(" &middot; ")}</span>`;
}

// The photo inside each tile is drawn by the GPU as a relief of the product
// (see enhanceTiles below), so the tile itself stays flat: its rectangle is
// what the relief is pinned to.
function renderProjectTile(unit) {
  const hero = getHeroImage(unit, 0);
  return `<button type="button" class="project-tile" id="${unit.id}" data-unit="${unit.id}" aria-haspopup="dialog">
    <span class="tile-inner">
      ${renderTileVisual(hero, unit.title)}
      <span class="tile-meta">
        <span class="tile-title">${unit.title}${unit.subtitle ? `<span class="subtitle">${unit.subtitle}</span>` : ""}</span>
        ${renderTileVersions(unit)}
      </span>
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
    <h1>Featured work</h1>
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

// Every tile's product becomes a lit 3D relief built from its own photo and
// depth map. Cut-out renders turn in real space toward the pointer (and idle
// on a phone); photos with their background still in them stay locked to
// the tile and move *inside* it instead. A tile keeps its real <img> until
// its relief is drawing, so nothing is ever blank.
function enhanceTiles(S) {
  document.querySelectorAll(".project-tile .tile-visual").forEach((vis) => {
    const file = vis.getAttribute("data-img");
    const cutout = vis.classList.contains("is-cutout");
    addRelief(S, {
      el: vis, img: vis.querySelector("img"), color: file, depth: DEPTH_MAPS[file],
      mode: cutout ? "object" : "window", pad: 0.82, radius: [13, 13, 13, 13],
      hoverEl: vis.closest(".project-tile"),
    }).catch(() => {});
  });
}

// The page title arrives as two stacked slabs of type.
function introWorkTitle() {
  if (prefersReduced || typeof gsap === "undefined") return;
  gsap.from(".work-intro h1", { yPercent: 40, opacity: 0, duration: 1.2, ease: "expo.out" });
  gsap.from(".field-nav a", { y: 16, opacity: 0, duration: 0.7, stagger: 0.05, ease: "power3.out", delay: 0.25 });
}

window.addEventListener("load", function () {
  document.querySelectorAll("[data-reveal-text]").forEach(splitLines);
  introWorkTitle();
  initHeadingReveals();
  initFadeUps();
  initDepthBackdrop();
  initDepthFloor();
  initScrollVelocity();
  initDepthFlow();
  initTilt();
  initMagnetic();
  if (willUseWebGL()) initStage().then(enhanceTiles).catch(() => {});
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
