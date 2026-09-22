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

// Objects travel through the viewport in 3D: they arrive tilted back from
// below, sit flat and full while they are the thing you are looking at, then
// tilt away again as they leave the top.
//
// Tied to the element's whole passage across the viewport rather than to a
// narrow "has arrived" band, for two reasons. It runs every time the element
// crosses, in either direction, instead of firing once and never again. And
// because the element is somewhere on its arc the entire time it is on
// screen, the depth is continuously visible instead of being a flicker you
// miss if you scroll past quickly.
function initDepthFlow(root) {
  if (prefersReduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  var scope = root || document;
  var narrow = window.matchMedia("(max-width: 820px)").matches;

  // The objects, where depth is the whole point, and the reading surfaces,
  // which have to come to rest flat and legible for much longer.
  var OBJECTS = ".project-tile, .partner-card, .photo-frame, .toolbox-panel, .workshop-lead .photo-frame";
  var SURFACES = "#main .section > .container, .work-intro > .container, .field-stage > .container";

  var objects = Array.prototype.slice.call(scope.querySelectorAll(OBJECTS));
  // Never drive one depth target from inside another. Objects win; the text
  // block wrapped around them stays put so it is not fighting its children.
  var surfaces = Array.prototype.slice.call(scope.querySelectorAll(SURFACES)).filter(function (c) {
    return !objects.some(function (o) { return c.contains(o); });
  });

  apply(objects, narrow ? 14 : 18, narrow ? 300 : 420, 0.25);
  apply(surfaces, narrow ? 5 : 7, narrow ? 140 : 200, 0.45);

  function apply(els, rot, dist, dim) {
    els.forEach(function (el, i) {
      if (el.dataset.depthBound) return;
      el.dataset.depthBound = "1";
      gsap.set(el, { transformOrigin: "50% 50%", transformPerspective: 1100 });

      // Staggering the start by position in the row makes a grid ripple
      // through depth instead of moving as one flat slab.
      var lead = (i % 3) * 45;
      var tl = gsap.timeline({
        scrollTrigger: {
          trigger: el,
          start: "top bottom-=" + lead,
          end: "bottom top+=" + lead,
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });
      tl.fromTo(
          el,
          { rotationX: rot, z: -dist, opacity: dim },
          { rotationX: 0, z: 0, opacity: 1, ease: "power2.out", duration: 1 }
        )
        .to(el, { duration: 0.85 }) // flat through the reading zone
        .to(el, {
          rotationX: -rot * 0.8, z: -dist * 0.55, opacity: dim + 0.25,
          ease: "power2.in", duration: 1,
        });
    });
  }
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
  if (!portrait || !content) return;

  // Scroll-driven, so it is just as present on a phone as on a desktop:
  // the portrait swings away into depth as you scroll through the hero,
  // and the text sinks back behind it. Both start neutral at the top of
  // the page, so the first paint is never a tilted or faded hero.
  if (typeof ScrollTrigger !== "undefined") {
    var pass = { trigger: hero, start: "top top", end: "bottom top", scrub: 0.6 };
    gsap.set(portrait, { transformOrigin: "50% 50%", transformPerspective: 1100 });
    gsap.fromTo(
      portrait,
      { rotationY: 0, rotationX: 0, z: 0 },
      { rotationY: -18, rotationX: 11, z: -300, ease: "none", scrollTrigger: pass }
    );
    gsap.set(content, { transformOrigin: "0% 50%", transformPerspective: 1100 });
    gsap.fromTo(
      content,
      { z: 0, opacity: 1 },
      { z: -200, opacity: 0.25, ease: "none", scrollTrigger: pass }
    );
  }

  // The pointer layer rides on the photo itself, one level inside the frame
  // the scroll is already moving. Two systems must never write the same
  // element's transform, or the last one to run silently wins.
  var photo = portrait.querySelector("img");
  if (!isCoarsePointer && photo) {
    gsap.set(photo, { transformPerspective: 900, transformOrigin: "50% 50%", scale: 1.06 });
    var pRx = gsap.quickTo(photo, "rotationX", { duration: 0.9, ease: "power3" });
    var pRy = gsap.quickTo(photo, "rotationY", { duration: 0.9, ease: "power3" });
    var pX = gsap.quickTo(photo, "x", { duration: 0.9, ease: "power3" });
    var pY = gsap.quickTo(photo, "y", { duration: 0.9, ease: "power3" });

    hero.addEventListener("pointermove", function (e) {
      var px = e.clientX / window.innerWidth - 0.5;
      var py = e.clientY / window.innerHeight - 0.5;
      pRy(px * 10);
      pRx(-py * 8);
      pX(px * 20);
      pY(py * 15);
    }, { passive: true });

    hero.addEventListener("pointerleave", function () {
      pRx(0); pRy(0); pX(0); pY(0);
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
});
