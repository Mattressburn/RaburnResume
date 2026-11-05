# hireraburn.com "Signal" redesign — design

Date: 2026-11-04. Status: revision 3, candidate answered the §15 questions on 2026-11-04. Supersedes the 2026-05-18 brutalist spec entirely. Items marked **[call]** are the author's decisions made during the builder check; items marked **[answered]** record the candidate's decisions; the one remaining **[open]** item is in §15.

## 1. Intent

Rebuild hireraburn.com from scratch as a single page that gets one idea across to an AI-company hiring manager in under 30 seconds: **Matthew Raburn shipped a production RAG assistant and agent that an enterprise support org uses on its escalations every weekday, and measured it.** Everything on the page exists to make that claim concrete, verifiable, and current, then to make the next step (read the case study, download the resume, email) one click away.

Why now: the live site and the unmerged brutalist branch both still position Matt as a sysadmin ("IT Professional | Enterprise Reliability | Tech Leadership", target roles like "Senior Systems Administrator"), carry joke content, and never mention the AI work that is now the whole pitch. The LinkedIn profile and resume were rewritten on 2026-11-04 around that work; the site is the last asset still telling the old story.

## 2. Goals, non-goals, anti-goals

**Goals**
1. A recruiter who reads only the hero knows what was built, that it is in production, and the scale (corpus, brands, questions per month, growth).
2. The page itself demonstrates AI engineering: an animated request-path diagram of the real architecture, and a live "Ask about Matt" assistant that answers from the page's own facts with citations.
3. Every number on the page traces to a dated source (the 2026-11-04 production stats dump, the public case study, or the candidate profile). Nothing is rounded past what the source supports.
4. Polished load-in and scroll motion that reads as craft, never as a gate: no scroll-jacking, no intro screens, no waiting for anything to finish.
5. Fast and accessible: Lighthouse performance 95+ on the Netlify preview, keyboard reachable, honest reduced-motion mode.

**Non-goals**
- Not a blog, not a content hub, not multi-page. One route.
- No analytics, no cookies, no stored questions. The only visitor-derived data the site holds is a rate-limit counter keyed on a salted hash of the IP address, pruned after two hours (§7). **[call]**
- No video, no WebGL. The "AI flex" is the assistant and the architecture, not generated imagery (see §11 for the optional ArtCraft slot).
- No CMS. Content is a data file in the repo.

**Anti-goals (would make this a failure even if it worked)**
- Any joke content, Easter eggs, hidden modes, or "dossier" / "anomalous capabilities" framing.
- The product name of the employer-internal assistant appearing in visible text anywhere above the Experience section (§5 naming rule).
- A claim the candidate cannot defend in an interview: Kubernetes operation, model training or fine-tuning, PyTorch, ML research, people management, SOW authorship, or an internal model vendor other than Azure OpenAI in production.
- Motion that delays content, hijacks scroll, or breaks on reduced-motion.
- A page that still reads as a sysadmin resume with AI bolted on.

## 3. Audience and the 30-second path

Primary reader: a hiring manager or technical recruiter at an AI product company, a Boston SaaS company with AI initiatives, or an enterprise vendor hiring forward-deployed / applied AI / solutions engineers. They arrive from LinkedIn, GitHub, or a resume link, on desktop or phone, and give the page half a minute.

The path they should take:
1. Hero headline and status line: production RAG, in daily use, enterprise support org.
2. Metric row: over 1M chunks, 8 brands indexed, over 1,000 questions in 30 days, over 4x growth.
3. Diagram (desktop; below the fold on phones): the architecture is real and non-trivial (planner, agent loop, hybrid retrieval, rerank, citations).
4. One of three actions: case study, resume PDF, email. The "Ask about Matt" box is the fourth, for the curious.

Secondary readers: engineers doing a pre-interview look (they get the flagship section and projects), and the candidate himself, who uses the page as the canonical public statement of what he built.

## 4. Constraints

- **Facts.** The only sources are: the production stats dump the candidate pasted on 2026-11-04 (reproduced in Appendix A), the public case study at github.com/Mattressburn/rumil-case-study, and the candidate profile in the ai-job-search workspace (`.claude/skills/job-application-assistant/01-candidate-profile.md`, which also lists the "do not claim" items). If a number is not in one of those, it does not go on the page. Where the spec's copy and the profile differ in wording, the spec is the copy and the profile is the fact check. **[call]**
- **Case study currency.** The public case study still states the August 2026 figures (about 310,000 chunks, seven sources, about 6,000 tests). The hero links to it as proof, so the two must agree before launch. **[answered]** The case study (README.md and ARCHITECTURE.md in github.com/Mattressburn/rumil-case-study) is updated to the November figures, under the same rounding rule below, in the same change set; the candidate pushes that repo himself. Both documents carry a "figures as of November 2026" line.
- **Rounding rule.** **[answered]** Every production figure on the page, in `shared/facts.md`, and in the updated case study is a ballpark introduced with "over" or "around" (for example "over 1M chunks", "around 250k documents", "over 1,000 questions in the last 30 days", "around 50 of around 75 approved accounts"). Exact values live only in Appendix A of this document. Measured quality figures from the case study (recall@10 0.82, 48 of 50 vs 26 of 50, 25% to 0%, 22.9M to 2.17M tokens) stay exact because they are measurements, not volumes. Small counts (8 brands, 17 tools) stay exact.
- **Keep internal.** Do not publish: the production commit hash, Proxmox host names or VM counts on the hypervisor, the "Case Radar" feature name, operator aliases, internal URLs, customer names, the brand usage split, the role split of active users, the business-unit acronym (say "the support organization for Johnson Controls security products"), the case-tool vendor's name next to the head-to-head comparison, or anything from the Rumil repo that the case study does not already state. Per-source record counts, approved-account counts and the VM-pipeline count are published in rounded form. **[answered]**
- **Production model.** The assistant in production runs on Azure OpenAI GPT-5.1 (GPT-4.1 earlier). Claude Code is the build tool. The page must never imply Claude is the runtime of the employer's system. The site's own "Ask about Matt" box runs on Claude, and the page says so plainly there.
- **No Education section** anywhere on the page. Work history and projects only.
- **No em-dashes** in any copy.
- **Tone.** Plain, specific, first person in the hero lede and the About paragraph, third person nowhere. No "passionate", "results-driven", "thought leader".
- **Build on the existing stack** (React 19, Vite 7, Tailwind 3, framer-motion 12, Vitest, Netlify). Do not introduce a second animation library or a smooth-scroll library.
- **Repo and deploy.** Work on the branch `signal-redesign` (cut from `kinetic-brutalist-refresh`, which has the Vite 7 and Vitest setup). PR to `main`; Netlify deploys `main` to hireraburn.com. The previous mockups and the brutalist spec stay in git history; they are not referenced by the new site.

## 5. Naming rule for the flagship system

The internal product name is **Rumil**. In visible text it appears in exactly two places: the Johnson Controls entry in the Experience section (bullet text and the case-study link label) and the "Ask about Matt" assistant's answers when a visitor asks about it directly. Everywhere else, including the hero, the status line, the metric labels, the flagship section heading and body, the diagram, the projects section, the page `<title>`, meta description, and Open Graph text, it is "the assistant", "a production RAG assistant", or "the system".

The rule covers visible text only. The hero's "Read the case study" button links to the GitHub repository URL, whose slug carries the name; that is allowed. **[call]**

A Vitest test asserts that the `textContent` of every node rendered before the Experience section's heading contains no occurrence of "Rumil" (case-insensitive).

## 6. Page structure and copy

Single scrolling page, max content width 1,200 px, left-aligned. Section order and anchors:

`#top` hero · `#system` flagship · `#experience` · `#projects` · `#stack` · `#contact`

A thin sticky top bar appears after the hero scrolls out: "MR" wordmark left, section links center (hidden on phones), "Resume PDF" button right.

### 6.1 Hero (`#top`)

Two columns on desktop (text 52%, diagram 48%). On phones the order is: status line, headline, lede, metric row (2×2), the three actions, then the ask input, then the diagram card using its vertical variant. The phone fold (390×844) holds everything through the three actions; the ask input and diagram follow below it. **[call]**

- **Status line** (mono, amber dot pulsing once per 1.8 s): `PRODUCTION RAG ASSISTANT · ANSWERING SINCE APR 2026 · ~100-PERSON SUPPORT ORG` (April 2026 is the first month of the production query log in the dump; "~100-person" is the candidate's approved ballpark for the org.)
- **Headline** (three masked lines): `Production RAG.` / `Shipped, measured,` / `in daily use.` with "measured," in amber.
- **Lede** (first person): "I'm Matthew Raburn. I took a retrieval assistant from a homelab prototype to the production agent an enterprise support org uses on its escalations every weekday. Python, Azure OpenAI, Elasticsearch, Claude Code. Lowell, MA. Remote or Boston hybrid."
- **Metric row** (four, counted up once on load; caption under the row in 10 px mono: `production figures as of Nov 4, 2026`):

  | Value | Label | Source row (Appendix A) |
  |---|---|---|
  | 1M+ | chunks indexed | Chunks in the index: 1,011,268 |
  | 8 | product brands indexed | Brands covered: 8 |
  | 1,000+ | questions, last 30 days | Questions, last 30 days: 1,059 |
  | 4x+ | last 90 days vs the 90 before | 2,353 vs 540 questions |

  The count-up animates to the rounded value; the "+" is a static suffix.

- **Actions**: primary amber button "Read the case study" (links to the GitHub case study, new tab), secondary "Resume PDF" (download), secondary "GitHub".
- **Ask about Matt** entry: a single input beneath the actions, placeholder "Ask about Matt: has he run anything in production?" with three suggestion chips. Submitting opens the assistant panel (§7).
- **Diagram card** (right column on desktop): heading `REQUEST PATH`, a short `trace 7f3a…` label (decorative), the animated SVG described in §8.3, and a three-line trace log that types in once: `retrieve  k=40  rerank → 8   412 ms` / `tool  jira.search  "controller offline after upgrade"` / `answer  grounded · 3 citations`. Latency and k values are illustrative; the log is labelled `example trace` in 10 px mono so it is not mistaken for live data.

### 6.2 Flagship system (`#system`)

Heading: `A production RAG assistant for a multi-brand enterprise support organization`. Eyebrow: `01 · THE SYSTEM`. No product name. **[call]** ("eight-brand" describes the corpus, not the org; the metric label says "8 product brands indexed".)

**Problem** (two sentences): "A support engineer working an escalation searched four to seven disconnected systems by hand: manuals, Confluence, Jira, the KB portal, a community forum, Salesforce cases, and install-log bundles. One lookup took about 30 minutes."

**What it does** (two sentences): "Ask in natural language, optionally upload an install-log bundle. The agent plans a tool path, retrieves across the whole corpus with hybrid BM25 and vector search, reranks with a cross-encoder, calls Jira, Salesforce, Snowflake and licensing tools when it needs them, and answers with citations back to the source documents, in under two minutes."

**Numbers** (grid of small cards, counted up when scrolled into view; the grid carries one caption: `production figures as of November 2026, rounded; quality figures from the public case study`). All values follow the §4 rounding rule; the exact source rows are in Appendix A.

| Group | Values as displayed |
|---|---|
| Corpus | over 1M chunks (around 26 GB) · around 250k unique documents · 8 product brands indexed |
| Sources | over 100k Jira issues · around 64k Salesforce cases · around 60k worklogs · over 10k KB articles · around 4,400 Confluence pages · over 180k closed-case resolution records |
| Usage | over 3,000 questions answered since April 2026 · over 1,000 in the last 30 days, around a quarter more than the 30 before · around 50 questions from around 10 people on an average weekday · peak over 100 questions in a day |
| Usage, people | around 50 of around 75 approved accounts have asked · around 35 active in the last 30 days |
| Growth | around 300 → around 850 → around 1,100 questions, August to October (three-point sparkline) · over 2,300 questions in the last 90 days against around 540 in the 90 before, over 4x · more than double the people |
| Tool mix, 30 days | over 1,300 tool calls: around 700 KB search · around 210 Jira · around 210 Salesforce · around 130 Snowflake case lookups (four-bar strip, bars drawn from the rounded values) |
| Quality | recall@10 0.82 on a 50-question golden set, measured August 2026 on the then 310k-chunk corpus (case study) · 48 of 50 correct vs 26 of 50 for the vendor assistant bundled with the case tool, unrehearsed head-to-head (candidate, 2026-09-14) · forced retries on ungrounded answers 25% → 0% (case study) |
| Engineering | 17 agent tools (case study) · around 19,700 automated tests · over 1,000 merged PRs and over 2,000 commits since April 2026 · around 190k lines of Python and 120k of TypeScript · around 130 test environments built by an automated VM pipeline since September |

**Architecture**: the hero diagram again at full width, same node set (§8.3), sized by a prop. Nodes that map to a case-study component row get a click-to-reveal "why" sentence from the ARCHITECTURE.md component table: hybrid retrieval (search backend + embeddings rows), rerank (reranker row), model box (agent models row); planner and agent loop get one sentence each from the README's Agent row. The five infrastructure components that are not diagram nodes (Postgres 16; Entra ID with approval gate; deferred jobs with a 180 s deadline; golden-set harness gating feature flags; GitHub Actions on self-hosted runners) render under the diagram as a mono caption list, each expandable to its "why" sentence. **[call]**

**What broke after launch** (three items, each title + two sentences, from the case study): the model stopped calling the retrieval tool (seven guardrails, 25% → 0%); nightly ingest burned embedding tokens (cache ceiling, 22.9M → 2.17M tokens a night); a rotated Jira token made a tool lie quietly (loud auth error, silent empties treated as a bug class). A fourth line: "Measured, then held back: Self-RAG off at 1.8x latency for no gain; RAG-Fusion behind a flag at 2.3x."

**How it was built** (one paragraph, names Claude Code): homelab prototype on personal hardware → Azure Container Apps → company-hosted production VM; built with Claude Code and Codex CLI as the daily harness, parallel builder agents on worktrees, adversarial review before merge, production promotion gated on a merged-tree test run.

Closing line with the case-study link: "Full write-up, architecture diagram and incident notes: the public case study." (link text says "public case study", not the product name)

### 6.3 Experience (`#experience`)

Eyebrow `02 · EXPERIENCE`. Four entries, each: company, title, dates, location, three to five bullets. Bullets are action + metric. Rumil may be named here. Wording below is final copy; the candidate profile is the fact check.

- **Johnson Controls** · L3 Technical Support Engineer, Security Products · Sep 2025 to present · Westford, MA (hybrid)
  - Designed and built Rumil, the RAG assistant and 17-tool agent described above, from a homelab prototype to a production system the security-products support organization uses every weekday; an Elasticsearch corpus of over a million chunks across eight brands, Azure OpenAI GPT-5.1, Python/FastAPI and Next.js. Link: public case study.
  - Won director sponsorship, moved it to Azure Container Apps and then to a company-hosted production VM with GitHub Actions CI/CD and around 19,700 automated tests.
  - Measured it: golden-set recall@10 0.82; 48 of 50 correct in an unrehearsed head-to-head against the vendor assistant bundled with the case tool (26 of 50); seven guardrails took ungrounded answers from 25% to 0%; an embed-cache fix cut nightly spend from 22.9M to 2.17M tokens.
  - Resolve L3 escalations for enterprise access-control deployments; built LogDump and AI-driven log and crash-dump triage that cut time to resolution. (The "works customer cases with Claude Code in half the time" clause is **not** published; it describes customer-data handling and is an unmeasured estimate. **[call]**)
- **Pall Corporation** · Senior Engineering Systems Analyst · Jan 2021 to Aug 2025 · Remote
  - Technical lead for the Pall Water divestiture: migrated 3 TB+ of engineering data three weeks early with zero incidents.
  - Cut workstation setup time 72% with PowerShell and SCCM deployment automation across 800+ global endpoints.
  - Managed simulation infrastructure and vendor contracts over USD 1M; ran FlexLM license servers for CATIA, SolidWorks, ANSYS and Autodesk at 99.9% uptime.
  - Stabilized Catia and Windchill Workgroup Manager supporting a USD 300M business unit; authored the SOP library.
  - Built AI-assisted log analysis and automation for the engineering-applications queue.
- **Boyd** · Systems Administrator · Oct 2019 to Jan 2021 · Woburn, MA
  - Primary systems administrator for a 280-person office: servers, network, identity, security.
  - Led the Office 365 and Teams rollout for 100+ staff.
  - Built JavaScript and PostgreSQL integrations syncing PLM and ERP.
- **Boyd (joined as Lytron, acquired Jul 2019)** · Database Administrator · Feb 2018 to Oct 2019 · Woburn, MA
  - Cut Engineering Change Notice cycle time 75%, from 14 days to 3.5.
  - Owned PLM and ERP database administration and reporting.

### 6.4 Projects (`#projects`)

Eyebrow `03 · PROJECTS`. Five cards, each: name, one line of what it does, stack chips, GitHub link. Order:

1. **LogDump** (Rust, C#, PowerShell): single-EXE field utility that arms ProcDump crash and hang capture through a scheduled task, collects log bundles, alerts by email or webhook. Packaged for C·CURE field deployments.
2. **BinarySlicer** (Python, PySide6): desktop decoder for access-control card payloads; formats defined in JSON so it extends without code; Windows releases with SHA256 checksums.
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
- Meta description: "Built and shipped a production RAG assistant and agent over an eight-brand enterprise support corpus: over a million chunks, over 1,000 questions a month, measured on a golden set. Python, Azure OpenAI, Elasticsearch, Claude Code. Boston, remote or hybrid."
- Open Graph image: a 1200×630 render of the hero (static PNG in `public/og.png`, generated once from the built page with Playwright; no runtime rendering). Regenerate whenever hero numbers change.
- `robots.txt` allows all. No analytics.

## 7. "Ask about Matt" assistant

**What it is.** A small grounded chat that answers questions about Matt from a single facts document, with citations to sections of this page. It runs on Claude through a Netlify Function. It exists to show, not tell: the visitor asks the kind of question a screener would ask and gets a cited, honest answer in a few seconds.

**UI.**
- Entry input in the hero (§6.1). Submitting opens a right-side panel on desktop (full-screen sheet on phones) with the conversation. The panel header says "Ask about Matt · answers come from this page and the public case study, generated by Claude. Rate limits only; no questions or addresses are stored."
- Suggestion chips (three, rotated from a list of eight): "Has he run anything in production?", "What's his eval setup?", "Does he know Kubernetes?", "What did he build on his own time?", "What broke after launch?", "Is he open to remote?", "What's his salary floor?" (answer: "not stated on this page; email Matt"), "Which model does the production system use?"
- Answers stream in. Each answer ends with citation chips (`#system`, `#experience`, `#projects`, `#stack`, `Case study`) that scroll the page to the section or open the case study.
- Hard limits shown in the UI: 500 characters per question, 6 questions per visit, then "That's the limit for this visit. Email Matt for the rest."
- Failure contract **[call]**:
  - `429 {reason:"global"}` (daily cap), `503` (no key), any `5xx`: the panel answers the eight suggestion questions from a bundled static answer set and says "Live answers are paused; these are pre-written."
  - `429 {reason:"ip"}` (per-IP hourly limit): "That's the limit for this visit. Email Matt for the rest." No static fallback.
  - `400` (oversize or malformed): "Can't answer live right now. Email Matt."
  - A stream that ends without a `[cite:…]` token is treated as truncated or failed: show the partial text followed by "Email Matt for the rest" instead of citation chips.

**Backend.** `netlify/functions/ask.ts`, Node runtime (not Edge), streaming response.
- Model: `claude-haiku-5-5` by default; `ASK_MODEL` env var can switch to `claude-sonnet-5-5`. Exact SDK usage per the claude-api skill at build time (the builder loads it before writing the function).
- System prompt: a fixed instruction block plus the contents of `shared/facts.md`, sent with prompt caching so the facts are cached across calls. Instructions: answer only about Matthew Raburn and his work; use only the facts document; if a fact is not in it, say "That's not on this page" and suggest email; never speculate about salary, availability dates, or employers' internal details; keep answers under 120 words; end with one to three citation tokens from a fixed list (`[cite:system]`, `[cite:experience]`, `[cite:projects]`, `[cite:stack]`, `[cite:case-study]`) that the client renders as chips; never claim the items on the "do not claim" list even if asked leadingly; it is fine to name Rumil when the visitor asks about it.
- The function awaits the first Anthropic stream event before returning the Response, so API errors map to real HTTP statuses instead of mid-stream failures. **[call]**
- Request shape: `{messages: [{role, content}...]}` with at most 6 user turns, each at most 500 chars; the server truncates and rejects anything larger. `max_tokens` 400.
- Rate limits **[call]**: per-IP 10 questions per hour and a global cap of 300 questions per UTC day, in Netlify Blobs. Per-IP key = first 16 hex chars of SHA-256(`RATE_SALT` env + `context.ip`), stored under `ip/<UTC hour>/<hash>`; global counter under `global/<UTC date>`; both namespaced by `process.env.CONTEXT` so deploy previews do not share production counters. Read-modify-write uses conditional writes (`onlyIfMatch`). Keys under `ip/` older than two hours are pruned on each call. The raw IP is never logged or stored. No question text is stored anywhere.
- Secrets: `ANTHROPIC_API_KEY` and `RATE_SALT` in Netlify environment variables. Never in the repo. The function returns a 503 the client treats as "paused" if the key is unset.
- Abuse posture: the model has no tools and no access beyond the facts document, so the worst case is an off-script sentence. Prompt injection in questions is handled by the system prompt and the fixed citation vocabulary; the client never renders model output as HTML.

**Facts document.** `shared/facts.md` is the single source of truth for the assistant and the provenance record for the page. Scope **[call]**: the §6 copy verbatim, the case-study component "why" sentences and the three post-launch incidents that §6.2 references, the "do not claim" list from the candidate profile, and dated provenance lines (Appendix A rows marked publish). Nothing from the resume that is not on the page; questions outside that set get "That's not on this page" plus the email suggestion. The site's `src/data/site.js` holds the same numbers for display; a Vitest test checks that every numeric value in `site.js` metrics appears in `shared/facts.md`.

**Cost.** Haiku 5.5 with a cached system prompt of roughly 2,500 tokens and 400-token answers costs well under a cent per question; the 300-per-day cap bounds the worst month at a few dollars. (Builder confirms exact pricing from the claude-api skill and records it in the README.)

## 8. Motion specification

Principle: motion reveals, it never gates. Every animation has a finished state that is the plain content, and the page is usable before any animation ends.

### 8.1 Load-in (hero only, once per page load)

Sequence, total 1.6 s, starting when the hero mounts:
1. 0 ms: status line fades in (200 ms).
2. 100 ms: headline lines rise out of clip masks, 80 ms stagger, 900 ms each, ease `cubic-bezier(.2,.8,.2,1)`.
3. 450 ms: lede fades up 18 px (700 ms).
4. 600 ms: metric cards fade up with 60 ms stagger; numbers count from 0 to value over 1,200 ms with ease-out cubic, formatted with thousands separators and the suffix (`1.0M`, `4.4x`).
5. 400 ms: diagram card fades up; edges draw (stroke-dashoffset, 900 ms); at 1,300 ms the pulses start and loop; the trace log types its three lines at 18 ms per character.
6. 900 ms: actions and the ask input fade up.

Implementation note **[call]**: framer-motion is loaded through `LazyMotion` with `domAnimation` and the `m` components to keep the motion bundle small; the headline mask reveal may be plain CSS keyframes so it starts at first paint.

### 8.2 Scroll

- Each section's heading and body blocks rise 18 px and fade in once when 20% visible (`whileInView`, `once: true`), 60 ms stagger between sibling cards.
- Numbers in §6.2 count up when their card enters the viewport, once.
- The sparkline draws its polyline (600 ms) and the tool-mix bars grow from zero (500 ms) when visible.
- The sticky top bar slides down when the hero's bottom passes the viewport top.
- No parallax, no scroll-linked transforms, no smooth-scroll library. Native `scroll-behavior: smooth` for anchor links only.

### 8.3 The request-path diagram

An SVG React component driven by one node and edge list in `src/data/site.js`, rendered in the hero and again at full width in §6.2, sized by a prop. Layout fixed by hand (not auto-layout): a 420×300 viewBox for desktop and a vertical 320×520 variant for phones. Nodes: query → planner → agent loop → cited answer down the left; hybrid retrieval and rerank with the Elasticsearch label on the right; tool fan-out (Jira, Salesforce, Snowflake, licensing) as small labels; the model box (Azure OpenAI GPT-5.1 behind a provider facade) at the bottom. Edges are 1.5 px `--line-2`; pulses are a 6-unit amber dash travelling the edge on a 2.6 s loop with per-edge delays so the flow reads top to bottom then back. Hover or focus on a node with a "why" sentence shows a one-line tooltip. Those nodes are focusable buttons; plain labels are not.

### 8.4 Hover and press

Cards: border color from `--line` to `--line-2` and 2 px lift, 160 ms. Buttons: 2% brightness change, scale 0.98 on press. Links: underline offset 4 px on hover. Nothing else moves on hover.

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
| `--fg-2` | `#9AA0AA` | secondary text (7.4:1 on `--bg`) |
| `--fg-3` | `#777E8A` | labels, eyebrows, chips, captions (4.79:1 on `--bg`, 4.62:1 on `--bg-2`) **[call]** |
| `--accent` | `#FFB020` | amber: status dot, headline word, primary button, pulses |
| `--ok` | `#5BD38A` | one use: the latency in the trace log |

Type: Inter Tight 800 for display (headline 60 px desktop, 40 px phone, letter-spacing -0.035em, line-height 1.0); Inter 400/500 for body (16 px, line-height 1.55, measure 46 to 60 ch); JetBrains Mono 400/500 for labels, metrics, chips, the diagram and the trace log (11 to 13 px, uppercase labels at 0.1em tracking). Fonts self-hosted as static-weight woff2 through `@fontsource` packages (Inter 400 and 500, Inter Tight 800, JetBrains Mono 400 and 500; about 114 kB latin total), preloaded, `font-display: swap`. No Google Fonts request. **[call]**

Radii 6 px for buttons and chips, 10 px for cards. Borders 1 px. No drop shadows except a 0 0 0 9px amber ring on the status dot's pulse. Spacing scale 4/8/16/24/32/48/64/96 px. Grid: 12 columns, 24 px gutters, 1,200 px max.

Light mode: none. The page is dark only, with `color-scheme: dark` declared.

## 10. Technical decisions (decided)

- **Keep:** React 19, Vite 7 (port 3001, outDir `build`), Tailwind 3, framer-motion 12, lucide-react, Vitest + Testing Library, Netlify (`netlify.toml`, `_redirects`).
- **Remove:** react-router-dom (single route; `App.jsx` renders the page directly), recharts, papaparse, web-vitals, `intellisense`, `react-is`, `netlify-cli` from devDependencies if unused by scripts. Delete `src/pages/VinylDashboard.jsx`, `src/components/DiscogsCollectionPanel.jsx`, `netlify/functions/discogs-collection.ts`, `public/fan500.json`, `public/ccure_9000_client.png`, all brutalist components and their tests, `src/routes.js(x)`, `src/reportWebVitals.js`, `README_CHAT_HELP.txt`, `filelist.txt`, `listing.txt`, `ruvector.db` (already gitignored), `public/MatthewRaburnResume-25.pdf` and `src/assets/Matthew_Raburn_Resume.pdf` (replaced by one `public/Matthew_Raburn_Resume.pdf`).
- **Add:** `@anthropic-ai/sdk` and `@netlify/blobs` (function only), `@fontsource/inter`, `@fontsource/inter-tight`, `@fontsource/jetbrains-mono` (static weights).
- **Structure:**
  - `src/App.jsx` composes sections in order.
  - `src/sections/{Hero,System,Experience,Projects,Stack,Contact}.jsx`
  - `src/components/{TopBar,Metric,Sparkline,BarStrip,RequestPath,TraceLog,Ask,Chip,Card,Reveal}.jsx`
  - `src/data/site.js` (all copy, numbers, nodes and edges, projects, experience)
  - `shared/facts.md` (assistant grounding and provenance)
  - `netlify/functions/ask.ts` and `netlify/functions/lib/ratelimit.ts` (pure limiter logic, unit-tested without Netlify)
  - `src/lib/motion.js` (shared variants, reduced-motion hook)
- **Rendering:** client-rendered SPA as today. No prerender in this iteration. If the Netlify preview misses Lighthouse performance 95, a React 19 `prerender` of the hero into `index.html` with CSS-keyframe load-in is the follow-up, not a redesign. **[call]**
- **Diagram and charts** are hand-written SVG. No chart library.
- **Streaming** from the function uses a plain `ReadableStream` of text chunks; the client appends as they arrive and strips `[cite:…]` tokens into chips.
- **Tests (Vitest):** page renders all six section headings; no "Rumil" in text content before the Experience heading; reduced-motion renders the headline immediately; every numeric value in `site.js` metrics appears in `shared/facts.md`; `Ask` component handles `429 global` (static fallback), `429 ip` (limit copy), `503` (static fallback), `400` (can't answer); the limiter denies the 11th request in an hour for one hash and the 301st in a day globally.
- **Performance budget:** JS under 150 kB gzipped total, fonts under 120 kB, no layout shift from counters (reserve width with `font-variant-numeric: tabular-nums`). Gate: Lighthouse performance 95+ on the Netlify preview (mobile preset). LCP under 1.5 s is a desktop, unthrottled target, not a gate. **[call]**
- **Accessibility:** semantic landmarks and headings, interactive diagram nodes are buttons with labels, focus rings 2 px amber, contrast at least 4.5:1 for all text, skip link to `#system`.

## 11. Generated media (optional, last, does not block)

**[answered]** The candidate wants the loop generated now, as part of this build, not after launch. It remains non-blocking: the page must look finished with the slot empty, and the asset lands in the last task of the plan.

- **Slot:** a looping ambient texture behind the hero at 6 to 8% opacity (slow drifting amber and slate light on black, no recognizable objects, no text), WebM + MP4 + a poster PNG, muted, `playsinline`, paused under reduced motion and on `prefers-reduced-data`, lazy-loaded after LCP. Under 1.5 MB.
- **Prompt (for ArtCraft, Veo 3.1 Fast or Kling 2.6):** "Abstract slow-motion loop, near-black background, faint amber and slate light trails drifting diagonally like data moving along fiber, very low contrast, seamless loop, no text, no objects, 16:9, 8 seconds."
- Generation path **[open, §15]**: ArtCraft's Omni API needs an account-gated API key (`artcraft_api_…`, see the ArtCraft repo's `_docs/artcraft_omni_api.md`); the desktop app needs a display session. If the candidate provides the key as `ARTCRAFT_API_KEY`, the builder scripts the generation (Veo 3.1 Fast or Kling 2.6, 8 s, 16:9, 1080p) and the poster extraction with ffmpeg. Otherwise the candidate runs the prompt above in the app and drops `hero-loop.webm`, `hero-loop.mp4` and `hero-poster.jpg` into `public/media/`.

## 12. Resume PDF

The site serves one PDF at `public/Matthew_Raburn_Resume.pdf`, linked from the hero, the top bar and the contact section, with `download` and a stable filename.

**[answered]** A general resume is rebuilt with the November figures in the ai-job-search workspace (`cv/main_general_applied_ai.tex` from the `resume.cls` template, compiled with lualatex, run through that workspace's full verification checklist: exactly two pages, no orphaned headings, ATS text-layer check, no Education section, Claude Code named). Its figures follow the same rounding rule as the page. The compiled PDF is copied into `public/` as the last content task before the PR.

## 13. Acceptance

The redesign is done when all of these hold on the Netlify preview of the `signal-redesign` branch:

1. On a 1440×900 desktop the hero, metric row, diagram and three actions are visible without scrolling. On a 390×844 phone the status line, headline, lede, metric row and three actions are visible without scrolling; the diagram follows below the fold.
2. No "Rumil" in text content above the Experience section; test passes.
3. Every number on the page is the §4 rounding of an Appendix A row or an exact case-study measurement; a reviewer checks them against `shared/facts.md` line by line. The updated case study and the page agree.
4. The assistant answers the eight suggestion questions correctly with citations, refuses an off-topic question politely, falls back to static answers when the key is removed, shows the per-visit limit copy on the 11th question in an hour from one address, and the global cap returns the static fallback.
5. Reduced-motion mode shows the complete page with nothing pending.
6. Lighthouse on the preview (mobile preset): performance 95+, accessibility 100, no console errors.
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

## 15. Questions for the candidate

Answered 2026-11-04:

1. **Case study currency:** update the public case study to the November figures in the same change set. **[answered]**
2. **What is public:** publish the held groups, generalized with "over" or "around" (the §4 rounding rule). **[answered]**
3. **Resume PDF:** rebuild a general resume with the November figures. **[answered]**
4. **ArtCraft loop:** generate now. **[answered]**
5. **Deploy secrets:** the candidate adds `ANTHROPIC_API_KEY` and `RATE_SALT` to Netlify at deploy time. **[answered]**

Still open:

6. **ArtCraft generation path.** Provide an ArtCraft API key (`ARTCRAFT_API_KEY`) so the build can script the loop, or run the §11 prompt in the ArtCraft app and drop the three files into `public/media/`. **[open]**

## Appendix A. Production stats dump, 2026-11-04 (provenance)

Pasted by the candidate on 2026-11-04 ("all live as of today, team-only; operator aliases, QA and test users excluded"). Exact values stay in this appendix only; the page shows the rounded form in the last column. Rows marked *internal* are never published.

| Row | Exact value | Published as |
|---|---|---|
| Questions answered all-time (since 2026-04-14) | 3,117 | over 3,000 since April 2026 |
| People who have asked | 54 of 74 approved accounts (73%) | around 50 of around 75 approved accounts |
| Questions, last 30 days | 1,059 (prior 30: 854, +24%) | over 1,000; around a quarter more than the 30 before |
| Active users, last 30 days | 35 (16 L3, 12 Support, 5 Managers) | around 35 (role split internal) |
| Weekday average, last 30 days | 48 questions / 10 distinct people per day | around 50 questions from around 10 people |
| Peak day | 120 questions (Oct 14); 16 people (Nov 2) | peak over 100 questions in a day (people count not shown) |
| 90 days vs the 90 before | 2,353 vs 540 questions, 4.4×; 44 vs 20 people | over 2,300 vs around 540, over 4x; more than double the people |
| Monthly growth | Aug 302 → Sep 862 → Oct 1,091 questions | around 300 → around 850 → around 1,100 |
| Brand split, 30 d | Software House 75%, Kantech 23% | internal |
| Tool calls, 30 d | 1,332: KB search 706, Jira 212, Salesforce 211, Snowflake case lookup 130 | over 1,300: around 700 / 210 / 210 / 130 |
| Chunks in the index | 1,011,268 (26 GB) | over 1M (around 26 GB); hero shows `1M+` |
| Unique documents | 250,527 | around 250k |
| Jira issues / Salesforce cases / worklogs | 106,243 / 64,245 / 59,910 | over 100k / around 64k / around 60k |
| KB portal articles + Confluence pages | 10,567 + 4,376 | over 10k + around 4,400 |
| Brands covered | 8 (Software House, Kantech, SES, American Dynamics, CEM, Cloudvue, Exacq, Illustra), 5 portal brands ingested nightly | 8 (count only; brand names and the nightly split not shown) |
| Closed-case resolution records | 181,652 across 8 brands | over 180k |
| Open L3 cases tracked | 272 | internal (feature name) |
| VMs built by the pipeline since Sep 1 | 129 | around 130 test environments since September |
| VMs on the hypervisor now | 107 (75 running) | internal |
| Merged PRs / commits since 2026-04-16 | 1,070 / 2,130 | over 1,000 PRs, over 2,000 commits since April 2026 |
| Lines of code | 194k Python + 122k TypeScript | around 190k Python and 120k TypeScript |
| Automated tests | 17,244 backend + 2,461 frontend | around 19,700 |
| Production commit hash | (omitted) | internal |
