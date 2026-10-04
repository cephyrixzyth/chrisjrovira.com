# Chris Rovira personal site

Responsive static portfolio and résumé page. Start a local preview from this folder with:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Content updates

Edit `content.js` to add or revise projects, work history, skills, and training. Roku project cards are structured separately from their presentation so future examples can be added without changing the layout. Add new Roku project examples after Chris confirms his involvement.

The old Google Sites page lists the current Roku title as **Technical Operations Manager**, starting November 2020, and has the expanded Roku responsibilities and launch highlights. The résumé archive includes additional detail for earlier roles and training. The archived 2021 résumé PDF is not linked because it predates the current profile information.

## Design references reviewed

- [Brittany Chiang](https://brittanychiang.com/) — direct role statement, one-page flow, clear paths to work and contact.
- [Lee Robinson](https://leerob.com/) — compact professional bio, credibility through past roles, and focused topic links.
- [Josh W. Comeau](https://www.joshwcomeau.com/) — lively editorial feel and small purposeful interactions; this page keeps motion restrained and honors reduced-motion preferences.

The page uses those patterns for its opening statement, project cards, career timeline, simple navigation, interactive filters, and keyboard-friendly controls.

## Themes

Dark is the default. Visitors can choose Light, Forest, Ocean, Sunset, or Lavender. Their choice is stored in the browser.

## Porkbun publishing

This is a static site: publish `index.html`, `styles.css`, `app.js`, `content.js`, `assistant.js`, `assistant-config.js`, `assistant-knowledge.json`, `analytics.js`, `analytics-config.js`, and `favicon.svg` to the hosting document root. The domain currently uses Porkbun nameservers, but its apex has no address record, so it needs a hosting target and DNS configuration before it can resolve to this site. Keep existing email records when updating DNS.

## Analytics

The Oneirodex marketing site uses Cloudflare Web Analytics. This site includes the same provider through `analytics.js`. The loader is wired, but tracking stays off until a separate Cloudflare Web Analytics token is created for `chrisjrovira.com` and placed in `analytics-config.js`:

```js
window.SITE_ANALYTICS_TOKEN = "YOUR_CHRISJROVIRA_COM_TOKEN";
```

Do not copy the Oneirodex token into this site; each domain should have its own analytics property so the reports remain separate.

## Private project board

The local Virtual Chris/free-hosting review board is in `.project-board/`. Preview it at `http://localhost:8000/.project-board/` while the local server is running. Keep this private planning folder out of any published file set; the portfolio publishing list above is intentionally explicit.

## Virtual Chris

The guide's review board is at `.project-board/`. Public, source-linked knowledge is maintained in `assistant-knowledge.json`; add or expand career entries only after Chris confirms them. The Cloudflare Worker backend and free-tier deployment notes are in `worker/`. `assistant-config.js` points to the deployed Worker. The local chat preview retrieves source passages without calling an AI model when no endpoint is configured.
