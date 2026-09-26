# Design

## Direction: spark to product

Yahia's own line is the brief: "If it exists, I refine it. If it doesn't, I design it." The home page stages that arc in order:

1. **The engineer.** His name set enormous, and Yahia (cut out with the chair) standing in front of it as a lit 3D relief built from a depth map of his photo. It condenses out of a point cloud on first visit and comes apart into warm dust as you scroll.
2. **The statement.** The tagline gets a screen of its own; each word lights as it is scrolled past.
3. **Making.** The angle-grinder photo, full bleed and graded, with live GPU sparks leaving the grinder's contact point and flying out across the page.
4. **The products.** His cut-out renders on a turntable ring, each a 3D relief from its own depth map; scrolling turns the ring and names the piece at the front.

The Work page keeps the approved IA (menu of tiles in PDF order, versions visible on the tile, detail modal with version tabs). Each tile's product is a GPU relief that turns toward the pointer; photos with backgrounds stay locked to the tile and move inside it instead.

## Palette: Black and Tan

- `--bg` `#12100d`, `--bg-deep` `#0b0a08`, `--bg-card` `#1d1a15`
- `--ink` `#f2ede6`, `--ink-2` `#b8afa3`, `--ink-3` `#8a8175`
- `--accent` `#cf9d5c`, `--accent-deep` `#e8c088` (the only accent, used everywhere)

## Type

- **Geist** (variable, self-hosted, OFL): everything read, including the mega name and titles.
- **Geist Mono**: every label, count and number (kickers, stat numerals, field counts, version pills).

## Shape

Cards and photos 14px radius; every interactive pill and button fully round.

## Rendering architecture

- `stage.js`: two WebGL canvases. `gl-bg` sits behind `#main` (dust volume); `gl-fg` sits above `#main` with `pointer-events: none` (portrait, product reliefs, sparks, showroom). Every GL object is pinned to a DOM element's rectangle each frame.
- A DOM `<img>` is only hidden (`.gl-active`) once its texture is on the GPU. No WebGL, a failed three.js load, a 404'd texture, a lost context, or reduced motion all leave the complete CSS site; under reduced motion three.js is never downloaded.
- Relief meshes cut triangles that span a depth cliff (vertex-shader edge detection) rather than stretching them into smears.
- Derived images (cut-out, depth maps, graded sparks) are documented in `assets/img/DERIVED_ASSETS.json`.

## Content authority

`data.js` and `assets/img/PHOTO_MANIFEST.json` remain the content and photo authority (see `CLAUDE.md`). All copy is Yahia's own, verbatim; this design changes placement and presentation only.
