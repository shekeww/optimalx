#!/usr/bin/env node
// Imports the owner's wordmark (owner brief 2026-09-25: "use this logo
// globally") into the brand assets both themes read, from ONE source file: the
// dark lockup on a transparent ground ("optimal X" with the orange mark and
// the NUTRITION & WELLNESS line). The reverse (paper ink for dark grounds) is
// derived here by recolouring the ink pixels, because the reverse file the
// owner sent carried background-removal speckle; the orange mark is kept.
//
// Writes, under public/assets/brand/:
//   optimalx-full.png / optimalx-full-reverse.png       the lockup with the line
//   optimalx-wordmark.png / optimalx-wordmark-reverse.png  the lockup without it
// and copies the wordmark pair into the Shopify theme's assets/ with the two
// header renditions (216 and 224 wide) the header reads. The mark files
// (optimalx-mark*.png/svg) are untouched: the X is the same drawing.
//
// Usage: node scripts/brand-wordmark-import.mjs <path-to-dark-lockup.png>

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const ROOT = path.resolve(fileURLToPath(new URL('.', import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'assets', 'brand');
const SHOPIFY_ASSETS = path.resolve(ROOT, '..', 'optimalx-shopify', 'assets');

function loadSharp() {
  try { return require('sharp'); } catch {
    const pnpmDir = path.join(ROOT, 'node_modules', '.pnpm');
    const hit = fs.readdirSync(pnpmDir).find((n) => n.startsWith('sharp@'));
    return require(path.join(pnpmDir, hit, 'node_modules', 'sharp'));
  }
}

/** Ink (low saturation) pixels become paper; the orange mark and alpha stay. */
function recolourToPaper(data, channels) {
  for (let i = 0; i < data.length; i += channels) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const a = channels === 4 ? data[i + 3] : 255;
    if (a === 0) continue;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    if (max - min < 48) { data[i] = 255; data[i + 1] = 255; data[i + 2] = 255; }
  }
  return data;
}

/** Row index where the tagline band starts: the first fully transparent gap below the wordmark's lowest ink. */
function taglineCut(data, width, height, channels) {
  const rowAlpha = new Array(height).fill(0);
  for (let y = 0; y < height; y++) {
    let sum = 0;
    for (let x = 0; x < width; x++) sum += data[(y * width + x) * channels + 3];
    rowAlpha[y] = sum;
  }
  // Walk up from the bottom: skip the tagline (ink), then the gap; the cut is the gap's top.
  let y = height - 1;
  while (y > 0 && rowAlpha[y] === 0) y--;          // trailing transparent margin
  while (y > 0 && rowAlpha[y] > 0) y--;            // the tagline band
  const gapBottom = y;
  while (y > 0 && rowAlpha[y] === 0) y--;          // the gap
  return { cut: y + 1, gapBottom };
}

async function main() {
  const src = process.argv[2];
  if (!src || !fs.existsSync(src)) { console.error('usage: node scripts/brand-wordmark-import.mjs <dark-lockup.png>'); process.exit(1); }
  const sharp = loadSharp();
  fs.mkdirSync(OUT, { recursive: true });

  const trimmed = await sharp(src).ensureAlpha().trim().png().toBuffer();
  const { data, info } = await sharp(trimmed).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  const fullDark = await sharp(data, { raw: { width, height, channels } }).png().toBuffer();
  const fullPaper = await sharp(recolourToPaper(Buffer.from(data), channels), { raw: { width, height, channels } }).png().toBuffer();
  fs.writeFileSync(path.join(OUT, 'optimalx-full.png'), fullDark);
  fs.writeFileSync(path.join(OUT, 'optimalx-full-reverse.png'), fullPaper);

  const { cut } = taglineCut(data, width, height, channels);
  const wordDark = await sharp(fullDark).extract({ left: 0, top: 0, width, height: cut }).trim().png().toBuffer();
  const wordPaper = await sharp(fullPaper).extract({ left: 0, top: 0, width, height: cut }).trim().png().toBuffer();
  fs.writeFileSync(path.join(OUT, 'optimalx-wordmark.png'), wordDark);
  fs.writeFileSync(path.join(OUT, 'optimalx-wordmark-reverse.png'), wordPaper);
  const wm = await sharp(wordDark).metadata();

  if (fs.existsSync(SHOPIFY_ASSETS)) {
    fs.writeFileSync(path.join(SHOPIFY_ASSETS, 'brand-wordmark.png'), wordDark);
    fs.writeFileSync(path.join(SHOPIFY_ASSETS, 'brand-wordmark-reverse.png'), wordPaper);
    for (const w of [216, 224]) {
      await sharp(wordPaper).resize({ width: w }).png().toFile(path.join(SHOPIFY_ASSETS, `brand-wordmark-reverse-${w}.png`));
    }
  }

  console.log(JSON.stringify({ full: { w: width, h: height }, wordmark: { w: wm.width, h: wm.height }, taglineCutRow: cut }));
}

main().catch((e) => { console.error(e); process.exit(1); });
