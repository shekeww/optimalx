// Imports the owner's six marketing poster files (owner brief 2026-09-24;
// docs/build/progress/S7a.md) from `public/assets/posters/` into the three
// widths the theme serves, and flips each processed slug's `available` flag
// in `app/content/posters.ts` from `false` to `true`.
//
// USAGE
//   node scripts/posters-import.mjs
//
// WHAT THE OWNER DOES
//   Drop up to six PNG/JPG/WEBP files into public/assets/posters/, portrait,
//   about 1125x1400 (4:5). Two ways to name them:
//     1. Name the file exactly one of the six slugs below, any of the three
//        extensions: inbody-consult.png, weekly-picks.jpg, ...
//     2. Or keep any filename and add public/assets/posters/map.json:
//          { "my-export-01.png": "inbody-consult", "IMG_002.jpg": "weekly-picks" }
//   Then run this script. It is safe to run again after adding more files, or
//   after replacing one: it always re-derives its three outputs from the
//   original file it finds this run, never from its own previous output.
//
// WHAT IT WRITES, per slug
//   public/assets/posters/<slug>.webp       1125px wide (the file the content
//                                            map and the dashboard fields read)
//   public/assets/posters/<slug>-720.webp   720px wide
//   public/assets/posters/<slug>-450.webp   450px wide
//   Every width keeps the ORIGINAL file's own aspect ratio (never cropped);
//   quality 82 on all three.
//
// Requires Python 3 with Pillow (PIL) on PATH, confirmed present in this
// environment as `python` (not `python3`, which is the Microsoft Store alias
// stub on this machine); both are tried, in that order, before failing.

import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));
const POSTERS_DIR = path.join(REPO_ROOT, 'public', 'assets', 'posters');
const MAP_FILE = path.join(POSTERS_DIR, 'map.json');
const CONTENT_MAP = path.join(REPO_ROOT, 'app', 'content', 'posters.ts');

/** The six slugs `app/content/posters.ts` declares, kept in sync by hand: a
 *  plain `.mjs` script cannot import a `.ts` module without a bundler. */
export const SLUGS = [
  'inbody-consult',
  'weekly-picks',
  'bundle-her',
  'bundle-him',
  'weight-subscription',
  'bigramy-creatine',
];

const WIDTHS = [1125, 720, 450];
const QUALITY = 82;
const IMAGE_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);

/** The Python side of the job: open once per source file, resize N times. */
const PY_SCRIPT = `
import json, sys
from PIL import Image

src = sys.argv[1]
quality = int(sys.argv[2])
jobs = json.loads(sys.argv[3])  # [[width, outPath], ...]

try:
    resample = Image.Resampling.LANCZOS
except AttributeError:
    resample = Image.LANCZOS

img = Image.open(src)
if img.mode not in ('RGB',):
    img = img.convert('RGB')
orig_w, orig_h = img.size

for width, out_path in jobs:
    height = round(orig_h * width / orig_w)
    img.resize((width, height), resample).save(out_path, 'WEBP', quality=quality)

print(json.dumps({'width': orig_w, 'height': orig_h}))
`;

/** The first working Python executable, `python` before `python3` (§ above). */
function pythonBin() {
  for (const bin of ['python', 'python3']) {
    const probe = spawnSync(bin, ['--version'], { encoding: 'utf8' });
    if (probe.status === 0) return bin;
  }
  throw new Error('No working Python executable found (tried python, python3).');
}

/** Every candidate source image in `POSTERS_DIR`, own-generated outputs excluded. */
function listSourceFiles() {
  if (!fs.existsSync(POSTERS_DIR)) return [];
  return fs
    .readdirSync(POSTERS_DIR)
    .filter((name) => IMAGE_EXTENSIONS.has(path.extname(name).toLowerCase()))
    .filter((name) => name !== 'map.json');
}

/** `file.json`'s explicit filename -> slug mapping, or an empty map. */
function readMap() {
  if (!fs.existsSync(MAP_FILE)) return new Map();
  const raw = JSON.parse(fs.readFileSync(MAP_FILE, 'utf8'));
  return new Map(Object.entries(raw));
}

/**
 * One file per slug, preferring a non-`.webp` original over this script's own
 * likely-previous `<slug>.webp` output when both exist for the same slug (so
 * a re-run always re-derives from the pristine file, never from an
 * already-compressed one). Throws on a genuine, unresolved conflict.
 */
function resolveBySlug(files, map) {
  const bySlug = new Map();
  for (const file of files) {
    const base = path.basename(file, path.extname(file));
    const mapped = map.get(file);
    const slug = mapped ?? (SLUGS.includes(base) ? base : undefined);
    if (!slug) continue;
    if (!SLUGS.includes(slug)) {
      throw new Error(`public/assets/posters/map.json maps "${file}" to unknown slug "${slug}"`);
    }
    const list = bySlug.get(slug) ?? [];
    list.push(file);
    bySlug.set(slug, list);
  }

  const resolved = new Map();
  for (const [slug, candidates] of bySlug) {
    if (candidates.length === 1) {
      resolved.set(slug, candidates[0]);
      continue;
    }
    const notOwnOutput = candidates.filter(
      (name) => path.basename(name, path.extname(name)) !== slug || path.extname(name).toLowerCase() !== '.webp'
    );
    const winners = notOwnOutput.length > 0 ? notOwnOutput : candidates;
    if (winners.length !== 1) {
      throw new Error(
        `More than one file resolves to slug "${slug}": ${candidates.join(', ')}. ` +
          'Remove the extra file or point map.json at exactly one.'
      );
    }
    resolved.set(slug, winners[0]);
  }
  return resolved;
}

/** Runs the Python resize job for one source file; throws on a non-zero exit. */
function resize(bin, sourcePath, jobs) {
  const result = spawnSync(bin, ['-c', PY_SCRIPT, sourcePath, String(QUALITY), JSON.stringify(jobs)], {
    encoding: 'utf8',
  });
  if (result.status !== 0) {
    throw new Error(`Python resize failed for ${sourcePath}:\n${result.stderr || result.stdout}`);
  }
  return JSON.parse(result.stdout.trim().split('\n').pop());
}

/** `<slug>.webp` for the max width, `<slug>-{width}.webp` for every other. */
function outputPath(slug, width, maxWidth) {
  const name = width === maxWidth ? `${slug}.webp` : `${slug}-${width}.webp`;
  return path.join(POSTERS_DIR, name);
}

/**
 * Flips `available: false` to `true` for one slug's entry in
 * `app/content/posters.ts`: finds `slug: '<slug>'`, then the NEXT
 * `available:` field after it by plain index (each entry declares its own
 * fields in one fixed order with `available` last, so the nearest
 * `available:` after a given `slug:` is always that same entry's own).
 *
 * Done by index, not by one combined regex: an earlier version matched
 * `slug: '<slug>'[\s\S]*?available:\s*false` in one pattern, and because a
 * lazy quantifier backtracks until the WHOLE pattern matches, it would walk
 * straight past this entry's own `available: true` (once already flipped)
 * to the NEXT entry's `available: false` and flip that one by mistake, caught
 * live while testing this script (docs/build/progress/S7a.md records it).
 * Two plain `indexOf` calls have no backtracking to go wrong.
 *
 * A no-op, not an error, when the slug is already `true`; throws when the
 * slug or its `available:` field cannot be found at all, since that means
 * the content map and this script have drifted out of sync.
 */
function markAvailable(slug) {
  const text = fs.readFileSync(CONTENT_MAP, 'utf8');
  const slugAt = text.indexOf(`slug: '${slug}'`);
  if (slugAt === -1) {
    throw new Error(`"${slug}" is not declared in ${path.relative(REPO_ROOT, CONTENT_MAP)}`);
  }
  const availableAt = text.indexOf('available:', slugAt);
  if (availableAt === -1) {
    throw new Error(`"${slug}" has no "available:" field in ${path.relative(REPO_ROOT, CONTENT_MAP)}`);
  }
  const valueAt = availableAt + 'available:'.length;
  const rest = text.slice(valueAt);
  if (/^\s*true/.test(rest)) return false; // already true; nothing to do
  if (!/^\s*false/.test(rest)) {
    throw new Error(`"${slug}"'s "available:" field is neither true nor false`);
  }
  const updated = rest.replace(/^(\s*)false/, '$1true');
  fs.writeFileSync(CONTENT_MAP, text.slice(0, valueAt) + updated);
  return true;
}

function printTable(rows) {
  if (rows.length === 0) return;
  const cols = ['slug', 'source', 'original', 'outputs', 'available'];
  const widths = cols.map((col) =>
    Math.max(col.length, ...rows.map((row) => String(row[col]).length))
  );
  const line = (values) => values.map((v, i) => String(v).padEnd(widths[i])).join('  ');
  console.log(line(cols));
  console.log(widths.map((w) => '-'.repeat(w)).join('  '));
  for (const row of rows) console.log(line(cols.map((col) => row[col])));
}

function main() {
  const files = listSourceFiles();
  if (files.length === 0) {
    console.log('no posters yet');
    console.log(
      `Drop the six poster files into ${path.relative(REPO_ROOT, POSTERS_DIR)}${path.sep}, named ` +
        'exactly one slug each (inbody-consult.png, weekly-picks.jpg, bundle-her.png, ' +
        'bundle-him.png, weight-subscription.png, bigramy-creatine.png \u2014 any of .png/.jpg/' +
        '.jpeg/.webp), or keep your own filenames and add a map.json ' +
        '({"<file>": "<slug>"}). Then run `node scripts/posters-import.mjs` again.'
    );
    return 0;
  }

  const map = readMap();
  const bySlug = resolveBySlug(files, map);
  if (bySlug.size === 0) {
    console.log('no posters yet');
    console.log(
      `${files.length} file(s) found in ${path.relative(REPO_ROOT, POSTERS_DIR)}${path.sep} but none ` +
        'matched a poster slug by filename or by map.json. Valid slugs: ' +
        `${SLUGS.join(', ')}.`
    );
    return 0;
  }

  const bin = pythonBin();
  const rows = [];
  for (const [slug, file] of bySlug) {
    const sourcePath = path.join(POSTERS_DIR, file);
    const jobs = WIDTHS.map((width) => [width, outputPath(slug, width, Math.max(...WIDTHS))]);
    const { width, height } = resize(bin, sourcePath, jobs);
    const flipped = markAvailable(slug);
    rows.push({
      slug,
      source: file,
      original: `${width}x${height}`,
      outputs: WIDTHS.join('/'),
      available: flipped ? 'now true' : 'already true',
    });
  }

  printTable(rows);
  const missing = SLUGS.filter((slug) => !bySlug.has(slug));
  if (missing.length > 0) {
    console.log(`Waiting on: ${missing.join(', ')}. Drop those files in and run this again.`);
  } else {
    console.log('All six posters processed.');
  }
  return 0;
}

const invokedDirectly =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (invokedDirectly) process.exitCode = main();
