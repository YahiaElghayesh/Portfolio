// ---------- Work index: fields, each listing its project units as cards ----------

const fieldsEl = document.getElementById("work-fields");
const jumpNav = document.getElementById("field-jump");

jumpNav.innerHTML = FIELDS.map(f => `<a href="#${f.category}">${f.categoryLabel}</a>`).join("");

fieldsEl.innerHTML = FIELDS.map(field => `
  <div class="field-group" id="${field.category}">
    <div class="field-head reveal">
      <h3>${field.categoryLabel}</h3>
      <span class="field-count">${field.units.length} ${field.units.length === 1 ? "project" : "projects"}</span>
    </div>
    <div class="work-card-grid">
      ${field.units.map(unit => {
        const v0 = unit.versions[0];
        const thumb = v0.images[0];
        const hasVersions = unit.versions.length > 1;
        return `
        <a class="work-card reveal" href="project.html?id=${unit.id}">
          <span class="work-card-media kind-${thumb.kind}"><img src="${thumb.file}" alt="" loading="lazy"></span>
          <span class="work-card-body">
            ${hasVersions ? `<span class="work-card-versions">${unit.versions.length} versions · latest ${v0.versionLabel}</span>` : ""}
            <span class="work-card-title">${unit.title}</span>
            ${unit.subtitle ? `<span class="work-card-subtitle">${unit.subtitle}</span>` : ""}
            <span class="work-card-desc">${v0.desc}</span>
          </span>
        </a>
      `;
      }).join("")}
    </div>
  </div>
`).join("");

observeRevealAll(".reveal");
