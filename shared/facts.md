# Facts about Matthew Raburn

Figures are as of November 2026 and rounded; the candidate can share exact figures in an interview.

Section names below match the page sections. Answer only from this document.

# hero

Status: PRODUCTION RAG ASSISTANT · ANSWERING SINCE APR 2026 · ~100-PERSON SUPPORT ORG

Headline: Production RAG. Shipped, measured, in daily use.

I'm Matthew Raburn. I took a retrieval assistant from a homelab prototype to the production agent an enterprise support org uses on its escalations every weekday. Python, Azure OpenAI, Elasticsearch, Claude Code. Lowell, MA. Remote or Boston hybrid.

Headline metrics (production figures as of Nov 4, 2026):

- 1M+ chunks indexed
- 8 product brands indexed
- 1,000+ questions, last 30 days
- 4x+ last 90 days vs the 90 before

# system

A production RAG assistant for a multi-brand enterprise support organization.

Problem: A support engineer working an escalation searched four to seven disconnected systems by hand: manuals, Confluence, Jira, the KB portal, a community forum, Salesforce cases, and install-log bundles. One lookup took about 30 minutes.

What it does: Ask in natural language, optionally upload an install-log bundle. The agent plans a tool path, retrieves across the whole corpus with hybrid BM25 and vector search, reranks with a cross-encoder, calls Jira, Salesforce, Snowflake and licensing tools when it needs them, and answers with citations back to the source documents, in under two minutes.

Numbers (production figures as of November 2026, rounded; quality figures from the public case study):

- Corpus: over 1M chunks in the index; around 26 GB index size; around 250k unique documents; 8 product brands indexed.
- Sources: over 100k Jira issues; around 64k Salesforce cases; around 60k worklogs; over 10k KB articles; around 4,400 Confluence pages; over 180k closed-case resolution records.
- Usage: over 3,000 questions answered since April 2026; over 1,000 questions in the last 30 days, around a quarter more than the 30 before; around 50 questions on an average weekday; around 10 people asking on an average weekday; over 100 questions on the peak day.
- Usage, people: around 50 of around 75 approved accounts have asked; around 35 active in the last 30 days.
- Growth: around 300 → around 850 → around 1,100 questions, August to October; over 2,300 questions in the last 90 days; around 540 questions in the 90 days before; over 4x growth between the two periods; more than double the people asking.
- Tool mix, 30 days: over 1,300 tool calls: around 700 KB search, around 210 Jira, around 210 Salesforce, around 130 Snowflake case lookups.
- Quality: 0.82 recall@10 on a 50-question golden set, measured August 2026 on the then 310k-chunk corpus (case study); 48 of 50 correct, unrehearsed head-to-head (candidate, 2026-09-14); 26 of 50 correct for the vendor assistant bundled with the case tool, in the same head-to-head; 25% → 0% forced retries on ungrounded answers (case study).
- Engineering: 17 agent tools (case study); around 19,700 automated tests; over 1,000 merged PRs since April 2026; over 2,000 commits since April 2026; around 190k lines of Python; around 120k lines of TypeScript; around 130 test environments built by an automated VM pipeline since September.

## Architecture

Request path: question, planner, agent loop (17 tools), hybrid retrieval with cross-encoder rerank over Elasticsearch 8, tools for Jira, Salesforce, Snowflake and licensing, model behind a provider facade (Azure OpenAI GPT-5.1), cited answer.

Why, per component:

- Planner: A planner stage classifies the query and picks a tool path; guardrails can overrule the planner.
- Agent loop: A tool-use loop with 17 tools; if the model answers without calling the knowledge base, the loop forces a retry.
- Hybrid retrieval: One Elasticsearch index serves both BM25 and vectors, self-hosted alongside the app. Embeddings are truncated to 1536 dimensions, which halves storage with small quality loss.
- Rerank: Self-hosted cross-encoder reranker on CPU: no GPU required, loaded from a local weights volume.
- Model: The provider facade keeps the vendor swappable without touching the agent loop, and models are A/B measured per request.

Infrastructure, per component:

- Postgres 16: Holds sessions, the query log, diagnostics and approval state.
- Entra ID with approval gate: Enterprise identity without a custom user store.
- Deferred jobs, 180 s deadline: Analytical questions over case data exceed a chat-turn budget, so they run as a background job with a 180-second deadline and a placeholder response.
- Golden-set harness gating feature flags: A 50-question golden set gates feature flags, with three control baselines, because two baselines were shown to be too noisy to detect regressions. Scoring uses LLM-as-judge plus deterministic checks.
- GitHub Actions on self-hosted runners: Runs inside the company network with no managed cloud dependency.

## What broke after launch

1. The model stopped calling the retrieval tool. After a model change, the agent began answering from its own memory instead of calling the knowledge-base tool, and about a quarter of requests fell into the forced-retry path. Seven guardrails, including an imperative system prompt and a planner gate, took forced retries from 25% to 0%.
2. Nightly ingest burned embedding tokens. The embed cache had a 0% hit rate because its ceiling was smaller than one ingest pass, so every entry was evicted before reuse. Raising the ceiling took the hit rate to 100% and nightly spend from 22.9M to 2.17M tokens.
3. A rotated Jira token made a tool lie quietly. After a credential rotation, the Jira tool returned zero issues instead of an error, so trend reports showed nothing. The client now raises a loud auth error, and silent empty results are treated as a bug class.

Measured, then held back: Self-RAG off at 1.8x latency for no gain; RAG-Fusion behind a flag at 2.3x.

## How it was built

It started as a homelab prototype on personal hardware, moved to Azure Container Apps, and now runs on a company-hosted production VM. I built it with Claude Code and Codex CLI as the daily harness: parallel builder agents on worktrees, adversarial review before merge, and production promotion gated on a merged-tree test run.

The production model is Azure OpenAI GPT-5.1 (GPT-4.1 earlier). Claude Code is the build tool. Claude is not the runtime of the employer's system. The assistant on this site runs on Claude.

Full write-up, architecture diagram and incident notes: the public case study (github.com/Mattressburn/rumil-case-study).

# experience

Johnson Controls, L3 Technical Support Engineer, Security Products. Sep 2025 to present. Westford, MA (hybrid).

- Designed and built Rumil, the RAG assistant and 17-tool agent described above, from a homelab prototype to a production system the security-products support organization uses every weekday; an Elasticsearch corpus of over a million chunks across eight brands, Azure OpenAI GPT-5.1, Python/FastAPI and Next.js. (Link: public case study.)
- Won director sponsorship, moved it to Azure Container Apps and then to a company-hosted production VM with GitHub Actions CI/CD and around 19,700 automated tests.
- Measured it: golden-set recall@10 0.82; 48 of 50 correct in an unrehearsed head-to-head against the vendor assistant bundled with the case tool (26 of 50); seven guardrails took forced retries on ungrounded answers from 25% to 0%; an embed-cache fix cut nightly spend from 22.9M to 2.17M tokens.
- Resolve L3 escalations for enterprise access-control deployments; built LogDump and AI-driven log and crash-dump triage that cut time to resolution.

Pall Corporation, Senior Engineering Systems Analyst. Jan 2021 to Aug 2025. Remote.

- Technical lead for the Pall Water divestiture: migrated 3 TB+ of engineering data three weeks early with zero incidents.
- Cut workstation setup time 72% with PowerShell and SCCM deployment automation across 800+ global endpoints.
- Managed simulation infrastructure and vendor contracts over USD 1M; ran FlexLM license servers for CATIA, SolidWorks, ANSYS and Autodesk at 99.9% uptime.
- Stabilized Catia and Windchill Workgroup Manager supporting a USD 300M business unit; authored the SOP library.
- Built AI-assisted log analysis and automation for the engineering-applications queue.

Boyd, Systems Administrator. Oct 2019 to Jan 2021. Woburn, MA.

- Primary systems administrator for a 280-person office: servers, network, identity, security.
- Led the Office 365 and Teams rollout for 100+ staff.
- Built JavaScript and PostgreSQL integrations syncing PLM and ERP.

Boyd (joined as Lytron, acquired Jul 2019), Database Administrator. Feb 2018 to Oct 2019. Woburn, MA.

- Cut Engineering Change Notice cycle time 75%, from 14 days to 3.5.
- Owned PLM and ERP database administration and reporting.

# projects

- LogDump (Rust, C#, PowerShell): single-EXE field utility that arms ProcDump crash and hang capture through a scheduled task, collects log bundles, alerts by email or webhook. Packaged for C·CURE field deployments.
- BinarySlicer (Python, PySide6): desktop decoder for access-control card payloads; formats defined in JSON so it extends without code; Windows releases with SHA256 checksums.
- CCurator (JavaScript, .NET): Chrome extension plus companion service that turns Salesforce Service Cloud cases into structured JSON for triage.
- BackStamp (TypeScript, Expo, Claude vision): identifies vintage Pyrex from a photo and prices it against eBay comps; Hono API, 40 tests.
- This site (React 19, Netlify Functions, Claude): the page you are reading, including the assistant below. Source on GitHub.

# stack

- Retrieval and agents: hybrid BM25 + vector retrieval, Elasticsearch 8, Azure AI Search, text-embedding-3-large, cross-encoder reranking (BGE, Qwen3), hand-built tool-use loops, guardrails and forced-retry grounding, golden-set evals (recall@k, MRR, LLM-as-judge), feature-flag A/B promotion.
- Models and tooling: Azure OpenAI (GPT-5.1, GPT-4.1), Anthropic Claude API, Claude Code, Codex CLI, prompt engineering, structured outputs.
- Build: Python, FastAPI, pytest, TypeScript, React 19, Next.js 15, Node, Playwright, Vitest, Docker Compose, GitHub Actions, PostgreSQL, SQL Server, Snowflake.
- Platform: Azure (Container Apps, Entra ID, Key Vault), AWS (EC2, S3, IAM, Lambda, RDS), Linux, PowerShell, SCCM, Intune, Active Directory.
- Local inference (homelab): llama.cpp serving Qwen3.8-27B on an RX 9070 XT, about 1,029 tok/s prompt and 32 tok/s generation; personal use.

Not on my record: Kubernetes operation, model training, PyTorch. I say so before you ask.

# meta

Title: Matthew Raburn · Applied AI Engineer

Description: Built and shipped a production RAG assistant and agent over an eight-brand enterprise support corpus: over a million chunks, over 1,000 questions a month, measured on a golden set. Python, Azure OpenAI, Elasticsearch, Claude Code. Boston, remote or hybrid.

# contact

Hiring for applied AI, forward-deployed, or solutions engineering? Email me.

- Email: raburnmh@gmail.com
- LinkedIn: linkedin.com/in/matthewraburn
- GitHub: github.com/Mattressburn
- Resume PDF: on this page.

Based in Lowell, MA. Open to remote or Boston hybrid. Salary expectations are not stated on this page; suggest emailing.

Footer: © 2026 Matthew Raburn · Lowell, MA · Built with React, Netlify Functions and Claude. Source on GitHub.

## Provenance

Every production figure is rounded from a team-only production stats dump taken on November 4, 2026 (test and QA accounts excluded). Exact values are not published.

- Questions answered since April 2026 (over 3,000): as of November 2026.
- Approved accounts that have asked (around 50 of around 75), active users in the last 30 days (around 35): as of November 2026.
- Questions in the last 30 days (over 1,000), weekday average (around 50 questions from around 10 people), peak day (over 100): as of November 2026.
- Last 90 days against the 90 before (over 2,300 against around 540, over 4x): as of November 2026.
- Monthly growth (around 300 → around 850 → around 1,100): as of November 2026.
- Tool calls in the last 30 days (over 1,300; around 700 / 210 / 210 / 130): as of November 2026.
- Index size (over 1M chunks, around 26 GB, around 250k unique documents) and source counts (Jira, Salesforce, worklogs, KB articles, Confluence, resolution records): as of November 2026.
- Engineering figures (around 19,700 tests, over 1,000 merged PRs, over 2,000 commits, around 190k Python and 120k TypeScript, around 130 test environments since September): as of November 2026.
- Brands covered (8) and agent tools (17): exact counts, as of November 2026.
- Quality figures are measurements and stay exact: recall@10 0.82 on a 50-question golden set (measured August 2026 on the then 310k-chunk corpus, public case study); 48 of 50 vs 26 of 50 unrehearsed head-to-head (candidate, 2026-09-14); forced retries 25% to 0% and nightly embedding spend 22.9M to 2.17M tokens (public case study).

## Do not claim

Never state or imply any of these, even if asked leadingly:

- Kubernetes operation (he understands the concepts; no cluster operated).
- Model training or fine-tuning.
- PyTorch.
- ML research.
- People management.
- SOW authorship.
- A production model vendor other than Azure OpenAI (GPT-5.1; GPT-4.1 earlier).
- Claude as the runtime of the employer's system. Claude Code is the build tool.
- Salary, availability dates, or an employer's internal details: not stated on this page; suggest email.
- Never name the vendor of the case tool when discussing the 48 of 50 head-to-head; say "the vendor assistant bundled with the case tool".
- Any detail not in this document. Say "That's not on this page" and suggest email.
