# Virtual Chris Worker

This is the private server side for the portfolio's AI guide. It uses Cloudflare Workers AI and a small, reviewed knowledge file shared with the static site. It does not use the OpenAI API key.

## Free-first setup

1. Confirm the Cloudflare account is using the Workers Free plan. Workers AI includes 10,000 Neurons/day on Free; the Worker also caps requests at 100/day total and 8/hour per visitor. On the Free plan, exhausted daily limits fail closed.
2. In a terminal at the portfolio folder, run `npx wrangler login` and follow Cloudflare's browser sign-in.
3. Deploy with `npx wrangler deploy --config worker/wrangler.jsonc`.
4. Copy the deployed `workers.dev` origin into `assistant-config.js`, for example `https://virtual-chris-guide.YOUR-SUBDOMAIN.workers.dev` (no trailing slash).
5. Publish the static site files listed in the root README. The Worker is deployed separately.

The Worker accepts only the production portfolio domains and the local port 8000 preview. It validates message size, retrieves up to four notes, keeps answers short, and returns source links. It does not persist questions, answers, or conversation history; a small durable counter stores only the daily total and short-lived hashed visitor counts. No model key is put in browser code.

For local preview, leave `assistant-config.js` blank. The chat then shows exact source matches from `assistant-knowledge.json` and clearly labels them as non-generative preview responses.
