import { describe, it, expect } from 'vitest';
import { statCells } from '../../app/components/product/lib/stats';
import { bandBadges, hasTag, VEGAN_TOKENS } from '../../app/components/product/lib/bandBadges';
import { splitStep } from '../../app/components/product/lib/steps';
import { parseSpecLineText } from '../../app/components/product/lib/specLine';
import { readNutritionTable } from '../../app/components/product/lib/nutritionTable';
import { parseFragment } from '../../app/components/product/lib/sanitizeHtml';

/**
 * The statistic strip and the band badges are the two places on the approved
 * design that look like data and would be easiest to fake. These tests hold
 * the line: a cell exists only where the product carries the figure, and a
 * badge exists only where the merchant tagged the product with it.
 */
const LABEL =
  '<table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr>' +
  '<tr><td>السعرات الحرارية</td><td>150</td></tr>' +
  '<tr><td>البروتين</td><td>20g</td></tr></table>';

const SPEC = 'الحصص: 30 | حجم العبوة: 907g | الشكل: بودرة';

function product(overrides: Record<string, unknown> = {}) {
  return { id: 1, name: 'Whey', type: 'product', ...overrides } as never;
}

describe('statCells', () => {
  it('fills every cell the product can source, in the design order', () => {
    const cells = statCells({
      product: product({ weight: '907g', tags: [{ name: 'Vegan', url: '/t' }] }),
      spec: parseSpecLineText(SPEC),
      nutrition: readNutritionTable(parseFragment(LABEL)),
    });
    expect(cells.map((cell) => cell.id)).toEqual(['pack_size', 'vegan', 'calories', 'protein']);
    expect(cells[0].value).toBe('907g');
    expect(cells[2].value).toBe('150');
    expect(cells[3].value).toBe('20g');
  });

  it('drops a cell whose source is missing rather than guessing at it', () => {
    const cells = statCells({ product: product(), spec: null, nutrition: null });
    expect(cells).toEqual([]);
  });

  it('never infers the vegan cell from the product name', () => {
    const cells = statCells({
      product: product({ name: 'جوست بروتين نباتي' }),
      spec: null,
      nutrition: null,
    });
    expect(cells.some((cell) => cell.id === 'vegan')).toBe(false);
  });

  it('takes the pack size from the catalogue weight when the spec line has none', () => {
    const cells = statCells({ product: product({ weight: ' 2kg ' }), spec: null, nutrition: null });
    expect(cells).toHaveLength(1);
    expect(cells[0]).toMatchObject({ id: 'pack_size', value: '2kg' });
  });

  it('falls back to the product calories field only for a real positive figure', () => {
    const zero = statCells({ product: product({ calories: 0 }), spec: null, nutrition: null });
    expect(zero).toEqual([]);

    const real = statCells({ product: product({ calories: 220 }), spec: null, nutrition: null });
    expect(real[0]).toMatchObject({ id: 'calories', value: '220' });
  });
});

describe('bandBadges', () => {
  it('reads one to three badges off the product tags, in the design order', () => {
    const badges = bandBadges(
      product({
        tags: [
          { name: 'Gluten Free', url: '/t/1' },
          { name: 'نباتي', url: '/t/2' },
        ],
      })
    );
    expect(badges.map((badge) => badge.id)).toEqual(['vegan', 'gluten_free']);
  });

  it('renders none at all without tags, which is every product in the store today', () => {
    expect(bandBadges(product())).toEqual([]);
    expect(bandBadges(product({ tags: [] }))).toEqual([]);
  });

  it('matches a tag whatever its case and spacing', () => {
    expect(hasTag(product({ tags: [{ name: '  PLANT  BASED ', url: '/t' }] }), VEGAN_TOKENS)).toBe(
      true
    );
    expect(hasTag(product({ tags: [{ name: 'بروتين', url: '/t' }] }), VEGAN_TOKENS)).toBe(false);
  });
});

describe('splitStep', () => {
  it('splits a step at its own comma and never rewrites the words', () => {
    const parts = splitStep('اخلطه مع 250-350 مل، من الماء أو الحليب النباتي');
    expect(parts.lead).toBe('اخلطه مع 250-350 مل');
    expect(parts.tail).toBe('من الماء أو الحليب النباتي');
  });

  it('leaves a sentence with no comma on one line', () => {
    expect(splitStep('أضف سكوب واحد')).toEqual({ lead: 'أضف سكوب واحد', tail: '' });
  });
});
