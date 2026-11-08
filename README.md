# CyStation Neocities

Source-controlled working copy for `https://cystation.neocities.org/`.

The first commit preserves the public crawl baseline from May 26, 2026. A complete Neocities directory export requires authenticated API access.

## AI Assistance Disclosure

This project was developed with assistance from OpenAI Codex for implementation, layout cleanup, asset preparation, deployment checks, and documentation. The November 2026 Rarewhere redesign of the main site was implemented with assistance from Anthropic's Claude Code. The repository owner supplied the site direction and source material, reviewed and tested the resulting changes, and remains responsible for the site's content, design, and final decisions.

## Local preview

`node output/site-redesign-20261107/preview.cjs` serves the site at http://127.0.0.1:8766/ with Neocities-style routing (extensionless pages, `not_found.html` for missing paths). It stops by itself after six hours.

## Analytics

`analytics.js` loads GoatCounter only after a site code is set in it, and only on cystation.neocities.org. Switching it on also means updating the Analytics paragraph in `privacy.html` (replacement text is in a comment there).
