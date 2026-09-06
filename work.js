// ---------- Work index: fields, each listing its project units as asymmetric zig-zag rows ----------

const fieldsEl = document.getElementById("work-fields");
const jumpNav = document.getElementById("field-jump");

jumpNav.innerHTML = FIELDS.map(f => `<a href="#${f.category}">${f.categoryLabel}</a>`).join("");

// varies row image aspect so consecutive rows never match
const ASPECTS = ["4/3", "1/1", "16/10", "3/4"];

fieldsEl.innerHTML = FIELDS.map(field => `
  <div class="field-group" id="${field.category}">
    <div class="field-head reveal">
      <h3>${field.categoryLabel}</h3>
      <span class="field-count">${field.units.length} ${field.units.length === 1 ? "project" : "projects"}</span>
    </div>
    <div class="work-rows">
      ${field.units.map((unit, i) => {
        const v0 = unit.versions[0];
        const thumb = v0.images[0];
        const hasVersions = unit.versions.length > 1;
        const tags = [hasVersions ? `${unit.versions.length} versions` : "Delivered", ...(PROJECT_TAGS[unit.id] || [])];
        const aspect = ASPECTS[i % ASPECTS.length];
        return `
        <a class="work-row reveal ${i % 2 === 1 ? "is-reversed" : ""}" href="project.html?id=${unit.id}">
          <span class="work-row-media kind-${thumb.kind}" style="--row-aspect:${aspect}"><img src="${thumb.file}" alt="" loading="lazy"></span>
          <span class="work-row-body">
            <span class="work-row-tags">${tags.join(" &middot; ")}</span>
            <span class="work-row-title">${unit.title}</span>
            ${unit.subtitle ? `<span class="work-row-subtitle">${unit.subtitle}</span>` : ""}
            <span class="work-row-desc">${v0.desc}</span>
            <span class="work-row-cta">View project <span>&rarr;</span></span>
          </span>
        </a>
      `;
      }).join("")}
    </div>
  </div>
`).join("");

observeRevealAll(".reveal");
