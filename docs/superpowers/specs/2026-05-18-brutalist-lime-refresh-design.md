# raburnresume — Kinetic Brutalist + Acid Lime refresh

**Date:** 2026-05-18
**Status:** Design locked, awaiting operator review of this spec.
**Reference mockup:** `mockups/LOCKED-direction.png` (rendered via Gemini 3 Pro Image @ 2K through the `belt` CLI; source prompt in `mockups/C1a-lime.json`).

---

## 1. Goal

Replace the existing "classified dossier with temporal era cycling" React 19/Vite site with a single-theme **Kinetic Brutalist** portfolio in the **Acid Lime** palette. The entire era engine, dossier fiction, and era-aware sub-components are removed; the resume content survives the rewrite but with standardized (non-dossier-themed) section labels.

## 2. Non-goals

- Not a refactor of the existing dossier code. The era engine is deleted, not improved.
- Not a copy rewrite of the underlying resume facts (jobs, dates, locations, achievements stay verbatim from `src/data/resumeData.js`). Only the genre wrapper around those facts changes.
- Not a stack change. Still React 19 + Vite 7 + Tailwind 3 + react-router-dom 7 + Recharts 3 + framer-motion 12 + Netlify Edge Functions. No new dependencies.
- Not a public marketing redesign — this is a personal portfolio, no funnel/CTA optimization required.

## 3. Locked direction (one paragraph)

Single theme applied globally. Background `#09090B` near-black. One accent color: acid lime `#A3E635`, used strictly — on the top marquee strip, on borders/offset-shadows, on a small set of pill badges. No other chromatic accents. All text off-white `#FAFAFA` (lime only when explicitly an accent element). Display typography in Space Grotesk Black 900, screaming uppercase, tight letter-spacing -1, line-height 0.9. Microcopy in Departure Mono (fallback: JetBrains Mono). Zero border-radius anywhere; hard 3-px solid borders; 6-px solid-color hard-offset shadows (separately positioned rectangles, never `box-shadow` with blur). Infinite-linear marquee at top. Scale-on-press 0.97 on interactive cards. Respects `prefers-reduced-motion`.

## 4. Design tokens

To live in `src/index.css` as CSS custom properties (no `[data-era="…"]` blocks):

```css
:root {
  --bg:           #09090B;
  --fg:           #FAFAFA;
  --accent:       #A3E635;
  --accent-ink:   #000000;       /* text on accent backgrounds */
  --muted:        #3F3F46;       /* redacted blocks, secondary borders */
  --muted-fg:     #A1A1AA;       /* secondary text */

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
  --shadow-off: 6px;             /* offset for hard-shadow rectangles */
  --radius:     0;

  --marquee-speed: 30s;
  --press-scale:   0.97;
}
```

**Tailwind config** (`tailwind.config.js`): replace the `retro.*` palette block with `colors: { bg, fg, accent, 'accent-ink', muted, 'muted-fg' }` mapped to the same hexes; extend `fontFamily.display` and `fontFamily.mono`; add `spacing` overrides only if Tailwind's default 4/8/etc scale isn't enough.

**Fonts**: load via Google Fonts in `index.html` (Space Grotesk 400/500/700/900). Departure Mono is not on Google Fonts — vendor as a `@font-face` local file OR fall back to JetBrains Mono (also on Google Fonts). Decision deferred to implementation; spec accepts either.

## 5. Component inventory

### New components (in `src/components/`)

| Component | Purpose | Notes |
|--|--|--|
| `Marquee.jsx` | Full-bleed top strip, infinite-linear scroll | CSS-only animation; duplicated child for seamless loop; `prefers-reduced-motion: reduce` halts animation. |
| `BrutalistCard.jsx` | Bordered card with hard offset shadow | Renders the offset shadow as a sibling positioned rect (not `box-shadow`), so the shadow can have solid color matching `--accent`. Optional `shadowColor` prop. |
| `PillBadge.jsx` | Accent-filled pill, black text | Used for "UNPREDICTABLE" hero pill + trivia badges. |
| `RedactedBlock.jsx` | Inline solid block (`▰▰▰`) | Uses `--muted` background; takes a `width` prop for varying redaction lengths. |
| `MicrocopyLabel.jsx` | Uppercase 12px Departure Mono, letter-spacing +2 | LAST UPDATED / LOCATION / CLIENTS / section numbering. |
| `SectionHeader.jsx` | Section number + label row | `01  EXPERIENCE` styling, accent-colored number on off-white label, or vice versa. |
| `BrutalistChip.jsx` | Skill pill (thin 2px border, mono caps) | Used in the SKILLS row. |

### Deleted

- `src/components/HiddenGlitchTrigger.jsx`
- `src/components/BootSequence.jsx`
- `src/JumpingCat.jsx`
- `src/RetroKnob.jsx`
- `src/SkillsStatus.jsx`
- `src/LogTicker.jsx`
- All era-aware inline components in `App.jsx`: `Redacted`, `ClassifiedStamp`, `CoffeeStain`, `DeskClutter`, `FolderTab` (replaced by simpler experience cards), `JobDetails` (folded into the new experience-card layout).

### Kept (without modification)

- `src/index.jsx` (router bootstrap).
- `src/routes.jsx`.
- The `react-router-dom` setup in `App.jsx`'s outer `<Routes>` shell (just the routes change content, not structure).
- `src/data/resumeData.js` **structure** (data fields unchanged; the UI labels that wrap each field are what changes — see §7).

### Modified

- `src/App.jsx` — gut + rewrite around the new hero + sections.
- `src/index.css` — gut + rewrite (~1030 lines → ~200 lines).
- `tailwind.config.js` — palette swap.
- `index.html` — font preload.
- `src/pages/VinylDashboard.jsx` — retheme (see §8).
- `src/components/DiscogsCollectionPanel.jsx` — retheme to match.

## 6. Hero layout

Single viewport above-the-fold composition matching `mockups/LOCKED-direction.png`:

```
┌─────────────────────────────────────────────────────────────┐
│ [Marquee — full-bleed lime · AVAILABLE · RABURN ▶▶ … repeat]│
├─────────────────────────────────────────────────────────────┤
│ LAST UPDATED: 2026-05-18                              MENU  │
│                                                             │
│   MATTHEW                                                   │
│   RABURN                                                    │
│                                                             │
│   I FIX HIGH-MAINTENANCE SYSTEMS. ALL OF THEM.              │
│                                                             │
│        ┌─────────────────────────────┐                      │
│        │ 04  TRIVIA              ░░░ │     CLIENTS:         │
│        │  (UNPREDICTABLE)            │     ▰▰▰  ▰▰▰▰        │
│        └─────────────────────────────┘                      │
│                                                             │
│ LOCATION: CYBERSPACE                                        │
└─────────────────────────────────────────────────────────────┘
```

- Marquee strip is **the only lime band of solid fill**. Body BG stays `--bg`.
- Name rendered in `--fg` (off-white). Tagline below in `--fg`. **The body content does not go lime**; lime is reserved for the marquee, card borders/offset, and pill badges.
  - This is a deliberate divergence from the nano-banana render of C1a (which made the entire name lime). The mockup is the *vibe*, not the literal spec — keeping the name off-white preserves contrast and prevents lime fatigue when the user scrolls.
- "MENU" in upper right is a sticky-on-scroll button → opens a brutalist drawer or anchors to sections (decision deferred to implementation; spec accepts either).
- The "04 TRIVIA / UNPREDICTABLE" card is a preview of the Trivia section below — clicking it scroll-anchors to `#trivia`.

## 7. Below-the-fold sections

Each section gets a `SectionHeader` (`NN  LABEL`) and is anchored by ID for in-page nav. **Data fields in `resumeData.js` are unchanged**; only the UI labels rendered in `App.jsx` change.

| # | Anchor ID | UI label | Data source field | Render |
|--|--|--|--|--|
| 00 | `#about` | (hero) | `personal` | hero (§6) |
| 01 | `#experience` | EXPERIENCE | `experience[]` | One BrutalistCard per job: company + title + period in display caps, location + achievements in Mono, lime offset shadow. |
| 02 | `#skills` | SKILLS | `operationalTradecraft[]` | Row of `BrutalistChip`s, mono uppercase. |
| 03 | `#testimonials` | TESTIMONIALS | `fieldReports[]` | BrutalistCards, quote in display large, author in Mono caps. Lime offset shadow alternating direction by index. |
| 04 | `#trivia` | TRIVIA | `anomalousCapabilities[]` | BrutalistCards with PillBadge headers (one lime badge per card). |
| 05 | `#target-roles` | TARGET ROLES | `targetRoles[]` | Mono-numbered list, no cards. |
| 06 | `#interests` | INTERESTS | `civilianCover[]` | Mono row per item: name + category + status, lime separator dots. |

The `personal.summary` copy — currently "I don't always fix high-maintenance, business-critical systems... but when I do, I transform them into calm, reliable workhorses. Stay automated, my friends." — stays for now. Decision on dropping the "Stay automated, my friends" Dos-Equis tag is deferred; both forms are acceptable.

**Footer:** Single mono line with copy + email + LinkedIn + the PDF download link. The classification-bar / "DOCUMENT CLASSIFICATION: TOP SECRET" line in the current footer is deleted.

## 8. Vinyl Dashboard retheme (`/dashboard`)

Keep the route. Keep Recharts. Keep the Discogs Netlify function. **Retheme**:

- Page chrome: same hero shell, same Marquee, same MicrocopyLabel pattern.
- Charts: palette becomes `[--accent, --fg, --muted-fg]` cycling. No gradients. No drop-shadows. Tooltip and legend in Mono caps. Axis grid `--muted` at 1px, axis labels in Departure Mono.
- `DiscogsCollectionPanel`: bordered card with lime offset shadow; album-row rendering becomes a tight mono-grid layout.
- `BootSequence` (currently used here) deleted — replaced with a `MicrocopyLabel` showing "CONNECTING…" during fetch.

**Scope guard:** if the dashboard retheme grows beyond ~half a day of work during implementation, defer it to a phase-2 follow-up rather than blocking the main-page ship.

## 9. Files: change summary

```
src/
├── App.jsx                          REWRITE (~540 → ~250 LOC)
├── index.css                        REWRITE (~1030 → ~200 LOC)
├── index.jsx                        KEEP
├── routes.jsx                       KEEP
├── App.css                          KEEP (empty-ish; merge into index.css if needed)
├── JumpingCat.jsx                   DELETE
├── RetroKnob.jsx                    DELETE
├── SkillsStatus.jsx                 DELETE
├── LogTicker.jsx                    DELETE
├── logo.svg                         DELETE (unused)
├── components/
│   ├── HiddenGlitchTrigger.jsx      DELETE
│   ├── BootSequence.jsx             DELETE
│   ├── DiscogsCollectionPanel.jsx   RETHEME
│   ├── Marquee.jsx                  NEW
│   ├── BrutalistCard.jsx            NEW
│   ├── PillBadge.jsx                NEW
│   ├── RedactedBlock.jsx            NEW
│   ├── MicrocopyLabel.jsx           NEW
│   ├── SectionHeader.jsx            NEW
│   └── BrutalistChip.jsx            NEW
├── data/
│   └── resumeData.js                KEEP (structure unchanged)
├── pages/
│   └── VinylDashboard.jsx           RETHEME
├── charts/
│   └── theme.jsx                    REWRITE (Recharts palette)
└── assets/
    └── Matthew_Raburn_Resume.pdf    KEEP

tailwind.config.js                   REWRITE (palette swap)
index.html                           MINOR (font swap)
public/                              KEEP (PDF + manifest + favicon)
netlify.toml                         KEEP
netlify/functions/                   KEEP
design-system/raburn-portfolio/
└── MASTER.md                        REWRITE (auto-generated stub is wrong)
```

## 10. Implementation flow

Operator approved **new branch + PR** workflow.

1. `git checkout -b kinetic-brutalist-refresh` from current `main`.
2. **Tokens + Tailwind first.** Rewrite `src/index.css` to the new tokens. Rewrite `tailwind.config.js`. Verify dev server boots and `App.jsx` still renders (it will look broken — that's fine, just need it to compile).
3. **New components in isolation.** Build Marquee, BrutalistCard, PillBadge, RedactedBlock, MicrocopyLabel, SectionHeader, BrutalistChip. Render them on a temporary `/preview` route or directly at the top of `App.jsx` for visual verification.
4. **Hero rewrite.** Replace the top of `ResumeHome` with the new hero block. Verify against `mockups/LOCKED-direction.png`.
5. **Sections.** Add §7 sections one at a time: EXPERIENCE → SKILLS → TESTIMONIALS → TRIVIA → TARGET ROLES → INTERESTS. Each section uses the new components; nothing inline.
6. **Delete the dead.** Once the new page renders all content, delete the era-aware inline components and the files marked DELETE in §9.
7. **Footer.**
8. **Dashboard retheme.** Last; gated by §8's scope guard.
9. **Rewrite `design-system/raburn-portfolio/MASTER.md`** to match what we actually built.
10. **Manual QA pass:** load on small phone (375px), large phone, tablet, desktop, 1440. Check `prefers-reduced-motion`. Check keyboard nav. Check Lighthouse contrast.
11. **PR to main.** Netlify preview deploy for final review. Merge.

## 11. Out of scope / phase-2 follow-ups

- Dark/light theme toggle. (Single-theme dark-only by design.)
- Recharts retheme polish beyond the §8 minimum.
- Resume PDF redesign to match brutalist site. (PDF is current source; site is the new wrapper.)
- Custom motion beyond the marquee + press-scale (e.g., scroll-triggered reveals on cards). Add if cheap during §10, defer otherwise.
- "MENU" drawer vs anchor nav — both acceptable for v1.
- Updating the README and the PDF's branding to match. (Both still reference the dossier theme.)

## 12. Risks + mitigations

| Risk | Mitigation |
|--|--|
| Lime overuse causes visual fatigue across long scroll | Body content stays off-white; lime appears only on marquee, card edges, and pill badges. Mockup-deviation noted in §6. |
| Departure Mono unavailable / license unclear | Spec accepts JetBrains Mono as fallback. Decision deferred to step 2. |
| Recharts retheme balloons | Hard scope guard in §8: half-day cap, defer otherwise. |
| Dossier-themed copy in `personal.summary` clashes with new tone | Decision deferred to step 4; both forms accepted. |
| Mobile rendering of giant display type doesn't fit | Hero name uses `clamp(3rem, 12vw, 9rem)`-style fluid sizing, breaks to two lines as designed. |

## 13. Acceptance criteria

- Visiting `/` on a desktop browser produces a hero that visually matches `mockups/LOCKED-direction.png` within 10% (typography weight, marquee, card with offset shadow, microcopy positions).
- No `[data-era="…"]` selectors remain in `src/index.css`. `grep -r 'data-era' src/` returns zero matches.
- All files marked DELETE in §9 are removed from the tree.
- All §7 sections render with content sourced from `resumeData.js`.
- `/dashboard` route still works and is themed to match (with the §8 scope guard caveat acknowledged).
- `prefers-reduced-motion: reduce` halts the marquee.
- Keyboard `Tab` traverses interactive elements in source order with visible focus rings (lime 2px outline).
- `npm run build` succeeds. Site deploys to Netlify branch preview.

## 14. Manual QA checklist (before PR merge)

The following checks require a human at a real browser — they cannot be automated from CLI subagents. Run them before merging the PR.

### Reduced motion (AC6)
- [ ] Open the site in Chrome
- [ ] DevTools → ⋯ menu → More tools → Rendering panel
- [ ] Find "Emulate CSS media feature `prefers-reduced-motion`"
- [ ] Set to `reduce`
- [ ] Verify the top marquee strip text stops scrolling (becomes static)
- [ ] Verify card press feedback animation is also suppressed (click a BrutalistCard with `interactive` — should not visibly scale)

### Keyboard navigation (AC7)
- [ ] Load `/` in any browser
- [ ] Press Tab from page load; verify focus visits in this order:
  1. MENU link (top right of hero) → scrolls to #experience
  2. TRIVIA card link → scrolls to #trivia
  3. Email link in footer
  4. LinkedIn link in footer
  5. DOWNLOAD .PDF link in footer
- [ ] Each focused element shows a visible lime 2px outline with 2px offset (the `:focus-visible` rule in src/index.css)
- [ ] Press Enter on any focused link → it activates (anchors scroll, mailto/external/download trigger correctly)
- [ ] Shift+Tab reverses order correctly

### Responsive sweep
For each viewport width, open `/` in DevTools device mode and confirm:
- [ ] **375px (iPhone SE):** Hero name wraps to two lines without horizontal scroll; marquee runs; sections stack to single column; SKILLS chips wrap; no horizontal scroll on any section.
- [ ] **768px (iPad portrait):** Two-column TESTIMONIALS and TRIVIA grids appear; EXPERIENCE remains single-column; container padding feels right.
- [ ] **1024px (small laptop):** `max-w-6xl` container kicks in (content centered with side margins); padding expands.
- [ ] **1440px (desktop):** Same content layout as 1024 but with more side whitespace; no content reflow.

If any responsive issue appears, file as a follow-up commit on the branch (or push a fix before opening the PR).

### Brand polish
- [ ] Hero matches `mockups/LOCKED-direction.png` ±10% — typography weight, marquee, card with offset shadow, microcopy positions.
- [ ] No remaining dossier visual elements (no manilla folder, coffee stain, CAC card, ink stamps).
- [ ] `/dashboard` route renders without crashing. (Full retheme happens in Phase 7.)

---

**Next:** operator reviews this spec. On approval, invoke `superpowers:writing-plans` to produce the implementation plan.
