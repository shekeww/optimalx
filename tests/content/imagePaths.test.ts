import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Every `/assets/...` path written into `app/` must exist in `public/`.
 *
 * This has now been the same bug twice. `GOAL_PHOTOS` pointed six goal cards
 * at frames from the image brief that were never shot, and every home page
 * load fetched six 404s; that was found and fixed by trimming the map to the
 * files that exist. `HOME_PLANS` had exactly the same three dead paths and was
 * missed, so on 2026-09-20 the live page was still firing three requests that
 * came back 500.
 *
 * Neither showed up as a broken layout, which is what made them survive:
 * `BandPhoto` renders null once the image fails, so the card looks correct and
 * only the network tab knows. A rendering test cannot catch that. Reading the
 * filesystem can.
 *
 * The rule is deliberately one-directional. An asset in `public/` that nothing
 * references is harmless dead weight; a reference to an asset that is not
 * there is a request on every page load for something that can never arrive.
 * Only the second is a failure.
 */

const ASSET_REF = /['"`](\/assets\/[A-Za-z0-9_./-]+)['"`]/g;

/** Placeholders and tokens that are not real files. */
const NOT_A_FILE = new Set(['/assets/', '/assets/images/']);

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.tsx?$/.test(name)) out.push(full);
  }
  return out;
}

describe('asset paths written into the theme', () => {
  const root = process.cwd();
  // `app/content` holds the maps; `app/components` holds the defaults that a
  // merchant field falls back to. Both have shipped a dead path.
  const files = [
    ...sourceFiles(path.join(root, 'app', 'content')),
    ...sourceFiles(path.join(root, 'app', 'components')),
  ];

  it('finds references to check, so a broken walker cannot pass silently', () => {
    const found = files.some((file) => ASSET_REF.test(fs.readFileSync(file, 'utf8')));
    expect(found).toBe(true);
  });

  it('resolves every referenced asset to a file in public/', () => {
    const missing: string[] = [];
    for (const file of files) {
      const src = fs.readFileSync(file, 'utf8');
      for (const match of src.matchAll(ASSET_REF)) {
        const ref = match[1];
        if (NOT_A_FILE.has(ref) || ref.includes('${')) continue;
        const onDisk = path.join(root, 'public', ref.replace(/^\//, ''));
        if (!fs.existsSync(onDisk)) {
          missing.push(`${ref}  <- ${path.relative(root, file).split(path.sep).join('/')}`);
        }
      }
    }
    expect(
      missing,
      `these are fetched on every render and cannot arrive:\n${missing.join('\n')}`
    ).toEqual([]);
  });
});
