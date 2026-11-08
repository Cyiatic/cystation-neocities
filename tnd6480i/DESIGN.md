# TND6480i project webpage

Mode: Experience. The menu is the entire webpage, following the Conker Skybox Viewer's game-as-page approach. The canonical route is `/tnd6480i/`; the old practice URL redirects here with its hash intact. No surrounding toolbar or site masthead. Main-menu OPTIONS supplies music, SFX, game-text comparison, Read text, full screen and return to CyStation. O opens options; PREVIOUS returns to the originating section. The accessible reading sheet contains installation/download information and remains available without JavaScript.

Entry flow: a bare URL or #files opens the four-folder save-select screen. Every folder opens #menu. Main-menu PREVIOUS returns to #files; existing briefing and #menu deep links remain usable. Folder artwork, gunbarrel and footer icons are decoded/rendered from the local patched ROM using `output/tnd-console-reference/render_save_select.py`. The new save-select screenshot is the composition reference. Draw the front two folders over the lower two, with DOM hit areas in the same order. Arrow keys move spatially through the 2x2 arrangement; keyboard crosshairs target each crest. Pointer clicks retain their coordinates. Copy and Erase remain original screen artwork, without fake save-management actions; assistive text explains that no game saves are stored.

## Visual authority

Use the user's eight 2026-10-27 Analogue 3D captures of the actual 480i patch, with progressive output and horizontal scaling. These supersede the earlier stock TND64 references and clipped-white paper calibration. Keep patch information under the original game headings by default. Compare game text uses Easy: James Bond / Mission 1: Russian Border / Part i: Arms Bazaar and the captured paragraphs.

The user-supplied g1mcfix4 xdelta supplies the wallet model, textures, vertex colors, Zurich/Bank Gothic bitmap glyphs, kerning and red crosshair. Stock GoldenEye 007 (USA) supplies the requested SFX. Preserve the real Brosnan portrait/paperclip, OHMSS, crest and stamps. No modern cards, ornamental fonts, synthesized clicks or added scanlines.

## Frame and coordinates

Keep a 640x480 game plane for rendering, input and hotspots. Match the A3D presentation in a centered 16:9 frame: at 1920x1080, the active picture is x=115, y=63, width=1673, height=950. Its source crop is x=3, y=1, width=628, height=478. This reproduces the user's horizontal scaling and black surround. Scale the entire composition proportionally to fit other browser viewports; preserve the right tabs. The physical display/GPU handles 1080i output. Do not claim PVM hardware verification.

Briefings use native bitmap glyphs, not the old 440x330 text layer enlarged by 16/11. Text starts at x=80. Header origins are y=127/143/159; section title y=220; body y=244. Patched title/body instructions use y=219/243; a one-row ink alignment matches the capture's raster placement. Wrap at 465 units with 15-unit lines. Every original paragraph line ending matches the captures: Background 3 lines, M Briefing 3, Q Branch 7, Moneypenny 1. Preserve that section order. Moneypenny has no NEXT label/hotspot; keep its patch-related double entendre.

Main-menu numbers/labels use x=218/238 and y=320/352/384, with the webpage's fourth OPTIONS row at y=416. Cursor x=183 for keyboard selection. Native Gothic tab text uses right edge 590 minus integer half of its 13-unit line height. Tab centers y=122/257/391; highlights start y=74/209/343, height=96. HTML hit areas stay in the canvas coordinate system under horizontal presentation scaling.

Options uses native bitmap text at x=80, heading y=126, rows y=174+35i. Keep patch briefings as compact prose. Numbered steps, checksums, references and credits belong in Read text. START and the main download option retrieve the supplied xdelta.

## Material and rendering

Use original paper/crest luminance without a white-point boost. A measured blank-paper region averages 242.15/255 in the reference and 241.05/255 in the browser; the old page averaged about 252 and lost the grain. Preserve original vertex depth, camera offsets, 60-degree perspective, quarter scale, perspective-correct UVs and three-point sampling. Generate the two backdrops using `output/tnd-console-reference/render_wallet.py`; decoded source textures remain unchanged. Do not bake screenshots into the webpage.

The measured heading and left text bounds are within two pixels of the 1920x1080 reference, using a 1280x720 browser capture normalized to 1080. Evidence: `output/tnd-console-reference/a3d-calibration.json`, `briefing-text-bounds.json`, and `a3d-*.png`. Remaining differences include RDP coverage/LOD, VI filtering and output-device processing. This is a measured approximation, not a pixel-identical emulator.

## Interaction and audio

Clicks/taps preserve crosshair coordinates through focus and page changes, including when NEXT disappears. Keyboard focus and arrows may move it onto the selected control. No cursor interpolation. Canvas supplies appearance; HTML supplies keyboard, touch and assistive-technology operation. Hashes/history restore section and comparison state.

Stock GE event 197 confirms folder/main-menu choices; event 199 handles briefing/back navigation. Event pointers use instrument +12+event*4. These events have zero FX mix, no chained voice and no loop. Stop the previous effect on selection; add no reverb. Clasiku's Briefing MP3 stays byte-identical. Music defaults to on for every page load, preloads automatically and attempts audible autoplay as the menu loads. Browsers may reject that attempt; the first trusted click or key retries, without a timer, muted workaround or policy override. Keep one looping audio element across all screens and pause while the tab is hidden. Music off applies until reload; SFX retains its saved preference. Do not promise autoplay will bypass browser restrictions.
