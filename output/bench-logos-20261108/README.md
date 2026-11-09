# Bench logos for F-Zero X and Killer Instinct Gold, 8 November 2026

The owner supplied two finished logos, F-Zero X 6480i:DD and Killer Instinct Gold 480i, and asked for the F-Zero X and Killer Instinct Gold entries to use them. Those entries are in the "In the works" list on `patches.html`.

- `source/`: the two logos as supplied (transparent sRGB WebP).
- `make_logos.py`: makes the 600 px web copies in `images/site/` (its docstring lists the steps).
- `before/`: `patches.html`, `style.css` and the two retired images as they were; the two pages were byte-identical to the live copies on 8 Nov 2026.
- `shots/`: the list at 1280 px (2x) and 375 px (3x) after the change.

**Page changes:** both `<img>` tags point at the new files and their `alt` text names the logo. The classes `bench__pixel` (side padding for the old pixel-art F-Zero texture) and `frame` (the old KI title-screen still) were dropped, so both logos now use the same box as the other bench logos. `style.css` lost the two rules that served only those classes.
