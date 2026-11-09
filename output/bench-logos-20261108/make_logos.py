"""Make the In-the-works bench logos for F-Zero X and Killer Instinct Gold (dev tool, not published).

Source: the two transparent logos the owner supplied on 8 Nov 2026 (sRGB WebP, kept in source/).
Their solid areas arrived at alpha 248-253 (lossy alpha from the attachment), so alpha 240 and up is set
back to 255. Each logo is trimmed to its visible area (alpha > 8), resized to 600 px wide (Lanczos;
Pillow premultiplies alpha when resizing) and saved as WebP q90 with lossless alpha, like the other
bench logos. Run from the repo root:  python output/bench-logos-20261108/make_logos.py
"""
from pathlib import Path
import numpy as np
from PIL import Image

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
JOBS = [('source/f0x6480idd-logo-owner.webp', 'images/site/f0x6480idd-logo-600.webp'),
        ('source/kig480i-logo-owner.webp', 'images/site/kig480i-logo-600.webp')]
WIDTH = 600

for src, dst in JOBS:
    a = np.array(Image.open(HERE / src).convert('RGBA'))
    a[..., 3][a[..., 3] >= 240] = 255
    ys, xs = np.nonzero(a[..., 3] > 8)
    a = a[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    im = Image.fromarray(np.ascontiguousarray(a), 'RGBA')
    out = im.resize((WIDTH, round(im.height * WIDTH / im.width)), Image.LANCZOS)
    out.save(ROOT / dst, 'WEBP', quality=90, method=6)
    print(f'{dst}: trimmed to {im.size}, saved {out.size}, {(ROOT / dst).stat().st_size} bytes')
