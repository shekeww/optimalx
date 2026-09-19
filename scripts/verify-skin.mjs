/**
 * Headless verification for the live-store skin.
 *
 * The browser MCP is not always available, and pasting an untested script into
 * a production storefront is not acceptable, so this runs the skin against a
 * saved copy of the real page HTML inside jsdom and reports what it built.
 *
 * It answers four questions that matter before a paste:
 *   1. does the script parse and run without throwing;
 *   2. does it build the sections the design calls for;
 *   3. does it stay idempotent when it runs twice;
 *   4. do both files fit Salla's 65535 character box.
 *
 * Usage: node scripts/verify-skin.mjs <fixture-dir>
 * The fixture directory holds fixture-pdp.html and fixture-home.html, captured
 * with curl from the live store.
 */

import { readFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { JSDOM, VirtualConsole } from 'jsdom';

const PASTE_CAP = 65535;
const THEME_DIR = resolve('docs/live-theme');
const fixtureDir = resolve(process.argv[2] ?? '.');

/** Sections the approved design expects the script to build on a product page. */
const EXPECTED_PDP = [
  'ox-stat',      // the four statistic cards
  'ox-tab',       // the tab strip
  'ox-panel',     // the three information panels
  'ox-supply',    // the supply calculator
];

function sizeReport() {
  const rows = [];
  for (const name of ['optimalx-raed.min.css', 'optimalx-raed.min.js']) {
    const p = join(THEME_DIR, name);
    if (!existsSync(p)) {
      rows.push({ name, chars: 0, ok: false, note: 'missing' });
      continue;
    }
    // Salla counts characters, not bytes: Arabic copy is multi-byte, so a byte
    // count would overstate the size and cut content that would have fitted.
    const chars = readFileSync(p, 'utf8').length;
    rows.push({ name, chars, ok: chars <= PASTE_CAP, note: chars <= PASTE_CAP ? '' : `over cap by ${chars - PASTE_CAP}` });
  }
  return rows;
}

function runAgainst(fixture, script) {
  const html = readFileSync(join(fixtureDir, fixture), 'utf8');
  const virtualConsole = new VirtualConsole();
  const errors = [];
  virtualConsole.on('jsdomError', (e) => errors.push(String(e.message).slice(0, 140)));

  const dom = new JSDOM(html, {
    runScripts: 'outside-only',
    pretendToBeVisual: true,
    url: 'https://optimalx.com.sa/',
    virtualConsole,
  });

  // The storefront SDK is not present in a fixture. Stub only what the skin is
  // allowed to touch, so a missing SDK cannot be mistaken for a skin failure.
  dom.window.salla = { config: { get: () => undefined }, event: { on: () => {} } };
  dom.window.matchMedia = dom.window.matchMedia || (() => ({ matches: false, addEventListener() {}, removeEventListener() {} }));
  dom.window.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
  dom.window.ResizeObserver = class { observe() {} disconnect() {} unobserve() {} };
  // The skin may defer its work; give it every entry point a real page offers.
  dom.window.requestIdleCallback = (fn) => dom.window.setTimeout(() => fn({ timeRemaining: () => 16, didTimeout: false }), 0);
  dom.window.cancelIdleCallback = (id) => dom.window.clearTimeout(id);
  dom.window.requestAnimationFrame = (fn) => dom.window.setTimeout(() => fn(Date.now()), 0);

  let threw = null;
  const fire = () => {
    // A script that hooks DOMContentLoaded would otherwise never run here: the
    // fixture is already parsed by the time it is evaluated.
    dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded', { bubbles: true }));
    dom.window.dispatchEvent(new dom.window.Event('load'));
  };
  try {
    dom.window.eval(script);
    fire();
    dom.window.eval(script); // second run proves idempotence
    fire();
  } catch (e) {
    threw = String(e && e.message ? e.message : e).slice(0, 200);
  }

  const doc = dom.window.document;
  const built = {};
  for (const prefix of EXPECTED_PDP) {
    built[prefix] = doc.querySelectorAll(`[class*="${prefix}"]`).length;
  }
  // A claim that must never appear without data behind it.
  const fabricated = [];
  const text = doc.body ? doc.body.textContent : '';
  for (const phrase of ['الأكثر مبيعا', 'تقييم', '226', '4.8']) {
    if (text && text.includes(phrase)) fabricated.push(phrase);
  }

  return { fixture, threw, errors: errors.slice(0, 3), built, fabricated };
}

const sizes = sizeReport();
console.log('\nPaste sizes (Salla cap 65535 characters)');
for (const r of sizes) console.log(`  ${r.name.padEnd(24)} ${String(r.chars).padStart(6)}  ${r.ok ? 'fits' : 'TOO LARGE ' + r.note}`);

const jsPath = join(THEME_DIR, 'optimalx-raed.min.js');
if (!existsSync(jsPath)) {
  console.log('\nNo minified script to run yet.');
  process.exit(sizes.every((r) => r.ok) ? 0 : 1);
}
const script = readFileSync(jsPath, 'utf8');

console.log('\nRunning the script against saved live HTML');
let failed = false;
for (const fixture of ['fixture-pdp.html', 'fixture-home.html']) {
  if (!existsSync(join(fixtureDir, fixture))) continue;
  const r = runAgainst(fixture, script);
  console.log(`\n  ${r.fixture}`);
  if (r.threw) { console.log(`    THREW: ${r.threw}`); failed = true; }
  if (r.errors.length) console.log(`    dom errors: ${r.errors.join(' | ')}`);
  for (const [k, v] of Object.entries(r.built)) console.log(`    ${k.padEnd(12)} ${v}`);
  if (r.fixture.includes('pdp')) {
    for (const k of EXPECTED_PDP) {
      if (!r.built[k]) { console.log(`    MISSING on the product page: ${k}`); failed = true; }
    }
  }
  if (r.fabricated.length) console.log(`    review these, they may be fabricated claims: ${r.fabricated.join(', ')}`);
}

const sizeOk = sizes.every((r) => r.ok);
console.log(`\nResult: ${!failed && sizeOk ? 'PASS' : 'FAIL'}\n`);
process.exit(!failed && sizeOk ? 0 : 1);
