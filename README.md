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
npx netlify dev --port 8888
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

The assistant answers only from `shared/facts.md` and ends each answer with `[cite:<section>]` tokens that the page renders as chips. No questions or addresses are stored; the rate limiter keeps a salted hash of the address for two hours.

Environment variables (Netlify site settings, never in the repo):

- `ANTHROPIC_API_KEY`: required. Without it the function returns 503 and the panel shows pre-written answers.
- `RATE_SALT`: required, any random string. It salts the hashed address used as the rate-limit key.
- `ASK_MODEL`: optional. Defaults to `claude-opus-5-5`; this site sets `ASK_MODEL=claude-haiku-5-5`.

Limits: 10 questions per hour per address and 300 questions per UTC day across all visitors, counted in Netlify Blobs.

Cost: Claude Opus 5.5 costs $4 / $20 per million input / output tokens. With a 2.5k-token system prompt and 400-token answers that is about 1.8 cents a question uncached, so the 300-per-day cap bounds a month at about $160 worst case, and a typical month costs a few dollars. Claude Haiku 5.5 costs $0.10 / $0.50 per million tokens, roughly forty times cheaper, which is why this site runs Haiku through `ASK_MODEL`. The facts block is prompt-cached, so repeat questions within a few minutes pay less for input.

## Design

The spec and implementation plan live under `docs/superpowers/`.

## Deploy

Netlify auto-deploys on push to `main`. Branch deploys preview at `<branch>--<site>.netlify.app`.
