// ---------- Project data ----------
const PROJECTS = [
  {
    id: "neurosurgery-frame",
    title: "Stereotactic Neurosurgery Frame",
    category: "medical",
    categoryLabel: "Medical Devices",
    images: ["assets/img/projects/neurosurgery-frame.webp"],
    desc: "A stereotactic targeting system developed as part of clinical research to deliver a manufacturable, lower-cost alternative to conventional stereotactic surgery platforms.",
    highlights: [
      "Sub-millimeter targeting accuracy across 100 validation trials.",
      "Novel physically reachable reference point eliminating complex imaginary coordinates.",
      "Five-axis mechanical targeting system with precise spatial and angular control.",
      "Simultaneous bilateral targeting capability reducing operative time.",
      "Functional 3D-printed prototype validated through pre-clinical trials.",
      "Transitioning to a clinical-grade metal design for long-term precision and durability."
    ]
  },
  {
    id: "ophthalmic-cell",
    title: "Automated Cell for an Ophthalmic Lab",
    category: "automation",
    categoryLabel: "Automation & Robotics",
    images: ["assets/img/projects/ophthalmic-cell.webp"],
    desc: "An automated cell that handles job trays in an ophthalmic lab environment, supporting tray preparation, orientation, and transfer to downstream processes.",
    highlights: [
      "Reverse-engineered the workflow from industry best practices and solved reach and safety constraints with an efficient cell layout.",
      "Adapted off-the-shelf hardware into new functions to reduce complexity.",
      "Balanced custom design with standardized ecosystem components.",
      "Developed tooling within the cobot's load and motion limits.",
      "Applied modular design thinking for scalable and ergonomic operation."
    ]
  },
  {
    id: "skycare-kit",
    title: "SKYCARE Kit",
    category: "medical",
    categoryLabel: "Medical Devices",
    images: ["assets/img/projects/skycare-kit.webp"],
    desc: "A medical support box that enables guided self-checks and remote doctor assistance in emergencies, such as in-flight incidents, remote locations, or situations without immediate professional care.",
    highlights: [
      "Designed dedicated slots that keep medical devices secure, protected, and easy to access during urgent use.",
      "Engineered an internal charging system so all devices remain powered and ready at all times.",
      "Integrated a touch screen and camera to enable real-time guidance from medical professionals.",
      "Built a robust enclosure intended to survive harsh, high-risk environments while remaining fully usable under pressure."
    ]
  },
  {
    id: "smart-mirror",
    title: "Medical Devices' Storage Solution for a Smart Wellness Mirror",
    category: "medical",
    categoryLabel: "Medical Devices",
    images: ["assets/img/projects/smart-mirror.webp"],
    desc: "A storage and access solution that organizes and protects medical devices while integrating seamlessly with a smart mirror for guided health checks.",
    highlights: [
      "Engineered a storage solution that fits the existing smart mirror while preserving its original ergonomics and dimensions.",
      "Designed dedicated spaces that let users access and return each device easily while ensuring full protection when stored.",
      "Integrated charging for all supported devices in a clean and concealed layout.",
      "Optimized the overall form to deliver quick access while maintaining a calm and orderly visual presence."
    ]
  },
  {
    id: "inos-watcher-v2",
    title: "Network Active Monitoring Probe V2 [INOS Watcher]",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/inos-watcher-v2.webp"],
    desc: "Perform large-scale, unattended 24/7 measurement of live 4G/5G networks in fixed and mobile locations such as airports, stadiums, shopping malls, and trains.",
    highlights: [
      "Filled a market gap by designing a probe that houses four devices while withstanding harsh indoor environments and high temperatures.",
      "Integrated a 150W adaptive cooling system that dynamically regulates power to maintain optimal processor performance.",
      "Optimized design and sourcing for global manufacturing, enabling localized production to slash shipping and import costs."
    ]
  },
  {
    id: "inos-watcher-v1",
    title: "Network Active Monitoring Probe V1 [INOS Watcher]",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/inos-watcher-v1.webp"],
    desc: "Perform large-scale, unattended 24/7 measurement of live 4G/5G networks in fixed and mobile locations such as airports, stadiums, shopping malls, and trains.",
    highlights: [
      "Integrated multiple high-heat devices into a compact, efficient design, ensuring seamless operation under demanding conditions.",
      "Engineered a robust cooling system capable of continuous, long-duration performance without degradation.",
      "Optimized airflow dynamics to channel cool air strategically from low to high heat-generating components, maximizing efficiency.",
      "Utilized readily available off-the-shelf components, streamlining production for the probe's temporary design."
    ]
  },
  {
    id: "inos-lite-v2",
    title: "In-Building Network Measurement Solution V2 [INOS Lite]",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/inos-lite-v2.webp"],
    desc: "Carry-on solution for benchmarking multiple wireless networks and technologies simultaneously for indoors and confined spaces.",
    highlights: [
      "Optimized a lightweight, ergonomic design to accommodate 12 phones, a router, a scanning device, and an antenna.",
      "Engineered a secure, quick-access phone mounting system that locks devices in place during movement.",
      "Developed a high-efficiency cooling system that silently moves large air volumes to regulate temperatures.",
      "Integrated hot-swappable lithium-ion battery packs to enable uninterrupted, extended measurement campaigns.",
      "Created precise patterns and cut lists for backpack fabrics and structural materials."
    ]
  },
  {
    id: "inos-lite-v1",
    title: "In-Building Network Measurement Solution V1 [INOS Lite]",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/inos-lite-v1.webp"],
    desc: "Carry-on solution for benchmarking multiple wireless networks and technologies simultaneously for indoors and confined spaces.",
    highlights: [
      "Designed, built, and delivered the solution in just 30 days.",
      "Optimized a lightweight, ergonomic design to house 12 phones, a router, and a mini-PC.",
      "Leveraged an off-the-shelf backpack and readily available components to fast-track development."
    ]
  },
  {
    id: "inos-air",
    title: "Drone Based Network Testing Solution [INOS Air]",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/inos-air.webp"],
    desc: "Measures and analyzes network performance for low-altitude cellular networks. This solution supports various applications, including infrastructure inspection, high-rise building coverage analysis, and drone delivery services.",
    highlights: [
      "Designed to support four devices while maintaining a lightweight, compact form.",
      "Implemented a modular system for seamless compatibility with most commercial drones through interchangeable adapters."
    ]
  },
  {
    id: "inos-gauge-v2",
    title: "Network Drive Test Solution V2 [INOS Gauge]",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/inos-gauge-v2.webp"],
    desc: "Drive Test / Outdoor Test kit for network optimization, providing real-world performance insights to enhance coverage, signal quality, and network reliability.",
    highlights: [
      "Engineered a highly portable, self-contained unit for seamless deployment in various environments.",
      "Developed a custom power delivery system that automatically switches between AC and 12-24VDC for effortless use in buildings and vehicles.",
      "Optimized the design to accommodate 20 phones, a router, scanning devices, a central computer, and more, tailored to client specifications.",
      "Built a scalable system that adapts to customer needs, ensuring optimal size and weight based on the number of devices required for testing."
    ]
  },
  {
    id: "inos-gauge-v1",
    title: "Network Drive Test Solution V1 [INOS Gauge]",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/inos-gauge-v1.webp"],
    desc: "Drive Test / Outdoor Test kit for network optimization, providing real-world performance insights to enhance coverage, signal quality, and network reliability.",
    highlights: [
      "Delivered full functionality with minimal time for custom designs.",
      "Designed, built, and deployed the kit in under five days using off-the-shelf components.",
      "Engineered an efficient cooling system to maintain optimal performance for 20 phones.",
      "Built a rugged, durable assembly that operated flawlessly in the field for an extended period, despite no prior testing."
    ]
  },
  {
    id: "long-range-benchmark",
    title: "Long Range Network Benchmarking Solution",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/long-range-benchmark.webp"],
    desc: "Drive Test / Outdoor Test kit for network optimization, providing real-world performance insights to enhance coverage, signal quality, and network reliability.",
    highlights: [
      "Built a rugged yet portable solution to withstand harsh field conditions.",
      "Integrated automatic switching between AC, 12-24VDC, and internal battery power.",
      "Designed a high-capacity, hot-swappable internal battery system that recharges automatically when connected to external power."
    ]
  },
  {
    id: "general-benchmark",
    title: "General Purpose Network Benchmarking Solution",
    category: "telecom",
    categoryLabel: "Telecom Testing",
    images: ["assets/img/projects/general-benchmark.webp"],
    desc: "Light testing for indoors and outdoors. A cost-effective and versatile solution for temporary test scenarios.",
    highlights: [
      "Designed for low cost and minimal maintenance.",
      "Packaged in a carry-on case for easy travel, allowing operators to demonstrate it to customers and conduct POCs.",
      "Built with globally sourced components available from most electronics stores."
    ]
  },
  {
    id: "exhaust-gas-sampler",
    title: "Automotive Exhaust Gas Sampler",
    category: "research",
    categoryLabel: "Instrumentation",
    images: ["assets/img/projects/exhaust-gas-sampler.webp"],
    desc: "Real-time analysis of vehicle emissions. It samples exhaust gases, conditions them through filtering, cooling, and water separation, and then measures different components' concentrations using a series of sensors.",
    highlights: [
      "Engineered a gas conditioning system from scratch, sourcing components globally with seamless integration.",
      "Handled sensitive sensors with precision, following manufacturer guidelines.",
      "Executed calibration processes to ensure accurate and reliable readings.",
      "Collaborated with a UX/UI designer to develop intuitive, touchscreen-compatible software tailored to project needs."
    ]
  },
  {
    id: "water-quality-sonde",
    title: "Multiparameter Water Quality Sonde",
    category: "environmental",
    categoryLabel: "Environmental & Agri-Tech",
    images: ["assets/img/projects/water-quality-sonde.webp"],
    desc: "Long-term continuous water quality monitoring in agricultural applications.",
    highlights: [
      "Manufactured the sonde from a material resistant to brackish agricultural waste and reinforced it with an epoxy coating for enhanced chemical durability.",
      "Optimized buoyancy characteristics to ensure stable submersion in target waters.",
      "Designed to accommodate four sensors with a central cleaning attachment to prevent algae buildup."
    ]
  },
  {
    id: "rain-monitoring",
    title: "Rain Precipitation | Emissions & Air Quality Monitoring Stations",
    category: "environmental",
    categoryLabel: "Environmental & Agri-Tech",
    images: ["assets/img/projects/rain-monitoring.webp"],
    desc: "Measurement and prediction of weather patterns in agricultural applications.",
    highlights: [
      "Built a versatile system for both field deployment and showcase display by enabling quick swapping of the mounting post.",
      "Designed an off-grid solution powered by solar energy for reliable, long-term operation.",
      "Optimized materials and components to guarantee low maintenance over extended periods.",
      "Presented the stations at COP27 in Sharm El-Sheikh."
    ]
  },
  {
    id: "gpr",
    title: "Ground Penetration Radar (GPR)",
    category: "research",
    categoryLabel: "Research · Graduation Project",
    images: ["assets/img/projects/gpr.webp"],
    desc: "GPR that generates images of sub-surface layers for early detection of defects in concrete structures.",
    highlights: [
      "Developed a GPR that creates images of sub-surface layers to assess concrete conditions and analyze underground utilities.",
      "Designed the radar's antennas and circuits on PCBs.",
      "Sourced RF components from vendors in Europe and the US.",
      "Awarded a research grant by \"The Academy of Scientific Research & Technology\" in Egypt."
    ]
  },
  {
    id: "minesweeping-robot",
    title: "Minesweeping Robot",
    category: "automation",
    categoryLabel: "Automation & Robotics",
    images: ["assets/img/projects/minesweeping-robot.webp"],
    desc: "An autonomous robot designed to scan fields for mines, effectively avoiding them while mapping their locations.",
    highlights: [
      "Participated in The International Robotic Competition on Humanitarian Demining in Egypt for two consecutive years.",
      "Secured 2nd place in 2016 at Zewail City of Science and Technology.",
      "Designed with a double wishbone suspension for rough terrain and optimal traction.",
      "Constructed from lightweight aluminum.",
      "Fully autonomous operation."
    ]
  }
];

// ---------- Reveal on scroll ----------
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

function observeReveal(el) { revealObserver.observe(el); }

// ---------- Render project grid ----------
const grid = document.getElementById("project-grid");

function renderProjects() {
  grid.innerHTML = PROJECTS.map((p, i) => `
    <article class="project-card reveal" data-category="${p.category}" data-id="${p.id}" style="transition-delay:${(i % 6) * 60}ms">
      <div class="card-media">
        <img src="${p.images[0]}" alt="${p.title}" loading="lazy">
      </div>
      <div class="card-body">
        <span class="card-index">${String(i + 1).padStart(2, "0")}</span>
        <div class="card-text">
          <p class="card-tag">${p.categoryLabel}</p>
          <h3>${p.title}</h3>
          <p>${p.desc}</p>
        </div>
      </div>
    </article>
  `).join("");

  document.querySelectorAll(".project-card").forEach(card => {
    card.addEventListener("click", () => openModal(card.dataset.id));
    observeReveal(card);
  });
}
renderProjects();

// ---------- Filtering ----------
const filterBar = document.getElementById("filter-bar");
filterBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".filter-btn");
  if (!btn) return;
  filterBar.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("is-active"));
  btn.classList.add("is-active");
  const filter = btn.dataset.filter;
  document.querySelectorAll(".project-card").forEach(card => {
    const match = filter === "all" || card.dataset.category === filter;
    card.classList.toggle("is-hidden", !match);
  });
});

// ---------- Modal ----------
const modal = document.getElementById("project-modal");
const modalImg = document.getElementById("modal-img");
const modalCategory = document.getElementById("modal-category");
const modalTitle = document.getElementById("modal-title");
const modalDesc = document.getElementById("modal-desc");
const modalHighlights = document.getElementById("modal-highlights");
const modalPrev = document.getElementById("modal-prev");
const modalNext = document.getElementById("modal-next");
const modalCounter = document.getElementById("modal-counter");
const modalThumbs = document.getElementById("modal-thumbs");

let activeProject = null;
let activeImageIndex = 0;

function renderModalImage() {
  if (!activeProject) return;
  const images = activeProject.images;
  modalImg.src = images[activeImageIndex];
  modalImg.alt = `${activeProject.title} — image ${activeImageIndex + 1} of ${images.length}`;

  const multi = images.length > 1;
  modalPrev.style.display = multi ? "flex" : "none";
  modalNext.style.display = multi ? "flex" : "none";
  modalCounter.style.display = multi ? "block" : "none";
  modalCounter.textContent = `${activeImageIndex + 1} / ${images.length}`;

  modalThumbs.style.display = multi ? "flex" : "none";
  if (multi) {
    modalThumbs.innerHTML = images.map((src, i) => `
      <img src="${src}" alt="Thumbnail ${i + 1}" class="${i === activeImageIndex ? "is-active" : ""}" data-index="${i}">
    `).join("");
  }
}

function openModal(id) {
  const p = PROJECTS.find(x => x.id === id);
  if (!p) return;
  activeProject = p;
  activeImageIndex = 0;
  modalCategory.textContent = p.categoryLabel;
  modalTitle.textContent = p.title;
  modalDesc.textContent = p.desc;
  modalHighlights.innerHTML = p.highlights.map(h => `<li>${h}</li>`).join("");
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

function showPrevImage() {
  if (!activeProject) return;
  activeImageIndex = (activeImageIndex - 1 + activeProject.images.length) % activeProject.images.length;
  renderModalImage();
}
function showNextImage() {
  if (!activeProject) return;
  activeImageIndex = (activeImageIndex + 1) % activeProject.images.length;
  renderModalImage();
}

document.getElementById("modal-close").addEventListener("click", closeModal);
document.getElementById("modal-backdrop").addEventListener("click", closeModal);
modalPrev.addEventListener("click", showPrevImage);
modalNext.addEventListener("click", showNextImage);
modalThumbs.addEventListener("click", (e) => {
  const thumb = e.target.closest("img[data-index]");
  if (!thumb) return;
  activeImageIndex = Number(thumb.dataset.index);
  renderModalImage();
});
document.addEventListener("keydown", (e) => {
  if (!modal.classList.contains("is-open")) return;
  if (e.key === "Escape") closeModal();
  if (e.key === "ArrowLeft") showPrevImage();
  if (e.key === "ArrowRight") showNextImage();
});

// ---------- Mobile nav ----------
const navToggle = document.getElementById("nav-toggle");
const mainNav = document.getElementById("main-nav");
navToggle.addEventListener("click", () => {
  const open = mainNav.classList.toggle("is-open");
  navToggle.setAttribute("aria-expanded", open ? "true" : "false");
});
mainNav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
  mainNav.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
}));

document.querySelectorAll(".reveal").forEach(observeReveal);

// ---------- Footer year ----------
document.getElementById("year").textContent = new Date().getFullYear();
