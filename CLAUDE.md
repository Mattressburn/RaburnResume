# raburnresume — Claude project notes

## What this is

Matthew Raburn's personal résumé site, themed as a **classified dossier** with a temporal-shifting UI engine ("Project Chronos") that lets the viewer cycle the entire page through five visual eras: `1982` (green-phosphor CRT), `1995` (Win95 grey), `2005` (web-2.0 skeuomorphic gradients), `2026` (current — dark indigo glass), and `dossier` (default — manilla folder with coffee stains, CAC card, ink stamps, etc.). A hidden trigger swaps eras with a CRT-glitch transition (framer-motion).

A second route, `/dashboard`, is the **Vinyl Recon Dashboard** — a Recharts visualization over a 500-record audio collection (`public/fan500.json`), pulling live Discogs data through a Netlify edge function.

Deployed to Netlify; PDF résumé lives in both `src/assets/` (bundled into the download button) and `public/` (linked as a static asset).

## Stack

- **React 19** + **react-router-dom 7** (two routes: `/` and `/dashboard`)
- **Vite 7** (dev server on port 3001, output to `build/`)
- **Tailwind 3** + heavy hand-rolled CSS in `src/index.css` (~1000 lines — most of the era system lives here, not in Tailwind)
- **framer-motion 12** for the era-cycle glitch transition
- **recharts 3** + **papaparse** for the dashboard
- **lucide-react** for icons
- **Netlify Edge Functions** (`netlify/functions/discogs-collection.ts`) for Discogs API calls

## Key entry points

- `src/App.jsx` — single big file (~540 lines). Contains `ResumeHome`, every era-aware sub-component (`Redacted`, `ClassifiedStamp`, `CoffeeStain`, `DeskClutter`, `FolderTab`, `JobDetails`), the glitch transition keyframes, and the router. The era is tracked via `ERA_KEYS` index → `data-era="…"` attribute on the root.
- `src/index.css` — **the design system**. Each era is a CSS-variable block (`[data-era="1982"] { --era-bg: …; --era-accent: …; }`) plus era-specific overrides for `.era-card`, `.era-paper`, `.era-btn`, etc. Adding/refreshing an era = edit this file.
- `src/data/resumeData.js` — all résumé copy as one exported object (`personal`, `operationalTradecraft`, `experience`, `anomalousCapabilities`, `fieldReports`, `targetRoles`, `civilianCover`). Content updates land here, not in `App.jsx`.
- `src/pages/VinylDashboard.jsx` — `/dashboard` route, Recharts visualizations.
- `src/components/HiddenGlitchTrigger.jsx` — the secret era-cycle button (top-right).
- `src/components/DiscogsCollectionPanel.jsx` — fetches from the Netlify function.
- `tailwind.config.js` — extends with the `retro` palette and `Shrikhand`/`Rubik` display fonts (the dossier-era pairing is `Courier New`; 1982 is `VT323`).

## Conventions worth knowing

- **Era awareness is opt-in per component.** Sub-components take `era` as a prop and switch their JSX (see `CoffeeStain`, `Redacted`). They never reach into `data-era`; it's passed down.
- **CSS variables, not Tailwind, drive the theme.** Use `var(--era-text)` / `var(--era-accent)` etc. and let the `[data-era="…"]` selector swap them. Tailwind classes are fine for layout/spacing, but colors and typography flow through the variable matrix.
- **Two PDF copies exist** — `src/assets/Matthew_Raburn_Resume.pdf` (imported into the Download button so Vite hashes it) and `public/MatthewRaburnResume-25.pdf` (static, older). Keep these in sync or pick one source of truth.

## Active iteration

None — Kinetic Brutalist + Acid Lime refresh complete. Awaiting merge of PR for branch `kinetic-brutalist-refresh`. Phase-2 follow-ups (any vinyl dashboard work deferred via §8 scope guard; PDF rebrand to match site; `README_CHAT_HELP.txt` cleanup) are open if/when prioritized.

## Session log

- **2026-05-18 (build complete)** — Kinetic Brutalist + Acid Lime refresh shipped on branch `kinetic-brutalist-refresh`. Deleted the era engine (~830 lines of dossier CSS, 6 era-aware components, `data-era` attribute). New: 7 brutalist components, single-theme tokens (12 CSS vars), Vitest infrastructure. Sections relabeled to standardized resume voice (EXPERIENCE / SKILLS / TESTIMONIALS / TRIVIA / TARGET ROLES / INTERESTS) — data unchanged in `resumeData.js`. `/dashboard` rethemed. Spec: `docs/superpowers/specs/2026-05-18-brutalist-lime-refresh-design.md`. Plan: `docs/superpowers/plans/2026-05-18-brutalist-lime-refresh.md`.
- **2026-05-18** — Initial audit + full design pivot. Wrote this CLAUDE.md. Mapped era system in `src/index.css` (variable matrix lines 14–133) and `App.jsx`'s era-aware components. Brainstormed via superpowers:brainstorming → frontend-design → ui-ux-pro-max. Generated 3 base mockups + 3 brutalist variants + 3 accent variants via nano-banana (Gemini 2.5 Flash for quick pass, Gemini 3 Pro Image @ 2K for sharp pass) through the `belt` CLI (inference.sh). Locked: **Kinetic Brutalist + Acid Lime**. Persisted skeleton `design-system/raburn-portfolio/MASTER.md` (auto-generated, needs hand-rewrite to match locked direction). Next: present full design for approval → write spec doc in `docs/superpowers/specs/` → implementation plan.
