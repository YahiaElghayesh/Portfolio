// ---------- Home (index.html) ----------

function renderHero() {
  document.getElementById("hero-content").innerHTML = `
    <span class="kicker">Product Design &amp; Hardware Solutions</span>
    <h1 data-reveal-text>Yahia Elghayesh</h1>
    <p class="hero-lede hero-tagline">&ldquo;If it exists, I refine it. If it doesn&rsquo;t, I design it.&rdquo;</p>
    <p class="hero-lede">I engineer solutions from the ground up &mdash; identifying problems, designing, prototyping, manufacturing, and delivering fully realized products across medical, telecom, environmental, and robotics sectors.</p>
    <div class="hero-links">
      <a class="primary" data-magnetic href="work.html">View the work</a>
      <a data-magnetic href="#contact">Get in touch</a>
    </div>`;
}

function renderAbout() {
  document.getElementById("about-section").innerHTML = `
    <div class="container">
      <div class="section-head" data-reveal>
        <h2 data-reveal-text>Have you met Yahia Elghayesh?</h2>
      </div>
      <div class="about-grid">
        <div class="about-copy" data-reveal>
          <p>I engineer solutions from the ground up&mdash;identifying problems, designing, prototyping, manufacturing, and delivering fully realized products.</p>
          <p>Proven project management record, delivering <strong>60+ projects</strong> on time and within budget across multiple sectors &mdash; from medical devices to telecom field equipment, environmental monitoring, and robotics.</p>
          <p>Driven self-learner with strong reasoning and articulate presentation. Passionate, relentless, and fears nothing.</p>
          <p class="about-offduty">When I&rsquo;m not designing, I&rsquo;m usually building something, riding my motorcycle, or in the gym training.</p>
        </div>
        <div class="about-stats" data-reveal>
          <div class="stat"><span class="stat-num">60+</span><span class="stat-label">Projects delivered on time &amp; on budget</span></div>
          <div class="stat"><span class="stat-num">18</span><span class="stat-label">Featured builds across 5 sectors</span></div>
        </div>
      </div>
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
      </div>
      <div class="workshop-lead" data-reveal>
        <div class="photo-frame"><img src="assets/img/workshop-overview.webp" alt="Yahia's home workshop, tool wall and workbench"></div>
        <div>
          <p class="measure" style="color:var(--ink-2)">The workshop I began building at the age of <strong>eight</strong>.<br>A testament to my lifelong passion for designing, creating, and bringing ideas to life.</p>
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
          (p) => `<a class="partner-card" href="${p.url}" target="_blank" rel="noopener">
            <span class="partner-logo"><img src="${p.logo}" alt="${p.name}"></span>
            <span class="partner-meta">
              <span class="partner-name">${p.name}</span>
              <span class="flag">${FLAG_ICONS[p.flag] || ""}</span>
            </span>
          </a>`
        ).join("")}
      </div>
    </div>`;
}

function renderWorkCta() {
  document.getElementById("work-cta-section").innerHTML = `
    <div class="container work-cta" data-reveal>
      <h2 data-reveal-text>See the work</h2>
      <a class="cta-link" data-magnetic href="work.html">View the work <span class="arrow">&rarr;</span></a>
    </div>`;
}

renderHero();
renderAbout();
renderToolbox();
renderWorkshop();
renderPartners();
renderWorkCta();
renderContact("contact-section");
renderFooter("site-footer");

window.addEventListener("load", function () {
  document.querySelectorAll("[data-reveal-text]").forEach(splitLines);
  initHeadingReveals();
  initFadeUps();
  initHeroParallax();
  initMagnetic();
});
