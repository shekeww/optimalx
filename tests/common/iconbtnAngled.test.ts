// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { compiledRules, declared, rulesFor } from '../helpers/compiledCss';

/**
 * The card arrow (`.ox-iconbtn--angled`, `_primitives.scss`) is ONE size on
 * every consumer (owner item 2026-09-24, S8a): box 24, glyph 16, corner cut
 * lean 8. S6b's sprite swap put the class straight on a 24px `Icon` at four
 * sites (goal, type tile, categories index, the featured cover CTA), which
 * drew the 24-unit chevron edge to edge inside the box: the arrow read as
 * enlarged next to the five rail/nav faces that wrap a 16px `Icon` in a span.
 * These checks read the compiled stylesheet (every nesting level resolved)
 * and the component sources, since jsdom has no layout.
 */
const COMPONENTS = path.join('app', 'components');

function tsxFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsxFiles(full));
    else if (entry.name.endsWith('.tsx')) out.push(full);
  }
  return out;
}

const SIZE_PROPERTIES = ['inline-size', 'block-size', 'width', 'height', 'min-inline-size', 'min-block-size'];

describe('the angled card arrow, one size everywhere', () => {
  it('draws a 24px box with the lean-8 corner cut', () => {
    const [rule] = rulesFor('.ox-iconbtn--angled');
    expect(rule).toBeTruthy();
    expect(declared(rule, 'inline-size')).toBe('24px');
    expect(declared(rule, 'block-size')).toBe('24px');
    expect(declared(rule, 'clip-path')).toMatch(/^polygon\(0 8px, 5\.\d+px 0, 100% 0, 100% 100%, 0 100%\)$/);
  });

  it('shrinks an Icon that carries the class itself to the 16px glyph', () => {
    const [rule] = rulesFor('.ox-icon.ox-iconbtn--angled');
    expect(rule, 'no rule sizes the glyph of an Icon carrying the class').toBeTruthy();
    expect(declared(rule, 'box-sizing')).toBe('border-box');
    // 24 box - 2 x 1px border - 2 x 3px padding = the 16px glyph viewport.
    expect(declared(rule, 'padding')).toBe('3px');
    // The 16 step of the size ladder takes the heavier stroke (S6a dev. 6).
    expect(declared(rule, '--ox-icon-stroke')).toBe('2.25px');
  });

  it('is never resized by a consumer rule', () => {
    const offenders = compiledRules()
      .filter((rule) => rule.selector.includes('ox-iconbtn--angled'))
      .filter((rule) => !['.ox-iconbtn--angled', '.ox-icon.ox-iconbtn--angled'].includes(rule.selector))
      .filter((rule) => rule.declarations.some((entry) => SIZE_PROPERTIES.includes(entry.property)))
      .map((rule) => rule.selector);
    expect(offenders).toEqual([]);
  });

  it('wraps a 16px Icon wherever the class sits on a span', () => {
    const offenders: string[] = [];
    for (const file of tsxFiles(COMPONENTS)) {
      const source = fs.readFileSync(file, 'utf8');
      const spanFaces = source.matchAll(/<span className="[^"]*ox-iconbtn--angled[^"]*"[^>]*>\s*<Icon [^>]*size=\{(\d+)\}/g);
      for (const match of spanFaces) {
        if (match[1] !== '16') offenders.push(`${file}: span face with a ${match[1]}px glyph`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it('keeps its consumers: eleven sites, both constructions (the branch gallery cover joins in S9c)', () => {
    const direct: string[] = [];
    const wrapped: string[] = [];
    for (const file of tsxFiles(COMPONENTS)) {
      const source = fs.readFileSync(file, 'utf8');
      if (/<Icon [^>]*className="[^"]*ox-iconbtn--angled/.test(source)) direct.push(path.basename(file));
      if (/<span className="[^"]*ox-iconbtn--angled/.test(source)) wrapped.push(path.basename(file));
    }
    expect(direct.sort()).toEqual(['CategoriesIndex.tsx', 'CategoryTile.tsx', 'FeaturedRail.tsx', 'GoalCard.tsx']);
    expect(wrapped.sort()).toEqual([
      'BranchGallery.tsx',
      'FeaturedRail.tsx',
      'OxBrands.tsx',
      'OxCategoryRail.tsx',
      'OxPosters.tsx',
      'PosterCard.tsx',
      'RelatedRail.tsx',
    ]);
  });
});
