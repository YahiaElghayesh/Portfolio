# Design

<!-- impeccable:design-schema 1 -->

## World

**Lab Validation Log.** The site presents Yahia's career as his own validation ledger — the same rigor his hardware is tested against (trial counts, IP ratings, calibration procedures) applied to the record of his work, instead of a conventional portfolio gallery. Direction derived via `impeccable concept-seed` (seed key `9e0140b9`, direction scope, experience mode); recorded contract lives in `.impeccable/surfaces/index-html.md`.

## Palette

Cool, clinical light paper — deliberately not warm cream (the most common AI-portfolio default). One committed verification-green ink, reserved exclusively for verified facts, active/current states, and index numerals — never decorative.

- `--paper` `#f1f3f1` — page ground
- `--paper-raised` `#ffffff` — cutout/exhibit panels, cert cards
- `--paper-sunken` `#e7eae7` — context-photo panel ground
- `--ink` `#14181a` — primary text (16.0:1 on paper)
- `--ink-2` `#4b5551` — secondary text (6.9:1 on paper)
- `--ink-3` `#7a827e` — tertiary/meta text
- `--hairline` `#d8dbd8` / `--hairline-strong` `#b9beba` — rules, borders
- `--verify` `#1e6f4c` — verification ink accent (5.5:1 on paper)
- `--verify-strong` `#143f2c` — accent text/hover (10.6:1 on paper)
- `--verify-soft` `#dceae1` — accent tint (badges, hover fills)

## Type

- **Overpass** (display/body) — chosen for its heritage as a U.S. highway-signage-derived typeface: real engineering/infrastructure lineage, not a generic AI-portfolio default (Space Grotesk was the original pick; swapped after the mechanical detector flagged it as overused).
- **IBM Plex Mono** (meta only) — every measurement, date, entry number, category label, and spec renders in mono, without exception. Never used for narrative body copy.

## Components

- **Ledger row** (`.entry`) — numbered log entry, not a card: entry number, title, description, discipline tags, pulled spec, inset exhibit photo.
- **Version disclosure** (native `<details>/<summary>`) — multi-revision products nest earlier versions under "N earlier revisions on record," accessible and keyboard-operable by default.
- **Exhibit** (`.exhibit`) — photo container driven by the image's own manifest `kind`: `cutout` sits on a raised white panel (`object-fit: contain`), `light`/`dark` context photos fill a sunken panel (`object-fit: cover`). No clip-path or geometric masking — real cutouts stay real cutouts.
- **Spec chip / fixed icon legend** — a small, closed set of glyphs (IP rating, weight, power, temperature, accuracy, size) that always mean the same thing wherever they appear.
- **Callout annotation** (project hero) — leader-line tags on the hero photo, sourced from that project's own discipline tags, generic corner-anchored rather than claiming pixel-precise feature detection.
- **Versus block** — side-by-side prior/current revision photos plus the real delta bullets already in `data.js`.

## Motion

Two authored moments only, per the craft floor's "one moment, not scattered effects" rule:
1. **Masthead entrance** — a single one-time CSS fade-up on load (not scroll-triggered).
2. **Instrument count-up** — the log header's project/revision/discipline counts animate up once on load (respects `prefers-reduced-motion`).

Everything else is static by design. An earlier draft added scroll-triggered fade-ins to every row and a pulsing "live" status dot; both were removed — the fade-ins violated the one-moment rule (and broke full-page capture, since off-screen `IntersectionObserver` targets never fire), and the pulsing dot was flagged by the mechanical detector as decorative liveness with no real data behind it.

## Structure

- `index.html` — masthead + full field-grouped ledger + about/partners/toolbox.
- `work.html` — the same ledger alone, as the "full index" reference view.
- `project.html?unit=<id>&v=<versionIndex>` — one entry's detail page, rendering `LAYOUTS` blocks (`wide`/`pair`/`inset`/`mosaic3`/`text`/`stat`/`poster`/`versus`) from `data.js`.
- `common.js` — shared ledger rendering, exhibit rendering, count-up, top-bar behavior. `home.js`/`work.js`/`project.js` are page-specific thin wrappers.

## Content authority

`data.js` and `assets/img/PHOTO_MANIFEST.json` remain the fixed content/photo authority (see `CLAUDE.md`); this design renders that data, it does not alter it. The one exception is `SPEC_HIGHLIGHT` in `common.js` — a curated pull-quote of one real, verbatim-sourced fact per project (e.g. "IP66 / IP68", "100 validation trials"), left blank for projects with no crisp standalone figure rather than inventing one.
