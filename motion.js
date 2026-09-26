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
    // Each word hinges up from its own bottom edge and comes forward out of
    // depth, instead of sliding up flat. The origin is the bottom of the
    // word and the perspective is per-word, so every word gets its own
    // vanishing point rather than sharing one for the whole page — that is
    // what stops a long heading from looking sheared off to one side.
    gsap.set(lines, { transformOrigin: "50% 100%", transformPerspective: 520 });
    gsap.fromTo(
      lines,
      { yPercent: 110, y: 0, rotationX: -58, z: -90, opacity: 0 },
      {
        yPercent: 0, y: 0, rotationX: 0, z: 0, opacity: 1,
        duration: 1.05,
        ease: "power3.out",
        stagger: 0.055,
        scrollTrigger: { trigger: h, start: "top 90%" },
      }
    );
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
// Where an element sits across its own row: -1 at the left-hand end, +1 at
// the right-hand end, 0 dead centre — and 0 for anything that is alone on
// its line, which has no row to be positioned along.
//
// Measured from laid-out geometry, not from an index, and against the row's
// real extent rather than the container's. Both matter here. The grids are
// auto-fill, so an index only maps to a column if you already know the
// column count, and it changes with the viewport. And the rows are ragged —
// Automation has two projects in a four-wide grid — so measuring against the
// container would put a short row entirely in the left half and fan every
// card in it the same way, instead of opening it around its own middle.
function rowPosition(el) {
  var parent = el.parentNode;
  if (!parent || !parent.children) return 0;
  var er = el.getBoundingClientRect();
  var left = er.left;
  var right = er.right;

  Array.prototype.forEach.call(parent.children, function (sib) {
    var sr = sib.getBoundingClientRect();
    // Same row = vertical spans overlap. The 4px slack absorbs cards of
    // slightly different heights sitting on one line.
    if (sr.bottom <= er.top + 4 || sr.top >= er.bottom - 4) return;
    if (sr.left < left) left = sr.left;
    if (sr.right > right) right = sr.right;
  });

  var span = right - left;
  if (span <= er.width + 1) return 0;
  return ((er.left + er.width / 2 - left) / span - 0.5) * 2;
}

function initDepthFlow(root) {
  if (prefersReduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  var scope = root || document;
  var narrow = window.matchMedia("(max-width: 820px)").matches;

  // The objects, where depth is the whole point, and the reading surfaces,
  // which have to come to rest flat and legible for much longer.
  // Project tiles come out of this list when WebGL is going to run: there,
  // the product inside each tile is an object the GPU turns in real 3D, and
  // it is positioned from the tile's screen rectangle. A CSS rotation on the
  // tile would move that rectangle out from under it every frame.
  var OBJECTS = willUseWebGL()
    ? ".partner-card, .toolbox-group"
    : ".project-tile, .partner-card, .toolbox-group";
  var SURFACES = "#main .section > .container, .work-intro > .container";

  var objects = Array.prototype.slice.call(scope.querySelectorAll(OBJECTS));
  // Never drive one depth target from inside another. Objects win; the text
  // block wrapped around them stays put so it is not fighting its children.
  var surfaces = Array.prototype.slice.call(scope.querySelectorAll(SURFACES)).filter(function (c) {
    return !objects.some(function (o) { return c.contains(o); });
  });

  apply(objects, narrow ? 14 : 18, narrow ? 300 : 420, 0.25, narrow ? 11 : 17);
  apply(surfaces, narrow ? 5 : 7, narrow ? 140 : 200, 0.45, 0);

  function apply(els, rot, dist, dim, fan) {
    els.forEach(function (el, i) {
      if (el.dataset.depthBound) return;
      el.dataset.depthBound = "1";
      gsap.set(el, { transformOrigin: "50% 50%", transformPerspective: 1100 });

      var side = rowPosition(el);
      // A phone stacks every one of these into a single column, so there is
      // no row left to fan along and rowPosition correctly returns 0 for all
      // of them — which would leave the narrow layout, the one the site is
      // mostly read on, with no Y-rotation at all. Down there the cards are
      // dealt instead: consecutive cards arrive turned opposite ways, which
      // is the same idea (a row opening) expressed over time rather than
      // across the screen.
      if (fan && narrow && side === 0) side = i % 2 ? 0.75 : -0.75;

      // Staggering the start by distance from the centre makes a row ripple
      // outward through depth instead of moving as one flat slab...
      var lead = Math.abs(side) * 70;
      // ...and turning the two halves of the row in opposite directions
      // makes it open like a hand of cards being laid down. A full-width
      // block sits at side ~0 and so never fans, which is what we want:
      // only things arranged in a row have a row to fan along. Always 0 at
      // rest, so nothing is ever read at an angle.
      var turn = fan ? side * fan : 0;
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
          { rotationX: rot, rotationY: turn, z: -dist, opacity: dim },
          { rotationX: 0, rotationY: 0, z: 0, opacity: 1, ease: "power2.out", duration: 1 }
        )
        .to(el, { duration: 0.85 }) // flat through the reading zone
        .to(el, {
          rotationX: -rot * 0.8, rotationY: -turn * 0.6,
          z: -dist * 0.55, opacity: dim + 0.25,
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

// Scroll speed, published two ways: as a CSS variable for paint properties,
// and as a signed number the WebGL shaders read to bend geometry. Nothing
// here competes with the tweens for an element's matrix.
//
// The reading comes from ScrollTrigger rather than a scroll listener.
// A listener on "scroll" fires unbatched, ahead of the frame the rest of
// this file draws in, so the value the shaders read would be from a
// different moment than the transforms around them.
var scrollVelocitySigned = 0;

function initScrollVelocity() {
  if (prefersReduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  var impulse = 0;

  ScrollTrigger.create({
    onUpdate: function (self) {
      // px/sec, signed. 2600 px/sec is treated as flat out.
      var v = self.getVelocity() / 2600;
      impulse = Math.max(-1, Math.min(1, v));
    },
  });

  gsap.ticker.add(function () {
    impulse *= 0.9;                                      // decays to nothing
    scrollVelocitySigned += (impulse - scrollVelocitySigned) * 0.12;
    if (Math.abs(scrollVelocitySigned) < 0.001) scrollVelocitySigned = 0;
    document.documentElement.style.setProperty("--vel", Math.abs(scrollVelocitySigned).toFixed(3));
  });
}

// The receding floor. A Z-translation on its own is indistinguishable from a
// scale — it only becomes travel once there is a ground plane staying still
// behind it. The plane itself is laid down in CSS (one rotateX); all this
// does is scroll the grid under the page, which is why it animates a custom
// property instead of a transform: the rotation has to stay untouched.
function initDepthFloor() {
  var floor = document.querySelector(".depth-bg .floor");
  if (!floor || prefersReduced || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;
  gsap.to(floor, {
    "--gy": "1400px",
    ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: 1 },
  });
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

document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
});
