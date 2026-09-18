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

// Hero portrait: a faint mouse-parallax drift inside its frame.
function initHeroParallax() {
  var img = document.querySelector(".hero-portrait img");
  if (!img) return;
  if (!isCoarsePointer && !prefersReduced) {
    document.querySelector(".hero").addEventListener("mousemove", function (e) {
      var px = e.clientX / window.innerWidth - 0.5;
      var py = e.clientY / window.innerHeight - 0.5;
      img.style.transform = "translate(" + px * -6 + "px," + py * -5 + "px) scale(1.05)";
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  initSmoothScroll();
});
