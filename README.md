# Yahia Elghayesh — Portfolio

A static portfolio site built from Yahia Elghayesh's product design & hardware engineering work: 15 case studies (spanning 20 product versions) across medical devices, telecom field-testing equipment, automation & robotics, environmental monitoring, and research instrumentation.

## Structure

- `index.html` — home page: hero, about, workshop, toolbox, certifications, partners, contact
- `work.html` — case studies index, grouped by field
- `project.html` — single case-study template (reads `?id=`), editorial layout with photos embedded alongside the relevant highlights
- `data.js` — shared case-study/toolbox/partners data, loaded by every page
- `common.js` — shared behavior: scroll reveals, lightbox modal, mobile nav
- `home.js` / `work.js` / `project.js` — per-page rendering
- `styles.css` — light, editorial engineering theme
- `assets/img/` — optimized project renders and photos (WebP)
- `assets/img/logos/` — sourced vendor/issuer logos (toolbox tools, SOLIDWORKS/Dassault Systèmes)

## Running locally

No build step required — it's a static site.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploying

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages, enable it on this repo pointing at the root of the default branch.
