// ---------- Project detail: editorial layout, photos embedded contextually alongside highlights ----------

const params = new URLSearchParams(location.search);
const unitId = params.get("id");
const found = unitId ? findUnitById(unitId) : null;

const root = document.getElementById("project-root");

if (!found) {
  root.innerHTML = `
    <div class="container project-notfound reveal">
      <p class="eyebrow">Not found</p>
      <h2>That project doesn't exist.</h2>
      <p><a class="btn-text" href="work.html">Back to all work <span>→</span></a></p>
    </div>
  `;
  observeRevealAll(".reveal");
} else {
  renderProject(found.unit, found.field, 0);
}

function pickHero(images) {
  const nonCutout = images.find(im => im.kind !== "cutout");
  return nonCutout || images[0];
}

// ---------- Block renderers: each project supplies its own sequence of these ----------
function figHTML(im, idx, extraClass) {
  return `
    <figure class="${extraClass || ""} kind-${im.kind}" data-img-index="${idx}">
      <img src="${im.file}" alt="" loading="lazy">
    </figure>
  `;
}

function highlightsHTML(highlights, indices) {
  return `<ul class="detail-highlights">${indices.map(i => `<li>${highlights[i]}</li>`).join("")}</ul>`;
}

function renderBlock(block, images, highlights, blockIndex) {
  if (block.type === "wide") {
    const im = images[block.images[0]];
    return `
      <figure class="layout-wide reveal ${im.kind === "cutout" ? "kind-cutout" : ""}" data-img-index="${block.images[0]}">
        <img src="${im.file}" alt="" loading="lazy">
        ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ""}
      </figure>
    `;
  }
  if (block.type === "pair") {
    return `
      <div class="layout-pair reveal">
        <div class="layout-pair-media">
          ${block.images.map(i => figHTML(images[i], i, "pair-fig")).join("")}
        </div>
        ${highlightsHTML(highlights, block.highlights)}
      </div>
    `;
  }
  if (block.type === "inset") {
    return `
      <div class="layout-inset side-${block.side} reveal">
        ${figHTML(images[block.images[0]], block.images[0], "inset-fig")}
        <div class="inset-text">
          <span class="inset-label">Detail</span>
          ${highlightsHTML(highlights, block.highlights)}
        </div>
      </div>
    `;
  }
  if (block.type === "mosaic3") {
    return `
      <div class="layout-mosaic3 reveal">
        <div class="mosaic3-media">
          ${block.images.map(i => figHTML(images[i], i, "mosaic3-fig")).join("")}
        </div>
        ${highlightsHTML(highlights, block.highlights)}
      </div>
    `;
  }
  if (block.type === "stat") {
    return `
      <div class="layout-stat reveal">
        <p>${highlights[block.highlight]}</p>
      </div>
    `;
  }
  // text
  return highlightsHTML(highlights, block.highlights).replace('class="detail-highlights"', 'class="detail-highlights detail-highlights-plain reveal"');
}

function renderProject(unit, field, versionIndex) {
  const v = unit.versions[versionIndex];
  const hasVersions = unit.versions.length > 1;
  const layout = getLayout(unit.id, v.versionLabel);
  const hero = layout ? v.images[layout.hero] : pickHero(v.images);
  const heroIndex = v.images.indexOf(hero);

  let blocksHTML = "";
  if (layout) {
    blocksHTML = layout.blocks.map(b => renderBlock(b, v.images, v.highlights)).join("");
  } else if (v.highlights.length > 0) {
    blocksHTML = `<ul class="detail-highlights detail-highlights-plain reveal">${v.highlights.map(h => `<li>${h}</li>`).join("")}</ul>`;
  }

  const flat = flatUnitList();
  const curFlatIndex = flat.findIndex(f => f.unit.id === unit.id);
  const prevEntry = flat[(curFlatIndex - 1 + flat.length) % flat.length];
  const nextEntry = flat[(curFlatIndex + 1) % flat.length];

  root.innerHTML = `
    <div class="container project-crumb reveal">
      <a href="work.html#${field.category}">${field.categoryLabel}</a>
      <span>/</span>
      <span>${unit.title}</span>
    </div>

    <header class="project-head reveal">
      <div class="container">
        <p class="eyebrow">${field.categoryLabel}</p>
        <h1>${v.title.replace(/\s*\[.*?\]\s*$/, "")}</h1>
        ${unit.subtitle ? `<p class="project-subtitle">${unit.subtitle}</p>` : ""}
        ${hasVersions ? `
          <div class="version-switcher" id="version-switcher">
            ${unit.versions.map((vv, i) => `<button class="version-btn ${i === versionIndex ? "is-active" : ""}" data-vindex="${i}">${vv.versionLabel}</button>`).join("")}
          </div>
        ` : ""}
      </div>
    </header>

    <figure class="project-hero reveal kind-${hero.kind}" data-img-index="${heroIndex}">
      <img src="${hero.file}" alt="" loading="lazy">
    </figure>

    <div class="container project-body">
      <p class="project-lead reveal">${v.desc}</p>
      ${blocksHTML}
    </div>

    <nav class="project-pager reveal">
      <div class="container project-pager-inner">
        <a class="pager-link pager-prev" href="project.html?id=${prevEntry.unit.id}">
          <span class="pager-label">&larr; Previous</span>
          <span class="pager-title">${prevEntry.unit.title}</span>
        </a>
        <a class="pager-link pager-next" href="project.html?id=${nextEntry.unit.id}">
          <span class="pager-label">Next &rarr;</span>
          <span class="pager-title">${nextEntry.unit.title}</span>
        </a>
      </div>
    </nav>
  `;

  document.title = `${v.title.replace(/\s*\[.*?\]\s*$/, "")} — Yahia Elghayesh`;

  // wire lightbox on every clickable image
  root.querySelectorAll("[data-img-index]").forEach(el => {
    el.addEventListener("click", () => {
      const idx = Number(el.dataset.imgIndex);
      openModal(v.images, idx, { title: v.title, category: field.categoryLabel, desc: v.desc, highlights: v.highlights });
    });
  });

  const switcher = document.getElementById("version-switcher");
  if (switcher) {
    switcher.addEventListener("click", (e) => {
      const btn = e.target.closest(".version-btn");
      if (!btn) return;
      renderProject(unit, field, Number(btn.dataset.vindex));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  observeRevealAll(".reveal");
}
