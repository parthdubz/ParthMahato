# Parth Mahato — Portfolio

A minimal, typography-led personal portfolio built with React, Vite, and Tailwind CSS.

## Run it locally

```bash
npm install
npm run dev
```

This starts a local dev server (usually at `http://localhost:5173`) with hot reload.

## Build for production

```bash
npm run build
```

This outputs a static site into the `dist/` folder — plain HTML/CSS/JS that can be hosted anywhere.

To preview the production build locally before deploying:

```bash
npm run preview
```

## Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Deploy on a domain

Pick whichever fits — all of these build the `dist/` folder automatically from this repo.

### Vercel (easiest, free custom domain support)
1. Go to [vercel.com](https://vercel.com), sign in with GitHub, and import this repo.
2. Framework preset: **Vite** (auto-detected). Build command: `npm run build`. Output directory: `dist`.
3. Deploy. Add your custom domain under Project → Settings → Domains.

### Netlify
1. Go to [netlify.com](https://netlify.com), "Add new site" → "Import an existing project" → connect this repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Deploy. Add your custom domain under Site settings → Domain management.

### GitHub Pages
1. In `vite.config.js`, uncomment and set `base: '/<repo-name>/'` to your repo name.
2. Install the deploy helper: `npm install -D gh-pages`
3. Add to `package.json` scripts: `"deploy": "npm run build && npx gh-pages -d dist"`
4. Run `npm run deploy`.
5. In your repo's Settings → Pages, set the source to the `gh-pages` branch.
6. For a custom domain, add a `CNAME` file with your domain to the `public/` folder, and configure DNS with your registrar (an `A` record to GitHub's IPs, or a `CNAME` record to `<username>.github.io`).

## Notes on assets

- The Galgo Condensed font (used for the hero name) is embedded directly in `src/App.jsx` as a base64 `@font-face`, so no separate font file is needed.
- The Neuro-Nod Elite project image is embedded the same way.
- The NGO AI Help Desk card background is a GIF referenced by external URL (`image2url.com`) — if that link ever goes down, replace `bgSrc` for that project in `src/App.jsx` with a new URL or an embedded base64 image.
- The AI Swasthya Sathi card background is a live `<canvas>` animation defined in `src/App.jsx` (`SwasthyaCanvas` component) — no external asset needed.

## Project structure

```
├── index.html          # HTML entry point, page title/meta
├── src/
│   ├── main.jsx         # React root
│   ├── App.jsx           # The entire site (single-component build)
│   └── index.css         # Tailwind directives
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```
