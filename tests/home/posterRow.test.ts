// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { compiledRules, declared, rulesFor } from '../helpers/compiledCss';
import { HOME_BLOCK_HEIGHTS } from '../../app/components/home/defaults';

/**
 * The two poster rows (owner item 2026-09-24, S8a; owner review 2026-09-25):
 * "اكتشف أكثر" carries the content cards and "العروض" opens on the offer
 * posters. Both draw the one `.ox-pcard` box, so the two rows keep one card
 * size, and share one slide rule, so they keep one set of visible-card
 * tiers and one bleed. Read off the compiled stylesheet (every nesting level
 * resolved), since jsdom has no layout.
 */
const BOX_PROPERTIES = ['aspect-ratio', 'block-size', 'height', 'min-block-size', 'min-height', 'max-block-size'];

describe('the poster card', () => {
  it('draws every card, offer and content alike, in the 4:5 box with sharp corners', () => {
    const [card] = rulesFor('.ox-pcard');
    expect(declared(card, 'aspect-ratio')).toBe('4/5');
    expect(declared(card, 'border-radius')).toBe('0');
  });

  it('never gives the content card a height of its own, so the offer box sets the row', () => {
    const offenders = compiledRules()
      .filter((rule) => rule.selector.includes('ox-pcard--content'))
      .filter((rule) => rule.declarations.some((entry) => BOX_PROPERTIES.includes(entry.property)))
      .map((rule) => rule.selector);
    expect(offenders).toEqual([]);
  });

  it('cuts every card, offer and content alike, on the diagonal at lean 40 (owner ruling 2026-09-24, S8i)', () => {
    const [card] = rulesFor('.ox-pcard');
    expect(declared(card, 'clip-path')).toMatch(
      /^polygon\(0 0, calc\(100% - 27px\) 0, 100% 40px, 100% 100%, 27px 100%, 0 calc\(100% - 40px\)\)$/
    );
    // One cut on the base rule, none re-declared on the content kind, so the
    // two kinds can never drift apart again.
    const [content] = rulesFor('.ox-pcard--content');
    expect(declared(content, 'clip-path')).toBeUndefined();
  });

  it('carries no strap rule on either kind (owner ruling 2026-09-24, S8i)', () => {
    expect(compiledRules().filter((rule) => rule.selector.includes('ox-pcard__slash'))).toEqual([]);
  });
});

describe('the two poster rails (owner review 2026-09-25)', () => {
  it('sizes both rows from one slide rule at every tier, 1.15 visible below 768', () => {
    const shared = compiledRules().filter(
      (rule) =>
        rule.selector.split(',').some((member) => member.trim() === '.ox-posters__slide') &&
        rule.selector.split(',').some((member) => member.trim() === '.ox-offers-rail__slide')
    );
    expect(shared.map((rule) => rule.atRules.join(' '))).toEqual([
      '',
      '@media (min-width: 768px)',
      '@media (min-width: 1024px)',
      '@media (min-width: 1280px)',
    ]);
    expect(declared(shared[0], 'flex')).toBe('0 0 calc((100% - 0.15 * var(--ox-4)) / 1.15)');
    expect(declared(shared[3], 'flex-basis')).toBe('calc((100% - 3 * var(--ox-4)) / 4)');
  });

  it('bleeds both rows to the screen edge and pads them back to the container edge, snap included', () => {
    for (const selector of ['.ox-posters__rail > .ox-posters__track', '.ox-offers-rail > .ox-offers-rail__track']) {
      const [rule] = rulesFor(selector);
      const pad = 'max(var(--ox-gutter), (100% - var(--ox-container)) / 2)';
      expect(declared(rule, 'padding-inline'), selector).toBe(pad);
      expect(declared(rule, 'scroll-padding-inline'), selector).toBe(pad);
    }
  });

  it('keeps space between the offer posters and the sale products under the one heading', () => {
    const rules = rulesFor('.ox-offers-rail');
    expect(rules.map((rule) => [rule.atRules.join(' '), declared(rule, 'margin-block-end')])).toEqual([
      ['', 'var(--ox-8)'],
      ['@media (min-width: 1024px)', 'var(--ox-12)'],
    ]);
  });

  it('reserves the heights read off the running page for both blocks', () => {
    expect(HOME_BLOCK_HEIGHTS['ox-posters']).toEqual({ mobile: 506, desktop: 506 });
    expect(HOME_BLOCK_HEIGHTS['ox-products-secondary']).toEqual({ mobile: 1315, desktop: 1038 });
  });
});
