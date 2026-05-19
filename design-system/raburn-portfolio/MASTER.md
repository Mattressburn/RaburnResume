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
