// ---------- Shared utilities: nav, photo rendering ----------

// Cutout (no-background) images float directly on the section's own background,
// with a soft drop shadow and interactive tilt — never boxed on white.
// Context images (kind "light"/"dark") keep their real photographed background
// and sit in a normal framed photo container.
function isCutout(image) {
  return image && image.kind === "cutout";
}

function renderVisualMain(image, alt) {
  if (isCutout(image)) {
    return `<div class="visual-main" data-tilt-frame>
      <img class="stage-img" data-tilt="10" src="${image.file}" alt="${alt || ""}">
    </div>`;
  }
  return `<div class="visual-main">
    <img class="stage-img is-context" src="${image.file}" alt="${alt || ""}">
  </div>`;
}

function renderVisualThumb(image, alt) {
  const cls = isCutout(image) ? "is-cutout" : "is-context";
  return `<div class="visual-cell ${cls}">
    <img src="${image.file}" alt="${alt || ""}">
  </div>`;
}

// Renders the full curated set of photos LAYOUTS assigns a project (see
// getGalleryImages in data.js) as one deliberate hero shot plus a thumbnail
// strip of the rest — never just a single picked image.
function renderStageVisual(images, alt) {
  const list = Array.isArray(images) ? images : [images];
  if (!list.length || !list[0]) return "";
  const [main, ...rest] = list;
  if (!rest.length) return `<div class="stage-visual">${renderVisualMain(main, alt)}</div>`;
  return `<div class="stage-visual has-gallery">
    ${renderVisualMain(main, alt)}
    <div class="visual-strip">${rest.map((img) => renderVisualThumb(img, alt)).join("")}</div>
  </div>`;
}

function projectHref(unitId) {
  return `work.html#${unitId}`;
}

// ---------- Shared contact + footer (same words, both pages) ----------
function renderContact(rootId) {
  document.getElementById(rootId).innerHTML = `
    <div class="container contact-section" data-reveal>
      <h2 data-reveal-text>Have a problem worth solving?</h2>
      <p class="contact-sub">I&rsquo;m always open to discussing new projects, product design challenges, or hardware engineering roles.</p>
      <div class="contact-links">
        <a class="contact-link" data-magnetic href="mailto:y.elghayesh@gmail.com">
          <span class="contact-label">Email</span>
          <span class="contact-value">y.elghayesh@gmail.com</span>
        </a>
        <a class="contact-link" data-magnetic href="https://wa.me/+201000447702" target="_blank" rel="noopener">
          <span class="contact-label">WhatsApp</span>
          <span class="contact-value">+20 100 044 7702</span>
        </a>
        <a class="contact-link" data-magnetic href="http://www.linkedin.com/in/elghayesh" target="_blank" rel="noopener">
          <span class="contact-label">LinkedIn</span>
          <span class="contact-value">linkedin.com/in/elghayesh</span>
        </a>
      </div>
    </div>`;
}

function renderFooter(rootId) {
  document.getElementById(rootId).innerHTML = `
    <div class="container footer-inner">
      <p>&copy; ${new Date().getFullYear()} Yahia Elghayesh. All projects and imagery shown are original work.</p>
      <a href="#top">Back to top &uarr;</a>
    </div>`;
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
