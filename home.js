// ---------- Home (index.html) ----------
//
// Every sentence on this page is Yahia's own, carried over verbatim from the
// portfolio. What changed is where each one lives and how it arrives.

function renderHero() {
  document.getElementById("hero-content").innerHTML = `
    <span class="kicker">Product Design &amp; Hardware Solutions</span>
    <p class="hero-lede">I engineer solutions from the ground up &mdash; identifying problems, designing, prototyping, manufacturing, and delivering fully realized products across medical, telecom, environmental, and robotics sectors.</p>
    <div class="hero-links">
      <a class="btn btn-primary" data-magnetic href="work.html">View the work</a>
      <a class="btn" data-magnetic href="#contact">Get in touch</a>
    </div>`;
}

// The tagline gets a screen of its own: it is the one sentence that says
// what the whole site is about.
function renderStatement() {
  document.getElementById("statement").innerHTML = `
    <div class="statement-pin">
      <p class="statement-text" data-scrub-words>&ldquo;If it exists, I <em>refine</em> it. If it doesn&rsquo;t, I <em>design</em> it.&rdquo;</p>
    </div>`;
}

function renderAbout() {
  document.getElementById("about-section").innerHTML = `
    <div class="container">
      <h2 class="section-title" data-reveal-text>Have you met Yahia Elghayesh?</h2>
      <div class="about-grid">
        <div class="about-stats">
          <div class="stat"><span class="stat-num" data-count="60" data-suffix="+">60+</span><span class="stat-label">Projects delivered on time &amp; on budget</span></div>
          <div class="stat"><span class="stat-num" data-count="18">18</span><span class="stat-label">Featured builds across 5 sectors</span></div>
        </div>
        <div class="about-copy" data-reveal>
          <p>I engineer solutions from the ground up&mdash;identifying problems, designing, prototyping, manufacturing, and delivering fully realized products.</p>
          <p>Proven project management record, delivering <strong>60+ projects</strong> on time and within budget across multiple sectors &mdash; from medical devices to telecom field equipment, environmental monitoring, and robotics.</p>
          <p>Driven self-learner with strong reasoning and articulate presentation. Passionate, relentless, and fears nothing.</p>
          <p class="about-offduty">When I&rsquo;m not designing, I&rsquo;m usually building something, riding my motorcycle, or in the gym training.</p>
        </div>
      </div>
    </div>`;
}

// The grinder shot is the strongest photograph Yahia has, so it gets the
// full width of the screen, and its sparks are continued live on the GPU
// (see addSparks in stage.js). The rest of the workshop set follows as an
// offset collage moving at different depths.
function renderWorkshop() {
  const sparksShot = WORKSHOP_STRIP.find((w) => /angle-grinder/.test(w.file));
  const rest = WORKSHOP_STRIP.filter((w) => w !== sparksShot);
  const collage = [
    { file: "assets/img/workshop-overview.webp", alt: "Yahia's home workshop, tool wall and workbench" },
    ...rest,
  ];
  document.getElementById("workshop-section").innerHTML = `
    <div class="sparks-stage" id="sparks-stage">
      <img class="sparks-img" src="assets/img/graded/sparks.webp"
        srcset="assets/img/graded/sparks-sm.webp 1000w, assets/img/graded/sparks.webp 2000w" sizes="100vw"
        alt="${sparksShot ? sparksShot.alt : ""}" width="2000" height="1333">
      <div class="sparks-scrim" aria-hidden="true"></div>
      <div class="container sparks-copy">
        <h2 class="section-title" data-reveal-text>In the workshop</h2>
        <p>The workshop I began building at the age of <strong>eight</strong>.<br>A testament to my lifelong passion for designing, creating, and bringing ideas to life.</p>
      </div>
    </div>
    <div class="container collage">
      ${collage
        .map(
          (w, i) => `<figure class="collage-item c${i + 1}" data-speed="${[0.1, -0.12, 0.2][i] || 0}">
            <img src="${w.file}" alt="${w.alt}" loading="lazy">
          </figure>`
        )
        .join("")}
    </div>`;
}

function renderToolbox() {
  document.getElementById("toolbox-section").innerHTML = `
    <div class="container">
      <div class="section-head">
        <h2 class="section-title" data-reveal-text>Toolbox</h2>
        <p>The software and certifications behind every project below.</p>
      </div>
      <div class="toolbox-grid">
        ${TOOLBOX.map(
          (group) => `<div class="toolbox-group" data-reveal>
            <h3>${group.name}</h3>
            <ul class="tool-list">
              ${group.tools
                .map((t) => {
                  const isSW = t.name === "SOLIDWORKS";
                  return `<li class="tool-item${isSW ? " has-certs" : ""}">
                    <img class="t-logo" src="${t.logo}" alt="" loading="lazy">
                    <span>${t.name}</span>
                    ${
                      isSW
                        ? `<span class="cert-badges">
                            ${CERTS.map(
                              (c) => `<a class="cert-badge" href="${c.url}" target="_blank" rel="noopener" title="${c.name}">
                                <img src="${c.badge}" alt="${c.name} credential badge">
                                <span>${c.code}</span>
                              </a>`
                            ).join("")}
                          </span>`
                        : ""
                    }
                  </li>`;
                })
                .join("")}
            </ul>
          </div>`
        ).join("")}
      </div>
    </div>`;
}

// ---------------------------------------------------------------- showroom ---
// The work, as objects. Every product that exists as a transparent render is
// set on a turntable ring in PDF order, each one a depth relief built from
// its own photo. Scrolling turns the ring; the product at the front is named
// underneath and links to its page.
//
// A product is only on the ring if it has a cut-out render: a photo with its
// background still in it would read as a card, not a thing. For the two
// units whose LAYOUTS hero is a context photo but which also have a V3
// cut-out render, that render is used here instead.
const SHOWROOM_OVERRIDES = {
  "inos-watcher": "assets/img/projects/inos-watcher-v3/overview-of-device-from-front-righ-slight-down.webp",
  "inos-gauge": "assets/img/projects/inos-gauge-v3/overview-of-device-front-top-right-opne-and.webp",
};

function showroomItems() {
  const items = [];
  FIELDS.forEach((field) =>
    field.units.forEach((unit) => {
      const hero = getHeroImage(unit, 0);
      const file = SHOWROOM_OVERRIDES[unit.id] || (hero && hero.kind === "cutout" ? hero.file : null);
      if (!file) return;
      items.push({ id: unit.id, title: unit.title, subtitle: unit.subtitle, field: field.categoryLabel, file });
    })
  );
  return items;
}

function renderShowroom() {
  const items = showroomItems();
  document.getElementById("work-cta-section").innerHTML = `
    <div class="showroom-pin">
      <div class="container showroom-head">
        <h2 class="section-title" data-reveal-text>See the work</h2>
        <a class="cta-link" data-magnetic href="work.html">View the work <span class="arrow">&rarr;</span></a>
      </div>
      <div class="showroom-stage" id="showroom-stage"></div>
      <div class="showroom-label" aria-live="polite">
        <span class="sl-field"></span>
        <a class="sl-title" href="work.html"></a>
        <span class="sl-sub"></span>
      </div>
      <ol class="showroom-list">
        ${items
          .map(
            (it) => `<li class="showroom-item">
              <a href="${projectHref(it.id)}">
                <span class="si-visual"><img src="${it.file}" alt="" loading="lazy"></span>
                <span class="si-title">${it.title}</span>
              </a>
            </li>`
          )
          .join("")}
      </ol>
    </div>`;
  return items;
}

function renderPartners() {
  document.getElementById("partners-section").innerHTML = `
    <div class="container">
      <h2 class="section-title" data-reveal-text>Companies I've worked with</h2>
      <div class="partners-grid">
        ${PARTNERS.map(
          (p) => `<a class="partner-card" href="${p.url}" target="_blank" rel="noopener" title="${p.name}">
            <span class="partner-logo" data-tilt="8" data-tilt-lift="26">
              <img src="${p.logo}" alt="${p.name}">
              <span class="flag">${FLAG_ICONS[p.flag] || ""}</span>
            </span>
          </a>`
        ).join("")}
      </div>
    </div>`;
}

renderHero();
renderStatement();
renderAbout();
renderWorkshop();
renderToolbox();
const SHOWROOM = renderShowroom();
renderPartners();
renderContact("contact");
renderFooter("site-footer");

// ------------------------------------------------------------ choreography ---

const heroState = { progress: 0 };

// The hero holds for one screen of scrolling while the portrait comes apart
// into dust and the name opens up behind it. Pinned with ScrollTrigger (not
// a scroll listener) so the progress is the same number the tweens use.
function initHeroScroll() {
  if (prefersReduced || typeof ScrollTrigger === "undefined") return;
  const hero = document.getElementById("hero");
  const pin = hero.querySelector(".hero-pin");
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: hero, start: "top top", end: "+=100%", pin: pin, scrub: 0.6,
      onUpdate: (self) => { heroState.progress = self.progress; },
    },
  });
  tl.to(".hn-1", { xPercent: -28, opacity: 0.12, ease: "none" }, 0)
    .to(".hn-2", { xPercent: 22, opacity: 0.12, ease: "none" }, 0)
    .to(".hero-copy", { y: -60, opacity: 0, ease: "none" }, 0)
    // Without WebGL the fallback photo simply recedes; with it, the avatar
    // shader does the dispersal and this does nothing visible.
    .to(".hero-avatar img", { scale: 0.86, opacity: 0, ease: "none" }, 0);
}

// Every word of the statement starts dim and lights up as it is scrolled
// past, so it is read at the pace it is scrolled rather than skimmed.
function initStatementScrub() {
  const el = document.querySelector("[data-scrub-words]");
  if (!el) return;
  // Wrap each word (keeping <em> emphasis) in a span.
  const walk = (node) => {
    Array.from(node.childNodes).forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach((part) => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(part));
          else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
  };
  walk(el);
  if (prefersReduced || typeof ScrollTrigger === "undefined") return;
  const words = el.querySelectorAll(".w");
  gsap.set(words, { opacity: 0.14 });
  gsap.to(words, {
    opacity: 1, stagger: 0.1, ease: "none",
    scrollTrigger: { trigger: "#statement", start: "top top", end: "+=90%", pin: ".statement-pin", scrub: 0.5 },
  });
}

// The two numbers count up when they come into view.
function initCounters() {
  document.querySelectorAll("[data-count]").forEach((el) => {
    const target = parseInt(el.getAttribute("data-count"), 10);
    const suffix = el.getAttribute("data-suffix") || "";
    if (prefersReduced || typeof ScrollTrigger === "undefined") return;
    const o = { v: 0 };
    el.textContent = "0" + suffix;
    gsap.to(o, {
      v: target, duration: 1.8, ease: "power3.out",
      scrollTrigger: { trigger: el, start: "top 85%" },
      onUpdate: () => { el.textContent = Math.round(o.v) + suffix; },
    });
  });
}

// Sparks section: the photo settles from a slight push-in as it arrives; the
// collage photos below drift at their own rates.
function initWorkshopMotion() {
  if (prefersReduced || typeof ScrollTrigger === "undefined") return;
  gsap.fromTo(".sparks-img", { scale: 1.18 }, {
    scale: 1, ease: "none",
    scrollTrigger: { trigger: "#sparks-stage", start: "top bottom", end: "bottom top", scrub: true },
  });
  document.querySelectorAll(".collage-item").forEach((fig) => {
    const speed = parseFloat(fig.getAttribute("data-speed")) || 0;
    gsap.fromTo(fig, { yPercent: speed * 60 }, {
      yPercent: -speed * 60, ease: "none",
      scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
    });
    gsap.fromTo(fig.querySelector("img"), { scale: 1.2, yPercent: -6 }, {
      scale: 1.2, yPercent: 6, ease: "none",
      scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: true },
    });
  });
}

// ---------------------------------------------------------------- the stage ---

function buildShowroom(S) {
  const stageEl = document.getElementById("showroom-stage");
  const section = document.getElementById("work-cta-section");
  const label = section.querySelector(".showroom-label");
  const lField = label.querySelector(".sl-field");
  const lTitle = label.querySelector(".sl-title");
  const lSub = label.querySelector(".sl-sub");
  const N = SHOWROOM.length;
  const ring = { angle: 0, target: 0, front: -1 };
  const step = (Math.PI * 2) / N;

  // The ring is pinned for a few screens and turns one full product per
  // stretch of scroll, landing each one square to the camera.
  const st = ScrollTrigger.create({
    trigger: section, start: "top top", end: "+=" + (N * 32) + "%", pin: ".showroom-pin", scrub: true,
    onUpdate: (self) => { ring.target = -self.progress * step * (N - 1); },
  });

  function setLabel(i) {
    if (i === ring.front) return;
    ring.front = i;
    const it = SHOWROOM[i];
    lField.textContent = it.field;
    lTitle.textContent = it.title;
    lTitle.href = projectHref(it.id);
    lSub.textContent = it.subtitle || "";
    if (!prefersReduced) gsap.fromTo(label.children, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.45, stagger: 0.04, ease: "power3.out", overwrite: true });
  }
  setLabel(0);

  SHOWROOM.forEach((it, i) => {
    addRelief(S, {
      el: stageEl, color: it.file, depth: DEPTH_MAPS[it.file], mode: "object", reflect: true,
      place: (relief, t) => {
        if (i === 0) {
          ring.angle += (ring.target - ring.angle) * 0.12;
          const idx = ((Math.round(-ring.angle / step) % N) + N) % N;
          setLabel(idx);
        }
        const r = stageEl.getBoundingClientRect();
        const m = relief.mesh, mat = relief.mat;
        if (r.bottom < 0 || r.top > S.vh() || r.width === 0) { m.visible = false; if (relief.mirror) relief.mirror.visible = false; return; }
        m.visible = true;
        const w = S.worldRect(r);
        // An elliptical track: wide across the screen so neighbours stand
        // clear of the front piece, shallow in depth so the back of the ring
        // stays in the room instead of vanishing into the distance.
        // On a phone the ring is wider than the screen, so the front piece
        // is large and its neighbours sit half off either edge, a carousel
        // you can see continuing rather than a row of thumbnails.
        const narrow = w.w < 700;
        const Rx = narrow ? w.w * 0.78 : Math.min(w.w * 0.44, 820);
        const Rz = narrow ? w.w * 0.9 : Math.min(w.w * 0.36, 640);
        const box = narrow ? Math.min(w.w * 0.62, w.h * 0.46) : Math.min(w.w * 0.24, w.h * 0.6, 440);
        const a = i * step + ring.angle;
        const facing = (Math.cos(a) + 1) / 2; // 1 at the front, 0 at the back
        let fw = box, fh = box / relief.aspect;
        if (fh > box) { fh = box; fw = fh * relief.aspect; }
        const scale = 0.45 + Math.pow(facing, 2.2) * 0.85;
        fw *= scale; fh *= scale;
        const floorY = w.y - box * 0.45;
        m.scale.set(fw, fh, 1);
        m.position.set(w.x + Math.sin(a) * Rx, floorY + fh / 2, (Math.cos(a) - 1) * Rz);
        m.rotation.set(0, a * 0.3 + Math.sin(t * 0.5 + i) * 0.05, 0);
        mat.uniforms.uRelief.value = Math.min(fw, fh) * 0.34;
        mat.uniforms.uFade.value = Math.pow(facing, 2.4);
        m.visible = facing > 0.12;
        if (relief.mirror) {
          const mm = relief.mirror;
          mm.scale.set(fw, -fh, 1);
          mm.position.set(m.position.x, floorY - fh / 2 - 2, m.position.z);
          mm.rotation.copy(m.rotation);
        }
      },
    }).catch(() => {});
  });

  document.documentElement.classList.add("has-showroom");
  ScrollTrigger.refresh();
  return st;
}

function startStage() {
  const avatarEl = document.getElementById("hero-avatar");
  const sparksImg = document.querySelector(".sparks-img");
  return initStage().then((S) => {
    const jobs = [];
    const avatar = addAvatar(S, {
      el: avatarEl,
      img: avatarEl.querySelector("img"),
      color: "assets/img/hero3d/yahia-chair.webp",
      depth: "assets/img/hero3d/yahia-chair-depth.webp",
      progress: () => heroState.progress,
    }).then((a) => { a.assemble(2.4); return a; });
    jobs.push(avatar);

    // The grinder's contact point, measured on the photo (53% across, 80%
    // down); the real sparks leave it between up-left and dead left.
    const startSparks = () => addSparks(S, {
      el: document.getElementById("sparks-stage"), img: sparksImg,
      point: [0.53, 0.8], angle: [2.25, 3.35],
    });
    if (sparksImg.complete) startSparks(); else sparksImg.addEventListener("load", startSparks, { once: true });

    // A small burst of sparks from the pointer when it lands on a contact
    // link: a tiny reward for reaching the end.
    if (!isCoarsePointer) {
      const burst = addSparks(S, { burst: true, angle: [0.35, 2.8], count: 160 });
      document.querySelectorAll(".contact-link").forEach((a) =>
        a.addEventListener("pointerenter", (e) => burst.fire(e.clientX, e.clientY))
      );
    }

    if (typeof ScrollTrigger !== "undefined" && SHOWROOM.length) buildShowroom(S);
    return Promise.race([
      avatar,
      new Promise((res) => setTimeout(res, 3500)),
    ]);
  });
}

// ------------------------------------------------------------------- intro ---
// A short curtain on the first visit of a session: a counter tracks the
// portrait's point cloud actually loading, then the curtain lifts and the
// cloud condenses into the figure. Never longer than the assets take, and
// hard-capped so a slow network cannot hold the page hostage.
function runIntro(ready) {
  const root = document.documentElement;
  const count = document.querySelector("[data-intro-count]");
  if (!root.classList.contains("intro")) return ready;
  const o = { v: 0 };
  const counter = gsap.to(o, {
    v: 92, duration: 1.6, ease: "power2.out",
    onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(3, "0"); },
  });
  const cap = new Promise((res) => setTimeout(res, 4000));
  return Promise.race([ready, cap]).then(() => {
    counter.kill();
    return new Promise((res) => {
      gsap.to(o, {
        v: 100, duration: 0.35, ease: "power1.out",
        onUpdate: () => { count.textContent = String(Math.round(o.v)).padStart(3, "0"); },
        onComplete: () => {
          gsap.to(".intro-curtain", {
            yPercent: -100, duration: 1.0, ease: "expo.inOut",
            onComplete: () => {
              root.classList.remove("intro");
              try { sessionStorage.setItem("ye-intro", "1"); } catch (e) {}
              res();
            },
          });
          gsap.from(".hn", { yPercent: 60, opacity: 0, duration: 1.2, stagger: 0.08, ease: "expo.out", delay: 0.45 });
          gsap.from(".hero-copy > *", { y: 24, opacity: 0, duration: 0.9, stagger: 0.07, ease: "power3.out", delay: 0.7 });
        },
      });
    });
  });
}

window.addEventListener("load", function () {
  document.querySelectorAll("[data-reveal-text]").forEach(splitLines);
  initHeadingReveals();
  initFadeUps();
  initDepthBackdrop();
  initDepthFloor();
  initScrollVelocity();
  initHeroScroll();
  initStatementScrub();
  initCounters();
  initWorkshopMotion();
  initDepthFlow();
  initTilt();
  initMagnetic();

  let ready = Promise.resolve();
  if (willUseWebGL()) ready = startStage().catch(() => {});
  runIntro(ready).then(() => { if (window.ScrollTrigger) ScrollTrigger.refresh(); });
});
