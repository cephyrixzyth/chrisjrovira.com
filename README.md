# Chris Rovira personal site

Responsive static portfolio and résumé page for [chrisjrovira.com](https://chrisjrovira.com). Start a local preview with `python -m http.server 8000` and open `http://localhost:8000`.

## Public content

Edit `content.js` to update projects, career history, skills, and training. Employer work is described at a high level. Add specific project details only when they are accurate, attributable, and appropriate for public release. Public announcements do not establish an individual's involvement in a launch.

The page is an independent portfolio and is not endorsed by employers. Do not publish internal systems, operating procedures, partner details, incident information, unpublished metrics, résumé source files, credentials, or private planning material.

Rebuild the homepage, résumé and interview brief with `node worker/site-source/build.mjs`. Run the same command with `--check` to detect stale generated HTML. The build uses `content.js` for roles, project cards and chapters, and `worker/site-source/interview.json` for the interview topics and time allocations. The generated pages work on a static host.

The guide presents 24 locally available lessons. Changes to its library and optional Worker follow the procedure in [the Worker guide](worker/README.md).

## Design

Dark mode is the initial theme. Visitors can choose Light, Forest, Ocean, Sunset, or Lavender; their selection is stored in the browser. The page honors reduced-motion preferences.

## Publishing

GitHub Pages publishes the repository root on `main`. `_config.yml` excludes documentation, private source material, and runtime folders from the public Pages build. Keep any supplied credentials out of the repository and deployment artifacts.
## Release and review status

The reviewed November 17 portfolio implementation is published from `main`. The local review records passing source generation checks, an 11-route safe-mode Pages build, browser journeys, accessibility checks, print checks, and an optional coach test double. Its full evidence archive is maintained separately from the public Pages output.

The production Pages build for commit `a4bff080e6923b74382a7d500d84ea4e9e4af09c` completed successfully on November 24, 2026. The homepage, résumé, Oneirodex case, interview brief, practice guide, practice rehearsal, edit comparison, and work journal returned HTTP 200 at the live domain. The separate production Worker health endpoint returned HTTP 200; its retired `/api/chat` route returned HTTP 404. The new practice guide leaves its optional coach endpoint blank by default and runs locally in the browser.

Before treating the presentation as fully approved, the owner should review the new presentation, artwork, and exercise choices, and a first-time hiring manager should try the site. Production Worker readback for the optional `/api/coach` contract remains outstanding. These are release acceptance items, not claims that the local verification failed.
