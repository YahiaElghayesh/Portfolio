# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Technically literate visitors who arrive via a shared link (LinkedIn, résumé, an intro email) — split evenly between hiring managers/recruiters evaluating Yahia for a role and potential clients/collaborators evaluating him for contract or consulting work. No dominant audience: design for a visitor who wants a fast, credible impression on arrival and the option to go deep on a specific project.

## Product Purpose

A personal portfolio for Yahia Elghayesh, a hardware/product design engineer. It exists to build credibility and win opportunities (employment or contract work) by proving real mechanical, electronics, and systems design capability through shipped hardware — not renders, not concept art.

## Positioning

Not a generalist "does a bit of everything" engineer — the body of work spans genuinely hard, cross-disciplinary hardware: medical-grade precision mechanisms (sub-millimeter stereotactic targeting), IP66/68-sealed telecom test equipment deployed globally, cobot-based lab automation, custom RF/PCB design (ground-penetrating radar), and off-grid environmental sensing. The differentiator a generalist portfolio can't copy: several products (INOS™ Watcher, Lite, Gauge) are shown across 2–3 real hardware iterations with documented what-changed-and-why, proving sustained ownership rather than one-off builds — alongside projects delivered in as little as 5–30 days, proving speed under pressure.

## Operating Context

Visitor lands via a shared link, on mobile or desktop, judges competence within seconds, then optionally drills into one project. Projects are grouped by field (Medical Devices, Telecom Testing, Automation & Robotics, Environmental & Agri-Tech, Research & Instrumentation). Several units have multiple versions with real "what changed" comparisons between them (see `versus` blocks in `data.js`'s `LAYOUTS`).

## Capabilities and Constraints

- `data.js` is the fixed content authority for this task — project copy, highlights, partner/toolbox/cert data — and is not to be edited or reworded as part of this design pass.
- `assets/img/PHOTO_MANIFEST.json` records, per source photo, what it shows and how it's meant to be used (hero candidate vs. detail crop vs. context shot). It must be read before any photo is placed; filenames encode real photographer intent, not just pixels.
- All project photography, partner logos, toolbox/cert logos, and workshop photos of Yahia himself are real and already sourced under `assets/img/`; no placeholder or invented imagery is needed for those.
- No image-generation tool is available in this session (`impeccable context` reported no `IMAGE_GEN_AVAILABLE`) — this build is code-led, not comp-led.
- The current implementation (`styles.css`, `index.html`, `work.html`, `project.html`, `home.js`, `work.js`, `project.js`) is explicitly rejected as design authority. Two prior visual attempts failed (one a gimmicky themed metaphor, one a boring timid cleanup); neither its layout, palette, type, nor component patterns may anchor the new design. This is a full structural and visual rebuild on top of the same real content, not an edit of the existing files' patterns.
- Direction for this pass is driven by a batch of reference portfolio/creative sites the user will supply and that must actually be fetched and examined — not by the standard blind concept-seed derivation.

## Brand Commitments

Name: Yahia (Elghayesh). Real workshop action photos of him (drilling, angle-grinder work, standing in his home workshop) exist and are approved "About" material — see `WORKSHOP_STRIP` in `data.js`. No prior binding aesthetic direction: the old visual system is discarded, not inherited.

## Evidence on Hand

- `data.js` — 14 real projects across 5 fields, several with multiple real hardware versions and genuine version-to-version deltas.
- `assets/img/PHOTO_MANIFEST.json` — full source-filename → description → processing-decision record for every image on the site.
- `assets/img/projects/<id>/` — real photos/renders per project.
- `assets/img/logos/` — real partner logos, CAD/EDA toolbox vendor logos, and Credly certification badge art (CSWP, CSWP-SM, CSWP-SU), each badge linked to its verifiable credential.
- `assets/img/workshop-set/` — real photos of Yahia working in his home workshop.

No fabricated testimonials, client quotes, pricing, or benchmarks exist and none should be invented; every claim on the site must trace to `data.js`, the photo manifest, or the logo/cert assets.

## Product Principles

1. Every visual claim traces to a real photo, real logo, or a fact already in `data.js` — nothing invented.
2. Photo placement follows the photographer's own filename intent (the manifest is ground truth), never re-derived from pixels alone.
3. The surface must read as credible engineering authority fast, and be bold and chic without tipping into gimmick (rejected attempt #1) or timid genericism (rejected attempt #2).
4. Both breadth (five distinct engineering disciplines) and depth (real iterative version history within products) are the story — the structure should let a visitor skim across fields or dive into one product's iteration history.

## Accessibility & Inclusion

No product-specific requirement established beyond a standard web accessibility baseline (semantic structure, meaningful alt text, sufficient contrast).
