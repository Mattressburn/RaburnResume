# Matthew Raburn — Portfolio

A personal portfolio site for Matthew Raburn (IT Professional · Enterprise Reliability · Tech Leadership). Single-page React app in a Kinetic Brutalist design language with a paired analytics route powered by Discogs data.

## Stack

- React 19 + Vite 7
- Tailwind 3
- react-router-dom 7
- Recharts 3
- Netlify Edge Functions (`netlify/functions/discogs-collection.ts`)

## Local dev

```bash
npm install
npm start
# Vite dev server on :3001
```

## Build

```bash
npm run build       # outputs to ./build
npm run preview     # serve the built bundle
npm run test        # run vitest suite
```

## Routes

- `/` — main portfolio
- `/dashboard` — Vinyl Recon Dashboard (Discogs visualization)

## Design

See `design-system/raburn-portfolio/MASTER.md` for tokens, components, and structure. The locked reference mockup is at `mockups/LOCKED-direction.png`. Spec and implementation plan live under `docs/superpowers/`.

## Deploy

Netlify auto-deploys on push to `main`. Branch deploys preview at `<branch>--<site>.netlify.app`.
