/**
 * Write WebP size variants for every JPEG and PNG under public/images and
 * record them in utils/imageManifest.json as path -> [width, height, ...variant
 * widths]. A variant of images/a/b.jpg at 640 px is images/a/b-640.webp.
 *
 * Variants are 640 and 1280 px wide, never wider than the source. A source
 * narrower than 1280 also gets one variant at its own width, and a source more
 * than 300 px wider than 1280 gets one at its own width (capped at 1920), so
 * large screens aren't limited to 1280. Nothing is upscaled.
 *
 * Needs `cwebp` (brew install webp). CI has no cwebp, so the output is
 * committed. Existing variants newer than their source are skipped.
 *
 * Usage: node scripts/optimize-images.mjs
 */

import fs from 'fs';
import path from 'path';
import { execFileSync } from 'child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const IMAGES = path.join(ROOT, 'public', 'images');
const MANIFEST = path.join(ROOT, 'utils', 'imageManifest.json');
const TARGETS = [640, 1280];
const MAX_WIDTH = 1920;

// Read pixel dimensions from a JPEG (SOFn marker) or PNG (IHDR) header.
function dimensions(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) === 0x89504e47) {
    return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
  }
  let i = 2;
  while (i < buf.length) {
    if (buf[i] !== 0xff) { i++; continue; }
    const marker = buf[i + 1];
    const len = buf.readUInt16BE(i + 2);
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { width: buf.readUInt16BE(i + 7), height: buf.readUInt16BE(i + 5) };
    }
    i += 2 + len;
  }
  throw new Error(`No dimensions found in ${file}`);
}

function variantWidths(width) {
  const widths = TARGETS.filter((w) => w < width);
  if (width < 1280 || width - 1280 > 300) widths.push(Math.min(width, MAX_WIDTH));
  return [...new Set(widths)];
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(full);
    return /\.(jpe?g|png)$/i.test(entry.name) ? [full] : [];
  });
}

const manifest = {};
let written = 0;
for (const file of walk(IMAGES).sort()) {
  const { width, height } = dimensions(file);
  const isPng = /\.png$/i.test(file);
  const base = file.replace(/\.(jpe?g|png)$/i, '');
  const variants = [];
  for (const w of variantWidths(width)) {
    const out = `${base}-${w}.webp`;
    const fresh = fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(file).mtimeMs;
    if (!fresh) {
      const quality = isPng ? ['-q', '90', '-alpha_q', '100'] : ['-q', '78'];
      const resize = w < width ? ['-resize', String(w), '0'] : [];
      execFileSync('cwebp', ['-quiet', '-mt', '-metadata', 'none', ...quality, ...resize, file, '-o', out]);
      written++;
    }
    variants.push(w);
  }
  manifest['/' + path.relative(path.join(ROOT, 'public'), file).split(path.sep).join('/')] = [width, height, ...variants];
}

fs.writeFileSync(MANIFEST, '{\n' + Object.entries(manifest).map(([k, v]) => `${JSON.stringify(k)}: ${JSON.stringify(v)}`).join(',\n') + '\n}\n');
console.log(`${Object.keys(manifest).length} images, ${written} variants written, manifest at ${path.relative(ROOT, MANIFEST)}`);
