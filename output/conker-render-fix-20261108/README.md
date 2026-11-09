# Conker render clean-up, 8 November 2026

The owner asked for the remaining white between Conker's tail and back, and between his tail and legs, to be removed from the render where he holds the Rareware R. The source is `images/cbfd-conker-rare.png` (353×415); the site shows it as `images/site/conker-rare.webp` and inside the social-preview image `images/site/og-cystation.jpg`.

**What was wrong:** the original background removal left the white background behind in those enclosed gaps as soft grey/white pixels (often with RGB equal to their alpha), plus a pale fringe on the tail tip.

**What changed:** `clean_conker.py` follows those neutral pixels outwards from a point inside each gap, limited to a box around it, makes them transparent, and gives the pale edge pixels beside them the colour of the nearest solid fur or hoodie pixel. 1,939 pixels changed, all inside the three boxes; the gloves, eyes, cheek, muzzle and sneakers are untouched. `fix_og_image.py` repainted only the changed pixels into the social-preview image (render at (70,61), 442×519, measured by matching the old render) and re-saved it at its original JPEG quality (88, 4:2:0).

`before/` holds the three original files. The source PNG is also in git history.
