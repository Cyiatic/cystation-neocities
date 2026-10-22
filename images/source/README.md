# Banjo dialogue lettering

`banjo-dialogue-font.png` is the original sheet supplied by the site owner. The sheet credits Malek Masoud for ripping the Banjo-Kazooie / Banjo-Tooie dialogue font, and Rare Limited / Nintendo for the original game artwork.

Run `node scripts/build-month-sprites.cjs` from the repository root with `sharp` available to Node.js. It assembles all twelve months and Overall, preserves transparent edges, and bakes N64-style three-sample triangular interpolation at 1x and 2x display densities. This reproduces the filtering style, rather than emulating the entire RDP/VI display pipeline. The source sheet is retained unchanged. Only the generated files under `images/months/` need publishing.
