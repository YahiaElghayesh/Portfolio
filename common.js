// ---------- Shared behavior across all pages: reveal-on-scroll, lightbox modal, mobile nav, footer year ----------

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
function observeReveal(el) { revealObserver.observe(el); }
function observeRevealAll(selector) { document.querySelectorAll(selector).forEach(observeReveal); }

// monogram fallback for a tool/logo with no sourced image
function logoOrMonogram(name, logoPath, extraClass) {
  if (logoPath) return `<img class="logo-mark ${extraClass || ""}" src="${logoPath}" alt="${name}" loading="lazy">`;
  const initial = name.trim().charAt(0).toUpperCase();
  return `<span class="logo-mark logo-monogram ${extraClass || ""}" aria-hidden="true">${initial}</span>`;
}

// ---------- Lightbox modal (present on every page) ----------
let activeImages = [];
let activeImageIndex = 0;
let activeMeta = null;
let modal, modalImg, modalCategory, modalTitle, modalDesc, modalHighlights, modalPrev, modalNext, modalCounter;

function initModal() {
  modal = document.getElementById("project-modal");
  if (!modal) return;
  modalImg = document.getElementById("modal-img");
  modalCategory = document.getElementById("modal-category");
  modalTitle = document.getElementById("modal-title");
  modalDesc = document.getElementById("modal-desc");
  modalHighlights = document.getElementById("modal-highlights");
  modalPrev = document.getElementById("modal-prev");
  modalNext = document.getElementById("modal-next");
  modalCounter = document.getElementById("modal-counter");

  document.getElementById("modal-close").addEventListener("click", closeModal);
  document.getElementById("modal-backdrop").addEventListener("click", closeModal);
  modalPrev.addEventListener("click", showPrevImage);
  modalNext.addEventListener("click", showNextImage);
  document.addEventListener("keydown", (e) => {
    if (!modal.classList.contains("is-open")) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "ArrowLeft") showPrevImage();
    if (e.key === "ArrowRight") showNextImage();
  });
}

function renderModalImage() {
  modalImg.src = activeImages[activeImageIndex].file;
  modalImg.alt = activeMeta ? `${activeMeta.title} — image ${activeImageIndex + 1} of ${activeImages.length}` : "";
  const multi = activeImages.length > 1;
  modalPrev.style.display = multi ? "flex" : "none";
  modalNext.style.display = multi ? "flex" : "none";
  modalCounter.style.display = multi ? "block" : "none";
  modalCounter.textContent = `${activeImageIndex + 1} / ${activeImages.length}`;
}

function openModal(images, startIndex, meta) {
  activeImages = images;
  activeImageIndex = startIndex || 0;
  activeMeta = meta || null;
  modalCategory.textContent = meta ? meta.category : "";
  modalTitle.textContent = meta ? meta.title : "";
  modalDesc.textContent = meta ? meta.desc : "";
  modalHighlights.innerHTML = meta && meta.highlights ? meta.highlights.map(h => `<li>${h}</li>`).join("") : "";
  modalHighlights.style.display = meta && meta.highlights ? "" : "none";
  renderModalImage();
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-lock");
}

function closeModal() {
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-lock");
}
function showPrevImage() { activeImageIndex = (activeImageIndex - 1 + activeImages.length) % activeImages.length; renderModalImage(); }
function showNextImage() { activeImageIndex = (activeImageIndex + 1) % activeImages.length; renderModalImage(); }

// ---------- Mobile nav ----------
function initMobileNav() {
  const navToggle = document.getElementById("nav-toggle");
  const mainNav = document.getElementById("main-nav");
  if (!navToggle || !mainNav) return;
  navToggle.addEventListener("click", () => {
    const open = mainNav.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    mainNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }));
}

document.addEventListener("DOMContentLoaded", () => {
  initModal();
  initMobileNav();
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
});
