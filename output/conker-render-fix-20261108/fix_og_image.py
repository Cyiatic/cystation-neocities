"""Repaint the cleaned Conker render into images/site/og-cystation.jpg (dev tool, not published).
The render sits at (70, 61) scaled to 442x519 (measured by matching the old render: mean abs diff 2.6).
Only pixels where the cleaned render differs from the old one are repainted (render over #000060),
never right of x=502, so the CYSTATION lettering and subtitle are untouched.
Usage: python fix_og_image.py OLD_RENDER.png NEW_RENDER.png OG_IN.jpg OG_OUT.jpg"""
import io, sys
import numpy as np
from PIL import Image
from scipy import ndimage

OFFSET, SIZE, NAVY, MAX_X = (70, 61), (442, 519), (0, 0, 96), 502
old_png, new_png, og_in, og_out = sys.argv[1:5]

og = Image.open(og_in)
# Same compression as the original: find the quality whose quantization tables match.
q_match = None
for q in range(60, 101):
    buf = io.BytesIO(); og.save(buf, 'JPEG', quality=q, subsampling=2); buf.seek(0)
    if Image.open(buf).quantization == og.quantization:
        q_match = q; break
print('original JPEG quality:', q_match)

old_s = np.array(Image.open(old_png).convert('RGBA').resize(SIZE, Image.LANCZOS)).astype(float)
new_s = np.array(Image.open(new_png).convert('RGBA').resize(SIZE, Image.LANCZOS)).astype(float)
changed = ndimage.binary_dilation((np.abs(old_s - new_s) > 0.5).any(axis=2), iterations=3)
ox, oy = OFFSET
xs = np.arange(SIZE[0]) + ox
changed[:, xs > MAX_X] = False

O = np.array(og.convert('RGB')).astype(float)
region = O[oy:oy + SIZE[1], ox:ox + SIZE[0]]
alpha = new_s[..., 3:4] / 255
painted = new_s[..., :3] * alpha + np.array(NAVY) * (1 - alpha)
region[changed] = painted[changed]
out = Image.fromarray(np.round(O).clip(0, 255).astype('uint8'), 'RGB')
out.save(og_out, 'JPEG', quality=q_match or 90, subsampling=2, optimize=True)
print(f'repainted {int(changed.sum())} pixels; wrote {og_out}')
