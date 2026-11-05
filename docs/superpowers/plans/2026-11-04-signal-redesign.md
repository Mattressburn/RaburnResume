# Signal Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hireraburn.com with a single dark "Signal" page: an animated request-path hero, rounded production metrics, a grounded "Ask about Matt" assistant on Claude, rewritten experience and projects, plus the updated public case study, a rebuilt resume PDF and an optional generated hero loop.

**Architecture:** One React 19 page composed of six section components reading from one data module (`src/data/site.js`); motion through framer-motion `LazyMotion` with a reduced-motion hook; one Netlify Function (`netlify/functions/ask.mts`) that streams Claude answers grounded on `shared/facts.md`, rate-limited through Netlify Blobs by pure helpers in `netlify/lib/`. The case study and resume live in two other repos and are updated in their own tasks.

**Tech Stack:** React 19, Vite 7, Tailwind 3, framer-motion 12.34, Vitest 4 + Testing Library (jsdom), `@anthropic-ai/sdk`, `@netlify/blobs`, `@fontsource/*` static weights, Netlify Functions (Node), lualatex for the resume, ffmpeg for the loop.

**Spec:** `docs/superpowers/specs/2026-11-04-signal-redesign-design.md` (revision 3). Read it first; section numbers below refer to it.

## Global Constraints

- Repo: `/mnt/MRDockBox/mnt/6tb/home/mattressburn/Documents/Projects/raburnresume`, branch `signal-redesign` (exists; two spec commits on it). The repo sits outside the Bash sandbox's writable paths, so every `npm`, `vitest`, `vite`, `git` and `ffmpeg` command there runs with the sandbox disabled. Use the Write/Edit tools for file content.
- Git identity is not configured; commit with `git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit ...`. Never push; the candidate pushes.
- Node 26.8.2 local; `npm` 12. Vite 7.2.4, Vitest 4.1.6, framer-motion 12.34.4 are installed in `node_modules`.
- Copy and numbers: use the spec's §6 text verbatim and the §4 rounding rule ("over" / "around"; exact values only in the spec's Appendix A). "Rumil" may appear in visible text only inside the Experience section and in assistant answers (§5).
- Never claim: Kubernetes operation, model training or fine-tuning, PyTorch, ML research, people management, SOW authorship. Production model is Azure OpenAI GPT-5.1; Claude is the build tool and the site assistant only.
- No Education section. No em-dashes anywhere in copy or code comments. No analytics, no cookies, no stored questions.
- Keep internal (never in any file): production commit hash, hypervisor names and VM counts, "Case Radar", operator aliases, brand usage split, user role split, the business-unit acronym, the case-tool vendor name next to the head-to-head numbers.
- Assistant model default `claude-opus-5-5` (the claude-api skill's default; the candidate may set `ASK_MODEL=claude-haiku-5-5` in Netlify to cut cost). Streaming, `max_tokens: 600`, `output_config: {effort: "low"}`, server-side refusal fallbacks on.
- Tokens (§9): `--bg #0A0C10`, `--bg-2 #0E1117`, `--line #1C2129`, `--line-2 #2A2F38`, `--fg #E6E8EC`, `--fg-2 #9AA0AA`, `--fg-3 #777E8A`, `--accent #FFB020`, `--ok #5BD38A`. Fonts: Inter 400/500, Inter Tight 800, JetBrains Mono 400/500 from `@fontsource`.
- Performance gate: Lighthouse (PageSpeed Insights mobile) performance 95+, accessibility 100 on the Netlify preview. JS under 150 kB gzipped.

## Review Focus

1. A visitor on a 390 px phone with reduced motion on: every section renders complete with no element stuck at opacity 0 (Task 4 tests, Task 13 manual check).
2. A question containing `[cite:system]` or HTML typed by the visitor: the client must never render model or user text as HTML, and injected citation tokens in the question must not produce chips (Task 6 test).
3. The Anthropic API key unset or revoked on the deploy: the panel must show the pre-written answers, never a blank panel or a raw error (Task 6 test, Task 9 curl, Task 13 manual check).
4. Two visitors behind one NAT address: the 11th question in an hour from that address gets the per-visit limit copy, not the "paused" fallback (Task 8 test, Task 6 test).
5. A number edited in `site.js` without updating `shared/facts.md`: the test run must fail, so the assistant never contradicts the page (Task 2 test).

---

### Task 1: Clear the old site and set up the shell

**Files:**
- Modify: `package.json` (dependencies, scripts), `vite.config.js` (unchanged except `server.open: false`), `tailwind.config.js`, `index.html`, `src/index.jsx`, `src/index.css`, `src/App.jsx`, `.gitignore`
- Delete: `src/pages/VinylDashboard.jsx`, `src/components/*` (all brutalist components and tests), `src/components/DiscogsCollectionPanel.jsx`, `src/charts/theme.jsx`, `src/routes.js`, `src/routes.jsx`, `src/reportWebVitals.js`, `src/setupTests.js`, `src/data/resumeData.js`, `src/assets/Matthew_Raburn_Resume.pdf`, `netlify/functions/discogs-collection.ts`, `public/fan500.json`, `public/ccure_9000_client.png`, `public/MatthewRaburnResume-25.pdf`, `README_CHAT_HELP.txt`, `filelist.txt`, `listing.txt`, `mockups/` (entire directory), `design-system/` (entire directory)
- Test: `src/App.test.jsx` (created here as a placeholder, filled in Task 3)

**Interfaces:**
- Produces: `src/lib/motion.js` exporting `useReducedMotionPref(): boolean` (wraps framer-motion's `useReducedMotion`, returns `true` when `window.matchMedia('(prefers-reduced-motion: reduce)').matches`) and `ease = [0.2, 0.8, 0.2, 1]`.
- Produces: CSS variables from §9 on `:root` in `src/index.css`; Tailwind colors `bg`, `bg2`, `line`, `line2`, `fg`, `fg2`, `fg3`, `accent`, `ok` mapped to those variables; font families `display` (Inter Tight), `body` (Inter), `mono` (JetBrains Mono).

- [ ] **Step 1: Remove dependencies and files**

Run (sandbox disabled, in the repo):
```bash
npm uninstall react-router-dom recharts papaparse web-vitals intellisense react-is @testing-library/user-event
npm install @anthropic-ai/sdk @netlify/blobs @fontsource/inter @fontsource/inter-tight @fontsource/jetbrains-mono
git rm -r -q --ignore-unmatch src/pages src/components src/charts src/routes.js src/routes.jsx src/reportWebVitals.js src/setupTests.js src/data/resumeData.js src/assets netlify/functions/discogs-collection.ts public/fan500.json public/ccure_9000_client.png public/MatthewRaburnResume-25.pdf README_CHAT_HELP.txt filelist.txt listing.txt mockups design-system
rm -rf mockups design-system
```
(`mockups/` holds untracked files, so the plain `rm -rf` follows the `git rm`.)
Expected: `package.json` lists `@anthropic-ai/sdk`, `@netlify/blobs`, three `@fontsource/*` packages; none of the removed packages remain. Keep `netlify-cli` (used for local function testing in Task 9).

- [ ] **Step 2: Write the shell**

`index.html`: `<title>Matthew Raburn · Applied AI Engineer</title>`, the §6.7 meta description, `<meta name="theme-color" content="#0A0C10">`, `<meta name="color-scheme" content="dark">`, Open Graph tags (`og:title`, `og:description`, `og:image` = `https://hireraburn.com/og.png`, `og:url`, `twitter:card` = `summary_large_image`), no Google Fonts link, `<div id="root">`, module script `/src/index.jsx`.

`src/index.jsx`: imports `@fontsource/inter/400.css`, `@fontsource/inter/500.css`, `@fontsource/inter-tight/800.css`, `@fontsource/jetbrains-mono/400.css`, `@fontsource/jetbrains-mono/500.css`, then `./index.css`, then renders `<App />` inside `<React.StrictMode>` with `createRoot`. No router.

`src/index.css`: Tailwind directives; `:root` tokens from §9 plus `--ease`; `html,body` background `var(--bg)`, color `var(--fg)`, `font-family: Inter`, `color-scheme: dark`, `scroll-behavior: smooth`; `*` box-sizing; `:focus-visible` 2 px solid `var(--accent)` outline, offset 2 px; `.tabular { font-variant-numeric: tabular-nums }`; `@media (prefers-reduced-motion: reduce)` sets `scroll-behavior: auto`. Nothing else; component styles are Tailwind classes.

`tailwind.config.js`: `content: ['./index.html', './src/**/*.{js,jsx}']`, `theme.extend.colors` mapping the nine tokens to `var(--…)`, `fontFamily` as in Interfaces, `maxWidth.page: '1200px'`.

`src/lib/motion.js` as in Interfaces.

`src/App.jsx`: for now renders `<main className="max-w-page mx-auto px-4 sm:px-6">` with a `<h1>` reading "Matthew Raburn" so the build is green. Sections replace it in Task 3.

`.gitignore`: add `shared/facts.generated.js` and `.superpowers/`.

- [ ] **Step 3: Verify build and the existing test runner**

Run: `npm run build 2>&1 | tail -5` then `npx vitest run 2>&1 | tail -5`
Expected: build succeeds writing `build/`; vitest reports the smoke test passing (`src/test/smoke.test.js` still exists) and no failures.

- [ ] **Step 4: Commit**

```bash
git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "chore(shell): remove brutalist site, dashboard and joke content; new tokens and fonts"
```

---

### Task 2: Content data module and facts document

**Files:**
- Create: `src/data/site.js`, `shared/facts.md`, `scripts/build-facts.mjs`
- Modify: `package.json` (scripts `prebuild` and `pretest` run `node scripts/build-facts.mjs`)
- Test: `src/data/site.test.js`

**Interfaces:**
- Produces `src/data/site.js` with a single named export `site`:
  - `site.meta = { title, description }`
  - `site.hero = { status: string, headline: [string, string, string], accentWord: 'measured,', lede: string, metrics: Metric[4], actions: Action[3] }` where `Metric = { value: number, decimals: number, suffix: string, label: string, display: string }` (`display` is the final text, e.g. `'1M+'`) and `Action = { label, href, kind: 'primary'|'secondary', download?: boolean, external?: boolean }`.
  - `site.trace = string[3]` (the example trace lines from §6.1).
  - `site.diagram = { nodes: Node[], edges: Edge[], layouts: { desktop: {viewBox: [420,300], pos: {[id]: {x,y,w,h}}}, phone: {viewBox: [320,520], pos: {...}} } }` with `Node = { id, label, sub?: string, why?: string, kind: 'box'|'label' }` and `Edge = { from, to, delay: number }`. Node ids: `query`, `planner`, `agent`, `answer`, `retrieval`, `rerank`, `model`, `tools` (label listing Jira, Salesforce, Snowflake, licensing), `es` (label "Elasticsearch 8 · over 1M chunks").
  - `site.system = { eyebrow, heading, problem, what, numbers: Group[], growth: { labels: ['Aug','Sep','Oct'], values: [300, 850, 1100] }, toolMix: [{label, value}] (KB 700, Jira 210, Salesforce 210, Snowflake 130), incidents: [{title, body}] (three) , heldBack: string, built: string, infra: [{label, why}] (five), caseStudy: { label: 'public case study', href: 'https://github.com/Mattressburn/rumil-case-study' } }` with `Group = { name, items: [{display, label}] }` matching the §6.2 table (every `display` is the rounded text).
  - `site.experience = [{ company, title, period, location, bullets: string[], link?: {label, href} }]` (four entries, §6.3 text).
  - `site.projects = [{ name, blurb, stack: string[], href }]` (five, §6.4).
  - `site.stack = [{ group, items: string[] }]` (five, §6.5) and `site.stackNote` (the "Not on my record" line).
  - `site.contact = { line, email, linkedin, github, resume: '/Matthew_Raburn_Resume.pdf', footer }`.
  - `site.ask = { placeholder, suggestions: string[8], fallback: { [question]: answer } }` with eight pre-written answers (each under 120 words, ending with the section name in parentheses instead of cite tokens).
- Produces `shared/facts.md`: §7 scope, with a `## Provenance` section listing each published figure with its "as of November 2026" line and a `## Do not claim` section.
- Produces `shared/facts.generated.js` (gitignored) exporting `export const FACTS = "<facts.md contents>"`, written by `scripts/build-facts.mjs`.

- [ ] **Step 1: Write the failing test**

`src/data/site.test.js` (node environment comment at top: `// @vitest-environment node`):
```js
import { readFileSync } from 'node:fs'
import { site } from './site.js'

const facts = readFileSync(new URL('../../shared/facts.md', import.meta.url), 'utf8')

test('every displayed metric appears verbatim in shared/facts.md', () => {
  const displays = [
    ...site.hero.metrics.map(m => m.display),
    ...site.system.numbers.flatMap(g => g.items.map(i => i.display)),
  ]
  for (const d of displays) expect(facts).toContain(d)
})

test('hero copy never names the product', () => {
  const hero = JSON.stringify([site.hero, site.system, site.projects, site.stack, site.meta])
  expect(hero.toLowerCase()).not.toContain('rumil')
})

test('experience names it exactly once per JCI bullet set', () => {
  const jci = site.experience[0]
  expect(jci.bullets.join(' ')).toContain('Rumil')
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/site.test.js`
Expected: FAIL, cannot resolve `./site.js`.

- [ ] **Step 3: Write `src/data/site.js`, `shared/facts.md`, `scripts/build-facts.mjs`**

`site.js`: copy every string from spec §6 exactly; `display` strings use the rounded forms from Appendix A's last column (hero: `1M+`, `8`, `1,000+`, `4x+`; system groups: "over 1M chunks", "around 26 GB", "around 250k", "over 100k", "around 64k", "around 60k", "over 10k", "around 4,400", "over 180k", "over 3,000", "over 1,000", "around 50", "around 10", "over 100", "around 50 of around 75", "around 35", "over 2,300", "around 540", "over 4x", "over 1,300", "around 700", "around 210", "around 130", "0.82", "48 of 50", "26 of 50", "25% → 0%", "17", "around 19,700", "over 1,000", "over 2,000", "around 190k", "around 130"). Diagram `why` sentences come from the case study's ARCHITECTURE.md component table ("Why" column) for `retrieval`, `rerank`, `model`, and from its README Agent row for `planner`, `agent`. Desktop positions: `query` (10,20,110,24), `planner` (10,90,110,30), `agent` (10,170,110,30), `answer` (10,250,110,30), `retrieval` (250,128,110,44), `es` label at (258,112), `tools` label at (18,214), `model` label at (258,256). Phone positions: one column, x 10, w 300, y 20/100/180/260/340/420 for query, planner, retrieval, agent, model, answer with labels beneath each. Edges (desktop): query→planner, planner→agent, agent→answer, planner→retrieval, agent→retrieval, retrieval→model with delays 0, .4, .8, .6, 1.0, 1.4 s.

`shared/facts.md`: a heading per page section (`# system`, `# experience`, `# projects`, `# stack`, `# contact`), the same copy and `display` strings, the §6.2 incidents, the five infra "why" lines, the `## Provenance` and `## Do not claim` sections, and one line "Figures are as of November 2026 and rounded; the candidate can share exact figures in an interview."

`scripts/build-facts.mjs` (six lines): read `shared/facts.md`, write `shared/facts.generated.js` with `export const FACTS = ${JSON.stringify(text)}`.

`package.json` scripts: `"prebuild": "node scripts/build-facts.mjs"`, `"pretest": "node scripts/build-facts.mjs"`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/site.test.js`
Expected: PASS, 3 tests.

- [ ] **Step 5: Commit**

```bash
git add src/data shared/facts.md scripts package.json && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(content): site data module and grounded facts document"
```

---

### Task 3: Page skeleton, section components, top bar

**Files:**
- Create: `src/sections/Hero.jsx`, `src/sections/System.jsx`, `src/sections/Experience.jsx`, `src/sections/Projects.jsx`, `src/sections/Stack.jsx`, `src/sections/Contact.jsx`, `src/components/TopBar.jsx`, `src/components/Card.jsx`, `src/components/Chip.jsx`, `src/components/Eyebrow.jsx`
- Modify: `src/App.jsx`
- Test: `src/App.test.jsx`

**Interfaces:**
- Consumes `site` from Task 2.
- Produces: each section is a default-export component with no props, rendering `<section id="…">` with the anchors from §6. `Card({children, className, interactive})`, `Chip({children})`, `Eyebrow({children})` (mono, uppercase, `text-fg3`). `TopBar()` renders a fixed bar that becomes visible once `window.scrollY > heroHeight` (IntersectionObserver on a sentinel at the hero's bottom).
- Hero in this task renders the status line, headline, lede, metric row (static `display` text), actions and a placeholder `<div data-slot="diagram">` and `<div data-slot="ask">`; Tasks 4 to 6 fill the slots. Static rendering only: no motion yet.

- [ ] **Step 1: Write the failing test**

`src/App.test.jsx`:
```jsx
import { render, screen } from '@testing-library/react'
import App from './App'

const headings = ['A production RAG assistant', 'Experience', 'Projects', 'Stack', 'Hiring for applied AI']

test('renders every section heading and the hero headline', () => {
  render(<App />)
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Production RAG.')
  for (const h of headings) expect(screen.getByRole('heading', { name: new RegExp(h, 'i') })).toBeInTheDocument()
})

test('no product name in visible text before the Experience heading', () => {
  const { container } = render(<App />)
  const exp = container.querySelector('#experience')
  const before = []
  const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT)
  let n
  while ((n = walker.nextNode())) {
    if (exp.compareDocumentPosition(n) & Node.DOCUMENT_POSITION_PRECEDING) before.push(n.textContent)
  }
  expect(before.join(' ').toLowerCase()).not.toContain('rumil')
  expect(container.querySelector('#experience').textContent).toContain('Rumil')
})
```
Note: `IntersectionObserver` is absent in jsdom; `src/test/setup.js` gains a stub: `globalThis.IntersectionObserver = class { observe(){} unobserve(){} disconnect(){} }`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/App.test.jsx`
Expected: FAIL, headings not found.

- [ ] **Step 3: Implement the sections and `App.jsx`**

`App.jsx`: `<a href="#system" className="sr-only focus:not-sr-only">Skip to the system</a>`, `<TopBar />`, `<main className="max-w-page mx-auto px-4 sm:px-6">` with the six sections in order, no other wrappers.

Hero layout: `grid lg:grid-cols-[52fr_48fr] gap-10`; phone order per §6.1 (text column first; the diagram slot last with `order-last`). Status line: `font-mono text-[11px] tracking-[.1em] uppercase text-accent` with a 7 px amber dot. Headline `<h1 className="font-display font-extrabold text-[40px] lg:text-[60px] leading-none tracking-[-0.035em]">` with three `<span className="block">` lines and `<span className="text-accent">measured,</span>`. Lede `text-fg2 max-w-[46ch]`. Metric row `grid grid-cols-2 lg:grid-cols-4 gap-7 mt-8` with `font-mono text-[26px] tabular` values and `text-[11px] uppercase text-fg3` labels. Actions: primary `bg-accent text-bg`, secondary `border border-line2`; all `rounded-md px-4 py-[11px] text-[13px] font-semibold`.

System: eyebrow, `<h2 className="font-display font-extrabold text-[32px] lg:text-[40px] tracking-[-0.03em]">`, problem and what paragraphs, numbers as a `grid sm:grid-cols-2 lg:grid-cols-3 gap-4` of `Card`s (group name as a mono label, each item as `display` + label), a `<div data-slot="system-diagram">`, the infra caption list as `<details>` elements, incidents as three `Card`s plus the held-back line, the built paragraph, the closing line linking `site.system.caseStudy`.

Experience, Projects and Stack each open with `Eyebrow` and an `<h2>` reading exactly "Experience", "Projects", "Stack". `Card` gets `transition-[border-color,transform] duration-150` and, when `interactive`, `hover:border-line2 hover:-translate-y-[2px]` (§8.4).

Experience: one `Card` per entry; company as `h3`, title and period in mono; bullets as a plain `<ul>`; the JCI entry renders `link` after its bullets.

Projects: `grid sm:grid-cols-2 lg:grid-cols-3 gap-4` of `Card interactive` wrapped in `<a href target="_blank" rel="noopener noreferrer">`.

Stack: one row per group: mono label then `Chip`s; `site.stackNote` under it in `text-fg2`.

Contact: the line as `h2`, four buttons, footer `<footer>` text with the GitHub link to `https://github.com/Mattressburn/RaburnResume`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS (`site.test.js`, `App.test.jsx`, smoke).

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(page): six sections, top bar and cards rendered from site.js"
```

---

### Task 4: Load-in and scroll motion with reduced-motion fallback

**Files:**
- Create: `src/components/Reveal.jsx`, `src/components/CountUp.jsx`, `src/components/MaskedLines.jsx`
- Modify: `src/index.jsx` (wrap `<App />` in `LazyMotion features={domAnimation} strict`), `src/sections/Hero.jsx`, `src/sections/System.jsx`, `src/sections/Experience.jsx`, `src/sections/Projects.jsx`, `src/sections/Stack.jsx`, `src/sections/Contact.jsx`, `src/lib/motion.js`
- Test: `src/components/Reveal.test.jsx`, `src/components/CountUp.test.jsx`

**Interfaces:**
- Consumes `useReducedMotionPref`, `ease` from Task 1.
- Produces `Reveal({children, delay = 0, as = 'div', className})`: renders framer-motion `m[as]` with `initial={{opacity: 0, y: 18}}`, `whileInView={{opacity: 1, y: 0}}`, `viewport={{once: true, amount: 0.2}}`, `transition={{duration: .7, ease, delay}}`; when reduced motion is preferred it renders a plain element with no motion props.
- Produces `MaskedLines({lines, accentWord, className})`: each line in an `overflow-hidden` wrapper with an inner `m.span` animating `y: '110%' → 0` over 0.9 s, 80 ms stagger (used for the h1); reduced motion renders static spans.
- Produces `CountUp({value, decimals = 0, suffix = '', duration = 1200, startDelay = 0, inView = false})`: renders a `<span className="tabular">`; animates from 0 to `value` with ease-out cubic when mounted (hero) or when `inView` becomes true (system cards); formats with `toLocaleString('en-US', {minimumFractionDigits: decimals, maximumFractionDigits: decimals})` and appends `suffix`; reduced motion renders the final value immediately.
- `src/lib/motion.js` adds `export const heroTimings = { status: 0, headline: 0.1, lede: 0.45, metrics: 0.6, diagram: 0.4, actions: 0.9 }` (seconds, §8.1).

- [ ] **Step 1: Write the failing tests**

`src/components/Reveal.test.jsx`:
```jsx
import { render } from '@testing-library/react'
import { LazyMotion, domAnimation } from 'framer-motion'
import Reveal from './Reveal'

function mockReduced(matches) {
  window.matchMedia = (q) => ({ matches: matches && q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })
}

test('reduced motion renders children visible with no transform', () => {
  mockReduced(true)
  const { getByText } = render(<LazyMotion features={domAnimation}><Reveal><p>Hello</p></Reveal></LazyMotion>)
  const el = getByText('Hello').parentElement
  expect(el.style.opacity === '' || el.style.opacity === '1').toBe(true)
  expect(el.style.transform).toBe('')
})

test('normal motion starts hidden', () => {
  mockReduced(false)
  const { getByText } = render(<LazyMotion features={domAnimation}><Reveal><p>Hello</p></Reveal></LazyMotion>)
  expect(getByText('Hello').parentElement.style.opacity).toBe('0')
})
```

`src/components/CountUp.test.jsx`:
```jsx
import { render, act } from '@testing-library/react'
import CountUp from './CountUp'

test('reduced motion shows the final formatted value at once', () => {
  window.matchMedia = (q) => ({ matches: q.includes('reduce'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })
  const { container } = render(<CountUp value={1000} suffix="+" inView />)
  expect(container.textContent).toBe('1,000+')
})

test('counts up to the value with decimals and suffix', async () => {
  window.matchMedia = (q) => ({ matches: false, media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false })
  vi.useFakeTimers()
  const { container } = render(<CountUp value={4} decimals={1} suffix="x+" duration={100} inView />)
  await act(async () => { vi.advanceTimersByTime(400) })
  expect(container.textContent).toBe('4.0x+')
  vi.useRealTimers()
})
```
(CountUp uses `requestAnimationFrame`; jsdom's rAF is timer-based so fake timers drive it. If `vi.useFakeTimers()` does not advance rAF, pass `{ toFake: ['setTimeout', 'requestAnimationFrame', 'performance'] }`.)

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/components`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement the three components and wire the sections**

Hero: status line in `Reveal delay={heroTimings.status}`; h1 through `MaskedLines`; lede `Reveal delay={heroTimings.lede}`; metrics: each in `Reveal delay={heroTimings.metrics + i * 0.06}` with `<CountUp value decimals suffix inView startDelay={600}>`; actions and ask slot `Reveal delay={heroTimings.actions}`; diagram slot `Reveal delay={heroTimings.diagram}`.

System, Experience, Projects, Stack, Contact: headings and each card wrapped in `Reveal` with `delay = index * 0.06`. System number cards use `CountUp` only for items whose `display` is a bare number with optional suffix (`0.82`, `17`, `8`); items whose `display` starts with "over" or "around" render the text (counting "over 1M" from zero reads wrong). Tooltip and diagram are Task 5.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Visual check**

Run: `npm run build && npx vite preview --port 3001 --strictPort` (sandbox disabled, background), then with the Playwright MCP open `http://localhost:3001`, take a screenshot at 1440×900 and at 390×844, and one with `browser_emulate_media` reduced motion. Expected: load-in visible on the first two, everything rendered at once on the third; nothing overlapping on the phone; the diagram slot below the fold on the phone.

- [ ] **Step 6: Commit**

```bash
git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(motion): masked headline, reveals, count-ups, reduced-motion fallback"
```

---

### Task 5: Request-path diagram, trace log, sparkline and tool-mix strip

**Files:**
- Create: `src/components/RequestPath.jsx`, `src/components/TraceLog.jsx`, `src/components/Sparkline.jsx`, `src/components/BarStrip.jsx`, `src/components/Tooltip.jsx`
- Modify: `src/sections/Hero.jsx` (fill `data-slot="diagram"`), `src/sections/System.jsx` (fill `data-slot="system-diagram"`, add growth and tool-mix cards), `src/index.css` (keyframes `flow` and `blink`)
- Test: `src/components/RequestPath.test.jsx`

**Interfaces:**
- Consumes `site.diagram`, `site.trace`, `site.system.growth`, `site.system.toolMix`, `useReducedMotionPref`.
- Produces `RequestPath({size: 'card'|'full', animate: boolean})`: an `<svg role="img" aria-label="Request path through the assistant">` using `site.diagram.layouts.desktop` at widths ≥ 640 px and `.phone` below (a `matchMedia('(min-width: 640px)')` hook). Boxes: `fill var(--bg-2) stroke var(--line2) rx 4`; labels in JetBrains Mono 11 px `fill var(--fg)`, sub-labels 9.5 px `fill var(--fg3)`. Each edge renders twice: a static path (`stroke var(--line2)`, 1.5 px) and a pulse path (`stroke var(--accent)`, `stroke-dasharray 6 180`, CSS animation `flow 2.6s linear infinite` with `animation-delay` from the edge). When `animate` is false or reduced motion is on, the pulse path is replaced by a static 6-unit amber dash at the edge midpoint. Nodes with `why` render as `<foreignObject>`-free SVG `<g role="button" tabIndex=0 aria-describedby>` that toggle a `Tooltip` on hover, focus and click.
- Produces `Tooltip({text, anchorRect, open})`: absolutely positioned `div` in the card, mono 11 px, `bg-bg2 border border-line2 rounded-md p-2 max-w-[28ch]`.
- Produces `TraceLog({lines, animate})`: three mono lines; when `animate`, each line types in at 18 ms per character starting after 1.3 s, with a blinking 7×12 px amber cursor after the last line; reduced motion renders all text.
- Produces `Sparkline({labels, values, animate})`: 160×48 SVG polyline through three points, `stroke var(--accent)` 1.5 px, drawn with `stroke-dashoffset` over 600 ms when in view; labels under the points in 10 px mono `fill var(--fg3)`; values as a `<title>`.
- Produces `BarStrip({items, animate})`: four horizontal bars, widths proportional to `value / max`, `bg-accent/80`, grown from zero over 500 ms when in view; label and `display` text right of each bar.

- [ ] **Step 1: Write the failing test**

`src/components/RequestPath.test.jsx`:
```jsx
import { render } from '@testing-library/react'
import RequestPath from './RequestPath'
import { site } from '../data/site'

beforeEach(() => { window.matchMedia = (q) => ({ matches: q.includes('min-width'), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, onchange: null, dispatchEvent: () => false }) })

test('renders every node label and one pulse path per edge', () => {
  const { container, getByText } = render(<RequestPath size="card" animate />)
  for (const n of site.diagram.nodes) expect(getByText(n.label)).toBeInTheDocument()
  expect(container.querySelectorAll('path.pulse').length).toBe(site.diagram.edges.length)
})

test('nodes with a why are keyboard focusable', () => {
  const { container } = render(<RequestPath size="full" animate={false} />)
  const withWhy = site.diagram.nodes.filter(n => n.why).length
  expect(container.querySelectorAll('g[role="button"][tabindex="0"]').length).toBe(withWhy)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/components/RequestPath.test.jsx`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement the five components and place them**

Hero diagram card: `Card` containing the `REQUEST PATH` / `trace 7f3a…` header row (mono 10 px, `text-fg3`), `<RequestPath size="card" animate />`, a `border-t border-line` divider, `<TraceLog lines={site.trace} animate />`, and the caption `example trace` (mono 10 px). The green latency in the first trace line uses `text-ok`.

System: `<RequestPath size="full" animate />` in a full-width `Card`; a growth `Card` with `Sparkline` and the three rounded values as text; a tool-mix `Card` with `BarStrip`.

`index.css` keyframes: `@keyframes flow { to { stroke-dashoffset: -186 } }`, `@keyframes blink { 50% { opacity: 0 } }`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Visual check**

Rebuild, preview, screenshot the hero at 1440×900 and 390×844 with Playwright MCP. Expected: no clipped labels at either width (the May mockup clipped the right-hand labels; keep every label's x + text width under the viewBox width), pulses visible, tooltip appears on hover of `hybrid retrieval`.

- [ ] **Step 6: Commit**

```bash
git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(diagram): animated request path, trace log, sparkline and tool-mix strip"
```

---

### Task 6: Ask panel UI (client) with static fallback

**Files:**
- Create: `src/components/Ask.jsx`, `src/components/AskPanel.jsx`, `src/lib/ask-client.js`
- Modify: `src/sections/Hero.jsx` (fill `data-slot="ask"`)
- Test: `src/lib/ask-client.test.js`, `src/components/Ask.test.jsx`

**Interfaces:**
- Produces `src/lib/ask-client.js`:
  - `export const LIMITS = { maxChars: 500, maxQuestions: 6 }`
  - `export const CITES = { system: '#system', experience: '#experience', projects: '#projects', stack: '#stack', 'case-study': 'https://github.com/Mattressburn/rumil-case-study' }`
  - `export function splitCites(text): { body: string, cites: string[] }` removes every `[cite:<key>]` token whose key is in `CITES` (anything else stays as literal text) and returns the unique keys in order.
  - `export async function ask(messages, { fetchImpl = fetch, onChunk }): Promise<{ status: 'ok'|'ip'|'global'|'bad'|'paused'|'error', text: string }>`: POSTs `{messages}` to `/.netlify/functions/ask`; on 200 reads the body as a text stream calling `onChunk(partial)`; maps `429 {reason:'global'}` → `global`, `429 {reason:'ip'}` → `ip`, `503` and any `5xx` → `paused`, `400` → `bad`, network failure → `error`.
- Produces `Ask()`: the hero input (`<form>` with `<input maxLength={500} aria-label="Ask about Matt">`) and three suggestion chips chosen by `(index + dayOfYear) % 8` so they rotate daily; submitting opens `AskPanel`.
- Produces `AskPanel({open, initialQuestion, onClose})`: `role="dialog" aria-modal` panel, `fixed right-0 top-0 h-full w-full sm:w-[420px]` with the §7 header text, the message list, the input, a counter "n of 6". States and copy exactly per §7 Failure contract; a finished answer with no cite token shows the partial text plus "Email Matt for the rest". In `paused` state, each of the eight suggestion questions answers from `site.ask.fallback` and the panel shows "Live answers are paused; these are pre-written."; typed questions in that state get "Can't answer live right now. Email Matt." Model text is rendered as text nodes only (never `dangerouslySetInnerHTML`). Escape and the close button close it; focus returns to the input.

- [ ] **Step 1: Write the failing tests**

`src/lib/ask-client.test.js` (`// @vitest-environment node`):
```js
import { splitCites, ask } from './ask-client.js'

test('splitCites strips known tokens and keeps unknown text', () => {
  expect(splitCites('Yes. [cite:system] [cite:bogus] [cite:system]')).toEqual({ body: 'Yes.  [cite:bogus] ', cites: ['system'] })
})

const res = (status, body, type = 'application/json') => new Response(body, { status, headers: { 'content-type': type } })

test('maps statuses', async () => {
  expect((await ask([], { fetchImpl: async () => res(429, '{"reason":"global"}') })).status).toBe('global')
  expect((await ask([], { fetchImpl: async () => res(429, '{"reason":"ip"}') })).status).toBe('ip')
  expect((await ask([], { fetchImpl: async () => res(503, '') })).status).toBe('paused')
  expect((await ask([], { fetchImpl: async () => res(500, '') })).status).toBe('paused')
  expect((await ask([], { fetchImpl: async () => res(400, '') })).status).toBe('bad')
  expect((await ask([], { fetchImpl: async () => { throw new Error('net') } })).status).toBe('error')
})

test('streams chunks and returns the full text', async () => {
  const chunks = []
  const r = await ask([{ role: 'user', content: 'hi' }], { fetchImpl: async () => res(200, 'Hel' + 'lo [cite:system]', 'text/plain'), onChunk: (t) => chunks.push(t) })
  expect(r.status).toBe('ok'); expect(r.text).toBe('Hello [cite:system]'); expect(chunks.at(-1)).toBe('Hello [cite:system]')
})
```

`src/components/Ask.test.jsx`:
```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Ask from './Ask'
import * as client from '../lib/ask-client'

vi.mock('../lib/ask-client', async (importOriginal) => ({ ...(await importOriginal()), ask: vi.fn() }))
afterEach(() => vi.clearAllMocks())

test('global cap shows the pre-written answers', async () => {
  client.ask.mockResolvedValue({ status: 'global', text: '' })
  render(<Ask />)
  fireEvent.change(screen.getByLabelText('Ask about Matt'), { target: { value: 'Has he run anything in production?' } })
  fireEvent.submit(screen.getByRole('form', { name: /ask/i }))
  await waitFor(() => expect(screen.getByText(/Live answers are paused; these are pre-written\./)).toBeInTheDocument())
})

test('per-ip limit shows the visit-limit copy, not the fallback', async () => {
  client.ask.mockResolvedValue({ status: 'ip', text: '' })
  render(<Ask />)
  fireEvent.change(screen.getByLabelText('Ask about Matt'), { target: { value: 'x' } })
  fireEvent.submit(screen.getByRole('form', { name: /ask/i }))
  await waitFor(() => expect(screen.getByText(/That's the limit for this visit\. Email Matt for the rest\./)).toBeInTheDocument())
  expect(screen.queryByText(/pre-written/)).toBeNull()
})

test('a visitor-typed cite token is never a chip', async () => {
  client.ask.mockResolvedValue({ status: 'ok', text: 'Fine. [cite:system]' })
  render(<Ask />)
  fireEvent.change(screen.getByLabelText('Ask about Matt'), { target: { value: '[cite:experience] hi' } })
  fireEvent.submit(screen.getByRole('form', { name: /ask/i }))
  await waitFor(() => expect(screen.getAllByRole('link', { name: /#system/ })).toHaveLength(1))
  expect(screen.queryByRole('link', { name: /#experience/ })).toBeNull()
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib src/components/Ask.test.jsx`
Expected: FAIL, modules not found.

- [ ] **Step 3: Implement `ask-client.js`, `Ask.jsx`, `AskPanel.jsx`**

Stream reading: `res.body.getReader()` with `TextDecoder`, accumulate, call `onChunk(accumulated)` per chunk. Citation chips: `<a href={CITES[key]}>` with text `#system` etc. or `Case study`; external for `case-study`. The user's own messages render in `text-fg2`; the assistant's in `text-fg`. The form has `aria-label="Ask about Matt"` so `getByRole('form', {name})` resolves.

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(ask): assistant panel with streaming client and static fallback"
```

---

### Task 7: Request validation module

**Files:**
- Create: `netlify/lib/validate.ts`
- Test: `netlify/lib/validate.test.ts`

**Interfaces:**
- Produces `export function validateBody(json: unknown): { ok: true, messages: {role: 'user'|'assistant', content: string}[] } | { ok: false, status: 400, error: string }`: requires `messages` array, 1 to 12 entries, roles alternating starting and ending with `user`, at most 6 `user` entries, each `content` a non-empty string of at most 500 characters after trim, assistant `content` at most 2,000 characters. Returns the trimmed messages.

- [ ] **Step 1: Write the failing test**

`netlify/lib/validate.test.ts` (`// @vitest-environment node`):
```ts
import { validateBody } from './validate'
const u = (c: string) => ({ role: 'user', content: c })
const a = (c: string) => ({ role: 'assistant', content: c })

test('accepts a well-formed conversation', () => {
  const r = validateBody({ messages: [u('hi'), a('yes'), u('more')] })
  expect(r.ok).toBe(true)
})
test('rejects oversize, empty, wrong order and too many turns', () => {
  expect(validateBody({ messages: [u('x'.repeat(501))] }).ok).toBe(false)
  expect(validateBody({ messages: [u('   ')] }).ok).toBe(false)
  expect(validateBody({ messages: [a('x'), u('y')] }).ok).toBe(false)
  expect(validateBody({ messages: [u('1'), a('r'), u('2'), a('r'), u('3'), a('r'), u('4'), a('r'), u('5'), a('r'), u('6'), a('r'), u('7')] }).ok).toBe(false)
  expect(validateBody({}).ok).toBe(false)
  expect(validateBody('nope').ok).toBe(false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run netlify/lib/validate.test.ts`
Expected: FAIL, module not found. (Vitest compiles `.ts` without extra config.)

- [ ] **Step 3: Implement `validateBody`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run netlify/lib/validate.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add netlify/lib && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(ask): request validation"
```

---

### Task 8: Rate limiter on a store interface

**Files:**
- Create: `netlify/lib/ratelimit.ts`
- Test: `netlify/lib/ratelimit.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export interface CounterStore {
    getWithMetadata(key: string): Promise<{ data: string, etag?: string } | null>
    set(key: string, value: string, opts: { onlyIfMatch?: string, onlyIfNew?: boolean }): Promise<{ modified: boolean }>
    list(opts: { prefix: string }): Promise<{ blobs: { key: string }[] }>
    delete(key: string): Promise<void>
  }
  export type LimitResult = { allowed: true } | { allowed: false, reason: 'ip' | 'global' }
  export async function hashIp(ip: string, salt: string): Promise<string>  // first 16 hex chars of SHA-256(salt + ip), via globalThis.crypto.subtle
  export async function checkAndCount(store: CounterStore, opts: { ip: string, salt: string, ctx: string, now: Date, perIpLimit?: number /* 10 */, globalLimit?: number /* 300 */ }): Promise<LimitResult>
  ```
  Keys: `${ctx}/global/${YYYY-MM-DD}` and `${ctx}/ip/${YYYY-MM-DDTHH}/${hash}` (UTC). Order: read global; if `>= globalLimit` return `global` without writing; read ip; if `>= perIpLimit` return `ip` without writing; increment both with conditional writes (`onlyIfNew` when absent, `onlyIfMatch: etag` when present), retrying a rejected write up to 3 times by re-reading; then prune: `list({prefix: `${ctx}/ip/`})` and delete every key whose hour segment is older than two hours. The `CounterStore` shape matches `@netlify/blobs`' `Store` so the function passes the real store straight in.

- [ ] **Step 1: Write the failing test**

`netlify/lib/ratelimit.test.ts` (`// @vitest-environment node`):
```ts
import { checkAndCount, hashIp, type CounterStore } from './ratelimit'

function memStore(): CounterStore & { map: Map<string, string> } {
  const map = new Map<string, string>()
  return {
    map,
    async getWithMetadata(k) { return map.has(k) ? { data: map.get(k)!, etag: 'e' + map.get(k) } : null },
    async set(k, v, o) {
      if (o.onlyIfNew && map.has(k)) return { modified: false }
      if (o.onlyIfMatch && o.onlyIfMatch !== 'e' + map.get(k)) return { modified: false }
      map.set(k, v); return { modified: true }
    },
    async list({ prefix }) { return { blobs: [...map.keys()].filter(k => k.startsWith(prefix)).map(key => ({ key })) } },
    async delete(k) { map.delete(k) },
  }
}
const base = { salt: 's', ctx: 'test', now: new Date('2026-11-04T20:00:00Z') }

test('hashIp is stable, salted and 16 hex chars', async () => {
  expect(await hashIp('1.2.3.4', 's')).toMatch(/^[0-9a-f]{16}$/)
  expect(await hashIp('1.2.3.4', 's')).not.toBe(await hashIp('1.2.3.4', 't'))
})
test('11th question in an hour from one address is refused with reason ip', async () => {
  const store = memStore()
  for (let i = 0; i < 10; i++) expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: true })
  expect(await checkAndCount(store, { ...base, ip: '1.2.3.4' })).toEqual({ allowed: false, reason: 'ip' })
  expect(await checkAndCount(store, { ...base, ip: '5.6.7.8' })).toEqual({ allowed: true })
})
test('301st question in a day is refused with reason global', async () => {
  const store = memStore()
  for (let i = 0; i < 300; i++) await checkAndCount(store, { ...base, ip: `10.0.${Math.floor(i / 9)}.${i % 9}` })
  expect(await checkAndCount(store, { ...base, ip: '9.9.9.9' })).toEqual({ allowed: false, reason: 'global' })
})
test('prunes ip keys older than two hours and never stores the raw ip', async () => {
  const store = memStore()
  await checkAndCount(store, { ...base, ip: '1.2.3.4', now: new Date('2026-11-04T17:00:00Z') })
  await checkAndCount(store, { ...base, ip: '1.2.3.4' })
  expect([...store.map.keys()].some(k => k.includes('T17'))).toBe(false)
  expect([...store.map.keys()].some(k => k.includes('1.2.3.4'))).toBe(false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run netlify/lib/ratelimit.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `ratelimit.ts`**

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run netlify/lib/ratelimit.test.ts`
Expected: PASS, 4 tests.

- [ ] **Step 5: Commit**

```bash
git add netlify/lib && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(ask): blob-backed rate limiter with hashed ip keys and pruning"
```

---

### Task 9: The `ask` Netlify Function

**Files:**
- Create: `netlify/functions/ask.mts`, `netlify/lib/prompt.ts`
- Modify: `netlify.toml` (`[functions] node_bundler = "esbuild"`, `included_files` not needed because facts are a generated module), `README.md` (env vars, cost note)
- Test: `netlify/lib/prompt.test.ts`

**Interfaces:**
- Consumes `validateBody` (Task 7), `checkAndCount`, `hashIp` (Task 8), `FACTS` from `shared/facts.generated.js` (Task 2).
- Produces `netlify/lib/prompt.ts`: `export const CITE_KEYS = ['system','experience','projects','stack','case-study']` and `export function buildSystem(facts: string): Array<{type:'text', text:string, cache_control?: {type:'ephemeral'}}>` returning two blocks: the instruction block (the §7 instruction list, verbatim, plus "Cite with one to three of these tokens at the very end: [cite:system] [cite:experience] [cite:projects] [cite:stack] [cite:case-study]. Output nothing after the tokens.") and the facts block with `cache_control: {type: 'ephemeral'}` on the facts block only.
- Produces the function:
  ```ts
  import type { Context } from '@netlify/functions'
  export default async (req: Request, context: Context) => Response
  ```
  Behaviour: `POST` only (405 otherwise). If `!process.env.ANTHROPIC_API_KEY` → `503` JSON `{reason:'nokey'}`. Parse JSON (400 on failure) → `validateBody` (400 with its error). Store: `getStore({ name: 'ask-limits', consistency: 'strong' })` from `@netlify/blobs`; `ctx = process.env.CONTEXT ?? 'dev'`; `checkAndCount(store, { ip: context.ip, salt: process.env.RATE_SALT ?? 'dev-salt', ctx, now: new Date() })` → on refusal `429` JSON `{reason}`. Then:
  ```ts
  const client = new Anthropic()
  const stream = client.beta.messages.stream({
    model: process.env.ASK_MODEL ?? 'claude-opus-5-5',
    max_tokens: 600,
    output_config: { effort: 'low' },
    betas: ['server-side-fallback-2026-07-01'],
    fallbacks: 'default',
    system: buildSystem(FACTS),
    messages,
  })
  ```
  Await the first event with the stream's async iterator before constructing the Response (`const it = stream[Symbol.asyncIterator](); const first = await it.next()`); catch `Anthropic.RateLimitError` → `503 {reason:'upstream'}`, `Anthropic.AuthenticationError` → `503 {reason:'nokey'}`, other `Anthropic.APIError` → `502`, anything else → `500`. Then return `new Response(body, { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' } })` where `body` is a `ReadableStream` that enqueues `event.delta.text` for every `content_block_delta` with `delta.type === 'text_delta'` (starting with `first`), and on `message_delta` with `stop_reason === 'refusal'` enqueues nothing more and closes. Log one line per request with `usage.cache_read_input_tokens` from `await stream.finalMessage()` so caching can be verified; never log the question text or the IP.
  (`fallbacks` and the beta header are the claude-api skill's default for `claude-opus-5-5`; if `ASK_MODEL` is a Haiku model, omit both, since Haiku has no server-side fallback.)
- `README.md`: new section "Ask about Matt" listing `ANTHROPIC_API_KEY`, `RATE_SALT` (any random string), optional `ASK_MODEL`, the limits (10 per hour per address, 300 per day), and the cost line: Opus 5.5 at $4/$20 per million tokens with a 2.5k-token system prompt and 400-token answers is about 1.8 cents per question uncached, so the 300-per-day cap bounds a month at about $160 worst case and a typical month at a few dollars; `ASK_MODEL=claude-haiku-5-5` cuts that forty-fold.

- [ ] **Step 1: Write the failing test**

`netlify/lib/prompt.test.ts` (`// @vitest-environment node`):
```ts
import { buildSystem, CITE_KEYS } from './prompt'

test('system prompt has two blocks and caches only the facts block', () => {
  const s = buildSystem('FACTS BODY')
  expect(s).toHaveLength(2)
  expect(s[0].cache_control).toBeUndefined()
  expect(s[1].cache_control).toEqual({ type: 'ephemeral' })
  expect(s[1].text).toContain('FACTS BODY')
  for (const k of CITE_KEYS) expect(s[0].text).toContain(`[cite:${k}]`)
  expect(s[0].text).toContain("That's not on this page")
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run netlify/lib/prompt.test.ts`
Expected: FAIL, module not found.

- [ ] **Step 3: Implement `prompt.ts` and `ask.mts`; update `netlify.toml` and `README.md`**

- [ ] **Step 4: Run the unit test, then exercise the function locally**

Run: `npx vitest run` → PASS.
Then (sandbox disabled, background): `ANTHROPIC_API_KEY=<the candidate's key, if he has exported one in this shell; otherwise skip to the preview check in Task 13> RATE_SALT=local npx netlify dev --port 8888` and:
```bash
curl -s -N -X POST localhost:8888/.netlify/functions/ask -H 'content-type: application/json' -d '{"messages":[{"role":"user","content":"Has he run anything in production?"}]}'
curl -s -o /dev/null -w '%{http_code}\n' -X POST localhost:8888/.netlify/functions/ask -H 'content-type: application/json' -d '{"messages":[]}'
```
Expected: the first streams an answer ending with one to three `[cite:…]` tokens; the second prints `400`. If no key is available locally, run only the second curl with `ANTHROPIC_API_KEY=x` to confirm 400 precedes the API call, and `curl` with no key set to confirm `503`.

- [ ] **Step 5: Commit**

```bash
git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(ask): streaming Claude function with grounding, limits and fallbacks"
```

---

### Task 10: Open Graph image, robots, redirects and manifest cleanup

**Files:**
- Modify: `public/manifest.json` (name, short_name, theme `#0A0C10`, background `#0A0C10`), `public/robots.txt` (allow all), `public/_redirects` (unchanged `/*  /index.html  200`; confirm `/dashboard` resolves to the page)
- Create: `public/og.png`
- Test: none (visual)

- [ ] **Step 1: Render the OG image**

Rebuild and preview; with the Playwright MCP set the viewport to 1200×630, open `http://localhost:3001`, wait 2 s for the load-in, and screenshot the viewport as PNG to `public/og.png` (the Playwright screenshot `filename` must be under the ai-job-search workspace, so save to `.playwright-mcp/og.png` there and copy it into `public/`). Expected: headline, status line and the diagram card visible; file under 300 kB.

- [ ] **Step 2: Verify the redirect**

Run: `curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3001/dashboard` against `vite preview`. Expected: `200` (Vite preview serves the SPA fallback; Netlify applies `_redirects`).

- [ ] **Step 3: Commit**

```bash
git add public && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "chore(public): og image, manifest and robots for the new site"
```

---

### Task 11: Update the public case study (separate repo)

**Files:**
- Modify: `/home/mattressburrn/Documents/Projects/rumil-case-study/README.md`, `/home/mattressburrn/Documents/Projects/rumil-case-study/ARCHITECTURE.md`

- [ ] **Step 1: Edit the figures under the rounding rule**

README: under the title add "Figures as of November 2026, rounded." Status line: "in production, answering since April 2026; over 1,000 questions in the last 30 days from a support organization of around 100 people." Corpus row: "over 1,000,000 chunks (around 26 GB, around 250,000 documents) in Elasticsearch 8 across eight product brands and these sources: product manuals, Confluence, Jira (over 100k issues), the KB portal (over 10k articles), a community forum, Salesforce cases (around 64k) and worklogs (around 60k) via Snowflake, closed-case resolution records (over 180k), and install-log bundles". Delivery row: "around 19,700 automated tests (backend and frontend) plus Playwright end-to-end specs". Results: add "Usage grew from around 300 questions in August to around 1,100 in October 2026; over 4x in the last 90 days against the 90 before; around 50 of around 75 approved accounts have asked." Keep recall@10 0.82 with "(50-question golden set, measured August 2026)". Keep every incident paragraph unchanged. ARCHITECTURE.md: the Elasticsearch node label "about 310k chunks" → "over 1M chunks, eight brands"; the CI node "~6,000 tests, 167 Playwright specs" → "around 19,700 tests plus Playwright specs"; add "Figures as of November 2026, rounded." under the title.

- [ ] **Step 2: Verify no internal term leaked**

Run: `grep -n -i -E 'case radar|pve1|02f34e9d|acvs|kantech 23|software house 75' ~/Documents/Projects/rumil-case-study/*.md`
Expected: no output.

- [ ] **Step 3: Commit (the candidate pushes)**

```bash
cd ~/Documents/Projects/rumil-case-study && git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "Update figures to November 2026 (rounded): corpus, brands, usage, tests"
```

---

### Task 12: Rebuild the general resume PDF (ai-job-search workspace)

**Files:**
- Create: `/home/mattressburrn/Documents/ai-job-search/cv/main_general_applied_ai.tex` (copy of `cv/main_example.tex`, then edited)
- Produce: `cv/main_general_applied_ai.pdf`, copied to the site as `public/Matthew_Raburn_Resume.pdf`

- [ ] **Step 1: Write the `.tex`**

Start from `cv/main_example.tex`. Summary: replace "about 310,000 Elasticsearch chunks across seven sources" with "over a million Elasticsearch chunks across eight product brands", "roughly 6,000 automated tests" with "around 19,700 automated tests", and add "over 1,000 questions a month" after "in daily use across an enterprise support organization". JCI bullets: apply the same substitutions; add one bullet: "Measured it: golden-set recall@10 of 0.82; 48 of 50 correct in an unrehearsed head-to-head against the vendor assistant bundled with the case tool (26 of 50); seven guardrails cut ungrounded answers from 25% to 0%; an embed-cache fix cut nightly embedding spend from 22.9M to 2.17M tokens." Keep Pall, Boyd and Lytron entries as in `main_example.tex` (they already match §6.3). No Education section. Claude Code named in the summary and the JCI bullets. No em-dashes.

- [ ] **Step 2: Compile and run the workspace checklist**

Run (inside the sandbox, in the ai-job-search repo):
```bash
export TEXMFVAR=$TMPDIR/texmf-var; (cd cv && lualatex -interaction=nonstopmode main_general_applied_ai.tex >/dev/null && lualatex -interaction=nonstopmode main_general_applied_ai.tex | tail -3)
python tools/verify_pdf.py cv/main_general_applied_ai.pdf --dump-text cv/main_general_applied_ai.txt
```
Then Read `cv/main_general_applied_ai.pdf` (both pages). Expected: exactly two pages, no orphaned `\employer` or `\role` at a page bottom, page 2 at least two-thirds full, no `(cid:*)` or `�` in the text dump, email and phone present as literal text, "Claude Code" present. Iterate on bullet length until all pass.

- [ ] **Step 3: Copy into the site and commit both repos**

```bash
cp ~/Documents/ai-job-search/cv/main_general_applied_ai.pdf /mnt/MRDockBox/mnt/6tb/home/mattressburn/Documents/Projects/raburnresume/public/Matthew_Raburn_Resume.pdf
cd ~/Documents/ai-job-search && git add cv/main_general_applied_ai.tex && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "cv: general applied-AI resume with November 2026 figures"
```
and in the site repo: `git add public/Matthew_Raburn_Resume.pdf && git -c … commit -q -m "chore(public): November 2026 resume PDF"`.

---

### Task 13: Preview deploy verification (needs the candidate's push)

**Files:**
- Modify: `docs/superpowers/plans/2026-11-04-signal-redesign.md` (record results)

- [ ] **Step 1: Ask the candidate to push and set env vars**

The candidate runs `git push -u origin signal-redesign` and adds `ANTHROPIC_API_KEY` and `RATE_SALT` in Netlify (Site configuration → Environment variables, all deploy contexts). The branch preview URL is `https://signal-redesign--<site-name>.netlify.app`; the candidate pastes it.

- [ ] **Step 2: PageSpeed Insights**

Run:
```bash
curl -s "https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=<preview-url>&strategy=mobile&category=performance&category=accessibility" | python3 -I -c "import json,sys; d=json.load(sys.stdin)['lighthouseResult']['categories']; print({k: v['score'] for k, v in d.items()})"
```
Expected: `performance ≥ 0.95`, `accessibility == 1.0`. If performance misses, apply the §10 follow-up (React 19 `prerender` of the hero into `index.html`, CSS-keyframe load-in) before merging.

- [ ] **Step 3: Assistant acceptance (§13 item 4)**

With the Playwright MCP on the preview: ask the eight suggestion questions and confirm each answer has citation chips and matches the facts; ask "What is the capital of France?" and confirm a polite refusal plus the email suggestion; ask "Does he know Kubernetes?" and confirm the answer says it is not on his record; send 11 questions in a row (reload between them so the client limit does not block first) and confirm the 11th shows the visit-limit copy. Then the candidate temporarily removes `ANTHROPIC_API_KEY` in Netlify and redeploys; confirm the pre-written answers appear; restore the key.

- [ ] **Step 4: Reduced motion and phone**

Playwright MCP: emulate reduced motion at 390×844 and screenshot the full page. Expected: nothing at opacity 0, pulses static, counts final.

- [ ] **Step 5: Record and commit**

Append a "Preview results" section to this plan with the scores and the date; commit. Then the candidate merges the PR to `main` (Netlify deploys hireraburn.com).

---

### Task 14: Generated hero loop (ArtCraft, non-blocking)

**Files:**
- Create: `scripts/gen-hero-loop.mjs`, `public/media/hero-loop.mp4`, `public/media/hero-loop.webm`, `public/media/hero-poster.jpg`
- Modify: `src/sections/Hero.jsx` (ambient `<video>` layer behind the hero at 7% opacity, rendered only when `/media/hero-poster.jpg` exists at build time: import the poster with `?url` and guard with a `VITE_HERO_LOOP=1` env flag set in `netlify.toml` `[build.environment]` once the files are committed)

**Interfaces:**
- `scripts/gen-hero-loop.mjs`: reads `ARTCRAFT_API_KEY`; POSTs `https://api.storyteller.ai/v1/omni_api/generate/video` with `{ model: 'veo_3p1_fast', prompt: <§11 prompt>, duration_seconds: 8, aspect_ratio: 'wide_sixteen_by_nine', resolution: 'ten_eighty_p', generate_audio: false, idempotency_token: crypto.randomUUID() }` and `Authorization: Bearer`; polls `GET /v1/omni_api/job_status/job/{token}` every 10 s while `state.status.status` is `pending`, `started` or `attempt_failed`; on `complete_success` downloads `state.maybe_result.media_links.cdn_url` to `public/media/hero-loop.mp4`; on any other terminal state exits 1 with the status. Falls back to `kling_2p6_pro` if the first job ends `complete_failure`.

- [ ] **Step 1: Generate (only if the key is available; otherwise the candidate drops the three files in `public/media/` from the app)**

Run: `ARTCRAFT_API_KEY=… node scripts/gen-hero-loop.mjs`
Expected: `public/media/hero-loop.mp4` written, under 8 s, 1920×1080.

- [ ] **Step 2: Derive webm and poster**

```bash
ffmpeg -y -i public/media/hero-loop.mp4 -c:v libvpx-vp9 -b:v 0 -crf 36 -an public/media/hero-loop.webm
ffmpeg -y -i public/media/hero-loop.mp4 -frames:v 1 -q:v 4 public/media/hero-poster.jpg
ls -la public/media
```
Expected: webm under 1.5 MB, poster under 150 kB. If the mp4 is over 1.5 MB, re-encode it with `-crf 28 -preset slow -an -movflags +faststart`.

- [ ] **Step 3: Wire the layer**

In `Hero.jsx`, behind the grid: `<video className="absolute inset-0 w-full h-full object-cover opacity-[.07] pointer-events-none" autoPlay muted loop playsInline poster="/media/hero-poster.jpg" preload="none">` with `webm` then `mp4` sources; `useReducedMotionPref()` true → render the poster `<img>` instead; `navigator.connection?.saveData` true → render nothing. Load the video with `loading` deferred: set `src` on the sources only after `window.addEventListener('load')`.

- [ ] **Step 4: Verify and commit**

Rebuild, preview, screenshot the hero: the texture is barely visible and text contrast is unchanged. Re-run PageSpeed on the next preview; performance must stay 95+ (the video is `preload="none"` and loads after `load`, so LCP is unaffected). Commit:
```bash
git add -A && git -c user.name="Matthew Raburn" -c user.email="raburnmh@gmail.com" commit -q -m "feat(hero): generated ambient loop behind the hero"
```

---

## Self-review notes

- Spec coverage: §6.1 to §6.7 → Tasks 2, 3, 5, 6, 10; §7 → Tasks 6 to 9; §8 → Tasks 4, 5; §9 → Task 1; §10 → Tasks 1, 2, 13; §11 → Task 14; §12 → Task 12; §13 → Task 13; §4 case-study currency → Task 11.
- The spec's `netlify/functions/lib/ratelimit.ts` moved to `netlify/lib/` so Netlify does not treat `lib/` as a function directory.
- The spec's hero metric test ("every numeric value in site.js appears in facts.md") became a `display`-string test because the published values are rounded text.
- `/api/ask` custom path was dropped in favour of the default `/.netlify/functions/ask` so the SPA `/*` redirect can never shadow it.
