---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface: index.html (home) — primary entry surface

Mode: Experience. Audience: hiring managers and potential clients/collaborators, evenly split, arriving via a shared link, judging competence in seconds then optionally going deep on one project. Task/action: skim breadth across 5 engineering disciplines, or dive into one product's real iteration history. Proof/content: 14 real projects in `data.js`, `PHOTO_MANIFEST.json`-governed real photography, real partner/toolbox/cert logos. Constraint: `data.js` content is fixed; current implementation files are anti-reference, not authority.

## Direction contract

**THESIS:** The site presents itself as Yahia's own validation log, not a gallery — the same rigor his hardware is tested against (100 trials, IP66/68 certification, calibration procedures) applied to his career record. It refuses the category-default arrangement of hero-photo-plus-card-grid, and refuses the two ruts a from-scratch brief invites: a literal "engineer's toolbox" skin, and a plain minimal-portfolio default.

**OWN-WORLD:** A paper-toned engineering ledger. Ground is a cool, clinical light paper (not warm cream — deliberately off the AI-cluster default), near-black ink for body text, one committed engineering-verification green (soldermask/oscilloscope-adjacent, muted not neon) reserved exclusively for verified facts, active state, and the running index numerals — never decorative. Type: Space Grotesk for display/body (structural, technical, undecorated), IBM Plex Mono reserved strictly for every meta/data string (entry numbers, categoryLabel, versionLabel, specs, dates) — instrument-printed text, no exceptions. Components: numbered ledger rows (not cards), a running section-header rule per field (like a log-book divider), leader-line callouts on photos in place of plain bullet highlights, a large ticking flagship stat as the masthead number.

**STORY:** A visitor lands on the ledger's open index — one flagship number (e.g. total validated trials or shipped hardware versions) animates up like an instrument reading, beside one sharp positioning sentence, no bio paragraph. Below, the full project index scrolls as dense, scannable log rows grouped by field, each row an entry number + title + a pulled-out key spec (mono) + an inset "exhibit" photo. Multi-version products (INOS™ Watcher V1→V3, etc.) appear as nested sub-entries under one parent, marked "supersedes," expandable inline to reveal the real versus-deltas already in `data.js`. Clicking any row/entry navigates to its own real project page.

**FIRST VIEWPORT:** Slim fixed top bar: name+role left in mono, three nav words right, no logo mark. Below it, the masthead: one huge Space Grotesk numeral (the flagship stat) top-left, one confident positioning sentence beside/below it. Immediately under the fold-line, the ledger index begins — first field-section header rule, first 2-3 entry rows visible, establishing the register before any scrolling.

**FORM:** Lab Validation Log — candidate 4 of 7 on my own resonance-ordered list (1 datasheet/spec-sheet, 2 CAD-viewport chrome, 3 exploded-view/numbered-callout, **4 lab validation/calibration log — assigned**, 5 oscilloscope/spectrum readout, 6 pegboard/shadow-board, 7 shipping/rating-label placard). Seed key: 9e0140b9 (mode: experience, scope: direction). Weighed against 6 catalog challengers: orienteering map, VHS rental wall, HyperCard stack, phosphor terminal, cephalopod skin, Miura-fold deployable sheet — 5 declined, 1 (Miura-fold) competitive (kept as a named full alternate: fold/deploy reveal is a strong interaction metaphor but a narrower information-architecture than the ledger for holding 14 projects × 5 fields × real iteration depth).

Raises earned from declined challengers, written into this direction:
- **Fixed-legend rigor** (from Orienteering): a small, strict set of spec-icons (IP rating, weight, power draw, temperature range) reused identically everywhere — one glyph always means one thing.
- **Hand-touched annotation accents** (from VHS rental wall): a restrained authored mark (a circled spec, a check tick) in the verification green, echoing real lab-notebook practice rather than sterile-only digital ticks.
- **Instrument-printed meta text, no exceptions** (from Phosphor Terminal): every status/spec string renders in mono as if printed by an instrument — never mixed into body sans.
- **One restrained ambient-life moment** (from Cephalopod skin): exactly one subtle live/breathing element (e.g. a "currently validating" status dot, or the masthead counter's tick-up on load) — not a living skin, a single deliberate pulse so the ledger doesn't read inert.

Signature interaction: row-level expand/collapse revealing real version-delta amendments inline (competitive-alternate-informed), plus the masthead stat's instrument-style count-up on load.

**FINISH:** unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Unresolved decisions

- Exact flagship masthead number (total validated trials vs. total shipped hardware versions vs. project count) — pick whichever `data.js` supports most cleanly without inventing a rollup figure.
- Whether the partner-logo strip sits near the masthead or at the foot of the ledger.
- Mobile collapse behavior for the fixed top bar.
