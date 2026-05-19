# Kinetic Brutalist + Acid Lime Refresh — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the classified-dossier React résumé site with a single-theme Kinetic Brutalist portfolio in Acid Lime, retheme `/dashboard` to match, and ship via PR.

**Architecture:** Single-page React app, single global theme — no era engine, no toggle. All styling driven by ~12 CSS custom properties in `src/index.css`; Tailwind retained for layout/spacing utilities only. Resume content rendered from existing `src/data/resumeData.js` (data structure unchanged; UI labels standardized).

**Tech Stack:** React 19, Vite 7, Tailwind 3, react-router-dom 7, Recharts 3, framer-motion 12 (already in deps). Vitest added in Phase 0 for component tests where they pay off.

**Reference:** Spec at `docs/superpowers/specs/2026-05-18-brutalist-lime-refresh-design.md`. Locked mockup at `mockups/LOCKED-direction.png`.

**Branch:** `kinetic-brutalist-refresh` off `main`.

**Testing philosophy:** TDD where it fits (`prefers-reduced-motion`, accessibility behaviors, acceptance-criteria invariants). Visual verification against the mockup for layout/aesthetics. The existing repo has `@testing-library/*` in deps but no test runner — Phase 0 wires Vitest.

---

## Phase 0: Setup + testing infrastructure

**Checkpoint at end:** Branch exists, `npm run test` runs Vitest successfully against a trivial smoke test, dev server boots on `:3001`.

### Task 0.1: Create branch

**Files:** none.

- [ ] **Step 1: Create and switch to branch**

```bash
cd /mnt/6tb/home/mattressburn/Documents/Projects/raburnresume
git checkout main
git pull --ff-only
git checkout -b kinetic-brutalist-refresh
```

Expected: `Switched to a new branch 'kinetic-brutalist-refresh'`.

- [ ] **Step 2: Verify clean baseline**

```bash
git status
npm install
npm run build
```

Expected: `npm run build` succeeds (existing dossier site builds clean).

### Task 0.2: Add Vitest

**Files:**
- Modify: `package.json`
- Create: `vitest.config.js`
- Create: `src/test/setup.js`

- [ ] **Step 1: Install Vitest + jsdom**

```bash
npm install -D vitest jsdom @testing-library/react
```

Expected: packages added to `devDependencies`, no peer-dep errors (React 19 supported by @testing-library/react ≥ 16).

- [ ] **Step 2: Create `vitest.config.js`**

```js
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    globals: true,
  },
});
```

- [ ] **Step 3: Create `src/test/setup.js`**

```js
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 4: Add `test` script to `package.json`**

In the `"scripts"` block, add:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Write a smoke test**

Create `src/test/smoke.test.js`:

```js
import { describe, it, expect } from 'vitest';

describe('smoke', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 6: Run tests**

```bash
npm run test
```

Expected: `1 passed`, exit code 0.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.js src/test/
git commit -m "chore: add vitest test runner with jsdom + testing-library

Lays groundwork for component tests in the brutalist rewrite."
```

### Task 0.3: Verify dev server

- [ ] **Step 1: Boot dev server**

```bash
npm start
```

Expected: Vite starts on port 3001 (per `vite.config.js`); browser auto-opens; dossier site renders.

- [ ] **Step 2: Stop the dev server** with Ctrl-C and proceed.

---

## Phase 1: Tokens + Tailwind foundation

**Checkpoint at end:** New CSS tokens live in `src/index.css`. Tailwind config swapped. `index.html` loads new fonts. Dev server boots; old page will look broken — that's expected.

### Task 1.1: Rewrite `tailwind.config.js`

**Files:** Modify: `tailwind.config.js`

- [ ] **Step 1: Replace contents**

```js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./public/index.html', './index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg:           '#09090B',
        fg:           '#FAFAFA',
        accent:       '#A3E635',
        'accent-ink': '#000000',
        muted:        '#3F3F46',
        'muted-fg':   '#A1A1AA',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        mono:    ['"Departure Mono"', '"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderWidth: {
        3: '3px',
      },
    },
  },
  plugins: [],
};
```

- [ ] **Step 2: Verify**

```bash
npx tailwindcss -i src/index.css -o /tmp/tw-check.css 2>&1 | head -5
```

Expected: no errors. (Output CSS may complain about unused selectors — fine.)

### Task 1.2: Update `index.html` fonts

**Files:** Modify: `index.html`

- [ ] **Step 1: Replace the `<link>` font line**

Find:

```html
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;600;700&family=Shrikhand&family=VT323&display=swap" rel="stylesheet">
```

Replace with:

```html
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&family=Space+Grotesk:wght@900&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
```

(Note: Departure Mono is not on Google Fonts. JetBrains Mono is the live fallback. If a self-hosted Departure Mono is added later, an `@font-face` block in `src/index.css` will register it; the Tailwind `font-mono` chain already prefers it.)

- [ ] **Step 2: Update title + meta**

Change `<title>Hire-Raburn</title>` to `<title>Matthew Raburn</title>`. Leave the `<meta name="description">` for now — it's fine.

### Task 1.3: Gut + rewrite `src/index.css`

**Files:** Modify: `src/index.css` (will shrink from ~1030 lines to ~200)

- [ ] **Step 1: Replace entire file contents**

```css
/* Google Fonts loaded via index.html. */

@tailwind base;
@tailwind components;
@tailwind utilities;

/* ═══════════════ TOKENS ═══════════════ */

:root {
  --bg:           #09090B;
  --fg:           #FAFAFA;
  --accent:       #A3E635;
  --accent-ink:   #000000;
  --muted:        #3F3F46;
  --muted-fg:     #A1A1AA;

  --font-display: 'Space Grotesk', system-ui, sans-serif;
  --font-mono:    'Departure Mono', 'JetBrains Mono', ui-monospace, monospace;

  --space-1:  4px;
  --space-2:  8px;
  --space-3:  16px;
  --space-4:  24px;
  --space-5:  32px;
  --space-6:  48px;
  --space-7:  64px;
  --space-8:  96px;

  --border-w:   3px;
  --shadow-off: 6px;
  --radius:     0;

  --marquee-speed: 30s;
  --press-scale:   0.97;
}

/* ═══════════════ GLOBAL BASE ═══════════════ */

html, body {
  background: var(--bg);
  color: var(--fg);
  font-family: var(--font-display);
  margin: 0;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

*,
*::before,
*::after {
  box-sizing: border-box;
  border-radius: var(--radius);
}

/* Visible keyboard focus */
:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* ═══════════════ DISPLAY TYPE ═══════════════ */

.display {
  font-family: var(--font-display);
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: -0.01em;
  line-height: 0.9;
}

.display-name {
  font-size: clamp(3.5rem, 12vw, 9rem);
}

.display-tagline {
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 700;
}

/* ═══════════════ MICROCOPY ═══════════════ */

.micro {
  font-family: var(--font-mono);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  font-weight: 500;
}

/* ═══════════════ MARQUEE ═══════════════ */

.marquee {
  background: var(--accent);
  color: var(--accent-ink);
  overflow: hidden;
  white-space: nowrap;
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--space-2) 0;
}

.marquee-track {
  display: inline-flex;
  animation: marquee var(--marquee-speed) linear infinite;
}

.marquee-track > span {
  padding-right: var(--space-6);
}

@keyframes marquee {
  from { transform: translateX(0); }
  to   { transform: translateX(-50%); }
}

/* ═══════════════ BRUTALIST CARD ═══════════════ */

.bcard {
  position: relative;
  display: inline-block;
}

.bcard-inner {
  position: relative;
  z-index: 1;
  background: var(--bg);
  border: var(--border-w) solid var(--accent);
  padding: var(--space-3) var(--space-4);
}

.bcard-shadow {
  position: absolute;
  inset: 0;
  transform: translate(var(--shadow-off), var(--shadow-off));
  background: var(--accent);
  z-index: 0;
}

/* Press feedback for interactive cards */
.bcard-interactive {
  cursor: pointer;
  transition: transform 100ms ease-out;
}

.bcard-interactive:active {
  transform: scale(var(--press-scale));
}

/* ═══════════════ PILL BADGE ═══════════════ */

.pill {
  display: inline-block;
  background: var(--accent);
  color: var(--accent-ink);
  font-family: var(--font-mono);
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--space-1) var(--space-3);
  border-radius: 9999px;
  font-size: 12px;
}

/* ═══════════════ REDACTED BLOCK ═══════════════ */

.redacted {
  display: inline-block;
  background: var(--muted);
  height: 1em;
  vertical-align: middle;
  margin: 0 2px;
}

/* ═══════════════ BRUTALIST CHIP ═══════════════ */

.chip {
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  padding: var(--space-2) var(--space-3);
  border: 2px solid var(--fg);
  margin: var(--space-1);
}

/* ═══════════════ SECTION HEADER ═══════════════ */

.section-header {
  display: flex;
  align-items: baseline;
  gap: var(--space-4);
  margin-top: var(--space-7);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-2);
  border-bottom: var(--border-w) solid var(--fg);
}

.section-number {
  font-family: var(--font-mono);
  font-weight: 700;
  color: var(--accent);
  font-size: clamp(2rem, 5vw, 3.5rem);
  letter-spacing: 0;
}

.section-label {
  font-family: var(--font-display);
  font-weight: 900;
  text-transform: uppercase;
  font-size: clamp(1.5rem, 4vw, 3rem);
  letter-spacing: -0.01em;
}

/* ═══════════════ LINKS ═══════════════ */

a {
  color: var(--accent);
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 2px;
}
```

- [ ] **Step 2: Boot dev server**

```bash
npm start
```

Expected: Vite serves on :3001. Page will look broken (dossier components reference deleted classes) — this is **expected**. Stop server (Ctrl-C).

### Task 1.4: Commit Phase 1

- [ ] **Step 1: Commit**

```bash
git add tailwind.config.js index.html src/index.css
git commit -m "feat(tokens): brutalist design tokens + tailwind palette swap

- Drop era-* CSS variable system (~830 lines of dossier styling)
- New tokens: --bg #09090B, --fg #FAFAFA, --accent #A3E635
- Space Grotesk Black 900 display + JetBrains Mono fallback
- Hard 3px borders, 6px offset solid-color shadows, zero radius
- Marquee + brutalist card + pill + chip primitives

Page renders broken intentionally until Phase 2 ships new components."
```

---

## Phase 2: New components

**Checkpoint at end:** Seven new components exist under `src/components/`. A temporary `/preview` route renders all of them. Visual check against `mockups/LOCKED-direction.png` confirms typography, color, and shadow behavior.

### Task 2.1: `Marquee.jsx`

**Files:**
- Create: `src/components/Marquee.jsx`
- Create: `src/components/Marquee.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/Marquee.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Marquee from './Marquee';

describe('Marquee', () => {
  it('renders the same text twice for seamless loop', () => {
    render(<Marquee text="HELLO" />);
    const matches = screen.getAllByText('HELLO');
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('respects an empty text prop without crashing', () => {
    const { container } = render(<Marquee text="" />);
    expect(container.querySelector('.marquee')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npm run test -- Marquee
```

Expected: FAIL (`Marquee` not found).

- [ ] **Step 3: Implement**

```jsx
// src/components/Marquee.jsx
import React from 'react';

/**
 * Full-bleed accent strip with infinitely scrolling text.
 * CSS-only animation (see .marquee in src/index.css).
 * The text is duplicated so the loop is seamless;
 * the @keyframes translates -50%.
 */
export default function Marquee({ text, separator = '·', chevron = '▶▶' }) {
  const segment = `${text} ${separator} ${chevron} `;
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{segment.repeat(6)}</span>
        <span>{segment.repeat(6)}</span>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm run test -- Marquee
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/Marquee.jsx src/components/Marquee.test.jsx
git commit -m "feat(components): Marquee — full-bleed accent strip, infinite loop"
```

### Task 2.2: `BrutalistCard.jsx`

**Files:**
- Create: `src/components/BrutalistCard.jsx`
- Create: `src/components/BrutalistCard.test.jsx`

- [ ] **Step 1: Write the failing test**

```jsx
// src/components/BrutalistCard.test.jsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BrutalistCard from './BrutalistCard';

describe('BrutalistCard', () => {
  it('renders children inside the inner layer', () => {
    render(
      <BrutalistCard>
        <span>contents</span>
      </BrutalistCard>
    );
    const inner = screen.getByText('contents').closest('.bcard-inner');
    expect(inner).toBeInTheDocument();
  });

  it('renders a sibling shadow element for the hard offset', () => {
    const { container } = render(<BrutalistCard>x</BrutalistCard>);
    expect(container.querySelector('.bcard-shadow')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect failure**

```bash
npm run test -- BrutalistCard
```

Expected: FAIL.

- [ ] **Step 3: Implement**

```jsx
// src/components/BrutalistCard.jsx
import React from 'react';

/**
 * Bordered card with a hard solid-color offset rectangle behind it.
 * The shadow is a real positioned element, not a box-shadow filter — that's
 * the only way to get a true solid color (not rgba) at offset (--shadow-off).
 *
 * Pass `interactive` for a press-scale animation (used for nav/anchor cards).
 */
export default function BrutalistCard({ children, interactive = false, className = '', ...rest }) {
  const wrapClass = `bcard${interactive ? ' bcard-interactive' : ''} ${className}`.trim();
  return (
    <div className={wrapClass} {...rest}>
      <div className="bcard-shadow" aria-hidden="true" />
      <div className="bcard-inner">{children}</div>
    </div>
  );
}
```

- [ ] **Step 4: Run, expect pass**

```bash
npm run test -- BrutalistCard
```

Expected: 2 passed.

- [ ] **Step 5: Commit**

```bash
git add src/components/BrutalistCard.jsx src/components/BrutalistCard.test.jsx
git commit -m "feat(components): BrutalistCard — bordered card with hard offset shadow"
```

### Task 2.3: `PillBadge.jsx`

**Files:** Create: `src/components/PillBadge.jsx`

- [ ] **Step 1: Implement directly (trivial — no test)**

```jsx
// src/components/PillBadge.jsx
import React from 'react';

export default function PillBadge({ children, className = '' }) {
  return <span className={`pill ${className}`}>{children}</span>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/PillBadge.jsx
git commit -m "feat(components): PillBadge — accent pill for badges"
```

### Task 2.4: `RedactedBlock.jsx`

**Files:** Create: `src/components/RedactedBlock.jsx`

- [ ] **Step 1: Implement**

```jsx
// src/components/RedactedBlock.jsx
import React from 'react';

/**
 * Inline graphite block for redacted text — preserves the dossier wink
 * without committing to the full fiction.
 */
export default function RedactedBlock({ width = '3em' }) {
  return <span className="redacted" style={{ width }} aria-label="redacted" />;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/RedactedBlock.jsx
git commit -m "feat(components): RedactedBlock — inline graphite block for redactions"
```

### Task 2.5: `MicrocopyLabel.jsx`

**Files:** Create: `src/components/MicrocopyLabel.jsx`

- [ ] **Step 1: Implement**

```jsx
// src/components/MicrocopyLabel.jsx
import React from 'react';

export default function MicrocopyLabel({ children, className = '', as: Tag = 'span' }) {
  return <Tag className={`micro ${className}`}>{children}</Tag>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/MicrocopyLabel.jsx
git commit -m "feat(components): MicrocopyLabel — uppercase tracked mono microcopy"
```

### Task 2.6: `SectionHeader.jsx`

**Files:** Create: `src/components/SectionHeader.jsx`

- [ ] **Step 1: Implement**

```jsx
// src/components/SectionHeader.jsx
import React from 'react';

export default function SectionHeader({ number, label, id }) {
  return (
    <header className="section-header" id={id}>
      <span className="section-number">{number}</span>
      <h2 className="section-label">{label}</h2>
    </header>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/SectionHeader.jsx
git commit -m "feat(components): SectionHeader — numbered section title with anchor id"
```

### Task 2.7: `BrutalistChip.jsx`

**Files:** Create: `src/components/BrutalistChip.jsx`

- [ ] **Step 1: Implement**

```jsx
// src/components/BrutalistChip.jsx
import React from 'react';

export default function BrutalistChip({ children }) {
  return <span className="chip">{children}</span>;
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/BrutalistChip.jsx
git commit -m "feat(components): BrutalistChip — skill pill, mono caps, 2px border"
```

### Task 2.8: Temporary `/preview` route

**Files:**
- Create: `src/pages/Preview.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Create `Preview.jsx`**

```jsx
// src/pages/Preview.jsx
import React from 'react';
import Marquee from '../components/Marquee';
import BrutalistCard from '../components/BrutalistCard';
import PillBadge from '../components/PillBadge';
import RedactedBlock from '../components/RedactedBlock';
import MicrocopyLabel from '../components/MicrocopyLabel';
import SectionHeader from '../components/SectionHeader';
import BrutalistChip from '../components/BrutalistChip';

export default function Preview() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Marquee text="AVAILABLE · RABURN · AVAILABLE · RABURN" />
      <div style={{ padding: '32px' }}>
        <MicrocopyLabel as="div">LAST UPDATED: 2026-05-18</MicrocopyLabel>
        <h1 className="display display-name">MATTHEW{' '}RABURN</h1>
        <p className="display display-tagline">I FIX HIGH-MAINTENANCE SYSTEMS. ALL OF THEM.</p>

        <SectionHeader number="01" label="EXPERIENCE" id="experience" />
        <BrutalistCard><span>Job card preview</span></BrutalistCard>

        <SectionHeader number="02" label="SKILLS" id="skills" />
        <div>
          <BrutalistChip>PowerShell</BrutalistChip>
          <BrutalistChip>Python</BrutalistChip>
          <BrutalistChip>C·CURE</BrutalistChip>
        </div>

        <SectionHeader number="04" label="TRIVIA" id="trivia" />
        <BrutalistCard interactive>
          <PillBadge>UNPREDICTABLE</PillBadge>
          <p style={{ marginTop: '12px' }}>Sample trivia text with a <RedactedBlock width="4em" /> in it.</p>
        </BrutalistCard>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Wire `/preview` route in `App.jsx`**

In `src/App.jsx`, find the final `<Routes>` block:

```jsx
return (
  <Routes>
    <Route path="/" element={<ResumeHome />} />
    <Route path="/dashboard" element={<VinylDashboard />} />
  </Routes>
);
```

Add an import at top: `import Preview from './pages/Preview';`

Add a route inside `<Routes>`:

```jsx
<Route path="/preview" element={<Preview />} />
```

- [ ] **Step 3: Boot dev server and visual-check**

```bash
npm start
```

Navigate to `http://localhost:3001/preview`. Verify:
- Acid-lime marquee scrolls at top
- Display name MATTHEW RABURN is huge, uppercase, off-white on near-black
- Tagline below at smaller display size
- Section headers show "01 EXPERIENCE", "02 SKILLS", "04 TRIVIA" with lime numbers
- BrutalistChip pills have 2px white border, mono caps
- BrutalistCard has 3px lime border with 6px lime offset shadow visible behind
- PillBadge "UNPREDICTABLE" lime with black text
- RedactedBlock graphite rectangle

Stop server.

- [ ] **Step 4: Run tests to confirm Phase 2 components still pass**

```bash
npm run test
```

Expected: all green.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Preview.jsx src/App.jsx
git commit -m "feat(preview): /preview route to visual-test brutalist components

Temporary scaffold; deleted in Phase 5 cleanup."
```

---

## Phase 3: Hero rewrite

**Checkpoint at end:** `ResumeHome` in `src/App.jsx` renders the hero from `mockups/LOCKED-direction.png` — marquee + huge name + tagline + microcopy + UNPREDICTABLE preview card. Era-aware components still exist in the file but are no longer rendered.

### Task 3.1: Strip era machinery from `App.jsx`

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Delete era constants and state**

Open `src/App.jsx`. Remove:
- The `ERA_KEYS` constant
- The `HiddenGlitchTrigger` import
- The `glitchTransition` keyframes object
- `framer-motion` imports (`motion`, `AnimatePresence`) if no longer used after this phase
- The `useState` for `currentEra` and `transitionKey`
- The `handleCycleEra` callback
- The entire `<AnimatePresence mode="wait">` wrapper and its `<motion.div>` child
- The `<HiddenGlitchTrigger>` render
- The `<div className="era-noise-overlay">` render

**Do not yet delete** the inline `Redacted` / `ClassifiedStamp` / `CoffeeStain` / `DeskClutter` / `FolderTab` / `JobDetails` components or the `useState` for `activeJob` — Phase 4 still references some patterns. They'll be deleted in Phase 5.

- [ ] **Step 2: Replace `ResumeHome` return JSX with a minimal hero shell**

Inside `ResumeHome`, replace the entire `return (…)` block with:

```jsx
return (
  <div className="min-h-screen">
    <Marquee text="AVAILABLE · RABURN · AVAILABLE · RABURN" />
    <main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
      {/* hero comes in Task 3.2 */}
      <p>HERO PLACEHOLDER</p>
    </main>
  </div>
);
```

Add the import at top:

```jsx
import Marquee from './components/Marquee';
```

- [ ] **Step 3: Verify dev server still boots**

```bash
npm start
```

Navigate to `/`. Expect: lime marquee + "HERO PLACEHOLDER" text. Stop server.

### Task 3.2: Build hero composition

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add imports**

At top, with the other component imports:

```jsx
import MicrocopyLabel from './components/MicrocopyLabel';
import BrutalistCard from './components/BrutalistCard';
import PillBadge from './components/PillBadge';
import RedactedBlock from './components/RedactedBlock';
```

- [ ] **Step 2: Replace the `<main>` body**

```jsx
<main className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
  <div className="flex justify-between items-baseline mb-8">
    <MicrocopyLabel as="div">LAST UPDATED: 2026-05-18</MicrocopyLabel>
    <MicrocopyLabel as="a" href="#experience">MENU</MicrocopyLabel>
  </div>

  <h1 className="display display-name mb-6">
    MATTHEW<br />RABURN
  </h1>

  <p className="display display-tagline mb-12">
    I FIX HIGH-MAINTENANCE SYSTEMS. ALL OF THEM.
  </p>

  <div className="flex flex-wrap items-start justify-between gap-8 mb-12">
    <a href="#trivia" className="no-underline">
      <BrutalistCard interactive>
        <MicrocopyLabel as="div" className="mb-2">04  TRIVIA</MicrocopyLabel>
        <PillBadge>UNPREDICTABLE</PillBadge>
      </BrutalistCard>
    </a>

    <MicrocopyLabel as="div">
      CLIENTS: <RedactedBlock width="3em" /> <RedactedBlock width="4em" />
    </MicrocopyLabel>
  </div>

  <MicrocopyLabel as="div" className="mt-12">LOCATION: CYBERSPACE</MicrocopyLabel>
</main>
```

- [ ] **Step 3: Visual-verify against mockup**

```bash
npm start
```

Open `http://localhost:3001/`. Compare side-by-side with `mockups/LOCKED-direction.png`. Confirm:
- Marquee at top, lime BG, black text scrolling
- LAST UPDATED top-left, MENU top-right, both 12px mono uppercase tracked
- MATTHEW RABURN huge, two lines, off-white
- Tagline below at ~half size, still display-cap
- TRIVIA card visible with UNPREDICTABLE pill
- CLIENTS row with two redacted blocks on the right
- LOCATION: CYBERSPACE bottom

Mockup deviations are OK (the model rendered things slightly differently); the spec governs.

Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat(hero): brutalist hero — marquee, name, tagline, preview card

Strips era engine machinery (ERA_KEYS, glitchTransition, era-aware state).
Inline era-aware sub-components (Redacted/CoffeeStain/etc.) remain in file
but are no longer rendered; deleted in Phase 5."
```

---

## Phase 4: Below-the-fold sections

**Checkpoint at end:** All six sections render from `resumeData.js` with standardized labels. `grep -nE '^const (Redacted|CoffeeStain|DeskClutter|ClassifiedStamp|FolderTab|JobDetails)' src/App.jsx` may still find these (Phase 5 cleans up), but **none** are rendered in the returned JSX.

### Task 4.1: Section 01 EXPERIENCE

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add `SectionHeader` import and section block**

Import:

```jsx
import SectionHeader from './components/SectionHeader';
```

Below the hero `</main>` opening block (but still inside `<main>`), add:

```jsx
<section>
  <SectionHeader number="01" label="EXPERIENCE" id="experience" />
  <div className="space-y-6">
    {resumeData.experience.map((job) => (
      <BrutalistCard key={job.id} className="w-full block">
        <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
          <h3 className="display text-2xl">{job.company}</h3>
          <MicrocopyLabel>{job.period} · {job.location}</MicrocopyLabel>
        </div>
        <MicrocopyLabel as="div" className="mb-3">{job.title}</MicrocopyLabel>
        <ul className="space-y-2 list-none p-0 m-0">
          {job.achievements.map((a, i) => (
            <li key={i} className="font-mono text-sm leading-relaxed text-fg">
              <span className="text-accent mr-2">▸</span>{a}
            </li>
          ))}
        </ul>
      </BrutalistCard>
    ))}
  </div>
</section>
```

Note: `BrutalistCard` currently uses `display: inline-block`. The `w-full block` Tailwind utility overrides that for the full-width experience cards.

- [ ] **Step 2: Adjust `BrutalistCard` to allow `block` override**

In `src/components/BrutalistCard.jsx`, change the wrapping div's class to use `bcard` only — the `display: inline-block` will be Tailwind-overridable from class. Already done: the inline-block lives in CSS; passing `className="w-full block"` from JSX overrides it. **No file change required.** Confirm by visual check next step.

- [ ] **Step 3: Visual verify**

```bash
npm start
```

Navigate to `/#experience`. Three job cards visible (Johnson Controls, Pall, Aavid), each with company + period + location row, title, and bulleted achievements with lime ▸ markers. Hard offset shadow visible. Stop server.

- [ ] **Step 4: Commit**

```bash
git add src/App.jsx
git commit -m "feat(sections): 01 EXPERIENCE — job cards from resumeData.experience"
```

### Task 4.2: Section 02 SKILLS

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add import**

```jsx
import BrutalistChip from './components/BrutalistChip';
```

- [ ] **Step 2: Add section below EXPERIENCE**

```jsx
<section>
  <SectionHeader number="02" label="SKILLS" id="skills" />
  <div className="flex flex-wrap gap-2">
    {resumeData.operationalTradecraft.map((s, i) => (
      <BrutalistChip key={i}>{s}</BrutalistChip>
    ))}
  </div>
</section>
```

- [ ] **Step 3: Visual verify + commit**

```bash
npm start
# verify /#skills shows row of chips
```

```bash
git add src/App.jsx
git commit -m "feat(sections): 02 SKILLS — brutalist chips from operationalTradecraft"
```

### Task 4.3: Section 03 TESTIMONIALS

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add section**

```jsx
<section>
  <SectionHeader number="03" label="TESTIMONIALS" id="testimonials" />
  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    {resumeData.fieldReports.map((report, i) => (
      <BrutalistCard key={i} className="w-full block">
        <blockquote className="display text-lg leading-tight mb-4">
          "{report.quote}"
        </blockquote>
        <cite className="micro not-italic block">— {report.author}</cite>
      </BrutalistCard>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Visual verify + commit**

```bash
npm start
# verify /#testimonials shows 2-column grid of quote cards
```

```bash
git add src/App.jsx
git commit -m "feat(sections): 03 TESTIMONIALS — quote cards from fieldReports"
```

### Task 4.4: Section 04 TRIVIA

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add section**

```jsx
<section>
  <SectionHeader number="04" label="TRIVIA" id="trivia" />
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {resumeData.anomalousCapabilities.map((cap, i) => (
      <BrutalistCard key={i} className="w-full block">
        <PillBadge>FACT {String(i + 1).padStart(2, '0')}</PillBadge>
        <p className="font-mono text-sm leading-relaxed mt-3 mb-0">{cap}</p>
      </BrutalistCard>
    ))}
  </div>
</section>
```

- [ ] **Step 2: Visual verify + commit**

```bash
npm start
# verify /#trivia shows cards with lime pill + monospaced fact text
```

```bash
git add src/App.jsx
git commit -m "feat(sections): 04 TRIVIA — fact cards from anomalousCapabilities"
```

### Task 4.5: Section 05 TARGET ROLES

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add section**

```jsx
<section>
  <SectionHeader number="05" label="TARGET ROLES" id="target-roles" />
  <ol className="font-mono text-base space-y-2 list-none p-0">
    {resumeData.targetRoles.map((role, i) => (
      <li key={i}>
        <span className="text-muted-fg mr-3">[{String(i + 1).padStart(2, '0')}]</span>
        {role}
      </li>
    ))}
  </ol>
</section>
```

- [ ] **Step 2: Visual verify + commit**

```bash
npm start
```

```bash
git add src/App.jsx
git commit -m "feat(sections): 05 TARGET ROLES — mono numbered list"
```

### Task 4.6: Section 06 INTERESTS

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add section**

```jsx
<section>
  <SectionHeader number="06" label="INTERESTS" id="interests" />
  <ul className="space-y-3 list-none p-0">
    {resumeData.civilianCover.map((item, i) => (
      <li key={i} className="flex flex-wrap items-center gap-3 font-mono text-sm">
        <span className="text-fg font-bold uppercase">{item.name}</span>
        <span className="text-muted-fg">{item.category}</span>
        <span className="text-accent">·</span>
        <span className="text-accent uppercase tracking-widest">{item.status}</span>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 2: Visual verify + commit**

```bash
npm start
```

```bash
git add src/App.jsx
git commit -m "feat(sections): 06 INTERESTS — civilian cover row list"
```

### Task 4.7: Footer

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Add `<footer>` after the last section, before `</main>` closes**

```jsx
<footer className="mt-16 pt-6 border-t-3 border-fg">
  <div className="flex flex-wrap justify-between items-baseline gap-4 font-mono text-xs uppercase tracking-widest">
    <span>© 2026 RABURN, M.</span>
    <div className="flex gap-4">
      <a href={`mailto:${resumeData.personal.contact.email}`}>{resumeData.personal.contact.email}</a>
      <a href={`https://${resumeData.personal.contact.linkedin}`} target="_blank" rel="noopener noreferrer">LINKEDIN</a>
      <a href={resumePDF} download="Matthew_Raburn_Resume.pdf">DOWNLOAD .PDF</a>
    </div>
  </div>
</footer>
```

(`resumePDF` is already imported at the top of `App.jsx` from the original code.)

- [ ] **Step 2: Visual verify + commit**

```bash
npm start
```

```bash
git add src/App.jsx
git commit -m "feat(footer): brutalist single-line footer with email/linkedin/pdf"
```

---

## Phase 5: Delete the dead

**Checkpoint at end:** All deprecated components and files removed. `grep -r 'data-era' src/` returns 0 matches. `npm run build` succeeds.

### Task 5.1: Strip era-aware inline components from `App.jsx`

**Files:** Modify: `src/App.jsx`

- [ ] **Step 1: Delete from `App.jsx`:**

- The entire `Redacted` component definition
- The entire `ClassifiedStamp` component definition
- The entire `SectionHeader` *inline* definition (was for the dossier; the new one is imported from `./components/SectionHeader`)
- The entire `FolderTab` component definition
- The entire `JobDetails` component definition
- The entire `CoffeeStain` component definition
- The entire `DeskClutter` component definition
- The `useState` for `activeJob` (no longer needed)
- The `resumePDF` import IF moved to footer-only — wait, footer uses it, keep it.

After this pass, `ResumeHome` should be only the hero + 6 sections + footer, plus a small set of imports.

- [ ] **Step 2: Verify**

```bash
npm run build
```

Expected: builds clean.

- [ ] **Step 3: Commit**

```bash
git add src/App.jsx
git commit -m "chore(cleanup): remove era-aware inline components from App.jsx"
```

### Task 5.2: Delete obsolete files

- [ ] **Step 1: Delete files**

```bash
rm src/components/HiddenGlitchTrigger.jsx
rm src/components/BootSequence.jsx
rm src/JumpingCat.jsx
rm src/RetroKnob.jsx
rm src/SkillsStatus.jsx
rm src/LogTicker.jsx
```

- [ ] **Step 2: Check `logo.svg` usage**

```bash
grep -r 'logo.svg' src/ index.html
```

If no matches: `rm src/logo.svg`. If matches found: leave it.

- [ ] **Step 3: Verify build**

```bash
npm run build
```

If any failure complains about a missing import from one of the deleted files: track it down (likely a stale `routes.jsx` or `App.css` reference) and fix.

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "chore(cleanup): delete dossier-era components and unused files"
```

### Task 5.3: Delete `/preview` route

**Files:**
- Delete: `src/pages/Preview.jsx`
- Modify: `src/App.jsx`

- [ ] **Step 1: Remove route + import**

In `src/App.jsx`, remove the `import Preview from './pages/Preview';` line and the `<Route path="/preview" element={<Preview />} />` line.

- [ ] **Step 2: Delete file**

```bash
rm src/pages/Preview.jsx
```

- [ ] **Step 3: Verify build**

```bash
npm run build
```

- [ ] **Step 4: Commit**

```bash
git add -u
git commit -m "chore(cleanup): remove temporary /preview route"
```

### Task 5.4: Acceptance-criteria invariant check

- [ ] **Step 1: Verify no `data-era` left**

```bash
grep -rn 'data-era' src/
```

Expected: empty output (exit code 1).

- [ ] **Step 2: Verify no `era-*` classes**

```bash
grep -rnE 'era-(card|paper|btn|skill-chip|tab|inset|noise|text|page-wrapper|body|photo|primary|font|radius|shadow|border|surface|bg)' src/
```

Expected: empty.

- [ ] **Step 3: Verify deleted files are gone**

```bash
for f in HiddenGlitchTrigger.jsx BootSequence.jsx JumpingCat.jsx RetroKnob.jsx SkillsStatus.jsx LogTicker.jsx; do
  if find src -name "$f" | grep -q .; then echo "STILL PRESENT: $f"; fi
done
```

Expected: no output.

---

## Phase 6: A11y + responsive polish

**Checkpoint at end:** `prefers-reduced-motion: reduce` halts the marquee. Keyboard tab order is sensible. Lighthouse contrast passes. Tested at 375 / 768 / 1024 / 1440 widths.

### Task 6.1: Test reduced motion

**Files:**
- Create: `src/components/Marquee.reducedmotion.test.jsx`

- [ ] **Step 1: Add test**

```jsx
// src/components/Marquee.reducedmotion.test.jsx
import { render } from '@testing-library/react';
import { describe, it, expect, beforeAll } from 'vitest';
import Marquee from './Marquee';

describe('Marquee + prefers-reduced-motion', () => {
  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: (query) => ({
        matches: query.includes('reduce'),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  });

  it('still renders marquee element when reduced-motion is on', () => {
    const { container } = render(<Marquee text="X" />);
    expect(container.querySelector('.marquee')).toBeInTheDocument();
  });
});
```

This is a weak test because the actual animation halting is via CSS (`@media (prefers-reduced-motion: reduce)` in `src/index.css`). The test confirms the component still renders sanely; a true visual check happens in the next step.

- [ ] **Step 2: Manual check**

Boot dev server. In Chrome DevTools → Rendering panel → "Emulate CSS media feature `prefers-reduced-motion`" → reduce. Verify marquee text stops scrolling.

```bash
npm start
```

Stop server.

- [ ] **Step 3: Commit**

```bash
git add src/components/Marquee.reducedmotion.test.jsx
git commit -m "test(a11y): marquee renders under prefers-reduced-motion"
```

### Task 6.2: Keyboard navigation

- [ ] **Step 1: Manual test**

```bash
npm start
```

On `/`: press Tab repeatedly from page load. Verify focus visits in order:
1. MENU link (anchor to #experience)
2. TRIVIA card link (anchor to #trivia)
3. Each LinkedIn / email / PDF link in the footer
4. (No other interactive elements)

Each focused element shows a lime 2px outline. If not, the `:focus-visible` rule in `src/index.css` isn't applying — investigate.

Stop server.

### Task 6.3: Responsive sweep

- [ ] **Step 1: Manual test at four widths**

```bash
npm start
```

DevTools → Toggle device toolbar. Set viewport to each in turn:
- 375px (iPhone SE): Hero name wraps, marquee runs, sections stack, chips wrap.
- 768px (iPad portrait): Two-column TESTIMONIALS / TRIVIA grids appear.
- 1024px (small laptop): Padding expands, max-w-6xl kicks in.
- 1440px (desktop): Same as 1024 but with more whitespace; content remains centered.

Note any layout breaks; fix with Tailwind responsive utilities in `App.jsx`. If a fix is non-trivial (>5 min), add a follow-up commit and note in §11 of the spec.

Stop server.

- [ ] **Step 2: Commit any responsive fixes**

```bash
git add -u
git commit -m "fix(responsive): adjustments at 375/768/1024/1440 breakpoints"
```

(Skip the commit if no fixes were needed.)

---

## Phase 7: Vinyl Dashboard retheme

**Checkpoint at end:** `/dashboard` renders with brutalist chrome — marquee at top, lime accent on Recharts data, mono axis labels, no shadows on charts, BrutalistCard wrapping the DiscogsCollectionPanel. **Scope guard:** if this phase exceeds half a day, abort, document remaining work in §11, and ship without it.

### Task 7.1: Rewrite Recharts theme

**Files:** Modify: `src/charts/theme.jsx`

- [ ] **Step 1: Read current contents**

```bash
cat src/charts/theme.jsx
```

(2.3KB file — note what it exports.)

- [ ] **Step 2: Replace with brutalist palette**

```jsx
// src/charts/theme.jsx
export const palette = {
  accent:   '#A3E635',
  fg:       '#FAFAFA',
  mutedFg:  '#A1A1AA',
  muted:    '#3F3F46',
  bg:       '#09090B',
};

export const chartSeries = [
  palette.accent,
  palette.fg,
  palette.mutedFg,
];

export const axisStyle = {
  fontFamily: 'Departure Mono, JetBrains Mono, ui-monospace, monospace',
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  fill: palette.mutedFg,
};

export const gridStyle = {
  stroke: palette.muted,
  strokeWidth: 1,
};

export const tooltipStyle = {
  contentStyle: {
    background: palette.bg,
    border: `2px solid ${palette.accent}`,
    borderRadius: 0,
    fontFamily: 'Departure Mono, JetBrains Mono, ui-monospace, monospace',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: '0.1em',
    color: palette.fg,
  },
  labelStyle: { color: palette.accent },
};
```

- [ ] **Step 3: Verify file imports**

```bash
grep -rn "from.*charts/theme" src/
```

Update any consumers to use the new export names. If old exports are referenced (e.g., `retroAxis`), rename references in the consumer to `axisStyle` etc.

- [ ] **Step 4: Commit**

```bash
git add src/charts/theme.jsx
git commit -m "feat(dashboard): Recharts theme — brutalist lime palette + mono axis"
```

### Task 7.2: Retheme `VinylDashboard.jsx`

**Files:** Modify: `src/pages/VinylDashboard.jsx`

- [ ] **Step 1: Read current file structure**

```bash
wc -l src/pages/VinylDashboard.jsx
head -40 src/pages/VinylDashboard.jsx
```

(~29KB / 750+ lines — most of it is data wrangling that's fine. Only chrome and chart props need touching.)

- [ ] **Step 2: Apply brutalist chrome**

Wrap the page with the same `<Marquee>` + `<MicrocopyLabel>` pattern as the home page. Replace any inline shadow / blur / rounded chrome with `BrutalistCard`. Replace any era-themed class names (e.g., `era-text`, `era-paper`) with vanilla Tailwind classes or CSS-variable refs.

Concrete replacements (apply each match):

```bash
# Inspect what classes need to go
grep -nE 'era-|retro' src/pages/VinylDashboard.jsx | head
```

For each match, replace with the appropriate brutalist equivalent (e.g., `era-paper` → remove, `era-text` → `text-fg`, `font-display` → `font-display`).

- [ ] **Step 3: Apply theme to Recharts**

For each chart component (`<LineChart>`, `<BarChart>`, etc.), add:

```jsx
import { chartSeries, axisStyle, gridStyle, tooltipStyle } from '../charts/theme';

// inside a chart
<XAxis tick={axisStyle} stroke={palette.mutedFg} />
<YAxis tick={axisStyle} stroke={palette.mutedFg} />
<CartesianGrid {...gridStyle} strokeDasharray="0" />
<Tooltip {...tooltipStyle} />
<Line dataKey="x" stroke={chartSeries[0]} strokeWidth={2} dot={false} />
```

- [ ] **Step 4: Visual verify**

```bash
npm start
```

Navigate to `/dashboard`. Verify marquee renders, mono axes, lime data lines, no rounded chart chrome.

- [ ] **Step 5: Commit**

```bash
git add src/pages/VinylDashboard.jsx
git commit -m "feat(dashboard): retheme VinylDashboard chrome + chart props to brutalist"
```

### Task 7.3: Retheme `DiscogsCollectionPanel.jsx`

**Files:** Modify: `src/components/DiscogsCollectionPanel.jsx`

- [ ] **Step 1: Replace era classes**

Same approach as 7.2: grep for `era-*` and `retro-*` classes, replace each with brutalist equivalents. Wrap the panel container in `<BrutalistCard className="w-full block">`.

- [ ] **Step 2: Replace BootSequence reference (if any)**

```bash
grep -n 'BootSequence' src/components/DiscogsCollectionPanel.jsx
```

If present: replace `<BootSequence />` with `<MicrocopyLabel>CONNECTING…</MicrocopyLabel>`.

- [ ] **Step 3: Commit**

```bash
git add src/components/DiscogsCollectionPanel.jsx
git commit -m "feat(dashboard): retheme DiscogsCollectionPanel — brutalist card + mono"
```

### Task 7.4: Scope-guard check

- [ ] **Step 1: Honest time check**

If Phase 7 has taken more than four hours of work, **stop here**. The spec §8 explicitly allows deferral. In that case:

- Edit `docs/superpowers/specs/2026-05-18-brutalist-lime-refresh-design.md` §11 to add: `- Vinyl Dashboard retheme — partial; remaining work tracked in followups/`
- Commit: `git commit -am "docs: defer remaining vinyl dashboard polish to phase 2"`
- Proceed to Phase 8.

If under budget, continue.

---

## Phase 8: Documentation

**Checkpoint at end:** `design-system/raburn-portfolio/MASTER.md` reflects what was actually built. `README.md` updated to drop dossier framing. `CLAUDE.md` session log gets a build-complete entry.

### Task 8.1: Rewrite `design-system/raburn-portfolio/MASTER.md`

**Files:** Modify: `design-system/raburn-portfolio/MASTER.md`

- [ ] **Step 1: Replace contents wholesale**

```markdown
# Raburn Portfolio — Design System (Source of Truth)

**Built:** 2026-05-18
**Direction:** Kinetic Brutalist + Acid Lime
**Reference mockup:** `mockups/LOCKED-direction.png`
**Spec:** `docs/superpowers/specs/2026-05-18-brutalist-lime-refresh-design.md`

---

## Tokens

| Role | Hex | CSS var | Tailwind class |
|--|--|--|--|
| Background | `#09090B` | `--bg` | `bg-bg` |
| Foreground | `#FAFAFA` | `--fg` | `text-fg` |
| Accent | `#A3E635` | `--accent` | `text-accent` / `bg-accent` |
| Accent ink | `#000000` | `--accent-ink` | `text-accent-ink` |
| Muted | `#3F3F46` | `--muted` | `bg-muted` |
| Muted FG | `#A1A1AA` | `--muted-fg` | `text-muted-fg` |

## Typography

- **Display:** Space Grotesk Black 900, uppercase, `letter-spacing: -0.01em`, `line-height: 0.9`. Used for hero name (clamp(3.5rem, 12vw, 9rem)), tagline (clamp(1.5rem, 4vw, 3rem)), section labels.
- **Mono microcopy:** Departure Mono (preferred) / JetBrains Mono (Google Fonts fallback). 12px uppercase, `letter-spacing: 0.15em`, weight 500. Used for LAST UPDATED / LOCATION / CLIENTS / period / location labels / chips / footer.

## Spacing scale

`--space-1` = 4px through `--space-8` = 96px. Standard Tailwind spacing is also available.

## Borders + shadows

- All borders: `--border-w` = 3px solid
- All shadows: `--shadow-off` = 6px hard-offset solid-color rectangles (NOT `box-shadow`)
- All radii: `--radius` = 0 everywhere

## Motion

- Marquee: `30s linear infinite` translateX(0 → -50%)
- Card press feedback: scale to `0.97` over 100ms
- Both halted under `@media (prefers-reduced-motion: reduce)` via globals in `src/index.css`

## Components

| Component | File |
|--|--|
| `<Marquee>` | `src/components/Marquee.jsx` |
| `<BrutalistCard>` | `src/components/BrutalistCard.jsx` |
| `<PillBadge>` | `src/components/PillBadge.jsx` |
| `<RedactedBlock>` | `src/components/RedactedBlock.jsx` |
| `<MicrocopyLabel>` | `src/components/MicrocopyLabel.jsx` |
| `<SectionHeader>` | `src/components/SectionHeader.jsx` |
| `<BrutalistChip>` | `src/components/BrutalistChip.jsx` |

## Page structure

Single route `/` renders the hero (marquee + name + tagline + TRIVIA preview card + microcopy) followed by six sections rendered from `src/data/resumeData.js`:

| # | Anchor | UI Label | Data field |
|--|--|--|--|
| 01 | `#experience` | EXPERIENCE | `experience` |
| 02 | `#skills` | SKILLS | `operationalTradecraft` |
| 03 | `#testimonials` | TESTIMONIALS | `fieldReports` |
| 04 | `#trivia` | TRIVIA | `anomalousCapabilities` |
| 05 | `#target-roles` | TARGET ROLES | `targetRoles` |
| 06 | `#interests` | INTERESTS | `civilianCover` |

`/dashboard` renders the brutalist-themed VinylDashboard (Recharts theme in `src/charts/theme.jsx`).
```

- [ ] **Step 2: Commit**

```bash
git add design-system/raburn-portfolio/MASTER.md
git commit -m "docs(design-system): rewrite MASTER.md to reflect built brutalist system"
```

### Task 8.2: Update README

**Files:** Modify: `README.md`

- [ ] **Step 1: Replace contents**

```markdown
# Matthew Raburn — Portfolio

A personal portfolio site for Matthew Raburn (IT Professional · Enterprise Reliability · Tech Leadership). Single-page React app in a Kinetic Brutalist design language with a paired analytics route powered by Discogs data.

## Stack

- React 19 + Vite 7
- Tailwind 3
- react-router-dom 7
- Recharts 3
- framer-motion 12 (motion respects `prefers-reduced-motion`)
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
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs(readme): rewrite for brutalist portfolio (drop dossier framing)"
```

### Task 8.3: Update repo `CLAUDE.md`

**Files:** Modify: `CLAUDE.md`

- [ ] **Step 1: Append session-log entry**

In `CLAUDE.md`, in the `## Session log` section, add a new bullet at the top of the list:

```markdown
- **2026-05-18 (build complete)** — Kinetic Brutalist + Acid Lime refresh shipped on branch `kinetic-brutalist-refresh`. Deleted the era engine (~830 lines of dossier CSS, 6 era-aware components, `data-era` attribute). New: 7 brutalist components, single-theme tokens (12 CSS vars), Vitest infrastructure. Sections relabeled to standardized resume voice (EXPERIENCE / SKILLS / TESTIMONIALS / TRIVIA / TARGET ROLES / INTERESTS) — data unchanged in `resumeData.js`. `/dashboard` rethemed (see §8 scope guard for partial-completion possibility). Spec: `docs/superpowers/specs/2026-05-18-brutalist-lime-refresh-design.md`. Plan: `docs/superpowers/plans/2026-05-18-brutalist-lime-refresh.md`.
```

Update the `## Active iteration` section by replacing it with:

```markdown
## Active iteration

None — Kinetic Brutalist + Acid Lime refresh complete. Awaiting merge of PR for branch `kinetic-brutalist-refresh`. Phase-2 follow-ups (any vinyl dashboard work deferred via §8 scope guard; PDF rebrand to match site; `README_CHAT_HELP.txt` cleanup) are open if/when prioritized.
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs(claude-md): session log entry + clear active iteration"
```

---

## Phase 9: QA + ship

**Checkpoint at end:** Tests pass. Build succeeds. PR opened with mockup screenshot, summary, and test plan.

### Task 9.1: Full test pass

- [ ] **Step 1: Run all tests**

```bash
npm run test
```

Expected: all green.

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: build succeeds. Note bundle size — should be smaller than pre-refresh (CSS shrank from ~30KB to ~5KB).

- [ ] **Step 3: Run preview**

```bash
npm run preview
```

Open the previewed URL. Click through `/` and `/dashboard`. Confirm both render correctly from the production bundle.

Stop preview.

### Task 9.2: Final acceptance-criteria sweep

Re-run each criterion from spec §13:

- [ ] **AC1:** `/` matches `mockups/LOCKED-direction.png` ±10%
- [ ] **AC2:** `grep -rn 'data-era' src/` returns 0 matches
- [ ] **AC3:** Deleted files are gone (`find src -name HiddenGlitchTrigger.jsx -o -name BootSequence.jsx -o -name JumpingCat.jsx -o -name RetroKnob.jsx -o -name SkillsStatus.jsx -o -name LogTicker.jsx` returns empty)
- [ ] **AC4:** All 6 sections render with content sourced from `resumeData.js`
- [ ] **AC5:** `/dashboard` renders and is themed (with §8 scope guard caveat acknowledged)
- [ ] **AC6:** `prefers-reduced-motion: reduce` halts the marquee (manual DevTools check)
- [ ] **AC7:** Keyboard Tab traversal with visible lime focus rings
- [ ] **AC8:** `npm run build` succeeds

### Task 9.3: Push branch + open PR

- [ ] **Step 1: Push**

```bash
git push -u origin kinetic-brutalist-refresh
```

- [ ] **Step 2: Open PR with mockup**

```bash
gh pr create --title "Kinetic Brutalist + Acid Lime refresh" --body "$(cat <<'EOF'
## Summary

- Replaces the classified-dossier site (with its 5-era cycling engine) with a single-theme Kinetic Brutalist portfolio in Acid Lime
- Same resume content (`resumeData.js` unchanged), new standardized section labels (EXPERIENCE / SKILLS / TESTIMONIALS / TRIVIA / TARGET ROLES / INTERESTS)
- New design system: 7 brutalist components + 12 CSS-variable tokens; `data-era` attribute and era-aware sub-components removed
- `/dashboard` rethemed to match (see spec §8 scope guard for deferred-polish notes if applicable)

Reference mockup: `mockups/LOCKED-direction.png`
Spec: `docs/superpowers/specs/2026-05-18-brutalist-lime-refresh-design.md`
Plan: `docs/superpowers/plans/2026-05-18-brutalist-lime-refresh.md`

## Test plan

- [ ] Netlify branch deploy renders `/` and `/dashboard`
- [ ] `npm run test` green locally
- [ ] `npm run build` clean
- [ ] Manual responsive sweep at 375 / 768 / 1024 / 1440 px
- [ ] DevTools `prefers-reduced-motion: reduce` halts the marquee
- [ ] Tab navigation shows visible lime focus rings
- [ ] PDF download from footer works

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

Return the PR URL to the operator.

---

## Phase summaries (for status reporting)

| Phase | Goal | Deliverable |
|--|--|--|
| 0 | Infrastructure | Branch + Vitest |
| 1 | Tokens + Tailwind | `index.css` rewritten, `tailwind.config.js` swapped |
| 2 | Components | 7 brutalist components + `/preview` scaffold |
| 3 | Hero | Mockup-matching home hero |
| 4 | Sections | 6 below-the-fold sections + footer |
| 5 | Cleanup | Era engine deleted, `/preview` removed |
| 6 | A11y + responsive | Reduced-motion, keyboard, breakpoint sweep |
| 7 | Dashboard | `/dashboard` rethemed (scope-guarded) |
| 8 | Docs | MASTER.md + README + CLAUDE.md |
| 9 | Ship | PR with mockup |

---

## Self-review notes

Spec coverage check:
- §3 locked direction → Phase 1 tokens
- §4 design tokens → Phase 1 tokens (1:1)
- §5 component inventory → Phase 2 (new) + Phase 5 (deletes)
- §6 hero layout → Phase 3
- §7 below-fold sections → Phase 4
- §8 dashboard retheme + scope guard → Phase 7
- §9 file change summary → Phases 1–5 + 7
- §10 implementation flow → mapped to phases 0–9
- §11 out-of-scope → Phase 8.3 active iteration note
- §12 risks → mitigated inline (Departure Mono fallback in Phase 1; scope guard in Phase 7; mockup-deviation noted in Phase 3 visual-check; mobile clamp() in Phase 1)
- §13 acceptance criteria → Phase 9.2 (1:1)

Placeholder scan: none — every step has either a code block or an exact command + expected output.

Type consistency: token names, CSS-class names, and component imports verified consistent across phases (e.g., `BrutalistCard` import path is `'./components/BrutalistCard'` in every consumer; CSS class `bcard` matches in `BrutalistCard.jsx` and `index.css`).
