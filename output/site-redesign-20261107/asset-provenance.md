# Asset provenance (redesign, 7 Nov 2026)

Every raster below was derived with ImageMagick 7 from an existing CyStation asset (authentic Rare/Nintendo renders or the owner’s own artwork). None is AI-generated. Kept here rather than as per-file sidecars so the public images folder stays clean.

| File | Source | Transformation | SHA-256 (first 16) |
| --- | --- | --- | --- |
| `images/site/conker-rare.webp` | `images/cbfd-conker-rare.png` | re-encoded to WebP q90 with alpha | `377ea15c22f4725f` |
| `images/site/bond-tnd-400.webp` | `images/tnd-bond-selector-full.webp` | resized to 400px wide, WebP q86 | `23498f3ba51e7d6c` |
| `images/site/pd-cover-640.webp` | `images/perfect-dark-selector-cover.webp` | resized to 640px wide, WebP q84 | `8c3fc15689a2adbf` |
| `images/site/ys-logo-600.webp` | `images/ys6480i-logo.webp` | resized to 600px wide, WebP q88 | `d95946098e73d28f` |
| `images/site/dkr-coming-soon-600.webp` | `images/dkr-coming-soon.webp` | resized to 600px wide, WebP q88 | `039beea58dc47633` |
| `images/site/tools-composite-900.webp` | `images/tools-of-the-trade-composite.webp` | resized to 900px wide, WebP q82 | `863845ba0636a27e` |
| `images/site/tools-composite-360.webp` | `images/tools-of-the-trade-composite.webp` | resized to 360px wide, WebP q82 | `395ddf7259cbe8bd` |
| `images/site/cyfound-960.webp` | `images/cyfound.webp` | resized to 960px wide, WebP q76 | `755e802ff13be04e` |
| `images/site/conker-cigar.webp` | `images/conker-cigar-isolated.png` | re-encoded to WebP q90 | `1cf227d665b71b24` |
| `images/site/scribes-feather.webp` | `images/scribes_feather.gif` | first frame re-encoded to WebP q90 | `b1345b7d3e33598e` |
| `images/site/diddy-plane-320.webp` | `images/dkr-diddy-plane.webp` | resized to 320px wide, WebP q88 | `338e0a39bd051483` |
| `images/site/outpost-github-sgi-96.webp` | `images/github-sgi.webp` | resized to 96x96, WebP q90 | `6cffca33bfdbf49c` |
| `images/site/outpost-iararenobg-96.webp` | `images/iararenobg.webp` | resized to 96x96, WebP q90 | `a2fbd8191cf78ca1` |
| `images/site/outpost-twitternobgrare-96.webp` | `images/twitternobgrare.webp` | resized to 96x96, WebP q90 | `cba681721cc348f4` |
| `images/site/outpost-ytnobgrare-96.webp` | `images/ytnobgrare.webp` | resized to 96x96, WebP q90 | `983d657bb440625e` |
| `images/site/outpost-conktail-96.webp` | `images/conktail.gif` | resized to 96px tall, WebP q90 | `84605327f7842f08` |
| `images/site/icon-192.png` | `images/goldballoon.png` | padded square, Lanczos upscale to 150px on #000060 192px canvas | `2c578edfc76c3a69` |
| `images/site/icon-512.png` | `images/goldballoon.png` | padded square, Lanczos upscale to 400px on #000060 512px canvas | `01a3228f2113dea4` |
| `apple-touch-icon.png` | `images/goldballoon.png` | padded square, Lanczos upscale to 140px on #000060 180px canvas | `d3ce0f5370d72519` |
| `favicon.ico` | `images/goldballoon.png` | 16/32/48px Lanczos downscales | `e3256fe23f4e303c` |
| `favicon-32.png` | `images/goldballoon.png` | 32px Lanczos downscale | `19bfb72e27d05e62` |
| `images/site/og-cystation.jpg` | `images/cbfd-conker-rare.png` | 1200x630 composite: render on #000060, CYSTATION set in Arial Black with offset shadow, Georgia Italic subtitle | `3f184d71cf466411` |
| `images/site/og-pd6480iperf.jpg` | `images/perfect-dark-selector-cover.webp` | 1200x630 composite: box art on #04080D, Arial Black title, Georgia Italic line, CYSTATION mark | `afa27650dc9e37a9` |
| `images/site/og-tnd6480i.jpg` | `images/tnd-bond-selector-full.webp + images/tnd6480i-logo.webp` | 1200x630 composite on #230000, Georgia Italic line, CYSTATION mark | `6c2de35031fec5c3` |
| `images/site/fzerox-logo.webp` | `fzerox/assets/aTitleLogoTex.png (original ROM texture, F-Zero/KI job)` | 2x point-filter upscale to 320x130, lossless WebP | `4a510d8e328137b5` |
| `images/site/kig-title-480.webp` | `killer-instinct-gold/assets/native-scene-poster.webp (title render from the recomp, F-Zero/KI job)` | cropped 800x660 at +240+30, resized to 480px wide, WebP q86 | `cc90567f3109d8c2` |

Fonts: `fonts/limelight-latin.woff2` is the unmodified Latin subset of Limelight (Sorkin Type, SIL OFL 1.1) from fonts.gstatic.com; licence in `fonts/OFL-Limelight.txt`.
Diagrams: `images/480i-signal-path*.svg` recoloured (#001b49 to #00003c, #003466 to #0b0b78); originals in `before/images/`.
