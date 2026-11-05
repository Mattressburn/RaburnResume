// Single source of page copy. Production figures are the rounded "published as" forms;
// measured quality figures and small counts stay exact. shared/facts.md mirrors this copy.

const CASE_STUDY = 'https://github.com/Mattressburn/rumil-case-study'
const GITHUB = 'https://github.com/Mattressburn'
const RESUME = '/Matthew_Raburn_Resume.pdf'

const suggestions = [
  'Has he run anything in production?',
  "What's his eval setup?",
  'Does he know Kubernetes?',
  'What did he build on his own time?',
  'What broke after launch?',
  'Is he open to remote?',
  "What's his salary floor?",
  'Which model does the production system use?',
]

export const site = {
  meta: {
    title: 'Matthew Raburn · Applied AI Engineer',
    description:
      'Built and shipped a production RAG assistant and agent over an eight-brand enterprise support corpus: over a million chunks, over 1,000 questions a month, measured on a golden set. Python, Azure OpenAI, Elasticsearch, Claude Code. Boston, remote or hybrid.',
  },

  hero: {
    status: 'PRODUCTION RAG ASSISTANT · ANSWERING SINCE APR 2026 · ~100-PERSON SUPPORT ORG',
    headline: ['Production RAG.', 'Shipped, measured,', 'in daily use.'],
    accentWord: 'measured,',
    lede:
      "I'm Matthew Raburn. I took a retrieval assistant from a homelab prototype to the production agent an enterprise support org uses on its escalations every weekday. Python, Azure OpenAI, Elasticsearch, Claude Code. Lowell, MA. Remote or Boston hybrid.",
    metrics: [
      { value: 1, decimals: 0, suffix: 'M+', label: 'chunks indexed', display: '1M+' },
      { value: 8, decimals: 0, suffix: '', label: 'product brands indexed', display: '8' },
      { value: 1000, decimals: 0, suffix: '+', label: 'questions, last 30 days', display: '1,000+' },
      { value: 4, decimals: 0, suffix: 'x+', label: 'last 90 days vs the 90 before', display: '4x+' },
    ],
    metricsCaption: 'production figures as of Nov 4, 2026',
    actions: [
      { label: 'Read the case study', href: CASE_STUDY, kind: 'primary', external: true },
      { label: 'Resume PDF', href: RESUME, kind: 'secondary', download: true },
      { label: 'GitHub', href: GITHUB, kind: 'secondary', external: true },
    ],
  },

  trace: [
    'retrieve  k=40  rerank → 8   412 ms',
    'tool  jira.search  "controller offline after upgrade"',
    'answer  grounded · 3 citations',
  ],

  diagram: {
    nodes: [
      { id: 'query', label: 'Question', kind: 'box' },
      {
        id: 'planner',
        label: 'Planner',
        kind: 'box',
        why: 'A planner stage classifies the query and picks a tool path; guardrails can overrule the planner.',
      },
      {
        id: 'agent',
        label: 'Agent loop',
        sub: '17 tools',
        kind: 'box',
        why: 'A tool-use loop with 17 tools; if the model answers without calling the knowledge base, the loop forces a retry.',
      },
      { id: 'answer', label: 'Cited answer', kind: 'box' },
      {
        id: 'retrieval',
        label: 'Hybrid retrieval',
        sub: 'BM25 + vector',
        kind: 'box',
        why: 'One Elasticsearch index serves both BM25 and vectors, self-hosted alongside the app. Embeddings are truncated to 1536 dimensions, which halves storage with small quality loss.',
      },
      {
        id: 'rerank',
        label: 'Rerank',
        sub: 'cross-encoder',
        kind: 'box',
        why: 'Self-hosted cross-encoder reranker on CPU: no GPU required, loaded from a local weights volume.',
      },
      {
        id: 'model',
        label: 'Azure OpenAI GPT-5.1',
        sub: 'provider facade',
        kind: 'box',
        why: 'The provider facade keeps the vendor swappable without touching the agent loop, and models are A/B measured per request.',
      },
      { id: 'tools', label: 'Jira · Salesforce · Snowflake · licensing', kind: 'label' },
      { id: 'es', label: 'Elasticsearch 8 · over 1M chunks', kind: 'label' },
    ],
    edges: [
      { from: 'query', to: 'planner', delay: 0 },
      { from: 'planner', to: 'agent', delay: 0.4 },
      { from: 'agent', to: 'answer', delay: 0.8 },
      { from: 'planner', to: 'retrieval', delay: 0.6 },
      { from: 'agent', to: 'retrieval', delay: 1.0 },
      { from: 'retrieval', to: 'model', delay: 1.4 },
      { from: 'retrieval', to: 'rerank', delay: 0.9 },
    ],
    layouts: {
      desktop: {
        viewBox: [420, 300],
        pos: {
          query: { x: 10, y: 20, w: 110, h: 24 },
          planner: { x: 10, y: 90, w: 110, h: 30 },
          agent: { x: 10, y: 170, w: 110, h: 30 },
          answer: { x: 10, y: 250, w: 110, h: 30 },
          retrieval: { x: 250, y: 128, w: 110, h: 44 },
          rerank: { x: 250, y: 184, w: 110, h: 30 },
          es: { x: 258, y: 112, w: 150, h: 14 },
          tools: { x: 18, y: 214, w: 200, h: 14 },
          model: { x: 258, y: 256, w: 102, h: 30 },
        },
      },
      phone: {
        viewBox: [320, 520],
        pos: {
          query: { x: 10, y: 20, w: 300, h: 40 },
          planner: { x: 10, y: 100, w: 300, h: 40 },
          retrieval: { x: 10, y: 180, w: 300, h: 40 },
          rerank: { x: 10, y: 224, w: 300, h: 14 },
          es: { x: 10, y: 240, w: 300, h: 14 },
          agent: { x: 10, y: 260, w: 300, h: 40 },
          tools: { x: 10, y: 304, w: 300, h: 14 },
          model: { x: 10, y: 340, w: 300, h: 40 },
          answer: { x: 10, y: 420, w: 300, h: 40 },
        },
      },
    },
  },

  system: {
    eyebrow: '01 · THE SYSTEM',
    heading: 'A production RAG assistant for a multi-brand enterprise support organization',
    problem:
      'A support engineer working an escalation searched four to seven disconnected systems by hand: manuals, Confluence, Jira, the KB portal, a community forum, Salesforce cases, and install-log bundles. One lookup took about 30 minutes.',
    what:
      'Ask in natural language, optionally upload an install-log bundle. The agent plans a tool path, retrieves across the whole corpus with hybrid BM25 and vector search, reranks with a cross-encoder, calls Jira, Salesforce, Snowflake and licensing tools when it needs them, and answers with citations back to the source documents, in under two minutes.',
    numbersCaption:
      'production figures as of November 2026, rounded; quality figures from the public case study',
    numbers: [
      {
        name: 'Corpus',
        items: [
          { display: 'over 1M chunks', label: 'in the index' },
          { display: 'around 26 GB', label: 'index size' },
          { display: 'around 250k', label: 'unique documents' },
          { display: '8', label: 'product brands indexed' },
        ],
      },
      {
        name: 'Sources',
        items: [
          { display: 'over 100k', label: 'Jira issues' },
          { display: 'around 64k', label: 'Salesforce cases' },
          { display: 'around 60k', label: 'worklogs' },
          { display: 'over 10k', label: 'KB articles' },
          { display: 'around 4,400', label: 'Confluence pages' },
          { display: 'over 180k', label: 'closed-case resolution records' },
        ],
      },
      {
        name: 'Usage',
        items: [
          { display: 'over 3,000', label: 'questions answered since April 2026' },
          { display: 'over 1,000', label: 'questions in the last 30 days, around a quarter more than the 30 before' },
          { display: 'around 50', label: 'questions on an average weekday' },
          { display: 'around 10', label: 'people asking on an average weekday' },
          { display: 'over 100', label: 'questions on the peak day' },
        ],
      },
      {
        name: 'Usage, people',
        items: [
          { display: 'around 50 of around 75', label: 'approved accounts have asked' },
          { display: 'around 35', label: 'active in the last 30 days' },
        ],
      },
      {
        name: 'Growth',
        items: [
          { display: 'around 300 → around 850 → around 1,100', label: 'questions, August to October' },
          { display: 'over 2,300', label: 'questions in the last 90 days' },
          { display: 'around 540', label: 'questions in the 90 days before' },
          { display: 'over 4x', label: 'growth between the two periods' },
          { display: 'more than double', label: 'the people asking' },
        ],
      },
      {
        name: 'Tool mix, 30 days',
        items: [
          { display: 'over 1,300', label: 'tool calls' },
          { display: 'around 700', label: 'KB search' },
          { display: 'around 210', label: 'Jira' },
          { display: 'around 210', label: 'Salesforce' },
          { display: 'around 130', label: 'Snowflake case lookups' },
        ],
      },
      {
        name: 'Quality',
        items: [
          { display: '0.82', label: 'recall@10 on a 50-question golden set, measured August 2026 on the then 310k-chunk corpus (case study)' },
          { display: '48 of 50', label: 'correct, unrehearsed head-to-head (candidate, 2026-09-14)' },
          { display: '26 of 50', label: 'correct for the vendor assistant bundled with the case tool' },
          { display: '25% → 0%', label: 'forced retries on ungrounded answers (case study)' },
        ],
      },
      {
        name: 'Engineering',
        items: [
          { display: '17', label: 'agent tools (case study)' },
          { display: 'around 19,700', label: 'automated tests' },
          { display: 'over 1,000', label: 'merged PRs since April 2026' },
          { display: 'over 2,000', label: 'commits since April 2026' },
          { display: 'around 190k', label: 'lines of Python' },
          { display: 'around 120k', label: 'lines of TypeScript' },
          { display: 'around 130', label: 'test environments built by an automated VM pipeline since September' },
        ],
      },
    ],
    growth: { labels: ['Aug', 'Sep', 'Oct'], values: [300, 850, 1100] },
    toolMix: [
      { label: 'KB search', value: 700 },
      { label: 'Jira', value: 210 },
      { label: 'Salesforce', value: 210 },
      { label: 'Snowflake', value: 130 },
    ],
    incidents: [
      {
        title: 'The model stopped calling the retrieval tool',
        body: 'After a model change, the agent began answering from its own memory instead of calling the knowledge-base tool, and about a quarter of requests fell into the forced-retry path. Seven guardrails, including a forced retry and a planner gate, took forced retries from 25% → 0%.',
      },
      {
        title: 'Nightly ingest burned embedding tokens',
        body: 'The embed cache had a 0% hit rate because its ceiling was smaller than one ingest pass, so every entry was evicted before reuse. Raising the ceiling took the hit rate to 100% and nightly spend from 22.9M → 2.17M tokens.',
      },
      {
        title: 'A rotated Jira token made a tool lie quietly',
        body: 'After a credential rotation, the Jira tool returned zero issues instead of an error, so trend reports showed nothing. The client now raises a loud auth error, and silent empty results are treated as a bug class.',
      },
    ],
    heldBack: 'Measured, then held back: Self-RAG off at 1.8x latency for no gain; RAG-Fusion behind a flag at 2.3x.',
    built:
      'It started as a homelab prototype on personal hardware, moved to Azure Container Apps, and now runs on a company-hosted production VM. I built it with Claude Code and Codex CLI as the daily harness: parallel builder agents on worktrees, adversarial review before merge, and production promotion gated on a merged-tree test run.',
    infra: [
      { label: 'Postgres 16', why: 'Holds sessions, the query log, diagnostics and approval state.' },
      { label: 'Entra ID with approval gate', why: 'Enterprise identity without a custom user store.' },
      {
        label: 'Deferred jobs, 180 s deadline',
        why: 'Analytical questions over case data exceed a chat-turn budget, so they run as a background job with a 180-second deadline and a placeholder response.',
      },
      {
        label: 'Golden-set harness gating feature flags',
        why: 'A 50-question golden set with three control baselines gates feature flags; two baselines were shown to be too noisy to detect regressions.',
      },
      {
        label: 'GitHub Actions on self-hosted runners',
        why: 'Runs inside the company network with no managed cloud dependency.',
      },
    ],
    closing: 'Full write-up, architecture diagram and incident notes: the public case study.',
    caseStudy: { label: 'public case study', href: CASE_STUDY },
  },

  experience: [
    {
      company: 'Johnson Controls',
      title: 'L3 Technical Support Engineer, Security Products',
      period: 'Sep 2025 to present',
      location: 'Westford, MA (hybrid)',
      bullets: [
        'Designed and built Rumil, the RAG assistant and 17-tool agent described above, from a homelab prototype to a production system the security-products support organization uses every weekday; an Elasticsearch corpus of over a million chunks across eight brands, Azure OpenAI GPT-5.1, Python/FastAPI and Next.js.',
        'Won director sponsorship, moved it to Azure Container Apps and then to a company-hosted production VM with GitHub Actions CI/CD and around 19,700 automated tests.',
        'Measured it: golden-set recall@10 0.82; 48 of 50 correct in an unrehearsed head-to-head against the vendor assistant bundled with the case tool (26 of 50); seven guardrails took ungrounded answers from 25% to 0%; an embed-cache fix cut nightly spend from 22.9M to 2.17M tokens.',
        'Resolve L3 escalations for enterprise access-control deployments; built LogDump and AI-driven log and crash-dump triage that cut time to resolution.',
      ],
      link: { label: 'public case study', href: CASE_STUDY },
    },
    {
      company: 'Pall Corporation',
      title: 'Senior Engineering Systems Analyst',
      period: 'Jan 2021 to Aug 2025',
      location: 'Remote',
      bullets: [
        'Technical lead for the Pall Water divestiture: migrated 3 TB+ of engineering data three weeks early with zero incidents.',
        'Cut workstation setup time 72% with PowerShell and SCCM deployment automation across 800+ global endpoints.',
        'Managed simulation infrastructure and vendor contracts over USD 1M; ran FlexLM license servers for CATIA, SolidWorks, ANSYS and Autodesk at 99.9% uptime.',
        'Stabilized Catia and Windchill Workgroup Manager supporting a USD 300M business unit; authored the SOP library.',
        'Built AI-assisted log analysis and automation for the engineering-applications queue.',
      ],
    },
    {
      company: 'Boyd',
      title: 'Systems Administrator',
      period: 'Oct 2019 to Jan 2021',
      location: 'Woburn, MA',
      bullets: [
        'Primary systems administrator for a 280-person office: servers, network, identity, security.',
        'Led the Office 365 and Teams rollout for 100+ staff.',
        'Built JavaScript and PostgreSQL integrations syncing PLM and ERP.',
      ],
    },
    {
      company: 'Boyd (joined as Lytron, acquired Jul 2019)',
      title: 'Database Administrator',
      period: 'Feb 2018 to Oct 2019',
      location: 'Woburn, MA',
      bullets: [
        'Cut Engineering Change Notice cycle time 75%, from 14 days to 3.5.',
        'Owned PLM and ERP database administration and reporting.',
      ],
    },
  ],

  projects: [
    {
      name: 'LogDump',
      blurb:
        'Single-EXE field utility that arms ProcDump crash and hang capture through a scheduled task, collects log bundles, alerts by email or webhook. Packaged for C·CURE field deployments.',
      stack: ['Rust', 'C#', 'PowerShell'],
      href: `${GITHUB}/ProcDumpMonitor`,
    },
    {
      name: 'BinarySlicer',
      blurb:
        'Desktop decoder for access-control card payloads; formats defined in JSON so it extends without code; Windows releases with SHA256 checksums.',
      stack: ['Python', 'PySide6'],
      href: `${GITHUB}/BinarySlicer`,
    },
    {
      name: 'CCurator',
      blurb: 'Chrome extension plus companion service that turns Salesforce Service Cloud cases into structured JSON for triage.',
      stack: ['JavaScript', '.NET'],
      href: `${GITHUB}/CCurator`,
    },
    {
      name: 'BackStamp',
      blurb: 'Identifies vintage Pyrex from a photo and prices it against eBay comps; Hono API, 40 tests.',
      stack: ['TypeScript', 'Expo', 'Claude vision'],
      href: `${GITHUB}/BackStamp`,
    },
    {
      name: 'This site',
      blurb: 'The page you are reading, including the assistant below. Source on GitHub.',
      stack: ['React 19', 'Netlify Functions', 'Claude'],
      href: `${GITHUB}/RaburnResume`,
    },
  ],

  stack: [
    {
      group: 'Retrieval and agents',
      items: [
        'hybrid BM25 + vector retrieval',
        'Elasticsearch 8',
        'Azure AI Search',
        'text-embedding-3-large',
        'cross-encoder reranking (BGE, Qwen3)',
        'hand-built tool-use loops',
        'guardrails and forced-retry grounding',
        'golden-set evals (recall@k, MRR, LLM-as-judge)',
        'feature-flag A/B promotion',
      ],
    },
    {
      group: 'Models and tooling',
      items: [
        'Azure OpenAI (GPT-5.1, GPT-4.1)',
        'Anthropic Claude API',
        'Claude Code',
        'Codex CLI',
        'prompt engineering',
        'structured outputs',
      ],
    },
    {
      group: 'Build',
      items: [
        'Python',
        'FastAPI',
        'pytest',
        'TypeScript',
        'React 19',
        'Next.js 15',
        'Node',
        'Playwright',
        'Vitest',
        'Docker Compose',
        'GitHub Actions',
        'PostgreSQL',
        'SQL Server',
        'Snowflake',
      ],
    },
    {
      group: 'Platform',
      items: [
        'Azure (Container Apps, Entra ID, Key Vault)',
        'AWS (EC2, S3, IAM, Lambda, RDS)',
        'Linux',
        'PowerShell',
        'SCCM',
        'Intune',
        'Active Directory',
      ],
    },
    {
      group: 'Local inference (homelab)',
      items: [
        'llama.cpp serving Qwen3.8-27B on an RX 9070 XT, about 1,029 tok/s prompt and 32 tok/s generation; personal use',
      ],
    },
  ],
  stackNote: 'Not on my record: Kubernetes operation, model training, PyTorch. I say so before you ask.',

  contact: {
    eyebrow: '05 · CONTACT',
    line: 'Hiring for applied AI, forward-deployed, or solutions engineering? Email me.',
    email: 'raburnmh@gmail.com',
    linkedin: 'https://www.linkedin.com/in/matthewraburn',
    github: GITHUB,
    resume: RESUME,
    footer: '© 2026 Matthew Raburn · Lowell, MA · Built with React, Netlify Functions and Claude. Source on GitHub.',
  },

  ask: {
    placeholder: 'Ask about Matt: has he run anything in production?',
    suggestions,
    fallback: {
      [suggestions[0]]:
        'Yes. He built a production RAG assistant and agent that the support organization for Johnson Controls security products has used on its escalations every weekday since April 2026. It answers over 1,000 questions in a typical 30 days from a corpus of over 1M chunks across 8 product brands, and usage is over 4x what it was 90 days earlier. It moved from a homelab prototype to Azure Container Apps and then to a company-hosted production VM. (Experience)',
      [suggestions[1]]:
        'A 50-question golden set scores recall@10 at 0.82 (measured August 2026 on the then 310k-chunk corpus). Evals also use three control baselines, LLM-as-judge plus deterministic checks, and feature-flag A/B promotion gated on the harness. In an unrehearsed head-to-head the assistant got 48 of 50 correct against 26 of 50 for the vendor assistant bundled with the case tool. Self-RAG was turned off after the harness showed no gain at 1.8x latency. (System)',
      [suggestions[2]]:
        'Not on his record. He understands the concepts, but he has not operated Kubernetes in production, and he says so up front. His platform experience is Azure Container Apps, Docker Compose, GitHub Actions on self-hosted runners, Linux, and a company-hosted production VM. (Stack)',
      [suggestions[3]]:
        'Outside his day job he built LogDump, a single-EXE field utility for ProcDump crash capture and log collection; BinarySlicer, a desktop decoder for access-control card payloads; CCurator, a Chrome extension that turns Salesforce cases into structured JSON; and this site, including this assistant. BackStamp is a hobby app that identifies vintage Pyrex from a photo with Claude vision. (Projects)',
      [suggestions[4]]:
        'Three things. The model stopped calling the retrieval tool; seven guardrails took forced retries from 25% → 0%. Nightly ingest burned embedding tokens because of a cache ceiling; the fix took spend from 22.9M → 2.17M tokens a night. A rotated Jira token made a tool return silent empties; the client now raises a loud auth error. (System)',
      [suggestions[5]]:
        'Yes. He is based in Lowell, MA and is open to remote work or a Boston hybrid arrangement. His current role at Johnson Controls is hybrid out of Westford, MA, and his previous role at Pall Corporation was fully remote. (Experience)',
      [suggestions[6]]:
        "That's not stated on this page. Email Matt at raburnmh@gmail.com and he can discuss compensation directly. (Contact)",
      [suggestions[7]]:
        'The production assistant runs on Azure OpenAI GPT-5.1, with GPT-4.1 earlier, behind a provider facade so the vendor can be swapped without touching the agent loop. Claude Code is the tool he built it with, and the assistant on this site runs on Claude. (System)',
    },
  },
}
