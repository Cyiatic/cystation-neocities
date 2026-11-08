# Site cursor

`rareware-cursor-original.png` preserves the gold and blue arrow supplied by the site owner. It already contains transparency; the black preview background is not baked into the PNG.

Run `node scripts/build-cursor.cjs` with `sharp` available to reproduce `images/rareware-cursor-32.png`. The script trims transparent margins, downsizes the original art without redrawing it, and retains transparent edge padding. The browser cursor uses a `(2, 2)` hotspot at the arrow tip. Publish the small PNG, `cursor.css`, and the cursor import in the shared stylesheet. The source image and build script are repository-only assets.
