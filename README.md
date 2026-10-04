# Chris Rovira personal site

Responsive static portfolio and résumé page. Start a local preview from this folder with:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000`.

## Content updates

Edit `content.js` to add or revise projects, the featured story reel, work history, skills, and training. Story chapters are shown one at a time with a horizontally scrollable title index. Each story can later include one full-width media source (`media: { type: "video", src: "/media/clip.mp4", poster: "/media/poster.webp" }`) or an approved video embed (`media: { type: "embed", src: "https://www.youtube-nocookie.com/embed/VIDEO_ID" }`). Until Chris supplies a clip, the chapter uses designed artwork in the same player-sized frame. Add Roku launch stories only after Chris confirms his involvement; public launch announcements alone do not establish attribution.

The old Google Sites page lists the current Roku title as **Technical Operations Manager**, starting November 2020, and has the expanded Roku responsibilities and launch highlights. The résumé archive includes additional detail for earlier roles and training. The archived 2021 résumé PDF is not linked because it predates the current profile information.

## Design references reviewed

- [Brittany Chiang](https://brittanychiang.com/) — direct role statement, one-page flow, clear paths to work and contact.
- [Lee Robinson](https://leerob.com/) — compact professional bio, credibility through past roles, and focused topic links.
- [Josh W. Comeau](https://www.joshwcomeau.com/) — lively editorial feel and small purposeful interactions; this page keeps motion restrained and honors reduced-motion preferences.

The page uses those patterns for its opening statement, project cards, career timeline, simple navigation, interactive filters, and keyboard-friendly controls.

## Themes

Dark is the default. Visitors can choose Light, Forest, Ocean, Sunset, or Lavender. Their choice is stored in the browser.

## Publishing

GitHub Pages publishes this static site from the root of `main`. The `CNAME` file maps it to `chrisjrovira.com`; HTTPS enforcement and the custom-domain certificate are active.

Porkbun DNS now points the apex to GitHub Pages and `www` to `cephyrixzyth.github.io`; nameservers were left as configured. GitHub reports a successful Pages build. HTTPS enforcement is pending certificate issuance after DNS propagation. Preserve any existing mail records if DNS is changed later.
## Analytics

The Oneirodex marketing site uses Cloudflare Web Analytics. This site includes the same provider through `analytics.js`. The loader uses the site-specific Cloudflare Web Analytics token configured in `analytics-config.js`:

```js
window.SITE_ANALYTICS_TOKEN = "YOUR_CHRISJROVIRA_COM_TOKEN";
```

Do not copy the Oneirodex token into this site; each domain should have its own analytics property so the reports remain separate.

## Private project board

The local Virtual Chris/free-hosting review board is in `.project-board/`. Preview it at `http://localhost:8000/.project-board/` while the local server is running. Keep this private planning folder out of any published file set; the portfolio publishing list above is intentionally explicit.

## Virtual Chris

The guide's review board is at `.project-board/`. Public, source-linked knowledge is maintained in `assistant-knowledge.json`; add or expand career entries only after Chris confirms them. The Cloudflare Worker backend and free-tier deployment notes are in `worker/`. `assistant-config.js` points to the deployed Worker. The local chat preview retrieves source passages without calling an AI model when no endpoint is configured.
