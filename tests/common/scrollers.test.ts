import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

/**
 * Every horizontal scroller is a positioned containing block
 * (DIRECTION 10.1, the G2 scroller rule; UX-2026-09-24 P0-4).
 *
 * The failure this pins is not cosmetic and it is not theoretical: with
 * `.ox-compare__scroller` computing `position: static`, `/ar/services`
 * measured `document.documentElement.scrollWidth` 720 and
 * `window.innerWidth` 720 against a 390 device, so the phone rendered the
 * whole page at about 54 %; the same page measured 720 at a 502 viewport.
 * Adding `position: relative` returned both to the viewport width. An
 * absolute or sticky descendant of a static scroller belongs to the initial
 * containing block, and its width reaches the DOCUMENT instead of staying
 * inside the scroller.
 *
 * The test reads the stylesheets rather than a rendered page because jsdom
 * has no layout: what it can prove is that no rule declares a horizontal
 * scroller without declaring the containing block with it, which is the
 * authoring rule the defect broke.
 */
const STYLES_DIR = path.join('app', 'styles');

function scssFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...scssFiles(full));
    else if (entry.name.endsWith('.scss')) out.push(full);
  }
  return out;
}

/** Every `{ ... }` block in a stylesheet, with the selector that opened it. */
function blocks(source: string): { selector: string; body: string }[] {
  const found: { selector: string; body: string }[] = [];
  let depth = 0;
  let start = 0;
  let selectorStart = 0;
  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];
    if (char === '{') {
      if (depth === 0) {
        start = i + 1;
        found.push({ selector: source.slice(selectorStart, i).trim(), body: '' });
      }
      depth += 1;
    } else if (char === '}') {
      depth -= 1;
      if (depth === 0) {
        found[found.length - 1].body = source.slice(start, i);
        selectorStart = i + 1;
      }
    }
  }
  return found;
}

/** Declarations of this block only: nested blocks removed. */
function ownDeclarations(body: string): string {
  let depth = 0;
  let out = '';
  for (const char of body) {
    if (char === '{') depth += 1;
    else if (char === '}') depth -= 1;
    else if (depth === 0) out += char;
  }
  return out;
}

const SCROLLER = /overflow-x\s*:\s*(auto|scroll)\b/;
const POSITIONED = /position\s*:\s*(relative|absolute|fixed|sticky)\b/;

/**
 * The scrollers that predate this rule and hold no positioned descendant, so
 * nothing of theirs can escape to the initial containing block. They are
 * listed rather than silently skipped: a NEW scroller has to be positioned or
 * it has to be argued for here, which is the point of the gate. Each one was
 * read: every child is a static card, chip, thumb or badge.
 */
const NO_POSITIONED_DESCENDANT = new Set([
  '.ox-trust__row',
  '.ox-thumbs__list',
  '.ox-bband__badges',
  '.ox-add-also__items',
  'nav.breadcrumbs .s-breadcrumb-wrapper',
  '.ox-listing__chips-row',
  '.ox-explore__list',
  '.ox-rail__track',
]);

describe('horizontal scrollers', () => {
  const files = scssFiles(STYLES_DIR);

  it('reads at least the six OptimalX stylesheets', () => {
    expect(files.length).toBeGreaterThan(5);
  });

  it('never declares overflow-x auto or scroll on a static box', () => {
    const offenders: string[] = [];
    for (const file of files) {
      const source = fs.readFileSync(file, 'utf8');
      for (const block of blocks(source)) {
        const own = ownDeclarations(block.body);
        if (!SCROLLER.test(own)) continue;
        if (POSITIONED.test(own)) continue;
        const selector = block.selector.split('\n').pop()?.trim() ?? '';
        if (NO_POSITIONED_DESCENDANT.has(selector)) continue;
        offenders.push(`${file}: ${selector}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps the services comparison scroller positioned', () => {
    const source = fs.readFileSync(path.join(STYLES_DIR, '06-ox', '_b5-pages.scss'), 'utf8');
    const block = blocks(source).find((entry) => entry.selector.endsWith('.ox-compare__scroller'));
    expect(block).toBeTruthy();
    expect(POSITIONED.test(ownDeclarations(block!.body))).toBe(true);
    expect(SCROLLER.test(ownDeclarations(block!.body))).toBe(true);
  });
});
