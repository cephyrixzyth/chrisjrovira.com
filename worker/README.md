# Virtual Chris guide Worker

The Worker retrieves reviewed notes from `assistant-knowledge.json` and generates short answers with Cloudflare Workers AI. It allows requests from the portfolio site, applies daily and per-visitor request limits, and returns source labels with answers. It does not store visitor questions; the Durable Object retains request counts using a truncated hash of the connecting IP.

Deploy from the repository root with:

```sh
npx wrangler deploy --config worker/wrangler.jsonc
```

Keep the knowledge file limited to approved, public-safe information. Do not add internal Roku procedures, partner configurations, incident information, unpublished metrics, résumé source files, credentials, or private planning material.

