// Run with Node.js and sharp: node scripts/build-month-sprites.cjs
// Deterministically assemble the supplied Banjo dialogue glyphs; no generated art.
// N64-style triangular interpolation, baked at 1x and 2x display density.
// https://ultra64.ca/files/documentation/online-manuals/man/pro-man/pro14/14-01.html
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'images/source/banjo-dialogue-font.png');
const output = path.join(root, 'images/months');
const labels = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December', 'Overall'];

function triangle(a, b, c, d, u, v) {
    // Split the texel square along the top-right / bottom-left diagonal.
    return u + v <= 1
        ? a + u * (b - a) + v * (c - a)
        : d + (1 - u) * (c - d) + (1 - v) * (b - d);
}

function filterThreePoint(pixels, width, height, scale) {
    const outWidth = width * scale;
    const outHeight = height * scale;
    const output = Buffer.alloc(outWidth * outHeight * 4);
    const alpha = (x, y) => (x < 0 || y < 0 || x >= width || y >= height)
        ? 0 : pixels[(y * width + x) * 4 + 3];
    for (let y = 0; y < outHeight; y++) {
        const sy = (y + 0.5) / scale - 0.5;
        const iy = Math.floor(sy);
        const v = sy - iy;
        for (let x = 0; x < outWidth; x++) {
            const sx = (x + 0.5) / scale - 0.5;
            const ix = Math.floor(sx);
            const u = sx - ix;
            const dest = (y * outWidth + x) * 4;
            // All glyph texels share one cream color. Interpolate coverage only
            // to retain that color at transparent edges without dark fringes.
            output[dest] = 255;
            output[dest + 1] = 255;
            output[dest + 2] = 221;
            output[dest + 3] = Math.round(triangle(
                alpha(ix, iy), alpha(ix + 1, iy),
                alpha(ix, iy + 1), alpha(ix + 1, iy + 1), u, v));
        }
    }
    return { pixels: output, width: outWidth, height: outHeight };
}

async function main() {
    const { data, info } = await sharp(source).ensureAlpha().raw()
        .toBuffer({ resolveWithObject: true });
    if (info.width !== 301 || info.height !== 162) {
        throw new Error('Expected the original 301 × 162 Banjo dialogue sheet.');
    }

    // The uppercase alphabet occupies y=28..36. Empty columns separate glyphs.
    const runs = [];
    for (let x = 0; x < 286; x++) {
        let ink = false;
        for (let y = 28; y < 37; y++) {
            if (data[(y * info.width + x) * 4 + 3] > 0) ink = true;
        }
        if (!ink) continue;
        const last = runs.at(-1);
        if (last && x === last[1] + 1) last[1] = x;
        else runs.push([x, x]);
    }
    if (runs.length !== 26) throw new Error(`Expected 26 glyphs; found ${runs.length}.`);
    const glyphs = Object.fromEntries(runs.map(([left, right], i) =>
        [String.fromCharCode(65 + i), { left, width: right - left + 1 }]));

    await fs.mkdir(output, { recursive: true });
    for (const label of labels) {
        const letters = [...label.toUpperCase()].map(letter => glyphs[letter]);
        // One transparent texel around the label retains the filtered edge.
        const width = letters.reduce((sum, glyph) => sum + glyph.width, 0) + letters.length + 1;
        const pixels = Buffer.alloc(width * 11 * 4);
        let cursor = 1;
        for (const glyph of letters) {
            for (let y = 0; y < 9; y++) {
                for (let x = 0; x < glyph.width; x++) {
                    const origin = ((y + 28) * info.width + glyph.left + x) * 4;
                    const dest = ((y + 1) * width + cursor + x) * 4;
                    pixels[dest] = 255;
                    pixels[dest + 1] = 255;
                    pixels[dest + 2] = 221;
                    pixels[dest + 3] = data[origin + 3];
                }
            }
            cursor += glyph.width + 1;
        }
        for (const density of [1, 2]) {
            const filtered = filterThreePoint(pixels, width, 11, 2 * density);
            const suffix = density === 1 ? '' : '@2x';
            await sharp(filtered.pixels, { raw: {
                width: filtered.width, height: filtered.height, channels: 4
            } }).png({ compressionLevel: 9 })
                .toFile(path.join(output, `banjo-${label.toLowerCase()}${suffix}.png`));
        }
        console.log(`${label}: ${width * 2} × 22, plus 2x density`);
    }
}

module.exports = { triangle, filterThreePoint };
if (require.main === module) {
    main().catch(error => { console.error(error); process.exitCode = 1; });
}
