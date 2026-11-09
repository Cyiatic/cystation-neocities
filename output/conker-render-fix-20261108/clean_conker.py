"""Remove the leftover white background from images/cbfd-conker-rare.png (dev tool, not published):
the haze between Conker's tail and back, the white wedge between his tail and legs, and the
whitish fringe on the tail tip.

The old background survives as neutral grey/white pixels (often with RGB equal to their alpha).
Each area is found by following those neutral pixels outwards from a point inside it, limited to a
box around that spot, so the gloves, eyes, muzzle and sneakers (all elsewhere) cannot change.
Pale edge pixels beside the cleared area then take the colour of the nearest solid fur or hoodie
pixel and fade in proportion to how washed-out they were. The cheek's edge is left alone so it
stays cream.

Usage: python clean_conker.py SOURCE.png OUTPUT.png"""
import sys
import numpy as np
from PIL import Image
from scipy import ndimage

# name: (box x0, x1, y0, y1 exclusive), seed point inside the leftover background or None for a fringe-only box
AREAS = {
    'gap between the back and the tail': ((218, 268, 266, 338), (252, 295)),
    'wedge between the tail and the legs': ((226, 255, 336, 357), (236, 345)),
    'fringe on the tail tip': ((325, 353, 244, 282), None),
}
CHEEK = (214, 240, 266, 304)   # cream cheek beside the gap: never recoloured


def main(src, dst):
    a = np.array(Image.open(src).convert('RGBA')).astype(float)
    rgb, al = a[..., :3], a[..., 3]
    mx, mn = rgb.max(axis=2), rgb.min(axis=2)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1), 0)
    neutral = (al > 0) & (sat < 0.12)

    clear = np.zeros(al.shape, bool)
    zone = np.zeros(al.shape, bool)
    for name, ((x0, x1, y0, y1), seed) in AREAS.items():
        box = np.zeros(al.shape, bool); box[y0:y1, x0:x1] = True
        zone |= box
        if seed is None:
            found = neutral & box            # tail tip: faint neutral halo pixels on the outline
        else:
            lab, _ = ndimage.label(neutral & box, structure=np.ones((3, 3)))
            ys, xs = np.nonzero(lab)
            k = np.argmin((xs - seed[0]) ** 2 + (ys - seed[1]) ** 2)
            found = lab == lab[ys[k], xs[k]]
        clear |= found
        print(f'{name}: {int(found.sum())} background pixels')

    solid = (sat >= 0.45) & (al >= 250)
    near_clear = ndimage.binary_dilation(clear | (al == 0), structure=np.ones((3, 3)), iterations=2)
    cheek = np.zeros(al.shape, bool); x0, x1, y0, y1 = CHEEK; cheek[y0:y1, x0:x1] = True
    fringe = zone & ~clear & ~cheek & (al > 0) & (sat < 0.4) & (mx > 110) & near_clear
    _, (iy, ix) = ndimage.distance_transform_edt(~solid, return_indices=True)

    out = a.copy()
    out[clear] = 0
    out[fringe, :3] = a[iy[fringe], ix[fringe], :3]
    out[fringe, 3] = al[fringe] * np.clip((sat[fringe] - 0.12) / 0.28, 0.15, 1)
    Image.fromarray(np.round(out).astype('uint8'), 'RGBA').save(dst, optimize=True)
    print(f'cleared {int(clear.sum())} pixels in total, recoloured {int(fringe.sum())} edge pixels')


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
