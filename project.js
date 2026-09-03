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

function splitEvenly(arr, n) {
  const out = [];
  const base = Math.floor(arr.length / n);
  let rem = arr.length % n;
  let i = 0;
  for (let b = 0; b < n; b++) {
    const take = base + (rem > 0 ? 1 : 0);
    if (rem > 0) rem--;
    out.push(arr.slice(i, i + take));
    i += take;
  }
  return out;
}

function pickHero(images) {
  const nonCutout = images.find(im => im.kind !== "cutout");
  return nonCutout || images[0];
}

function renderProject(unit, field, versionIndex) {
  const v = unit.versions[versionIndex];
  const hasVersions = unit.versions.length > 1;
  const hero = pickHero(v.images);
  const rest = v.images.filter(im => im !== hero);

  let blocksHTML = "";
  let galleryHTML = "";

  if (v.highlights.length > 0 && rest.length > 0) {
    const numBlocks = Math.min(rest.length, v.highlights.length);
    const blockImages = rest.slice(0, numBlocks);
    const galleryImages = rest.slice(numBlocks);
    const highlightGroups = splitEvenly(v.highlights, numBlocks);

    blocksHTML = blockImages.map((im, i) => `
      <div class="detail-block ${i % 2 === 1 ? "is-reversed" : ""} reveal">
        <figure class="detail-media kind-${im.kind}" data-img-index="${v.images.indexOf(im)}">
          <img src="${im.file}" alt="" loading="lazy">
        </figure>
        <ul class="detail-highlights">
          ${highlightGroups[i].map(h => `<li>${h}</li>`).join("")}
        </ul>
      </div>
    `).join("");

    if (galleryImages.length) {
      galleryHTML = `
        <div class="detail-gallery reveal">
          ${galleryImages.map(im => `
            <figure class="gallery-thumb kind-${im.kind}" data-img-index="${v.images.indexOf(im)}">
              <img src="${im.file}" alt="" loading="lazy">
            </figure>
          `).join("")}
        </div>
      `;
    }
  } else if (v.highlights.length > 0) {
    blocksHTML = `
      <ul class="detail-highlights detail-highlights-plain reveal">
        ${v.highlights.map(h => `<li>${h}</li>`).join("")}
      </ul>
    `;
  } else if (rest.length > 0) {
    galleryHTML = `
      <div class="detail-gallery reveal">
        ${rest.map(im => `
          <figure class="gallery-thumb kind-${im.kind}" data-img-index="${v.images.indexOf(im)}">
            <img src="${im.file}" alt="" loading="lazy">
          </figure>
        `).join("")}
      </div>
    `;
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

    <figure class="project-hero reveal kind-${hero.kind}" data-img-index="${v.images.indexOf(hero)}">
      <img src="${hero.file}" alt="" loading="lazy">
    </figure>

    <div class="container project-body">
      <p class="project-lead reveal">${v.desc}</p>
      ${blocksHTML}
      ${galleryHTML}
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
