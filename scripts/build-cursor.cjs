// Run with Node.js and sharp: node scripts/build-cursor.cjs
// Prepare the supplied transparent artwork for a native browser cursor.
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

async function main() {
    const root = path.resolve(__dirname, '..');
    const source = path.join(root, 'images/source/rareware-cursor-original.png');
    const { data, info } = await sharp(source).ensureAlpha().raw()
        .toBuffer({ resolveWithObject: true });
    let left = info.width, top = info.height, right = -1, bottom = -1;
    // Ignore almost invisible alpha noise when finding the artwork's bounds.
    for (let y = 0; y < info.height; y++) {
        for (let x = 0; x < info.width; x++) {
            if (data[(y * info.width + x) * 4 + 3] < 8) continue;
            left = Math.min(left, x); top = Math.min(top, y);
            right = Math.max(right, x); bottom = Math.max(bottom, y);
        }
    }
    if (right < left) throw new Error('Cursor source has no visible artwork.');
    left = Math.max(0, left - 4); top = Math.max(0, top - 4);
    right = Math.min(info.width - 1, right + 4);
    bottom = Math.min(info.height - 1, bottom + 4);
    await fs.mkdir(path.join(root, 'images'), { recursive: true });
    const result = await sharp(source)
        .extract({ left, top, width: right - left + 1, height: bottom - top + 1 })
        .resize(30, 30, { fit: 'inside', kernel: 'lanczos3' })
        .extend({ top: 1, bottom: 1, left: 1, right: 1, background: '#00000000' })
        .png({ compressionLevel: 9 })
        .toFile(path.join(root, 'images/rareware-cursor-32.png'));
    console.log(`Cursor: ${result.width} × ${result.height}, transparent PNG; hotspot: 2, 2.`);
}

main().catch(error => { console.error(error); process.exitCode = 1; });
