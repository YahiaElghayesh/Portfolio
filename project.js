// ---------- Project detail (project.html): renders one unit/version from LAYOUTS ----------

function qParam(name) {
  return new URLSearchParams(location.search).get(name);
}

function annotatedHero(image, unitTitle, calloutLabels) {
  const cls = exhibitClass(image.kind);
  const points = [
    { x: 14, y: 18 },
    { x: 82, y: 78 },
  ];
  const callouts = (calloutLabels || []).slice(0, 2);
  const svgLines = callouts
    .map((_, i) => {
      const p = points[i];
      const anchorX = p.x < 50 ? p.x + 10 : p.x - 10;
      return `<line x1="${anchorX}%" y1="${p.y}%" x2="${p.x}%" y2="${p.y}%"/><circle cx="${p.x}%" cy="${p.y}%" r="3"/>`;
    })
    .join("");
  const tags = callouts
    .map((label, i) => {
      const p = points[i];
      return `<span class="callout-tag" style="left:${p.x < 50 ? p.x + 12 : p.x - 12}%; top:${p.y}%">${label}</span>`;
    })
    .join("");
  return `
    <div class="exhibit p-hero ${cls}">
      <img src="${image.file}" alt="${unitTitle}" loading="eager">
      ${callouts.length ? `<svg class="callout-line">${svgLines}</svg>${tags}` : ""}
    </div>`;
}

function blockHighlights(highlights, idxs) {
  return (idxs || []).map((i) => highlights[i]).filter(Boolean);
}

function renderBlock(block, unit, version) {
  const imgs = version.images;
  const highlights = version.desc ? version.highlights : version.highlights;

  if (block.type === "wide") {
    const img = imgs[block.images[0]];
    return `<div class="p-block block-wide container">
      <figure>
        ${renderExhibit(img, unit.title)}
        ${block.caption ? `<figcaption>${block.caption}</figcaption>` : ""}
      </figure>
    </div>`;
  }

  if (block.type === "pair") {
    return `<div class="p-block container">
      <div class="block-pair">
        ${block.images.map((i) => renderExhibit(imgs[i], unit.title)).join("")}
      </div>
      ${block.highlights ? `<ul class="block-highlights" style="margin-top:var(--space-5)">${blockHighlights(highlights, block.highlights).map((h) => `<li>${h}</li>`).join("")}</ul>` : ""}
    </div>`;
  }

  if (block.type === "inset") {
    const side = block.side === "right" ? "side-right" : "side-left";
    const photos = block.images.map((i) => renderExhibit(imgs[i], unit.title)).join("");
    const list = `<ul class="block-highlights">${blockHighlights(highlights, block.highlights).map((h) => `<li>${h}</li>`).join("")}</ul>`;
    return `<div class="p-block container">
      <div class="block-inset ${side}">
        <div>${photos}</div>
        <div>${list}</div>
      </div>
    </div>`;
  }

  if (block.type === "mosaic3") {
    return `<div class="p-block container">
      <div class="block-mosaic3">${block.images.map((i) => renderExhibit(imgs[i], unit.title)).join("")}</div>
      <ul class="block-highlights">${blockHighlights(highlights, block.highlights).map((h) => `<li>${h}</li>`).join("")}</ul>
    </div>`;
  }

  if (block.type === "text") {
    return `<div class="p-block container">
      <ul class="block-highlights">${blockHighlights(highlights, block.highlights).map((h) => `<li>${h}</li>`).join("")}</ul>
    </div>`;
  }

  if (block.type === "stat") {
    const text = blockHighlights(highlights, block.highlights)[0] || "";
    const match = text.match(/[\d.]+[%\w-]*/);
    const figure = match ? match[0] : "";
    return `<div class="p-block container">
      <div class="block-stat">
        ${figure ? `<span class="stat-figure mono-num">${figure}</span>` : ""}
        <p class="stat-body">${text}</p>
      </div>
    </div>`;
  }

  if (block.type === "poster") {
    const img = imgs[block.images[0]];
    return `<div class="p-block block-poster container">
      <figure>
        ${renderExhibit(img, unit.title)}
        <figcaption>
          ${block.eyebrow ? `<span class="p-eyebrow mono">${block.eyebrow}</span>` : ""}
          ${block.caption || ""}
        </figcaption>
      </figure>
    </div>`;
  }

  if (block.type === "versus") {
    const va = unit.versions[block.a.v];
    const vb = unit.versions[block.b.v];
    const imgA = va.images[block.a.img];
    const imgB = vb.images[block.b.img];
    return `<div class="p-block block-versus container">
      <div class="versus-head mono">Rev ${vb.versionLabel} → Rev ${va.versionLabel} — what changed</div>
      <div class="versus-grid">
        <figure>${renderExhibit(imgB, vb.title)}<div class="v-cap mono">Rev ${vb.versionLabel}</div></figure>
        <figure>${renderExhibit(imgA, va.title)}<div class="v-cap mono">Rev ${va.versionLabel}</div></figure>
      </div>
      <ul class="versus-changes">${block.changes.map((c) => `<li>${c}</li>`).join("")}</ul>
    </div>`;
  }

  return "";
}

function renderVersionNav(unit, currentIndex) {
  if (unit.versions.length < 2) return "";
  return `<div class="p-versions-nav">
    ${unit.versions
      .map((v, i) =>
        i === currentIndex
          ? `<span class="mono" aria-current="true">Rev ${v.versionLabel}</span>`
          : `<a class="mono" href="${projectHref(unit.id, i)}">Rev ${v.versionLabel}</a>`
      )
      .join("")}
  </div>`;
}

function renderFootNav(unit) {
  const flat = flatUnitList();
  const idx = flat.findIndex((f) => f.unit.id === unit.id);
  const prev = flat[(idx - 1 + flat.length) % flat.length];
  const next = flat[(idx + 1) % flat.length];
  return `<div class="p-nav-foot container">
    <a href="${projectHref(prev.unit.id, 0)}">&larr; ${prev.unit.title}</a>
    <a href="work.html">Full index</a>
    <a href="${projectHref(next.unit.id, 0)}">${next.unit.title} &rarr;</a>
  </div>`;
}

function renderProject() {
  const unitId = qParam("unit");
  const found = findUnitById(unitId);
  const main = document.getElementById("main");

  if (!found) {
    main.innerHTML = `<div class="container section">
      <p class="mono">Entry not found.</p>
      <p><a href="work.html">&larr; Back to the full index</a></p>
    </div>`;
    document.title = "Entry not found — Yahia Elghayesh";
    return;
  }

  const { unit, field } = found;
  const vIndex = Math.min(parseInt(qParam("v") || "0", 10) || 0, unit.versions.length - 1);
  const version = unit.versions[vIndex];
  const layout = getLayout(unit.id, version.versionLabel) || { hero: 0, blocks: [{ type: "text", highlights: version.highlights.map((_, i) => i) }] };
  const heroImage = version.images[layout.hero] || version.images[0];
  const tags = PROJECT_TAGS[unit.id] || [];
  const calloutLabels = tags.slice(0, 2);

  document.title = `${unit.title} — Yahia Elghayesh`;

  main.innerHTML = `
    <nav class="crumb container">
      <a href="index.html">Log</a><span>/</span>
      <a href="work.html#${field.category}">${field.categoryLabel}</a><span>/</span>
      <span>${unit.title}</span>
    </nav>
    <header class="p-header container">
      <span class="p-field mono">${field.categoryLabel}</span>
      <h1>${version.title}</h1>
      <p class="p-desc">${version.desc}</p>
      ${renderVersionNav(unit, vIndex)}
    </header>
    <div class="container">${annotatedHero(heroImage, unit.title, calloutLabels)}</div>
    ${layout.blocks.map((b) => renderBlock(b, unit, version)).join("")}
    ${renderFootNav(unit)}
  `;

  initCountUp(main);
}

renderProject();
document.getElementById("site-footer").innerHTML = `
  <div class="container footer-inner">
    <div>
      <div class="f-name">Yahia Elghayesh</div>
      <a class="f-email mono" href="mailto:y.elghayesh@gmail.com">y.elghayesh@gmail.com</a>
    </div>
    <div class="footer-meta mono">Log maintained continuously · every entry sourced from real hardware</div>
  </div>`;
