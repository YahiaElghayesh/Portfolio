// ---------- Motion system: smooth scroll, reveals, cursor, tilt, magnetic links ----------

var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

var lenisInstance = null;

function initSmoothScroll() {
  if (prefersReduced || typeof Lenis === "undefined") return null;
  var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
  lenisInstance = lenis;
  document.documentElement.classList.add("has-smooth-scroll");
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);
  if (window.ScrollTrigger) {
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add(function (time) { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  return lenis;
}

// Same-page "#hash" links, handled once, independent of whether Lenis is
// active. Two real bugs otherwise: (1) when Lenis IS running it owns scroll
// position via its own RAF loop, so a plain native jump gets silently
// fought and undone the next frame; (2) "#top" targets the fixed header,
// which has no meaningful document position for a *native* jump to resolve
// (fixed elements sit outside document flow) — that's broken with or
// without Lenis, so it's special-cased to "scroll to 0" either way.
document.addEventListener("click", function (e) {
  var link = e.target.closest('a[href^="#"]');
  if (!link) return;
  var id = link.getAttribute("href").slice(1);
  var toTop = id === "top" || !id;
  var target = toTop ? 0 : document.getElementById(id);
  if (target === undefined || target === null) return;
  e.preventDefault();
  if (lenisInstance) {
    lenisInstance.scrollTo(target, { offset: 0 });
  } else {
    var y = toTop ? 0 : target.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: y, behavior: prefersReduced ? "auto" : "smooth" });
  }
  history.pushState(null, "", id ? "#" + id : location.pathname);
});

// Splits text into per-line spans (no paid plugin) and reveals them on scroll.
function splitLines(el) {
  // The "split" class is what HIDES the words (CSS translates them out of an
  // overflow-hidden box), so it is only added when something is definitely
  // going to reveal them again. Without that guard, a reader with reduced
  // motion, or any browser where GSAP failed to load, gets blank headings.
  var canAnimate = !prefersReduced && typeof gsap !== "undefined";
  var words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  if (canAnimate) el.classList.add("split");
  words.forEach(function (w, i) {
    var span = document.createElement("span");
    span.className = "line";
    span.style.transitionDelay = i * 0 + "s";
    span.textContent = w + (i < words.length - 1 ? " " : "");
    el.appendChild(span);
  });
}

function initHeadingReveals(root) {
  if (prefersReduced || typeof gsap === "undefined") return;
  var headings = (root || document).querySelectorAll("[data-reveal-text]");
  headings.forEach(function (h) {
    var lines = h.querySelectorAll(".line");
    if (!lines.length) return;
    gsap.to(lines, {
      y: 0,
      duration: 0.9,
      ease: "power3.out",
      stagger: 0.04,
      scrollTrigger: { trigger: h, start: "top 90%" },
    });
  });
}

function initFadeUps(root) {
  // Reduced motion leaves the content where it is, visible, instead of
  // animating it in from an invisible start state.
  if (prefersReduced || typeof gsap === "undefined") return;
  var els = (root || document).querySelectorAll("[data-reveal]");
  els.forEach(function (el) {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1, y: 0, duration: 0.8, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 88%" },
      }
    );
  });
}

// ---------- Depth layer ----------
// Every 3D effect below routes through GSAP rather than writing
// el.style.transform directly. Two reasons: GSAP tracks rotation, x/y and z
// as independent components of one matrix, so a tilt can coexist with a
// scroll reveal on the same element instead of clobbering it; and quickTo
// reuses a single tween per property instead of spawning one per pointer
// event.

// Pointer tilt: a card leans toward the cursor and lifts toward the viewer,
// so it reads as a physical object you could pick up rather than a rectangle.
// data-tilt = max degrees, data-tilt-lift = px toward the camera.
function initTilt(root) {
  if (prefersReduced || isCoarsePointer || typeof gsap === "undefined") return;
  (root || document).querySelectorAll("[data-tilt]").forEach(function (el) {
    if (el.dataset.tiltBound) return; // re-render safe: the modal re-inits
    el.dataset.tiltBound = "1";

    var max = parseFloat(el.getAttribute("data-tilt")) || 8;
    var lift = parseFloat(el.getAttribute("data-tilt-lift")) || 0;
    gsap.set(el, { transformPerspective: 900, transformOrigin: "50% 50%" });

    var rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
    var ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
    var tz = lift ? gsap.quickTo(el, "z", { duration: 0.5, ease: "power3" }) : null;

    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      rx(-py * max);
      ry(px * max);
      if (tz) tz(lift);
      // Feeds the .sheen gloss so the highlight tracks the same point.
      el.style.setProperty("--mx", ((px + 0.5) * 100).toFixed(1) + "%");
      el.style.setProperty("--my", ((py + 0.5) * 100).toFixed(1) + "%");
    }, { passive: true });

    el.addEventListener("pointerleave", function () {
      rx(0);
      ry(0);
      if (tz) tz(0);
    });
  });
}

// Content blocks arrive from depth as they enter the viewport, so each one
// reads as stepping forward to be read rather than sliding past.
function initSectionDepth(root) {
  if (prefersReduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  var narrow = window.matchMedia("(max-width: 780px)").matches;
  var depth = narrow ? 120 : 220;
  var sel = "#main .section > .container, .work-intro > .container, .field-stage > .container";

  (root || document).querySelectorAll(sel).forEach(function (el) {
    if (el.dataset.depthBound) return;
    el.dataset.depthBound = "1";

    // A block taller than the viewport would visibly skew at its far edge,
    // because the perspective origin sits at its own centre. Those get the
    // Z move only.
    var tall = el.getBoundingClientRect().height > window.innerHeight * 0.9;
    gsap.set(el, { transformOrigin: "50% 50%" });
    gsap.fromTo(
      el,
      { z: -depth, rotationX: tall ? 0 : 2.5, opacity: 0.4, transformPerspective: 1600 },
      {
        z: 0, rotationX: 0, opacity: 1, transformPerspective: 1600, ease: "power1.out",
        scrollTrigger: {
          trigger: el, start: "top 90%", end: "top 55%", scrub: 0.5,
          // Once a block has fully arrived there is nothing left to animate,
          // and leaving a 3D matrix on it would keep a text block on its own
          // compositing layer for the rest of the session, which softens
          // glyph rendering. Drop the transform; the tween re-applies it
          // (perspective included) if the reader scrolls back up.
          onLeave: function () { gsap.set(el, { clearProps: "transform" }); },
        },
      }
    );
  });
}

// The two pools of light behind the page drift against the scroll, which
// gives the Z-movement a fixed background to be measured against.
function initDepthBackdrop() {
  var bg = document.querySelector(".depth-bg");
  if (!bg || prefersReduced || typeof gsap === "undefined") return;
  var d1 = bg.querySelector(".d1");
  var d2 = bg.querySelector(".d2");

  if (typeof ScrollTrigger !== "undefined") {
    var track = { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1.2 };
    gsap.to(d1, { yPercent: 16, ease: "none", scrollTrigger: track });
    gsap.to(d2, { yPercent: -20, ease: "none", scrollTrigger: track });
  }

  if (!isCoarsePointer) {
    var x1 = gsap.quickTo(d1, "x", { duration: 1.6, ease: "power2" });
    var y1 = gsap.quickTo(d1, "y", { duration: 1.6, ease: "power2" });
    var x2 = gsap.quickTo(d2, "x", { duration: 2, ease: "power2" });
    var y2 = gsap.quickTo(d2, "y", { duration: 2, ease: "power2" });
    window.addEventListener("pointermove", function (e) {
      var px = e.clientX / window.innerWidth - 0.5;
      var py = e.clientY / window.innerHeight - 0.5;
      x1(px * 60); y1(py * 40);
      x2(px * -45); y2(py * -30);
    }, { passive: true });
  }
}

// Project photo galleries: clicking a thumbnail trades places with the main
// photo — the photo that was in main moves into that thumbnail's spot — so
// whatever was showing before is always one more click away, never stranded.
function initGalleries(root) {
  (root || document).querySelectorAll(".stage-visual.has-gallery").forEach(function (stage) {
    var mainImg = stage.querySelector(".visual-main img");
    stage.querySelectorAll(".visual-cell").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var newSrc = btn.getAttribute("data-src");
        var newKind = btn.getAttribute("data-kind");
        var oldSrc = mainImg.getAttribute("src");
        var oldKind = mainImg.getAttribute("data-kind");
        var thumbImg = btn.querySelector("img");

        var swap = function () {
          mainImg.src = newSrc;
          mainImg.setAttribute("data-kind", newKind);
          mainImg.classList.toggle("is-context", newKind !== "cutout");
          if (typeof gsap !== "undefined" && !prefersReduced) {
            gsap.fromTo(mainImg, { opacity: 0, scale: 0.97 }, { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" });
          }
        };
        if (typeof gsap !== "undefined" && !prefersReduced) {
          gsap.to(mainImg, { opacity: 0, scale: 0.97, duration: 0.16, ease: "power1.in", onComplete: swap });
        } else {
          swap();
        }

        thumbImg.src = oldSrc;
        btn.setAttribute("data-src", oldSrc);
        btn.setAttribute("data-kind", oldKind);
        btn.classList.toggle("is-cutout", oldKind === "cutout");
        btn.classList.toggle("is-context", oldKind !== "cutout");
      });
    });
  });
}

// Magnetic pull for primary links/buttons.
function initMagnetic(root) {
  if (prefersReduced || isCoarsePointer || typeof gsap === "undefined") return;
  (root || document).querySelectorAll("[data-magnetic]").forEach(function (el) {
    if (el.dataset.magneticBound) return;
    el.dataset.magneticBound = "1";
    var mx = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3" });
    var my = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3" });
    el.addEventListener("pointermove", function (e) {
      var r = el.getBoundingClientRect();
      mx((e.clientX - (r.left + r.width / 2)) * 0.25);
      my((e.clientY - (r.top + r.height / 2)) * 0.25);
    }, { passive: true });
    el.addEventListener("pointerleave", function () {
      mx(0);
      my(0);
    });
  });
}

// Hero depth: the portrait sits on a nearer plane than the headline, so the
// two separate as the cursor moves. That separation is what reads as real
// space, rather than a photo with an effect on it.
function initHeroDepth() {
  var hero = document.querySelector(".hero");
  if (!hero || prefersReduced || typeof gsap === "undefined") return;
  var portrait = hero.querySelector(".hero-portrait");
  var content = hero.querySelector(".hero-content");
  var grid = hero.querySelector(".hero-grid");
  if (!portrait || !content) return;

  if (!isCoarsePointer) {
    gsap.set(portrait, { transformPerspective: 1200, transformOrigin: "50% 50%" });
    var pRx = gsap.quickTo(portrait, "rotationX", { duration: 0.9, ease: "power3" });
    var pRy = gsap.quickTo(portrait, "rotationY", { duration: 0.9, ease: "power3" });
    var pX = gsap.quickTo(portrait, "x", { duration: 0.9, ease: "power3" });
    var pY = gsap.quickTo(portrait, "y", { duration: 0.9, ease: "power3" });
    var cX = gsap.quickTo(content, "x", { duration: 1.1, ease: "power3" });
    var cY = gsap.quickTo(content, "y", { duration: 1.1, ease: "power3" });

    hero.addEventListener("pointermove", function (e) {
      var px = e.clientX / window.innerWidth - 0.5;
      var py = e.clientY / window.innerHeight - 0.5;
      pRy(px * 9);
      pRx(-py * 7);
      pX(px * 16);
      pY(py * 12);
      // The text plane drifts the other way and less far: the nearer an
      // object, the more it should shift.
      cX(px * -9);
      cY(py * -7);
    }, { passive: true });

    hero.addEventListener("pointerleave", function () {
      pRx(0); pRy(0); pX(0); pY(0); cX(0); cY(0);
    });
  }

  // Leaving the hero pushes it back into the scene, so whatever follows
  // reads as arriving in front of it instead of merely scrolling over it.
  if (grid && typeof ScrollTrigger !== "undefined") {
    gsap.set(grid, { transformPerspective: 1600, transformOrigin: "50% 100%" });
    gsap.to(grid, {
      z: -260, opacity: 0.35, ease: "none",
      scrollTrigger: { trigger: hero, start: "bottom bottom", end: "bottom top", scrub: 0.6 },
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
});
