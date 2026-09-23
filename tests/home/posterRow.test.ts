// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { compiledRules, declared, rulesFor } from '../helpers/compiledCss';
import { HOME_BLOCK_HEIGHTS } from '../../app/components/home/defaults';

/**
 * The mixed "اكتشف أكثر" row (owner item 2026-09-24, S8a): the offer posters
 * and the content cards share ONE box, so the row keeps one height and the
 * reserved block height S7a measured for the 4:5 offer still holds. Read off
 * the compiled stylesheet (every nesting level resolved), since jsdom has no
 * layout.
 */
const BOX_PROPERTIES = ['aspect-ratio', 'block-size', 'height', 'min-block-size', 'min-height', 'max-block-size'];

describe('the mixed poster row', () => {
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

  it('cuts the content card on the diagonal at lean 40, the tier its strap is built from', () => {
    const [content] = rulesFor('.ox-pcard--content');
    expect(declared(content, 'clip-path')).toMatch(
      /^polygon\(0 0, calc\(100% - 27px\) 0, 100% 40px, 100% 100%, 27px 100%, 0 calc\(100% - 40px\)\)$/
    );
    // The offer poster stays uncut (S7a §6: artwork nobody has inspected).
    const [offer] = rulesFor('.ox-pcard');
    expect(declared(offer, 'clip-path')).toBeUndefined();
  });

  it('keeps the reserved block height S7a measured for the 4:5 card', () => {
    expect(HOME_BLOCK_HEIGHTS['ox-posters']).toEqual({ mobile: 456, desktop: 477 });
  });
});
