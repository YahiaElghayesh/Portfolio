# Yahia Elghayesh — Portfolio

A static portfolio website built from Yahia Elghayesh's product design & hardware engineering portfolio: 18 projects across medical devices, telecom field-testing equipment, environmental monitoring, and robotics.

## Structure

- `index.html` — page markup
- `styles.css` — dark, engineering-inspired theme
- `script.js` — project data, filtering, modal, scroll reveals
- `assets/img/` — optimized project renders and photos (WebP)
- `assets/files/` — downloadable source portfolio PDF

## Running locally

No build step required — it's a static site.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploying

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages, enable it on this repo pointing at the root of the default branch.
