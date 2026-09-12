// ---------- Home (index.html) ----------

function renderHero() {
  document.getElementById("hero-content").innerHTML = `
    <span class="kicker">Hardware &amp; Product Design Engineer</span>
    <h1 data-reveal-text>Yahia Elghayesh</h1>
    <p class="hero-lede">I design, build, and ship precision hardware — medical devices, telecom test equipment, automation, environmental sensing, and research instrumentation.</p>
    <div class="hero-links">
      <a class="primary" data-magnetic href="work.html">View the work</a>
      <a data-magnetic href="#contact">Get in touch</a>
    </div>`;
}

function renderToolbox() {
  document.getElementById("toolbox-section").innerHTML = `
    <div class="container">
      <div class="section-head" data-reveal>
        <h2 data-reveal-text>Toolbox</h2>
        <p>The software and certifications behind every project below.</p>
      </div>
      <div class="toolbox-grid">
        ${TOOLBOX.map(
          (group) => `<div class="toolbox-group" data-reveal>
            <h3>${group.name}</h3>
            <div class="tool-list">
              ${group.tools
                .map((t) => {
                  const isSW = t.name === "SOLIDWORKS";
                  return `<div class="tool-item${isSW ? " has-certs" : ""}">
                    ${t.logo ? `<img class="t-logo" src="${t.logo}" alt="${t.name} logo">` : `<span class="t-logo is-empty" aria-hidden="true"></span>`}
                    <span>${t.name}</span>
                    ${
                      isSW
                        ? `<div class="cert-badges">
                            ${CERTS.map(
                              (c) => `<a class="cert-badge" href="${c.url}" target="_blank" rel="noopener">
                                <img src="${c.badge}" alt="${c.name} credential badge">
                                <span>${c.code}</span>
                              </a>`
                            ).join("")}
                          </div>`
                        : ""
                    }
                  </div>`;
                })
                .join("")}
            </div>
          </div>`
        ).join("")}
      </div>
    </div>`;
}

function renderWorkshop() {
  document.getElementById("workshop-section").innerHTML = `
    <div class="container">
      <div class="section-head" data-reveal>
        <h2 data-reveal-text>In the workshop</h2>
        <p>Most of these projects started on this bench — machining, wiring, and assembling the same hardware that ends up shipped to clients and deployed in the field.</p>
      </div>
      <div class="workshop-lead" data-reveal>
        <div class="photo-frame"><img src="assets/img/workshop-overview.webp" alt="Yahia's home workshop, tool wall and workbench"></div>
        <div>
          <p class="measure" style="color:var(--ink-2)">A working shop, not a showroom — the pegboard, the miter station, and the parts bins that every prototype above passes through before it ships.</p>
        </div>
      </div>
      <div class="workshop-strip">
        ${WORKSHOP_STRIP.map((w) => `<div class="photo-frame" data-reveal><img src="${w.file}" alt="${w.alt}"></div>`).join("")}
      </div>
    </div>`;
}

function renderPartners() {
  document.getElementById("partners-section").innerHTML = `
    <div class="container">
      <div class="section-head" data-reveal>
        <h2 data-reveal-text>Companies I've worked with</h2>
      </div>
      <div class="partners-grid" data-reveal>
        ${PARTNERS.map(
          (p) => `<a class="partner-item" href="${p.url}" target="_blank" rel="noopener">
            <span class="flag">${FLAG_ICONS[p.flag] || ""}</span>
            <img src="${p.logo}" alt="${p.name}">
          </a>`
        ).join("")}
      </div>
    </div>`;
}

function renderWorkCta() {
  document.getElementById("work-cta-section").innerHTML = `
    <div class="container work-cta" data-reveal>
      <h2 data-reveal-text>See the work</h2>
      <a class="cta-link" data-magnetic href="work.html">Featured projects, by field <span class="arrow">&rarr;</span></a>
    </div>`;
}

function renderContact() {
  document.getElementById("contact-section").innerHTML = `
    <div class="container contact-section" data-reveal>
      <h2 data-reveal-text>Let's talk</h2>
      <a class="contact-email" data-magnetic href="mailto:y.elghayesh@gmail.com">y.elghayesh@gmail.com</a>
    </div>`;
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `
    <div class="container footer-inner">
      <span>&copy; ${new Date().getFullYear()} Yahia Elghayesh</span>
      <a href="mailto:y.elghayesh@gmail.com">y.elghayesh@gmail.com</a>
    </div>`;
}

renderHero();
renderToolbox();
renderWorkshop();
renderPartners();
renderWorkCta();
renderContact();
renderFooter();

window.addEventListener("load", function () {
  document.querySelectorAll("[data-reveal-text]").forEach(splitLines);
  initHeadingReveals();
  initFadeUps();
  initHeroParallax();
  initMagnetic();
});
