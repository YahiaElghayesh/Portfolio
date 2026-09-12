// ---------- Work (work.html): field stages with scroll-scrubbed project transitions ----------

function renderVersionHistory(unit) {
  const older = unit.versions.slice(1);
  if (!older.length) return "";
  return `<details class="version-history">
    <summary><svg class="vh-chev" width="10" height="10" viewBox="0 0 10 10"><path d="M2 1l6 4-6 4" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>
      ${older.length} earlier revision${older.length > 1 ? "s" : ""}</summary>
    <div class="vh-list">
      ${older
        .map(
          (v) => `<div class="vh-item">
            <div class="vh-label">${v.versionLabel} — ${v.title}</div>
            <p>${v.desc}</p>
          </div>`
        )
        .join("")}
    </div>
  </details>`;
}

function renderStageSlide(unit, field, i) {
  const latest = unit.versions[0];
  const hero = getHeroImage(unit, 0);
  const tags = PROJECT_TAGS[unit.id] || [];
  return `<article class="stage-slide${i === 0 ? " is-active" : ""}" data-slide="${i}" id="${unit.id}">
    <div class="stage-grid">
      ${renderStageVisual(hero, unit.title)}
      <div class="stage-text">
        <span class="p-field">${field.categoryLabel}</span>
        <h3>${unit.title}${unit.subtitle ? `<span class="subtitle">${unit.subtitle}</span>` : ""}</h3>
        <div class="stage-body">
          <p>${latest.desc}</p>
          <ul>${latest.highlights.map((h) => `<li>${h}</li>`).join("")}</ul>
        </div>
        <div class="stage-tags">${tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
        ${renderVersionHistory(unit)}
      </div>
    </div>
  </article>`;
}

function renderFieldStage(field) {
  const n = field.units.length;
  return `
    <section class="field-stage" data-field="${field.category}" data-count="${n}">
      <div class="field-stage-inner">
        <div class="container">
          <div class="field-stage-head">
            <div class="container" style="padding-inline:0">
              <h2 id="${field.category}-nav">${field.categoryLabel}</h2>
              <span class="field-count">${String(n).padStart(2, "0")} projects</span>
            </div>
          </div>
          <div class="stage-slides">${field.units.map((u, i) => renderStageSlide(u, field, i)).join("")}</div>
          ${n > 1 ? `<div class="stage-progress">${field.units.map((_, i) => `<span class="${i === 0 ? "is-active" : ""}"></span>`).join("")}</div>` : ""}
        </div>
      </div>
    </section>`;
}

function initFieldStages() {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wide = window.matchMedia("(min-width: 901px)").matches;
  if (typeof gsap === "undefined" || typeof ScrollTrigger === "undefined" || reduced || !wide) return;

  document.querySelectorAll(".field-stage").forEach((stage) => {
    const n = parseInt(stage.getAttribute("data-count"), 10);
    if (n < 2) return;
    stage.classList.add("is-pinned-mode");

    const slides = stage.querySelectorAll(".stage-slide");
    const dots = stage.querySelectorAll(".stage-progress span");
    let current = 0;

    ScrollTrigger.create({
      trigger: stage,
      start: "top top",
      end: "+=" + n * 85 + "%",
      pin: stage.querySelector(".field-stage-inner"),
      scrub: 0.4,
      onUpdate: (self) => {
        const idx = Math.min(n - 1, Math.floor(self.progress * n));
        if (idx === current) return;
        const forward = idx > current;
        const prevSlide = slides[current];
        const nextSlide = slides[idx];
        prevSlide.classList.remove("is-active");
        nextSlide.classList.add("is-active");
        gsap.set(prevSlide, { position: "absolute" });
        gsap.fromTo(
          nextSlide.querySelector(".stage-img"),
          { scale: forward ? 1.12 : 0.88, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.55, ease: "power2.out" }
        );
        gsap.fromTo(
          nextSlide.querySelector(".stage-text"),
          { y: forward ? 18 : -18, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: "power2.out" }
        );
        dots.forEach((d, i) => d.classList.toggle("is-active", i === idx));
        current = idx;
      },
    });
  });
}

document.getElementById("work-intro").innerHTML = `
  <div class="container">
    <h1 data-reveal-text>Featured work</h1>
    <div class="field-nav">${FIELDS.map((f) => `<a href="#${f.category}-nav">${f.categoryLabel}</a>`).join("")}</div>
  </div>`;

document.getElementById("field-stages-root").innerHTML = FIELDS.map(renderFieldStage).join("");

document.getElementById("site-footer").innerHTML = `
  <div class="container footer-inner">
    <span>&copy; ${new Date().getFullYear()} Yahia Elghayesh</span>
    <a href="mailto:y.elghayesh@gmail.com">y.elghayesh@gmail.com</a>
  </div>`;

window.addEventListener("load", function () {
  document.querySelectorAll("[data-reveal-text]").forEach(splitLines);
  initHeadingReveals();
  initFadeUps();
  initTilt();
  initFieldStages();
  if (window.ScrollTrigger) ScrollTrigger.refresh();
});
