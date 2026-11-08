# CyStation Rarewhere redesign: review record (7 Nov 2026)

Branch `redesign/rarewhere-site`. Nothing committed, published or pushed.

## Direction
Rare's own "Rarewhere" site as it stood in Oct–Nov 2000 (verified on the Wayback Machine): `bgcolor=#000060`, cream `#FFFFDD` text, `#FFDD00` links, a 600px column, an italic gold top bar, engraved gold deco titles, and zig-zag rows of character renders with short witty copy. Rebuilt as real HTML text with modern accessibility. Pinned by the owner, so Impeccable's direction roll was not run.

## Evidence
- `verify.py` → `verify.json`, `shots/` (13 routes × desktop 1440 / mobile 390; 320px checked without captures).
  - 0px horizontal overflow at 1440, 390 and 320 on every page; one h1 per page; no duplicate ids; every `<img>` has an alt attribute; description and og:image on every page; body ground `rgb(0, 0, 96)` everywhere, including the 404.
  - Expected flags only: the seven Conker gallery strips sit inside the collapsed research `<details>` (lazy, load when opened: all seven 1280×217 confirmed), and the 404 page logs its own 404 status.
  - Keyboard: skip link → `#main`; every early tab stop shows a 3px white outline.
  - Native returns: TND Options link `/patches#tnd6480i` and PD links `/patches#pd6480iperf` land on visible `:target` rows; `/tnd6480i/#q-branch` opens the Q-Branch page, `/pd6480iperf/#editions` the editions view; no page errors.
  - Conker viewer: 7 skyboxes, selection loads and updates hash/caption/title, ArrowRight pans 80px, `#notes` opens the research.
- `check_links.py` → `link-check.json`: 15 pages, 142 local references, 0 missing (the 404 page resolved from a nested path). External: 50 links; failures are bot/rate limits (CodePen 403, Steam 429) and three canonical URLs not yet live (`/pd6480iperf/`, `/tnd6480i/`, `/privacy`).
- `home-before-after.json` (1440 wide, lazy images loaded): live homepage 2477px tall, 1011 KB, first PD link at y=749 → new homepage 1843px, 234 KB, first PD button at y=377.
- `impeccable-detect.json`: 137 advisories. Low-contrast hits assume a white page (rendered: cream 17.6:1, gold 13:1, sky 11:1 on #000060); gradient text and stripes are the Rarewhere engraving and the 240p/480i scanline diagram; "Arial" is the period UI label face; em dashes are the archived skybox names. No mechanical fixes needed.
- Protected pages: `protected-game-pages.sha256` still matches for TND/PD CSS and JS; each `index.html` gained exactly 10 og:/twitter meta lines (CRLF preserved; `diff` shows only the insertion).
- `asset-provenance.md`: every new raster, its source and transformation.

## Finish review (run in-thread; the owner asked for no subagents)
disposition: fix → applied → ship (for the scored fix)
- persistence: PRODUCT.md, DESIGN.md (token frontmatter), SITEMAP.md, surface briefs updated. Code-led build (no image generation used), so no comp state applies.
- fidelity (against OWN-WORLD, no comp): TYPE match (Limelight gilt titles; owner-pinned Arial Black wordmark with offset shadow). GROUND match (`#000060` measured on every page). MATERIAL: the hatched gilt and bevel buttons are CSS versions of Rarewhere's own digital lettering and button graphics, not imitations of a physical material; accepted adaptation, citing the owner's Rareware brief. First viewport holds: bar, wordmark, render, "Out now" with both release buttons above the fold at 1280×800 and 390×844.
- ceiling: Rarewhere's rollover image swaps on the bar are reduced to colour and underline changes; per-game page theming stays with the native TND/PD pages.
- material_fixes: (1) TND blurb credited only TiJay and Wreck; the dossier credits "TiJay, Wreck and the TND64 team" → fixed in `patches.html`.
- contract note: FORM records `seed: none (direction pinned by the owner, roll not run)`, a disclosed deviation from Impeccable's roll requirement rather than an oversight.
- keep: the flat navy field, the engraved gilt and the render-led zig-zag rows.

## Remaining limitations
- Analytics are wired but OFF: GoatCounter needs the owner's account and a code in `analytics.js`, plus the replacement paragraph in `privacy.html`.
- There are no AI endpoints on the site, so rate limits and spend caps don't apply.
- Browsers can still block audible autoplay on a fresh direct visit to the TND/PD menus (unchanged, by design).
- The touch icons upscale a 39×50 balloon sprite; a larger source would sharpen the 512px icon.
- Unreferenced leftovers kept for safety: `home.css`, `timeline-months.css`, `cursor.css`, `patch-select.js`.
- Not tested on physical iOS/Android devices or Safari/Firefox engines; checks used Chromium.
