// ---------- Home page rendering: certifications, toolbox, partners, workshop strip, work teaser ----------

// Certifications — each links out to its verifiable Credly credential
const certList = document.getElementById("cert-list");
certList.innerHTML = CERTS.map(c => `
  <li>
    <a class="cert-link" href="${c.url}" target="_blank" rel="noopener">
      <img class="cert-badge" src="${c.badge}" alt="${c.code} badge" loading="lazy">
      <span class="cert-name"><strong>${c.code}</strong><em>${c.name}</em></span>
    </a>
  </li>
`).join("");

// Toolbox
const toolboxGrid = document.getElementById("toolbox-grid");
toolboxGrid.innerHTML = TOOLBOX.map(t => `
  <div class="toolbox-col reveal">
    <h3>${t.name}</h3>
    ${t.detail ? `<p class="toolbox-detail">${t.detail}</p>` : ""}
    <div class="tool-row">
      ${t.tools.map(tool => `
        <div class="tool-item">
          ${logoOrMonogram(tool.name, tool.logo)}
          <span class="tool-name">${tool.name}</span>
        </div>
      `).join("")}
    </div>
  </div>
`).join("");
observeRevealAll(".toolbox-col");

// Partners
const partnersRow = document.getElementById("partners-row");
partnersRow.innerHTML = PARTNERS.map(p => `
  <a class="partner-item reveal" href="${p.url}" target="_blank" rel="noopener" data-partner="${p.name}">
    <span class="partner-mark">
      ${p.logo ? `<img src="${p.logo}" alt="${p.name}" loading="lazy">` : `<span class="partner-wordmark">${p.name}</span>`}
    </span>
    <span class="partner-label">${p.flag && FLAG_ICONS[p.flag] ? `<span class="partner-flag">${FLAG_ICONS[p.flag]}</span>` : ""}${p.name}</span>
  </a>
`).join("");
observeRevealAll(".partner-item");

// Workshop strip
const workshopStrip = document.getElementById("workshop-strip");
workshopStrip.innerHTML = WORKSHOP_STRIP.map(w => `
  <div class="strip-item reveal"><img src="${w.file}" alt="${w.alt}" loading="lazy"></div>
`).join("");
observeRevealAll(".strip-item");

// Work teaser (fields overview, links out to work.html)
const fieldsTeaser = document.getElementById("fields-teaser");
if (fieldsTeaser) {
  fieldsTeaser.innerHTML = FIELDS.map(field => {
    const thumb = getHeroImage(field.units[0], 0);
    return `
    <a class="field-teaser-card reveal" href="work.html#${field.category}">
      <span class="field-teaser-media kind-${thumb.kind}"><img src="${thumb.file}" alt="" loading="lazy"></span>
      <span class="field-teaser-body">
        <span class="field-teaser-name">${field.categoryLabel}</span>
        <span class="field-teaser-count">${field.units.length} ${field.units.length === 1 ? "project" : "projects"}</span>
      </span>
    </a>
  `;
  }).join("");
  observeRevealAll(".field-teaser-card");
}

observeRevealAll(".reveal");

// ---------- Hero depth scene: slow scroll parallax + a subtle pointer tilt on the
// photo layer, so it reads as one physical space the page is built around rather
// than a flat background image. One authored motion, smoothly eased. ----------
(function () {
  const scene = document.getElementById("hero-scene");
  const media = document.getElementById("hero-scene-media");
  if (!scene || !media) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let targetX = 0, targetY = 0, curX = 0, curY = 0, scrollShift = 0;

  function onScroll() {
    const rect = scene.getBoundingClientRect();
    const progress = Math.min(1, Math.max(0, -rect.top / (rect.height || 1)));
    scrollShift = progress * 70;
  }
  function onPointerMove(e) {
    const rect = scene.getBoundingClientRect();
    if (e.clientY < rect.top || e.clientY > rect.bottom) return;
    targetX = (e.clientX - rect.left) / rect.width - 0.5;
    targetY = (e.clientY - rect.top) / rect.height - 0.5;
  }
  function tick() {
    curX += (targetX - curX) * 0.055;
    curY += (targetY - curY) * 0.055;
    media.style.transform = `translate3d(${curX * 16}px, ${scrollShift + curY * 12}px, 0) scale(1.06)`;
    requestAnimationFrame(tick);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("mousemove", onPointerMove, { passive: true });
  onScroll();
  requestAnimationFrame(tick);
})();
