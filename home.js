// ---------- Home page rendering: certifications, toolbox, partners, workshop strip, work teaser ----------

// Certifications
const certList = document.getElementById("cert-list");
certList.innerHTML = CERTS.map(c => `
  <li>
    <span class="cert-badge">${certBadgeSVG()}</span>
    <span class="cert-name"><strong>${c.code}</strong><em>${c.name}</em></span>
    <img class="cert-issuer" src="${CERT_ISSUER_LOGO}" alt="Dassault Systèmes" loading="lazy">
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
  <div class="partner-item reveal">
    ${p.logo ? `<img src="${p.logo}" alt="${p.name}" loading="lazy">` : `<span class="partner-name">${p.name}</span>`}
  </div>
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
    const thumb = field.units[0].versions[0].images[0];
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
