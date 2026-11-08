# TND6480i webpage

The standalone CyStation patch page lives at `/tnd6480i/`. It uses the TND console dossier as the whole page, with the user's horizontally scaled Analogue 3D framing, in-game OPTIONS, the original cursor and stock GoldenEye selection sounds, and Clasiku's Briefing album recording. Main-menu OPTIONS (or O) contains Music, Sound effects, Compare game text, Read text, Full screen when supported, and Return to CyStation. PREVIOUS returns from OPTIONS to the section that opened it. The reading sheet is keyboard accessible and the installation/download information remains available without JavaScript.

CyStation's home/project selectors, timeline, Why 480i page and directory link here. The old `/practice/tnd6480i/` URL redirects with its query and section hash intact. The previous practice implementation remains in that folder as historical source; edit this canonical folder for future webpage changes.

The page opens at save selection (#files), matching the supplied four-folder screenshot. All four folders enter the same patch menu (#menu), whose PREVIOUS tab returns to file selection. Direct briefing links still work. The original Copy/Erase artwork is decorative; this webpage stores no game saves.

## Assets

Runtime assets include the menu/font/cursor PNGs, the save-select backdrop and three footer graphics, bitmap font metadata, two stock GoldenEye WAVs, the user's unchanged Briefing MP3, two reference captures, and the supplied xdelta. No ROM, decomp checkout, extraction output or old experimental asset is part of this page. The save-select assets are reproducible through `output/tnd-console-reference/render_save_select.py`, using the existing local ROM and decoder. Texture blur mode 7 is a no-op, matching GE's texBlur; footer sprites use the game's inverted V orientation.

The xdelta remains `TND64_Expanded_11-24_480i-Cyiatic.xdelta` (MD5 `5e0447557b0d275e265c54bd1cb98553`). It targets g1mcfix4; it is not the later project BPS release. The album MP3 SHA-256 is `b13c80cbe0c98d0acef4b82cfa0004144de64d2f47737353536368bb18fea5b3`. Music now defaults to on at each load and attempts autoplay. If browser policy blocks it, a trusted click/key starts it. OPTIONS can mute it for the remainder of the visit; reload returns to on. SFX retains its saved preference. Music loops without resetting on navigation and pauses when the tab is hidden. See [MDN's autoplay guide](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay) for the browser restriction.

`DESIGN.md` records visual constraints. The eight 2026-10-27 A3D captures supersede the older stock TND64 composition. Native 640x480 bitmap text wraps at 465 units; original paper luminance is restored. A 16:9 presentation frame reproduces the capture's black surround and horizontal scaling. The browser does not simulate interlace; 1080i output is handled by the user's display setup. Measurements and extraction provenance live in `output/tnd-console-reference/`; `a3d-calibration.json` records measured positional errors and limitations. Exact pixel identity to console hardware is not established.

## Local preview

From the Neocities root, run `node output/tnd-practice/preview.cjs` when port 8765 is free. Open `http://127.0.0.1:8765/tnd6480i/`. The preview is loopback-only and stops after one hour. This page is static HTML/CSS/JS with relative assets; no build, private server, or external runtime is needed. No public upload is performed by creating this route.
