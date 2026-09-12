// ---------- Home (index.html): masthead ledger header + full field-grouped log ----------

function renderMasthead() {
  const c = countAll();
  document.getElementById("log-header").innerHTML = `
    <div class="container">
      <div class="log-meta">
        <span class="live-dot" aria-hidden="true"></span>
        <span><strong>LOG</strong></span>
        <span class="sep">—</span>
        <span>Yahia Elghayesh, Hardware &amp; Product Design Engineer</span>
        <span class="sep">—</span>
        <span><span class="mono-num" data-count-to="${c.projects}">0</span> projects</span>
        <span class="sep">·</span>
        <span><span class="mono-num" data-count-to="${c.versions}">0</span> shipped revisions</span>
        <span class="sep">·</span>
        <span><span class="mono-num" data-count-to="${c.fields}">0</span> disciplines</span>
      </div>
      <div class="masthead">
        <h1>Precision hardware, proven across five disciplines.</h1>
        <p class="lede">Medical devices, telecom test equipment, automation, environmental sensing, and research instrumentation — each entry below is real, shipped hardware, logged with what changed and why.</p>
      </div>
    </div>`;
}

function renderAbout() {
  document.getElementById("about-section").innerHTML = `
    <div class="container about-grid">
      <div class="">
        <div class="section-head"><h2>In the workshop</h2></div>
        <p class="measure" style="color:var(--ink-2)">Most of these projects started on this bench — machining, wiring, and assembling the same hardware that ends up in the field, before it ever reaches a client site.</p>
        <div class="certs-row" style="margin-top:var(--space-6)">
          ${CERTS.map(
            (c) => `<a class="cert-item" href="${c.url}" target="_blank" rel="noopener">
              <img src="${c.badge}" alt="${c.name} credential badge">
              <span><span class="c-code mono">${c.code}</span><br><span class="c-name">${c.name}</span></span>
            </a>`
          ).join("")}
        </div>
      </div>
      <div class="workshop-strip">
        ${WORKSHOP_STRIP.map((w) => `<img src="${w.file}" alt="${w.alt}">`).join("")}
      </div>
    </div>`;
}

function renderPartners() {
  document.getElementById("partners-section").innerHTML = `
    <div class="container">
      <div class="section-head"><h2>Worked with</h2></div>
      <div class="partners-strip">
        ${PARTNERS.map(
          (p) => `<a class="partner-item" href="${p.url}" target="_blank" rel="noopener">
            <span class="flag">${FLAG_ICONS[p.flag] || ""}</span>
            <img src="${p.logo}" alt="${p.name}">
          </a>`
        ).join("")}
      </div>
    </div>`;
}

function renderToolbox() {
  document.getElementById("toolbox-section").innerHTML = `
    <div class="container">
      <div class="section-head"><h2>Toolbox</h2></div>
      <div class="toolbox-grid">
        ${TOOLBOX.map(
          (group) => `<div class="toolbox-group">
            <h3 class="mono">${group.name}</h3>
            <div class="tool-list">
              ${group.tools
                .map(
                  (t) => `<div class="tool-item">
                    ${t.logo ? `<img class="t-logo" src="${t.logo}" alt="${t.name} logo">` : `<span class="t-logo is-empty" aria-hidden="true"></span>`}
                    <span>${t.name}</span>
                  </div>`
                )
                .join("")}
            </div>
          </div>`
        ).join("")}
      </div>
    </div>`;
}

function renderFooter() {
  document.getElementById("site-footer").innerHTML = `
    <div class="container footer-inner">
      <div>
        <div class="f-name">Yahia Elghayesh</div>
        <a class="f-email mono" href="mailto:y.elghayesh@gmail.com">y.elghayesh@gmail.com</a>
      </div>
      <div class="footer-meta mono">Log maintained continuously · every entry sourced from real hardware</div>
    </div>`;
}

document.getElementById("ledger-root").innerHTML = renderLedgerAllFields();
renderMasthead();
renderAbout();
renderPartners();
renderToolbox();
renderFooter();
