# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Retro-game players, preservationists, and modding enthusiasts who want to find CyStation's 480i patch work, understand its release state, and follow projects still in development.

## Product Purpose

CyStation is Cyiatic's home for Nintendo 64 480i patches, recovered game renders, and project history. Success means visitors can immediately tell released work from work in progress and reach a patch's own page, its downloads, or the relevant archive record within a click or two.

## Positioning

The site presents technical patch work through the character-led manner of Rare's own "Rarewhere" site of 2000: each destination is announced by engraved gold lettering and a real game render, not a generic download list.

## Operating Context

The site is static HTML, CSS, and a little JavaScript, published to Neocities and mirrored in the `Cyiatic/cystation-neocities` GitHub repository. Releases link to separate GitHub repositories; preservation uploads live on the Internet Archive. Neocities serves `not_found.html` as the custom 404 page.

## Capabilities and Constraints

- Released: TND6480i (`/tnd6480i/`, July 2026) and PD6480iPerf (`/pd6480iperf/`, September 2026). In development with no public build: CBFD480i, DKR480i, YS6480i, F0X6480iDD (F-Zero X and its Expansion Kit) and KIG480i (Killer Instinct Gold). Never present a download for unreleased work.
- Native game menus are the project pages: TND, PD, YS (`/ys6480i/`), F-Zero X (`/fzerox/`) and Killer Instinct Gold (`/killer-instinct-gold/`). They keep their own visuals, audio, cursors and viewport-filling layout and never load the main stylesheet. TND and PD return through their native Options to `/patches#tnd6480i` and `/patches#pd6480iperf`, YS to `/patches#ys6480i`, F-Zero X and KI Gold to `/patches`. Shortcuts `/tnd6480i/#q-branch` and `/pd6480iperf/#editions` open downloads and installation directly. Browsers may block audible autoplay on a fresh visit; never promise otherwise.
- Patches and Render Restore are separate areas with cross-links (CBFD480i ↔ Conker's Skyboxes; Why 480i? ↔ the N64 New Soft Catalog mark).
- Conker's Skyboxes opens on its pannable viewer; every source link, caption, ROM identifier and research note stays in the same page.
- Practice routes are development copies, excluded from the sitemap and robots, and marked noindex.
- Keyboard access, visible focus, reduced motion, phone widths down to 320px, and fast loads on static hosting are requirements. No framework, no build step.
- No accounts, forms, cookies or ads. Analytics stay off until the owner configures GoatCounter in `analytics.js` and updates the privacy page.

## Brand Commitments

- Keep the CyStation name and the pre-Microsoft Rareware feel: royal navy `#000060`, cream `#FFFFDD`, gold. Not the lighter post-2002 blue.
- The CYSTATION wordmark is the heavy uppercase lettering with its offset shadow (Arial Black), sized to fit.
- Use authentic Rare/Nintendo renders and existing project art; never generate replacement character art.
- Outposts lives in the footer with the six googly-eyed icons: GitHub, Internet Archive, Twitter, YouTube, About, Credits.

## Evidence on Hand

- Rarewhere reference (Wayback Machine, rareware.com, Oct–Nov 2000): `bgcolor=#000060 text=#ffffdd link=#ffdd00 vlink=#bbaa00`, 600px column, italic gold top bar, engraved-gold deco titles, zig-zag render rows, bottom section bar.
- Renders and art in `images/` (Conker on the Rareware R, Bond, Diddy's plane, the Scribes quill, box art, project logos, Conker skybox strips; the Banjo month and year sprites are retired from the Timeline but kept in the repo).
- Project facts in the TND and PD reading views and in the timeline.

## Product Principles

- Keep the homepage short: identity, the two released patches with their actions in the first viewport, then one row each for Patches, Render Restore and Timeline.
- State a patch's release state before decoration; say "no public build" plainly.
- Let authentic characters and project art carry navigation and personality.
- One mention per thing per page: no repeated route cards, labels above headings, fake status lights or signal/transmission language.
- Old-web warmth, current accessibility.

## Accessibility & Inclusion

Semantic landmarks and one h1 per page, a skip link, visible 3px focus rings, 44px targets, meaningful alt text on informative images, reduced-motion support, and layouts verified at 1440, 390 and 320px.
