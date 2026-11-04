# hireraburn.com "Signal" redesign — design

Date: 2026-11-04. Status: draft for builder check. Supersedes the 2026-05-18 brutalist spec entirely.

## 1. Intent

Rebuild hireraburn.com from scratch as a single page that gets one idea across to an AI-company hiring manager in under 30 seconds: **Matthew Raburn shipped a production RAG assistant and agent that an enterprise support org runs its escalations through, and measured it.** Everything on the page exists to make that claim concrete, verifiable, and current, then to make the next step (read the case study, download the resume, email) one click away.

Why now: the live site and the unmerged brutalist branch both still position Matt as a sysadmin ("IT Professional | Enterprise Reliability | Tech Leadership", target roles like "Senior Systems Administrator"), carry joke content, name a former employer wrongly ("Aavid" for Boyd), and never mention the AI work that is now the whole pitch. The LinkedIn profile and resume were rewritten on 2026-11-04 around that work; the site is the last asset still telling the old story.

## 2. Goals, non-goals, anti-goals

**Goals**
1. A recruiter who reads only the hero knows what was built, that it is in production, and the scale (corpus, brands, questions per month, growth).
2. The page itself demonstrates AI engineering: an animated request-path diagram of the real architecture, and a live "Ask about Matt" assistant that answers from the page's own facts with citations.
3. Every number on the page traces to a dated source (the 2026-11-04 production stats dump, the public case study, or the candidate profile). Nothing is rounded past what the source supports.
4. Polished load-in and scroll motion that reads as craft, never as a gate: no scroll-jacking, no intro screens, no waiting for anything to finish.
5. Fast and accessible: LCP under 1.5 s on a mid-range phone on 4G, keyboard reachable, honest reduced-motion mode.

**Non-goals**
- Not a blog, not a content hub, not multi-page. One route.
- No analytics, no cookies, no visitor data collection of any kind.
- No video, no WebGL. The "AI flex" is the assistant and the architecture, not generated imagery (see §11 for the optional ArtCraft slot).
- No CMS. Content is a data file in the repo.

**Anti-goals (would make this a failure even if it worked)**
- Any joke content, Easter eggs, hidden modes, or "dossier" / "anomalous capabilities" framing.
- The product name of the employer-internal assistant appearing anywhere above the Experience section (§5 naming rule).
- A claim the candidate cannot defend in an interview: Kubernetes operation, model training or fine-tuning, PyTorch, ML research, people management, SOW authorship, or an internal model vendor other than Azure OpenAI in production.
- Motion that delays content, hijacks scroll, or breaks on reduced-motion.
- A page that still reads as a sysadmin resume with AI bolted on.

## 3. Audience and the 30-second path

Primary reader: a hiring manager or technical recruiter at an AI product company, a Boston SaaS company with AI initiatives, or an enterprise vendor hiring forward-deployed / applied AI / solutions engineers. They arrive from LinkedIn, GitHub, or a resume link, on desktop or phone, and give the page half a minute.

The path they should take:
1. Hero headline and status line: production RAG, in daily use, enterprise support org.
2. Metric row: 1.0M chunks, 8 brands, 1,059 questions in 30 days, 4.4x growth.
3. Diagram: the architecture is real and non-trivial (planner, agent loop, hybrid retrieval, rerank, citations).
4. One of three actions: case study, resume PDF, email. The "Ask about Matt" box is the fourth, for the curious.

Secondary readers: engineers doing a pre-interview look (they get the flagship section and projects), and the candidate himself, who uses the page as the canonical public statement of what he built.

## 4. Constraints

- **Facts.** The only sources are: the production stats dump the candidate pasted on 2026-11-04 (reproduced in §6.2), the public case study at github.com/Mattressburn/rumil-case-study, and the candidate profile in the ai-job-search workspace (`.claude/skills/job-application-assistant/01-candidate-profile.md`, which also lists the "do not claim" items). If a number is not in one of those, it does not go on the page.
- **Keep internal.** Do not publish: the production commit hash, Proxmox host names or VM counts, the "Case Radar" feature name, operator aliases, internal URLs, customer names, or anything from the Rumil repo that the case study does not already state.
- **Production model.** The assistant in production runs on Azure OpenAI GPT-5.1 (GPT-4.1 earlier). Claude Code is the build tool. The page must never imply Claude is the runtime of the employer's system. The site's own "Ask about Matt" box runs on Claude, and the page says so plainly there.
- **No Education section** anywhere on the page. Work history and projects only.
- **No em-dashes** in any copy.
- **Tone.** Plain, specific, first person in the hero lede and the About paragraph, third person nowhere. No "passionate", "results-driven", "thought leader".
- **Build on the existing stack** (React 19, Vite 7, Tailwind 3, framer-motion 12, Vitest, Netlify). Do not introduce a second animation library or a smooth-scroll library.
- **Repo and deploy.** Work on a new branch `signal-redesign` cut from `kinetic-brutalist-refresh` (it has the Vite 7 and Vitest setup and the smaller codebase). PR to `main`; Netlify deploys `main` to hireraburn.com. The previous mockups and the brutalist spec stay in git history; they are not referenced by the new site.

## 5. Naming rule for the flagship system

The internal product name is **Rumil**. On this page it is named in exactly two places: the Johnson Controls entry in the Experience section (bullet text and the case-study link label) and the "Ask about Matt" assistant's answers when a visitor asks about it directly. Everywhere else, including the hero, the status line, the metric labels, the flagship section heading and body, the diagram, the projects section, the page `<title>`, meta description, and Open Graph text, it is "the assistant", "a production RAG assistant", or "the system".

A Vitest test asserts that the rendered DOM before the Experience section's heading contains no occurrence of the string "Rumil".

## 6. Page structure and copy

Single scrolling page, max content width 1,200 px, left-aligned. Section order and anchors:

`#top` hero · `#system` flagship · `#experience` · `#projects` · `#stack` · `#contact`

A thin sticky top bar appears after the hero scrolls out: "MR" wordmark left, section links center (hidden on phones), "Resume PDF" button right.

### 6.1 Hero (`#top`)

Two columns on desktop (text 52%, diagram 48%), stacked on phones (text, then metrics, then diagram).

- **Status line** (mono, amber dot pulsing once per 1.8 s): `PRODUCTION RAG ASSISTANT · ANSWERING SINCE APR 2026 · ~100-PERSON SUPPORT ORG`
- **Headline** (three masked lines): `Production RAG.` / `Shipped, measured,` / `in daily use.` with "measured," in amber.
- **Lede** (first person): "I'm Matthew Raburn. I took a retrieval assistant from a homelab prototype to the production agent an enterprise support org runs its escalations through. Python, Azure OpenAI, Elasticsearch, Claude Code. Lowell, MA. Remote or Boston hybrid."
- **Metric row** (four, counted up once on load):

  | Value | Label |
  |---|---|
  | 1.0M | chunks indexed |
  | 8 | product brands |
  | 1,059 | questions, last 30 days |
  | 4.4x | quarter over quarter |

- **Actions**: primary amber button "Read the case study" (links to the GitHub case study, new tab), secondary "Resume PDF" (download), secondary "GitHub".
- **Ask about Matt** entry: a single input beneath the actions, placeholder "Ask about Matt: has he run anything in production?" with three suggestion chips. Submitting opens the assistant panel (§7).
- **Diagram card** (right column): heading `REQUEST PATH`, a short `trace 7f3a…` label (decorative, not a real trace), the animated SVG described in §8.3, and a three-line trace log that types in once: `retrieve  k=40  rerank → 8   412 ms` / `tool  jira.search  "controller offline after upgrade"` / `answer  grounded · 3 citations`. Latency and k values are illustrative; the log is labelled `example trace` in 10 px mono so it is not mistaken for live data.

### 6.2 Flagship system (`#system`)

Heading: `A production RAG assistant for an eight-brand support organization`. Eyebrow: `01 · THE SYSTEM`. No product name.

**Problem** (two sentences): "A support engineer working an escalation searched four to seven disconnected systems by hand: manuals, Confluence, Jira, the KB portal, a community forum, Salesforce cases, and install-log bundles. One lookup took about 30 minutes."

**What it does** (two sentences): "Ask in natural language, optionally upload an install-log bundle. The agent plans a tool path, retrieves across the whole corpus with hybrid BM25 and vector search, reranks with a cross-encoder, calls Jira, Salesforce, Snowflake and licensing tools when it needs them, and answers with citations back to the source documents, in under two minutes."

**Numbers** (grid of small cards, counted up when scrolled into view; every value is from the 2026-11-04 production dump unless noted):

| Group | Values |
|---|---|
| Corpus | 1,011,268 chunks (26 GB) · 250,527 unique documents · 8 brands, 5 portal brands ingested nightly |
| Sources | 106,243 Jira issues · 64,245 Salesforce cases · 59,910 worklogs · 10,567 KB articles · 4,376 Confluence pages · 181,652 closed-case resolution records |
| Usage | 3,117 questions answered since Apr 14, 2026 · 54 of 74 approved accounts have asked · 35 active in the last 30 days · 48 questions and 10 people on an average weekday · peak 120 questions in a day |
| Growth | Aug 302 → Sep 862 → Oct 1,091 questions (rendered as a three-point sparkline) · 2,353 vs 540 questions in the last 90 days against the 90 before (4.4x) · 44 vs 20 people |
| Tool mix, 30 days | 1,332 tool calls: KB search 706 · Jira 212 · Salesforce 211 · Snowflake case lookup 130 (rendered as a four-bar strip) |
| Quality | recall@10 0.82 on the golden set (case study) · 48 of 50 correct vs 26 of 50 for the support tool's built-in assistant, unrehearsed head-to-head (candidate profile, user-stated 2026-09-14) · forced retries on ungrounded answers 25% → 0% (case study) |
| Engineering | 17 agent tools (case study) · 19,705 automated tests (17,244 backend + 2,461 frontend) · 1,070 merged PRs and 2,130 commits since Apr 16, 2026 · 194k lines of Python + 122k TypeScript · 129 test environments built by the VM pipeline since Sep 1 |

**Architecture**: the hero diagram again at full width, each node clickable to reveal one "why" sentence from the case study's component table (search backend, embeddings, reranker, agent models, persistence, auth, long queries, evaluation, delivery). Labels: Elasticsearch 8 · BM25 + dense vectors · `text-embedding-3-large` truncated to 1536 d · cross-encoder rerank (BGE, later Qwen3, on CPU) · planner with guardrails · 17-tool agent loop · deferred jobs with a 180 s deadline · Azure OpenAI GPT-5.1 behind a provider facade · Postgres 16 · Entra ID with approval gate · golden-set harness gating feature flags · GitHub Actions on self-hosted runners.

**What broke after launch** (three items, each title + two sentences, from the case study): the model stopped calling the retrieval tool (seven guardrails, 25% → 0%); nightly ingest burned embedding tokens (cache ceiling, 22.9M → 2.17M tokens a night); a rotated Jira token made a tool lie quietly (loud auth error, silent empties treated as a bug class). A fourth line: "Measured, then held back: Self-RAG off at 1.8x latency for no gain; RAG-Fusion behind a flag at 2.3x."

**How it was built** (one paragraph, names Claude Code): homelab prototype on personal hardware → Azure Container Apps → company-hosted production VM; built with Claude Code and Codex CLI as the daily harness, parallel builder agents on worktrees, adversarial review before merge, production promotion gated on a merged-tree test run.

Closing line with the case-study link: "Full write-up, architecture diagram and incident notes: the public case study." (link text says "public case study", not the product name)

### 6.3 Experience (`#experience`)

Eyebrow `02 · EXPERIENCE`. Four entries, each: company, title, dates, location, three to five bullets. Bullets are action + metric, matching the 2026-11-04 LinkedIn rewrite. Rumil may be named here.

- **Johnson Controls** · L3 Technical Support Engineer, Security Products · Sep 2025 to present · Westford, MA (hybrid)
  - Designed and built Rumil, the RAG assistant and 17-tool agent described above, from a homelab prototype to a production system the ACVS support organization uses daily; 1.0M-chunk Elasticsearch corpus across eight brands, Azure OpenAI GPT-5.1, Python/FastAPI and Next.js. Link: public case study.
  - Won director sponsorship, moved it to Azure Container Apps and then to a company-hosted production VM with GitHub Actions CI/CD and about 19,700 automated tests.
  - Measured it: golden-set recall@10 0.82; 48 of 50 correct in an unrehearsed head-to-head against the support tool's built-in assistant (26 of 50); seven guardrails took ungrounded answers from 25% to 0%; embed-cache fix cut nightly spend from 22.9M to 2.17M tokens.
  - Resolve L3 escalations for enterprise access-control deployments; built LogDump and AI-driven log and crash-dump triage; work software-issue cases with Claude Code and close them in about half the time (own estimate).
- **Pall Corporation** · Senior Engineering Systems Analyst · Jan 2021 to Aug 2025 · Remote
  - Technical lead for the Pall Water divestiture: migrated 3 TB+ of engineering data three weeks early with zero incidents.
  - Cut workstation setup time 72% with PowerShell and SCCM automation across 800+ global endpoints.
  - Managed simulation infrastructure and vendor contracts over USD 1M; ran FlexLM license servers for CATIA, SolidWorks, ANSYS and Autodesk at 99.9% uptime.
  - Technical lead for Catia and Windchill Workgroup Manager supporting a USD 300M business unit; authored the SOP library.
  - Built AI-assisted log analysis and automation for the engineering-applications queue.
- **Boyd** · Systems Administrator · Oct 2019 to Jan 2021 · Woburn, MA
  - Primary systems administrator for a 280-person office: servers, network, identity, security.
  - Led the Office 365 and Teams rollout for 100+ staff.
  - Built JavaScript and PostgreSQL integrations syncing PLM and ERP.
- **Lytron (acquired by Boyd, Jul 2019)** · Database Administrator · Feb 2018 to Oct 2019 · Woburn, MA
  - Cut Engineering Change Notice cycle time 75%, from 14 days to 3.5.
  - Owned PLM and ERP database administration and reporting.

### 6.4 Projects (`#projects`)

Eyebrow `03 · PROJECTS`. Five cards, each: name, one line of what it does, stack chips, GitHub link. Order:

1. **LogDump** (Rust, C#, PowerShell): single-EXE field utility that arms ProcDump crash and hang capture through a scheduled task, collects log bundles, alerts by email or webhook. In use on customer deployments.
2. **BinarySlicer** (Python, PySide6): desktop decoder for access-control card payloads; formats defined in JSON so it extends without code; signed Windows releases.
3. **CCurator** (JavaScript, .NET): Chrome extension plus companion service that turns Salesforce Service Cloud cases into structured JSON for triage.
4. **BackStamp** (TypeScript, Expo, Claude vision): identifies vintage Pyrex from a photo and prices it against eBay comps; Hono API, 40 tests.
5. **This site** (React 19, Netlify Functions, Claude): the page you are reading, including the assistant below. Source on GitHub.

### 6.5 Stack (`#stack`)

Eyebrow `04 · STACK`. Five groups as mono chip rows:

- **Retrieval and agents:** hybrid BM25 + vector retrieval, Elasticsearch 8, Azure AI Search, `text-embedding-3-large`, cross-encoder reranking (BGE, Qwen3), hand-built tool-use loops, guardrails and forced-retry grounding, golden-set evals (recall@k, MRR, LLM-as-judge), feature-flag A/B promotion
- **Models and tooling:** Azure OpenAI (GPT-5.1, GPT-4.1), Anthropic Claude API, Claude Code, Codex CLI, prompt engineering, structured outputs
- **Build:** Python, FastAPI, pytest, TypeScript, React 19, Next.js 15, Node, Playwright, Vitest, Docker Compose, GitHub Actions, PostgreSQL, SQL Server, Snowflake
- **Platform:** Azure (Container Apps, Entra ID, Key Vault), AWS (EC2, S3, IAM, Lambda, RDS), Linux, PowerShell, SCCM, Intune, Active Directory
- **Local inference (homelab):** llama.cpp serving Qwen3.8-27B on an RX 9070 XT, about 1,029 tok/s prompt and 32 tok/s generation; personal use

Below the chips, one honest line: "Not on my record: Kubernetes operation, model training, PyTorch. I say so before you ask."

### 6.6 Contact (`#contact`)

Eyebrow `05 · CONTACT`. Large line: "Hiring for applied AI, forward-deployed, or solutions engineering? Email me." Buttons: raburnmh@gmail.com (mailto), LinkedIn, GitHub, Resume PDF. Footer: "© 2026 Matthew Raburn · Lowell, MA · Built with React, Netlify Functions and Claude. Source on GitHub."

### 6.7 Head, meta, Open Graph

- `<title>`: `Matthew Raburn · Applied AI Engineer`
- Meta description: "Built and shipped a production RAG assistant and agent for an eight-brand enterprise support org: 1.0M-chunk corpus, 1,000+ questions a month, measured on a golden set. Python, Azure OpenAI, Elasticsearch, Claude Code. Boston, remote or hybrid."
- Open Graph image: a 1200×630 render of the hero (static PNG in `public/og.png`, generated once from the built page with Playwright; no runtime rendering).
- `robots.txt` allows all. No analytics.

## 7. "Ask about Matt" assistant

**What it is.** A small grounded chat that answers questions about Matt from a single facts document, with citations to sections of this page. It runs on Claude through a Netlify Function. It exists to show, not tell: the visitor asks the kind of question a screener would ask and gets a cited, honest answer in a few seconds.

**UI.**
- Entry input in the hero (§6.1). Submitting opens a right-side panel on desktop (full-screen sheet on phones) with the conversation. The panel header says "Ask about Matt · answers come from this page, the resume and the public case study, generated by Claude."
- Suggestion chips (three, rotated from a list of eight): "Has he run anything in production?", "What's his eval setup?", "Does he know Kubernetes?", "What did he build on his own time?", "What broke after launch?", "Is he open to remote?", "What's his salary floor?" (answer: "not stated on this page; email Matt"), "Which model does the production system use?"
- Answers stream in. Each answer ends with citation chips (`#system`, `#experience`, `Case study`) that scroll the page to the section or open the case study.
- Hard limits shown in the UI: 500 characters per question, 6 questions per visit, then "That's the limit for this visit. Email Matt for the rest."
- Failure modes: if the function returns 429 (daily cap) or 5xx, or the API key is unset, the panel answers the eight suggestion questions from a bundled static answer set and says "Live answers are paused; these are pre-written." Everything else shows "Can't answer live right now. Email Matt."

**Backend.** `netlify/functions/ask.ts`, Node runtime (not Edge), streaming response.
- Model: `claude-haiku-5-5` by default; `ASK_MODEL` env var can switch to `claude-sonnet-5-5`. Exact SDK usage per the claude-api skill at build time (the builder loads it before writing the function).
- System prompt: a fixed instruction block plus the contents of `shared/facts.md`, sent with prompt caching so the facts are cached across calls. Instructions: answer only about Matthew Raburn and his work; use only the facts document; if a fact is not in it, say "That's not on this page" and suggest email; never speculate about salary, availability dates, or employers' internal details; keep answers under 120 words; end with one to three citation tokens from a fixed list (`[cite:system]`, `[cite:experience]`, `[cite:projects]`, `[cite:stack]`, `[cite:case-study]`) that the client renders as chips; never claim the items on the "do not claim" list even if asked leadingly; it is fine to name Rumil when the visitor asks about it.
- Request shape: `{messages: [{role, content}...]}` with at most 6 user turns, each at most 500 chars; the server truncates and rejects anything larger. `max_tokens` 400.
- Rate limits: per-IP 10 questions per hour and a global cap of 300 questions per UTC day, both stored in Netlify Blobs (two keys, atomic enough for this traffic). On the global cap return 429 with a JSON body the client recognizes. No question text is stored anywhere; only counters.
- Secrets: `ANTHROPIC_API_KEY` in Netlify environment variables. Never in the repo. The function refuses to start without it and returns a 503 the client treats as "paused".
- Abuse posture: the model has no tools and no access beyond the facts document, so the worst case is an off-script sentence. Prompt injection in questions is handled by the system prompt and the fixed citation vocabulary; the client never renders model output as HTML.

**Facts document.** `shared/facts.md` is the single source of truth for both the page copy and the assistant. It is written once from §6 plus the candidate profile's "do not claim" list, and it includes dated provenance lines so the assistant can say "as of November 2026". The site's data file imports it for the numbers it displays, or the builder keeps `src/data/site.js` and `shared/facts.md` in sync with a test that checks every number in `site.js` appears in `facts.md`.

**Cost.** Haiku 5.5 with a cached 2,000-token system prompt and 400-token answers costs well under a cent per question; the 300-per-day cap bounds the worst month at a few dollars. (Builder confirms exact pricing from the claude-api skill and records it in the README.)

## 8. Motion specification

Principle: motion reveals, it never gates. Every animation has a finished state that is the plain content, and the page is usable before any animation ends.

### 8.1 Load-in (hero only, once per page load)

Sequence, total 1.6 s, starting at first paint:
1. 0 ms: status line fades in (200 ms).
2. 100 ms: headline lines rise out of clip masks, 80 ms stagger, 900 ms each, ease `cubic-bezier(.2,.8,.2,1)`.
3. 450 ms: lede fades up 18 px (700 ms).
4. 600 ms: metric cards fade up with 60 ms stagger; numbers count from 0 to value over 1,200 ms with ease-out cubic, formatted with thousands separators and the suffix (`1.0M`, `4.4x`).
5. 400 ms: diagram card fades up; edges draw (stroke-dashoffset, 900 ms); at 1,300 ms the pulses start and loop; the trace log types its three lines at 18 ms per character.
6. 900 ms: actions and the ask input fade up.

### 8.2 Scroll

- Each section's heading and body blocks rise 18 px and fade in once when 20% visible (framer-motion `whileInView`, `once: true`), 60 ms stagger between sibling cards.
- Numbers in §6.2 count up when their card enters the viewport, once.
- The sparkline draws its polyline (600 ms) and the tool-mix bars grow from zero (500 ms) when visible.
- The sticky top bar slides down when the hero's bottom passes the viewport top.
- No parallax, no scroll-linked transforms, no smooth-scroll library. Native `scroll-behavior: smooth` for anchor links only.

### 8.3 The request-path diagram

An SVG React component driven by a node and edge list in `src/data/site.js`. Layout fixed by hand (not auto-layout) for a 420×300 viewBox on desktop and a vertical 320×520 variant for phones. Nodes: query → planner → agent loop → cited answer down the left; hybrid retrieval and rerank with the Elasticsearch label on the right; tool fan-out (Jira, Salesforce, Snowflake, licensing) as small labels; the model box (Azure OpenAI GPT-5.1 behind a provider facade) at the bottom. Edges are 1.5 px `#2A2F38`; pulses are a 6-unit amber dash travelling the edge on a 2.6 s loop with per-edge delays so the flow reads top to bottom then back. Hover or focus on a node shows a one-line tooltip (the "why" from the case study). Nodes are focusable buttons for keyboard users.

### 8.4 Hover and press

Cards: border color from `#1C2129` to `#2A2F38` and 2 px lift, 160 ms. Buttons: 2% brightness change, scale 0.98 on press. Links: underline offset 4 px on hover. Nothing else moves on hover.

### 8.5 Reduced motion

Under `prefers-reduced-motion: reduce`: all reveals render in their finished state immediately, counters show final values, the diagram shows its edges drawn with static amber markers instead of moving pulses, the trace log is fully rendered, the sparkline and bars are static. The Vitest reduced-motion test asserts the hero headline is visible with no pending animation.

## 9. Visual system

Tokens (CSS variables on `:root`, mirrored in `tailwind.config.js`):

| Token | Value | Use |
|---|---|---|
| `--bg` | `#0A0C10` | page |
| `--bg-2` | `#0E1117` | cards |
| `--line` | `#1C2129` | borders |
| `--line-2` | `#2A2F38` | hover borders, diagram edges |
| `--fg` | `#E6E8EC` | text |
| `--fg-2` | `#9AA0AA` | secondary text |
| `--fg-3` | `#6F7682` | labels |
| `--accent` | `#FFB020` | amber: status dot, headline word, primary button, pulses |
| `--ok` | `#5BD38A` | one use: the latency in the trace log |

Type: Inter Tight 800 for display (headline 60 px desktop, 40 px phone, letter-spacing -0.035em, line-height 1.0); Inter 400/500 for body (16 px, line-height 1.55, measure 46 to 60 ch); JetBrains Mono 400/500 for labels, metrics, chips, the diagram and the trace log (11 to 13 px, uppercase labels at 0.1em tracking). Fonts self-hosted as woff2 through `@fontsource` packages, preloaded, `font-display: swap`. No Google Fonts request.

Radii 6 px for buttons and chips, 10 px for cards. Borders 1 px. No drop shadows except a 0 0 0 9px amber ring on the status dot's pulse. Spacing scale 4/8/16/24/32/48/64/96 px. Grid: 12 columns, 24 px gutters, 1,200 px max.

Light mode: none. The page is dark only, with `color-scheme: dark` declared.

## 10. Technical decisions (decided)

- **Keep:** React 19, Vite 7 (port 3001, outDir `build`), Tailwind 3, framer-motion 12, lucide-react, Vitest + Testing Library, Netlify (`netlify.toml`, `_redirects`).
- **Remove:** react-router-dom (single route; `App.jsx` renders the page directly), recharts, papaparse, web-vitals, `intellisense`, `react-is`, `netlify-cli` from devDependencies if unused by scripts. Delete `src/pages/VinylDashboard.jsx`, `src/components/DiscogsCollectionPanel.jsx`, `netlify/functions/discogs-collection.ts`, `public/fan500.json`, `public/ccure_9000_client.png`, all brutalist components and their tests, `src/routes.js(x)`, `src/reportWebVitals.js`, `README_CHAT_HELP.txt`, `filelist.txt`, `listing.txt`, `ruvector.db` (already gitignored), `public/MatthewRaburnResume-25.pdf` and `src/assets/Matthew_Raburn_Resume.pdf` (replaced by one `public/Matthew_Raburn_Resume.pdf`).
- **Add:** `@anthropic-ai/sdk` and `@netlify/blobs` (function only), `@fontsource-variable/inter-tight`, `@fontsource-variable/inter`, `@fontsource-variable/jetbrains-mono`.
- **Structure:**
  - `src/App.jsx` composes sections in order.
  - `src/sections/{Hero,System,Experience,Projects,Stack,Contact}.jsx`
  - `src/components/{TopBar,Metric,Sparkline,BarStrip,RequestPath,TraceLog,Ask,Chip,Card,Reveal}.jsx`
  - `src/data/site.js` (all copy, numbers, nodes and edges, projects, experience)
  - `shared/facts.md` (assistant grounding; also the provenance record)
  - `netlify/functions/ask.ts`
  - `src/lib/motion.js` (shared variants, reduced-motion hook)
- **Diagram and charts** are hand-written SVG. No chart library.
- **Streaming** from the function uses a plain `ReadableStream` of text chunks; the client appends as they arrive.
- **Tests (Vitest):** page renders all six section headings; no "Rumil" in the DOM before the Experience heading; reduced-motion renders the headline immediately; every numeric value in `site.js` metrics appears in `shared/facts.md`; `Ask` component falls back to static answers on a 429/503; the function's rate limiter denies the 11th request in an hour and the 301st in a day (limiter logic in a pure module, tested without Netlify).
- **Performance budget:** JS under 150 kB gzipped total, fonts under 120 kB, LCP under 1.5 s simulated 4G mid-range phone, no layout shift from counters (reserve width with `font-variant-numeric: tabular-nums`). Verified with Lighthouse on the Netlify preview before merge.
- **Accessibility:** semantic landmarks and headings, all interactive diagram nodes are buttons with labels, focus rings 2 px amber, contrast at least 4.5:1 for body text (`#9AA0AA` on `#0A0C10` passes), skip link to `#system`.

## 11. Generated media (optional, last, does not block)

The candidate has an ArtCraft account and wants to use generated media. The Signal direction is typographic and does not need imagery; a generated asset is an optional polish step after launch:

- **Slot:** a looping ambient texture behind the hero at 6 to 8% opacity (slow drifting amber and slate light on black, no recognizable objects, no text), WebM + MP4 + a poster PNG, muted, `playsinline`, paused under reduced motion and on `prefers-reduced-data`, lazy-loaded after LCP. Under 1.5 MB.
- **Prompt (for ArtCraft, Veo 3.1 Fast or Kling 2.6):** "Abstract slow-motion loop, near-black background, faint amber and slate light trails drifting diagonally like data moving along fiber, very low contrast, seamless loop, no text, no objects, 16:9, 8 seconds."
- If the ArtCraft API key is available in the environment, the builder may script generation; otherwise the candidate generates it in the app and drops the files in `public/media/`. The page must look finished with the slot empty.

## 12. Resume PDF

The site serves one PDF at `public/Matthew_Raburn_Resume.pdf`, linked from the hero, the top bar and the contact section, with `download` and a stable filename. Which PDF ships is an open question for the candidate (§14); the builder wires the link and leaves a placeholder file named in the README.

## 13. Acceptance

The redesign is done when all of these hold on the Netlify preview of the `signal-redesign` branch:

1. The hero, metrics, diagram and three actions are visible without scrolling on a 390×844 phone and a 1440×900 desktop.
2. No "Rumil" above the Experience section; test passes.
3. Every number on the page matches §6.2 or the case study; a reviewer checks them against `shared/facts.md` line by line.
4. The assistant answers the eight suggestion questions correctly with citations, refuses an off-topic question politely, falls back to static answers when the key is removed, and the 11th question in an hour from one IP is refused.
5. Reduced-motion mode shows the complete page with nothing pending.
6. Lighthouse on the preview: performance 95+, accessibility 100, no console errors.
7. All Vitest tests pass; `npm run build` succeeds with no warnings about unused dependencies.
8. The old routes (`/dashboard`) return the single page (SPA redirect), not an error.

## 14. Left to the builder

- Exact SVG coordinates for the diagram and its phone variant.
- Component boundaries beyond the list in §10, hook names, variant names.
- Tooltip implementation for diagram nodes (native `title` is not enough; a small positioned div is fine).
- Whether `shared/facts.md` is imported with `?raw` into the client bundle (for the fallback answers) or the static answers live in `site.js`.
- Font subset ranges.
- The OG image render script.
- Commit granularity on the branch; one PR at the end.

## 15. Questions for the candidate (filled after the builder check)

1. Which resume PDF ships: an existing September variant, or a general one rebuilt with the November numbers?
2. ArtCraft: generate the ambient loop now, later, or skip?
3. Confirm the Anthropic API key will be added to Netlify at deploy time (the function is useless without it; the fallback keeps the page working).
