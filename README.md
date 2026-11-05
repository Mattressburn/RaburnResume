# Matthew Raburn: Portfolio

hireraburn.com, the single-page portfolio of Matthew Raburn (Applied AI Engineer), with an "Ask about Matt" assistant that answers from the page's own facts document.

## Stack

- React 19 + Vite 7
- Tailwind 3, framer-motion
- Netlify Functions (`netlify/functions/ask.mts`) with Netlify Blobs for rate limits
- Anthropic TypeScript SDK (`@anthropic-ai/sdk`) for the assistant
- Vitest

## Local dev

```bash
npm install
npm start
# Vite dev server on :3001
```

To run the site and the assistant function together, put the environment variables below in a gitignored `.env` and run:

```bash
npx netlify dev
```

## Build

```bash
npm run build       # outputs to ./build
npm run preview     # serve the built bundle
npm run test        # run vitest suite
```

`prebuild`, `pretest` and `prestart` regenerate `shared/facts.generated.js` from `shared/facts.md`.

## Routes

- `/`: the portfolio page
- `POST /.netlify/functions/ask`: the assistant, body `{messages: [{role, content}...]}`, streams plain text

## Ask about Matt

The assistant answers only from `shared/facts.md` and ends each answer with `[cite:<section>]` tokens that the page renders as chips. No questions or addresses are stored. The rate limiter counts per salted hash of the address; address counters are kept for the current hour and the two before it, and pruning runs when a new address key is created.

Environment variables (Netlify site settings, never in the repo):

- `ANTHROPIC_API_KEY`: required. Without it the function returns 503 and the panel shows pre-written answers.
- `RATE_SALT`: required, any random string. It salts the hashed address used as the rate-limit key.
- `ASK_MODEL`: optional. Defaults to `claude-opus-5-5`; this site sets `ASK_MODEL=claude-haiku-5-5`.

Limits: 10 questions per hour per address and 300 questions per UTC day across all visitors, counted in Netlify Blobs.

Cost: the system prompt (instructions plus the facts document) measures about 5,600 tokens, and a cold request pays the cache write (1.25x input). A typical question costs about 3.4 cents on Claude Opus 5.5 ($4 / $20 per million input / output tokens) and about 0.085 cents on Claude Haiku 5.5 ($0.10 / $0.50 per million). The ceiling per request, with a full conversation history (about 13,000 characters from the browser) and all 600 output tokens (thinking included), is roughly 5 to 6 cents on Opus and about 0.13 cents on Haiku. At the 300-per-day cap that is about $450 to $550 a month on Opus and about $12 on Haiku; a typical month is a few dollars on either. This site runs Haiku through `ASK_MODEL`.

## Design

The spec and implementation plan live under `docs/superpowers/`.

## Deploy

Netlify auto-deploys on push to `main`. Branch deploys preview at `<branch>--<site>.netlify.app`.
