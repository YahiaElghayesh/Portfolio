// ---------- Shared utilities: nav, photo rendering ----------

// Cutout (no-background) images float directly on the section's own background,
// with a soft drop shadow and interactive tilt — never boxed on white.
// Context images (kind "light"/"dark") keep their real photographed background
// and sit in a normal framed photo container.
function isCutout(image) {
  return image && image.kind === "cutout";
}

function renderStageVisual(image, alt) {
  if (!image) return "";
  if (isCutout(image)) {
    return `<div class="stage-visual" data-tilt-frame>
      <img class="stage-img" data-tilt="10" src="${image.file}" alt="${alt || ""}">
    </div>`;
  }
  return `<div class="stage-visual">
    <img class="stage-img is-context" src="${image.file}" alt="${alt || ""}">
  </div>`;
}

function projectHref(unitId) {
  return `work.html#${unitId}`;
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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTopbar);
} else {
  initTopbar();
}
