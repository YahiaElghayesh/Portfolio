// ---------- Motion system: smooth scroll, reveals, cursor, tilt, magnetic links ----------

var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var isCoarsePointer = window.matchMedia("(hover: none), (pointer: coarse)").matches;

function initSmoothScroll() {
  if (prefersReduced || typeof Lenis === "undefined") return null;
  var lenis = new Lenis({ duration: 1.1, smoothWheel: true });
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

// Splits text into per-line spans (no paid plugin) and reveals them on scroll.
function splitLines(el) {
  var words = el.textContent.trim().split(/\s+/);
  el.textContent = "";
  el.classList.add("split");
  words.forEach(function (w, i) {
    var span = document.createElement("span");
    span.className = "line";
    span.style.transitionDelay = i * 0 + "s";
    span.textContent = w + (i < words.length - 1 ? " " : "");
    el.appendChild(span);
  });
}

function initHeadingReveals(root) {
  if (typeof gsap === "undefined") return;
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
  if (typeof gsap === "undefined") return;
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

// Cursor-follow subtle 3D tilt for floating cutout images.
function initTilt(root) {
  if (prefersReduced || isCoarsePointer) return;
  var els = (root || document).querySelectorAll("[data-tilt]");
  els.forEach(function (el) {
    var strength = parseFloat(el.getAttribute("data-tilt")) || 8;
    var frame = el.closest("[data-tilt-frame]") || el;
    frame.style.perspective = "900px";
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;
      var py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = "rotateY(" + (px * strength) + "deg) rotateX(" + (-py * strength) + "deg)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "rotateY(0deg) rotateX(0deg)";
    });
  });
}

// Custom cursor dot that grows over interactive/hoverable elements.
function initCursor() {
  if (isCoarsePointer) return;
  var dot = document.createElement("div");
  dot.className = "cursor-dot";
  document.body.appendChild(dot);
  var x = 0, y = 0, cx = 0, cy = 0;
  window.addEventListener("mousemove", function (e) { x = e.clientX; y = e.clientY; });
  (function tick() {
    cx += (x - cx) * 0.2;
    cy += (y - cy) * 0.2;
    var scale = dot.classList.contains("is-hover") ? 5.75 : 1;
    dot.style.transform = "translate(" + cx + "px," + cy + "px) translate(-50%,-50%) scale(" + scale + ")";
    requestAnimationFrame(tick);
  })();
  document.querySelectorAll("a, button, [data-tilt]").forEach(function (el) {
    el.addEventListener("mouseenter", function () { dot.classList.add("is-hover"); });
    el.addEventListener("mouseleave", function () { dot.classList.remove("is-hover"); });
  });
}

// Magnetic pull for primary links/buttons.
function initMagnetic(root) {
  if (prefersReduced || isCoarsePointer) return;
  var els = (root || document).querySelectorAll("[data-magnetic]");
  els.forEach(function (el) {
    el.addEventListener("mousemove", function (e) {
      var r = el.getBoundingClientRect();
      var mx = e.clientX - (r.left + r.width / 2);
      var my = e.clientY - (r.top + r.height / 2);
      el.style.transform = "translate(" + mx * 0.25 + "px," + my * 0.25 + "px)";
    });
    el.addEventListener("mouseleave", function () {
      el.style.transform = "translate(0,0)";
    });
  });
}

// Hero parallax: photo drifts slower than scroll, subtle mouse-parallax too.
function initHeroParallax() {
  var img = document.querySelector(".hero-photo-wrap img");
  if (!img) return;
  if (typeof gsap !== "undefined" && !prefersReduced) {
    gsap.to(img, {
      yPercent: 12,
      ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  }
  if (!isCoarsePointer && !prefersReduced) {
    document.querySelector(".hero").addEventListener("mousemove", function (e) {
      var px = e.clientX / window.innerWidth - 0.5;
      var py = e.clientY / window.innerHeight - 0.5;
      img.style.transform = "translate(" + px * -14 + "px," + py * -10 + "px) scale(1.04)";
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
  initCursor();
});
