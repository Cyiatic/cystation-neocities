# CyStation sitemap and flow

Main bar on every main page: **CyStation (home) · 480i Patches · Render Restore · Timeline**, plus an up-arrow to the parent on sub-pages. Footer on every main page: **Outposts** (GitHub, Internet Archive, Twitter, YouTube, About, Credits), then **Directory · Links · Privacy**.

| Area | Route | Role |
| --- | --- | --- |
| Home | `/` | Wordmark, both released patches with their actions, one row each for Patches, Render Restore, Timeline |
| 480i Patches | `/patches` | Out now (PD, TND) and In the works (CBFD, DKR, YS, F-Zero X, KI Gold); anchors `#pd6480iperf #tnd6480i #cbfd480i #dkr480i #ys6480i #f0x6480idd #kig480i` |
| PD6480iPerf | `/pd6480iperf/` | Native Perfect Dark menu; Options → Return to CyStation → `/patches#pd6480iperf`; shortcut `#editions` |
| TND6480i | `/tnd6480i/` | Native dossier; Options → Return to CyStation → `/patches#tnd6480i`; shortcut `#q-branch` |
| YS6480i | `/ys6480i/` | Native storybook menu (in development, no build); CyStation choice → `/patches#ys6480i`; deep link `#status` |
| F0X6480iDD | `/fzerox/` | Native F-Zero X menu (in development, no build); returns to `/patches`; uses the shared `patch-menu/` folder |
| KIG480i | `/killer-instinct-gold/` | Native Killer Instinct Gold menu with its intro video (in development, no build); returns to `/patches`; uses `patch-menu/` |
| Why 480i? | `/why-480i` | Guide under Patches; `#catalog` holds the N64 New Soft Catalog mark |
| Render Restore | `/render-restore.html` | Filings newest first, plus the Internet Archive collection |
| Conker's Skyboxes | `/render-restore/conker-skyboxes.html` | RR-001 viewer; `#skybox_00`…`#skybox_06` select a strip, `#notes` opens sources & research |
| Tools of the Trade | `/render-restore/tools-of-the-trade.html` | RR-000 composite record |
| Timeline | `/projects` | Every project since 2015, with a year jump bar (`#y2026`…`#y2015`) |
| Directory | `/navigation` | Complete map (footer link) |
| About, Credits, Links | `/aboutme`, `/credits`, `/links` | Footer pages |
| Privacy | `/privacy` | Hosting, analytics, local storage and third-party notes |
| 404 | `/not_found.html` | Neocities custom 404; root-absolute paths so it works at any depth (noindex) |

Cross-links: CBFD480i ↔ Conker's Skyboxes; Render Restore → Why 480i? `#catalog`; Why 480i? → both released patches; every filing → its neighbour and the hub.

Unchanged URLs: every previous route still resolves. Retired from the bar: "Station" (now the CyStation home link) and "Directory" (now in the footer).

Publish `patch-menu/` together with `/fzerox/` and `/killer-instinct-gold/`; both menus load it.

Machine files: `/sitemap.xml` lists the 17 canonical pages; `/robots.txt` disallows `/practice/` and `/output/`; `/site.webmanifest`, `/favicon.ico`, `/favicon-32.png`, `/apple-touch-icon.png`; Open Graph images in `/images/site/og-*.jpg`.

Not for upload: `output/`, `.agent/`, `.impeccable/`, `.claude/`, `.playwright-cli/`, `practice/`, `scripts/`, `images/source/`, the `*.md` docs, `NULL`. Unreferenced after the redesign (safe to delete; backups kept): `home.css`, `timeline-months.css`, `cursor.css` (its rules now live in `style.css`), `patch-select.js`.
