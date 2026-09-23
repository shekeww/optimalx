// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { compiledRules, declared, type CompiledRule } from '../helpers/compiledCss';

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

/**
 * No horizontal scroller shows a native scrollbar (owner item 2026-09-24,
 * S8a): every carousel, rail, chip row, tab row, thumb rail and table
 * scroller keeps scrolling, by touch, trackpad, wheel and its own arrows,
 * but hides the bar with `scrollbar-width: none` (Firefox, and Chromium
 * from 121) plus `::-webkit-scrollbar { display: none }` (Safari, older
 * Chromium). The peek of the next card, the rail cue and the progress strap
 * are the affordance instead.
 *
 * Read off the COMPILED stylesheet (`tests/helpers/compiledCss.ts`), so a
 * scroller declared inside a media query or a nested block is seen too; the
 * block-level gate above only reads top-level source blocks.
 */
const X_SCROLL = /^(auto|scroll)\b/;

/** Every compiled rule that scrolls sideways: `overflow-x`, or `overflow`'s first (x) value. */
function horizontalScrollers(): CompiledRule[] {
  return compiledRules().filter((rule) => {
    const x = declared(rule, 'overflow-x');
    const both = declared(rule, 'overflow');
    return (x !== undefined && X_SCROLL.test(x)) || (both !== undefined && X_SCROLL.test(both));
  });
}

function members(selector: string): string[] {
  return selector.split(',').map((member) => member.trim());
}

/**
 * A scroller that may keep a visible bar, each one argued. Empty: the one
 * candidate the brief named, the services comparison table
 * (`.ox-compare__scroller`), hides its bar too. It scrolls only below the
 * width its 640px table fits (a phone), where the bar is an overlay the
 * platform hides at rest anyway, and the cut-off second service column
 * beside the pinned question column already shows there is more that way.
 */
const VISIBLE_BAR_ALLOWED = new Map<string, string>();

/**
 * The two engine home blocks the base theme styles with Tailwind's
 * `overflow-x-auto` (`04-components/home-blocks.scss`, not ours to edit):
 * `@apply` is resolved after Sass, so the compiled rules above never see
 * them. Their bar is hidden from `_b2-home.scss` instead, and a new
 * `overflow-x-auto` anywhere in the source fails the count below.
 */
const TAILWIND_SCROLLERS = ['.s-block--tabs-produtcs .tabs', '.s-block--special-products .tabs'];

/**
 * Horizontal scrollers declared by Salla's own web-component stylesheet
 * (loaded beside ours, so never in the compiled Sass either), found by
 * scanning the stylesheet the preview serves: every `salla-tabs` header, the
 * offer modal's product row, and the `overflow-x-auto` utility. Their bars
 * are hidden from `_primitives.scss`.
 */
const SALLA_SCROLLERS = ['.s-tabs-header', '.s-offer-modal-body', '.overflow-x-auto'];

describe('horizontal scrollers hide the native bar', () => {
  it('finds the scrollers it gates (a sanity floor, not an inventory)', () => {
    expect(horizontalScrollers().length).toBeGreaterThanOrEqual(14);
  });

  it('declares scrollbar-width: none on every overflow-x auto or scroll rule', () => {
    const offenders = horizontalScrollers()
      .filter((rule) => declared(rule, 'scrollbar-width') !== 'none')
      .filter((rule) => !members(rule.selector).every((member) => VISIBLE_BAR_ALLOWED.has(member)))
      .map((rule) => `${rule.selector} (scrollbar-width: ${declared(rule, 'scrollbar-width') ?? 'unset'})`);
    expect(offenders).toEqual([]);
  });

  it('hides the WebKit bar for every one of them too', () => {
    const rules = compiledRules();
    const hidden = new Set(
      rules
        .filter((rule) => declared(rule, 'display') === 'none')
        .flatMap((rule) => members(rule.selector))
        .filter((member) => member.endsWith('::-webkit-scrollbar'))
    );
    const offenders = horizontalScrollers()
      .flatMap((rule) => members(rule.selector))
      .filter((member) => !VISIBLE_BAR_ALLOWED.has(member))
      .filter((member) => !hidden.has(`${member}::-webkit-scrollbar`));
    expect(offenders).toEqual([]);
  });

  it('covers the Tailwind-applied scrollers the compiled Sass cannot see', () => {
    const applied = scssFiles(STYLES_DIR).flatMap((file) =>
      (fs.readFileSync(file, 'utf8').match(/@apply[^;]*\boverflow(-x)?-(auto|scroll)\b/g) ?? []).map(() => file)
    );
    expect(applied).toHaveLength(TAILWIND_SCROLLERS.length);
    const rules = compiledRules();
    const anyRule = (selector: string, property: string) =>
      rules.some((rule) => members(rule.selector).includes(selector) && declared(rule, property) === 'none');
    for (const selector of TAILWIND_SCROLLERS) {
      expect(anyRule(selector, 'scrollbar-width'), selector).toBe(true);
      expect(anyRule(`${selector}::-webkit-scrollbar`, 'display'), `${selector}::-webkit-scrollbar`).toBe(true);
    }
  });

  it("covers Salla's own component scrollers, which load beside the theme's stylesheet", () => {
    const rules = compiledRules();
    const anyRule = (selector: string, property: string) =>
      rules.some((rule) => members(rule.selector).includes(selector) && declared(rule, property) === 'none');
    for (const selector of SALLA_SCROLLERS) {
      expect(anyRule(selector, 'scrollbar-width'), selector).toBe(true);
      expect(anyRule(`${selector}::-webkit-scrollbar`, 'display'), `${selector}::-webkit-scrollbar`).toBe(true);
    }
  });
});
