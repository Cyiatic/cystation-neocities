# CyStation Neocities

Source for [cystation.neocities.org](https://cystation.neocities.org/): Cyiatic's
home for 480i N64 patches, game-modding research and preservation work. It's a
plain static site (HTML, CSS, a little JavaScript) with no build step for the pages.

## Pages

| File | Page |
| --- | --- |
| `index.html` | Home |
| `navigation.html` | Directory |
| `patches.html` | 480i projects: patch selector, release state and downloads |
| `projects.html` | Project timeline |
| `why-480i.html` | Why 480i? Signal-path explainer |
| `render-restore.html` | Render Restore index |
| `render-restore/*.html` | Render Restore entries (RR-000 Tools of the Trade, RR-001 Conker Skyboxes) |
| `aboutme.html`, `credits.html`, `links.html` | About, credits, links |

Shared styles are in `style.css`, `cursor.css` and `timeline-months.css`. The
patch selector behaviour is in `patch-select.js`.

## Quick start

Open `index.html` directly, or serve the folder so that root-relative links work:

```powershell
python -m http.server 8000
# then browse to http://localhost:8000/
```

Neocities serves `page.html` at `/page` as well, so internal links may omit `.html`.

## Publishing

Only the site files go to Neocities: the `*.html` and `*.css` files, `patch-select.js`,
`render-restore/` and `images/`. Leave out the repository-only files (`README.md`,
`PRODUCT.md`, `DESIGN.md`, `docs/`, `scripts/`, `.impeccable/`, and `images/source/`).

## Regenerating images

Two generated image sets come from source art in `images/source/`. Both scripts
need Node.js with [`sharp`](https://sharp.pixelplumbing.com/) installed (`npm install sharp`):

```powershell
node scripts/build-cursor.cjs         # images/rareware-cursor-32.png
node scripts/build-month-sprites.cjs  # images/months/banjo-*.png (1x and 2x)
```

See [images/source/README.md](images/source/README.md) and
[images/source/rareware-cursor-README.md](images/source/rareware-cursor-README.md)
for where the source art came from.

## Repository layout

| Path | Contents |
| --- | --- |
| root `*.html`, `*.css`, `*.js` | The live site |
| `images/` | Site images. Most have a `.webp` version alongside a `.png` fallback. |
| `images/months/` | Generated timeline month lettering |
| `images/source/` | Original art used by the generator scripts (not published) |
| `scripts/` | Image generator scripts |
| `docs/` | Repository notes, e.g. the [May 2026 baseline crawl](docs/baseline-notes-20260526.md) |
| `PRODUCT.md`, `DESIGN.md`, `.impeccable/` | Design brief and design-tool context |

## Credits and provenance

The first commit preserves the public crawl of the site from 2026-05-26 (see
[baseline notes](docs/baseline-notes-20260526.md)). Game renders, logos and
lettering belong to their respective rights holders, mainly Rare Limited and
Nintendo. See `credits.html` for per-asset credits.

## License

No license has been chosen yet, so all rights are reserved by default.

## AI Assistance Disclosure

This project was developed with assistance from OpenAI Codex for implementation, layout cleanup, asset preparation, deployment checks, and documentation. The repository owner supplied the site direction and source material, reviewed and tested the resulting changes, and remains responsible for the site's content, design, and final decisions.
