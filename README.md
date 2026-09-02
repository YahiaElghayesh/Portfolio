# Yahia Elghayesh — Portfolio

A static portfolio website built from Yahia Elghayesh's product design & hardware engineering portfolio: 20 case studies across medical devices, telecom field-testing equipment, environmental monitoring, and robotics.

## Structure

- `index.html` — page markup
- `styles.css` — dark, editorial engineering theme
- `script.js` — case study data, filtering, gallery modal, scroll reveals
- `assets/img/` — optimized project renders and photos (WebP)

## Running locally

No build step required — it's a static site.

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080`.

## Deploying

Any static host works (GitHub Pages, Netlify, Vercel). For GitHub Pages, enable it on this repo pointing at the root of the default branch.
