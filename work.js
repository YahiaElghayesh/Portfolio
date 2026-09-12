// ---------- Work index (work.html): full log, jump nav, no about/partners chrome ----------

function renderWorkHero() {
  const c = countAll();
  document.getElementById("work-hero").innerHTML = `
    <div class="container">
      <div class="log-meta">
        <span class="live-dot" aria-hidden="true"></span>
        <span><strong>FULL INDEX</strong></span>
        <span class="sep">—</span>
        <span><span class="mono-num" data-count-to="${c.projects}">0</span> projects</span>
        <span class="sep">·</span>
        <span><span class="mono-num" data-count-to="${c.versions}">0</span> revisions</span>
      </div>
      <h1 class="">Every entry, every field, every revision.</h1>
      <div class="field-jump">
        ${FIELDS.map((f) => `<a href="#${f.category}">${f.categoryLabel}</a>`).join("")}
      </div>
    </div>`;
}

document.getElementById("work-ledger-root").innerHTML = renderLedgerAllFields();
renderWorkHero();
document.getElementById("site-footer").innerHTML = `
  <div class="container footer-inner">
    <div>
      <div class="f-name">Yahia Elghayesh</div>
      <a class="f-email mono" href="mailto:y.elghayesh@gmail.com">y.elghayesh@gmail.com</a>
    </div>
    <div class="footer-meta mono">Log maintained continuously · every entry sourced from real hardware</div>
  </div>`;
