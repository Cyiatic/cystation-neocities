---
name: CyStation
description: Cyiatic's Nintendo 64 corner, built like Rare's Rarewhere site of 2000.
colors:
  rarewhere-navy: "#000060"
  navy-deep: "#00003C"
  navy-bar: "#06066E"
  navy-raise: "#0B0B78"
  rarewhere-cream: "#FFFFDD"
  white: "#FFFFFF"
  link-gold: "#FFDD00"
  visited-gold: "#CCB400"
  rule-gold: "#C99A2E"
  bar-gold: "#E9BE52"
  wordmark-gold: "#FFE45C"
  sky-copy: "#AACCFF"
typography:
  wordmark:
    fontFamily: "Arial Black, Arial, Helvetica Neue, Roboto, sans-serif"
    fontSize: "clamp(2.4rem, 7.4vw, 4.25rem)"
    fontWeight: 900
    lineHeight: 0.95
    letterSpacing: "-0.035em"
  display:
    fontFamily: "Limelight, Georgia, serif"
    fontSize: "clamp(2.1rem, 5.6vw, 3.25rem)"
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: "0.05em"
  headline:
    fontFamily: "Limelight, Georgia, serif"
    fontSize: "clamp(1.65rem, 3.8vw, 2.25rem)"
    fontWeight: 400
    letterSpacing: "0.05em"
  title:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "1.3rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Georgia, Times New Roman, serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.62
  label:
    fontFamily: "Arial, Helvetica Neue, Helvetica, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    letterSpacing: "0.12em"
rounded:
  sm: "2px"
  md: "3px"
spacing:
  gutter: "clamp(1rem, 4vw, 2rem)"
  column: "47rem"
  column-home: "52rem"
  row-gap: "clamp(2.25rem, 6vw, 3.25rem)"
components:
  button-primary:
    backgroundColor: "{colors.link-gold}"
    textColor: "#00004C"
    rounded: "{rounded.md}"
    padding: "0.55rem 1.05rem"
  link-action:
    textColor: "{colors.link-gold}"
    typography: "{typography.label}"
  nav-item:
    textColor: "{colors.bar-gold}"
    typography: "{typography.label}"
  nav-item-current:
    textColor: "{colors.white}"
---

# Design System: CyStation

## Overview

**Creative North Star: "The Rarewhere Station"**

CyStation is built the way Rare built Rarewhere in 2000: a narrow column on flat royal navy, an italic gold bar across the top, engraved gold titles, and destinations announced by real character renders that zig-zag down the page. It is a fan's station, not a portfolio: playful copy, authentic art, and very little chrome. Modern behaviour sits underneath (responsive layout, real text, keyboard access), but nothing on the surface looks like a 2020s template.

The old lighter-blue, Microsoft-era look, card grids, carousels, status lights and "signal" language are rejected.

**Key Characteristics:**
- Flat `#000060` field, no texture, no banner image on every page.
- Engraved gold titles (Limelight with a CSS hatch) and the heavy CYSTATION wordmark with its offset shadow.
- Zig-zag rows: render on one side, title and two or three lines on the other, alternating.
- Gold bevel buttons only for primary actions; everything else is an italic-caps text action.
- Outposts footer with the googly-eyed icons.

## Colors

One saturated field does almost all the work; gold is the voice; cream carries reading.

### Primary
- **Rarewhere Navy** (#000060): the page itself, every page, edge to edge. Taken from Rarewhere's `bgcolor`.
- **Link Gold** (#FFDD00): links, text actions, button faces, drop caps. Rarewhere's link colour.

### Secondary
- **Wordmark Gold** (#FFE45C): the CYSTATION lettering only.
- **Bar Gold** (#E9BE52) and **Rule Gold** (#C99A2E): bar labels, rules, frames, bullets, end caps.

### Neutral
- **Rarewhere Cream** (#FFFFDD): body text (17.6:1 on navy).
- **White** (#FFFFFF): titles of releases, current nav item, focus ring, bold text.
- **Sky Copy** (#AACCFF): meta lines, dates, captions (about 11:1 on navy).
- **Navy Deep / Bar / Raise** (#00003C, #06066E, #0B0B78): frames, the bar's gradient, controls.

### Named Rules
**The One Field Rule.** The page is navy. Panels are deeper navy at most; nothing switches to a light surface.
**The Gold Means Go Rule.** Gold marks things you can follow or press. Static decoration uses rule gold, not link gold.

## Typography

**Wordmark:** Arial Black, uppercase, `text-shadow: .03em .03em 0 #000060, .065em .065em 0 rgb(0 0 0 / 55%)`.
**Display Font:** Limelight (self-hosted, `fonts/limelight-latin.woff2`, OFL) with Georgia fallback.
**Body Font:** Georgia, Times New Roman.
**Label Font:** Arial bold italic caps.

**Character:** a period-correct trio: the deco titling of Rare's banners, the serif text of 1999 browsers, the italic sans of its button graphics.

### Hierarchy
- **Wordmark** (900, clamp(2.4rem, 7.4vw, 4.25rem), 0.95): homepage h1 and, small, in the bar.
- **Display** (Limelight 400, clamp(2.1rem, 5.6vw, 3.25rem), 1.12): page titles, engraved gold.
- **Headline** (Limelight, clamp(1.65rem, 3.8vw, 2.25rem)): row and section titles, engraved.
- **Small gilt** (Limelight, clamp(1.3rem, 2.8vw, 1.6rem)): in-page headings; gold gradient without the hatch.
- **Title** (Georgia 700, 1.3rem): release names.
- **Body** (Georgia 400, 1.125rem/1.62; 1.0625rem under 640px): prose, max about 62ch.
- **Label** (Arial 700 italic, 0.8125rem, 0.07–0.12em, uppercase): bar, buttons, text actions, Outposts.

### Named Rules
**The Lowercase i Rule.** In uppercase lettering, the "i" of 480i, iQue and GoldeniQue stays lowercase (`<span class="lc">i</span>`).
**The Engraving Rule.** The hatch appears only at headline size and up; small gilt keeps a clean gradient.

## Layout

A single centred column: 47rem on most pages, 52rem on the homepage, with clamp(1rem, 4vw, 2rem) gutters. The bar and the footer sit in a fixed 53rem frame (`--frame`) on every page, the homepage included, so they never shift between pages. Hub pages stack zig-zag rows (`.row`, `.row--flip`) with a 10rem art column (`.row--tall` 9rem, `.row--sm` 7rem, `.row--xs` 5.25rem for the home quill, `.row--big` 15rem; no inline sizes); a wide plate (`.plate`) breaks the rhythm for panoramas and for the Why 480i? signal diagram (`.plate__fig`, shown whole). Patches and supporting pages keep the same column. Under 48rem the home hero floats its render right of the copy; under 40rem rows switch to a 5.75rem art column (`.row--xs` art fills three-quarters of it), big rows stack, the bar puts its links on one line beneath the brand, the Timeline's year list becomes an even grid, and Outposts become a 3×2 grid. The Conker viewer's panorama runs full-bleed; its heading and controls stay on the text column.

## Elevation & Depth

Flat. Depth comes from tone (navy-deep frames, the bar's slight gradient), gold rules and the gilt drop shadow on titles. The only shadow is the soft one under gold buttons (`0 3px 8px rgb(0 0 20 / 50%)`) plus their inset bevel.

## Shapes

Square and ruled. Gold 1–2px rules frame plates, frames and the bar; the bar has 7px gold end caps that overshoot it by 6px, as on Rarewhere's banners. Radii stay at 2–3px.

## Components

### Buttons
- **Shape:** 3px radius, 1px dark-gold border, inset bevel.
- **Primary:** gold gradient face, navy italic caps, min-height 44px. Used only for the main action of a release or filing.
- **Hover / Active:** slight brightening; pressed state inverts the bevel and drops 1px.
- **Text action (`.go`):** gold italic caps with underline; turns white on hover.

### Navigation
The bar is identical markup on every main page: navy gradient band, gold rules top and bottom, gold end caps. Left: gold balloon and small CYSTATION, linking home (shown on the homepage too). Then `480i Patches • Render Restore • Timeline` in italic gold caps; the current page or section is white. Nothing else goes in the bar. Under 40rem the brand takes the first line and the three links share the second, spread edge to edge without wrapping (smaller caps under 25rem and 23rem).

**The trail (`.crumb`):** a page inside a section (Why 480i?, Conker's Skyboxes, Tools of the Trade) carries a small `‹ Section` link in the bar's italic gold caps directly above its title. It replaces the old up-arrow.

**Timeline:** years are `gilt gilt--md` text over a gold rule; months are italic gold caps labels beside (or, on phones, above) their entries. No sprite lettering.

### Zig-zag row (signature)
Render on one side, gilt title, a meta line in sky italic, two or three lines of copy, actions. Alternate rows put the render on the right; the text stays left-aligned in every row. In-the-works logos sit in one fixed-size box each so their titles line up. Entries that game menus return to (`#tnd6480i`, `#pd6480iperf` and the in-development ids) take a gold `:target` outline.

### Outposts footer
Gilt "Outposts", six 48px googly-eyed icons with italic caps labels (the outbound four say "opens in a new tab" to screen readers), then Directory · Links · Privacy and a one-line fan-site notice.

### Cursor
The browser's own, on every main page (since 10 November 2026). The gold Rareware arrow is retired for now; `images/rareware-cursor-32.png` is kept. The game menus keep their own cursors.

### Following eyes
The googly eyes on the Outposts icons, the home quill and the Render Restore temple turn toward the pointer, the link with keyboard focus or a tap (`eyes.js`, loaded on every main page).
- **How:** the script redraws each image with its pupils filled in from the eye white, and slides the original pupils in an SVG layer. The layer sits in the image's own grid cell (`.has-eyes`) and is masked to each eye.
- **Geometry:** each eye's white and resting pupil are measured ellipses in `eyes.js`. New googly-eyed art needs its eyes measured before it joins.
- **When it's off:** without JavaScript and with reduced motion, the art is unchanged and the layout is identical.

### iQue Player page (a homage)
The owner asked on 11 November 2026 for the iQue page to reference the official iQue site's UI. Inside a yellow frame, the page borrows the look of www.ique.com at the end of 2004, from the Wayback Machine's capture of 11 December 2004. The bar and the footer stay CyStation's, and the One Field and Gold Means Go rules stop at the yellow frame.
- **Parts:**
  - a `#ffff00` field;
  - an indigo `#2e3192` panel with one big rounded corner, carrying the glass orb logo (cut from iQue's own game reel);
  - yellow folder tabs;
  - a grey `#a9a9a7` well holding white rounded boxes under black title bars, each with its Chinese name (神游机, 神游卡, 游戏专区);
  - a steel-blue `#b8c4d2` feature panel with a grey slanted pill, used for GoldeniQue.
- **Type:** Arial bold for bars and tabs, Georgia for reading text; indigo links and focus rings inside the boxes.
- **From the owner's iQue Card:** the "Inside my iQue Card" box shows pictures ripped from the card's NAND on 10 November 2026. Its screens sit in dark 16:10 tiles; its character cut-outs sit in indigo tiles, which hide their hard crop edges.
- **Greeting:** the menu's 欢迎!! greets visitors at the top of the panel. A small inline script swaps in 生日快乐! every 18 November, the iQue Player's launch day.
- **Fan page, not an official one:** a closing line says the page borrows iQue's 2004 look, and the CyStation bar, footer and fan-site notice stay.

### Rare TV
A small gold-framed TV in the bottom-right corner of every main page that plays old Rare and Nintendo 64 ads and trailers (`tv.js`, clips in `tv/`). The owner asked for a corner miniplayer of trailers on 9 November 2026.
- **Lineups:** on the iQue Player page (`<body data-tv="ique">`) it becomes the iQue TV and plays only iQue videos, one channel per iQue game in release order. Each lineup keeps its own channel and spot. Power, sound, size and put-away are shared, so a TV that's on stays on when you move between them. A page can add its own button for the TV with `data-tv-on`, inside a hidden `.tv-cue`; tv.js shows it only when the TV is there.
- **Look:** a navy-deep box with a 1px rule-gold border and the bar's gold end caps, and a 4:3 screen. Below the screen it shows "CH n", the game in cream and what the clip is in sky italic. The buttons are gold icons: power, channel down, channel up, sound and put away. When the set is off, the screen shows "Rare TV" in small gilt above a gold "Switch on".
- **Playing:** it starts off and loads nothing until someone switches it on. Sound stays off until someone turns it on, and that choice lasts for the visit. Changing channel shows a blink of static. When an ad ends, the next channel starts. Clicking the screen makes the set bigger or smaller.
- **Across pages:** for the rest of the visit, the next page carries on with the same ad from the same spot. It also remembers the channel, the size and whether the set was put away.
- **Where it sits:** from 80rem up it sits in the margin beside the frame. Below that, or once put away, it becomes a 48px TV icon. Under 63rem the footer gets extra room so the page can scroll clear of the icon.
- **When it stays off:**
  - With reduced motion or data saver it never starts by itself.
  - Reduced motion also drops the static and the warm-up, and stops at the end of each ad.
  - Without JavaScript or H.264 video there is no TV.
- **Clips:** 4:3 H.264/AAC MP4s, trimmed to the ad itself and evened to −17 LUFS. The 384×288 ones are cut from 360p and 480p sources, the 320×240 ones from 240p sources; each is about 1–4 MB. Sources are listed on the Credits page. To add a clip, add it to the `CH` list in `tv.js`.

## Do's and Don'ts

### Do:
- **Do** keep every page on `#000060` with cream body text and gold links.
- **Do** announce sections with gilt titles and real renders.
- **Do** give every informative image meaningful alt text and explicit width/height.
- **Do** keep the native game menus (TND, PD, YS, F-Zero X, KI Gold) visually separate: link to them, never wrap them.

### Don't:
- **Don't** use the lighter Microsoft-era blue, grunge tiles or the N64 cast banner as page chrome.
- **Don't** add eyebrow labels above headings, fake status indicators, carousels or repeated route-card blocks.
- **Don't** claim downloads or dates for CBFD480i, DKR480i, YS6480i, F0X6480iDD or KIG480i.
- **Don't** promise audible autoplay on the game pages.
