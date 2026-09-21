import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, act } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('./i18n-mock')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children }: Record<string, unknown>) => (
    <a href={to as string}>{children as React.ReactNode}</a>
  ),
  Image: ({ alt, src }: Record<string, unknown>) => (
    <img alt={String(alt ?? '')} src={src as string} />
  ),
}));

const t = createT('ar');

const { AnchorStrip } = await import('../../app/components/product/BelowFold/AnchorStrip');
const { DetailsPanel } = await import('../../app/components/product/BelowFold/DetailsPanel');
const { HowToUse } = await import('../../app/components/product/BelowFold/HowToUse');
const { NutritionTable } = await import('../../app/components/product/BelowFold/NutritionTable');
const { StatCards } = await import('../../app/components/product/BuyZone/StatCards');
const { PaymentMarks } = await import('../../app/components/product/BuyZone/PaymentMarks');
const { RatingRow } = await import('../../app/components/product/RatingRow');
const { parseSpecLineText } = await import('../../app/components/product/lib/specLine');
const { readNutritionTable } = await import('../../app/components/product/lib/nutritionTable');
const { parseFragment } = await import('../../app/components/product/lib/sanitizeHtml');

function labelWith(rows: number) {
  let html = '<table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr>';
  for (let i = 0; i < rows; i += 1) {
    html += '<tr><td>عنصر ' + String(i + 1) + '</td><td>' + String(i + 1) + 'g</td></tr>';
  }
  return html + '</table>';
}

const product = { id: 1, name: 'Whey', type: 'product' } as never;

describe('AnchorStrip', () => {
  it('renders nothing at all when no region on the page has content', () => {
    const { container } = renderWithProviders(<AnchorStrip items={[]} />);
    expect(container.querySelector('.ox-strip')).toBeNull();
  });

  it('renders one tab per region and points each at a real anchor', () => {
    const { container } = renderWithProviders(
      <AnchorStrip
        items={[
          { id: 'ox-details', label: t('ox.pdp.tab_details') },
          { id: 'ox-nutrition', label: t('ox.pdp.tab_nutrition') },
        ]}
      />
    );
    const tabs = container.querySelectorAll('.ox-strip__tab');
    expect(tabs).toHaveLength(2);
    expect(tabs[0].getAttribute('href')).toBe('#ox-details');
    expect(tabs[0].getAttribute('aria-current')).toBe('true');
    expect(tabs[1].getAttribute('aria-current')).toBe('false');
  });
});

describe('DetailsPanel', () => {
  it('renders a row only for a value the product actually carries', () => {
    const { container } = renderWithProviders(
      <DetailsPanel
        product={{ ...(product as object), brand: { id: 2, name: 'GHOST' }, sku: '810005961870' } as never}
        spec={parseSpecLineText('الحصص: 32 | حجم العبوة: 907g | الشكل: بودرة')}
      />
    );
    const keys = Array.from(container.querySelectorAll('.ox-details__key')).map(
      (node) => node.textContent
    );
    expect(keys).toEqual([
      t('ox.pdp.detail_brand'),
      t('ox.pdp.detail_type'),
      t('ox.pdp.size'),
      t('ox.pdp.servings'),
      t('ox.pdp.detail_sku'),
    ]);
    expect(container.querySelector('[dir="ltr"]')?.textContent).toBe('810005961870');
  });

  it('is absent entirely when the product carries nothing to put in it', () => {
    const { container } = renderWithProviders(<DetailsPanel product={product} spec={null} />);
    expect(container.querySelector('.ox-details')).toBeNull();
  });
});

describe('HowToUse', () => {
  it('renders one numbered step per parsed sentence and nothing without any', () => {
    const { container } = renderWithProviders(
      <HowToUse steps={['أضف سكوب واحد', 'اخلطه مع 250 مل، من الماء']} />
    );
    expect(container.querySelectorAll('.ox-howto__step')).toHaveLength(2);
    expect(container.querySelectorAll('.ox-howto__num')[1].textContent).toBe('02');
    expect(container.querySelector('.ox-howto__tail')?.textContent).toBe('من الماء');

    const empty = renderWithProviders(<HowToUse steps={[]} />);
    expect(empty.container.querySelector('.ox-howto')).toBeNull();
  });
});

describe('NutritionTable disclosure (B22)', () => {
  it('has no disclosure when the label carries six rows or fewer', () => {
    const data = readNutritionTable(parseFragment(labelWith(6)));
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(6);
    expect(container.querySelector('.ox-nutrition__disc')).toBeNull();
    expect(container.querySelector('.ox-nutrition__more')).toBeNull();
  });

  it('shows six rows and opens onto the rest when the label carries more', () => {
    const data = readNutritionTable(parseFragment(labelWith(9)));
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(6);
    const more = container.querySelector('.ox-nutrition__more') as HTMLButtonElement;
    expect(more.textContent).toContain(t('ox.pdp.nutrition_show_all'));
    // The click flips React state, so it has to flush before the assertion.
    act(() => {
      more.click();
    });
    expect(container.querySelectorAll('tbody tr')).toHaveLength(9);
    expect(container.querySelector('.ox-nutrition__more')?.textContent).toContain(
      t('ox.pdp.nutrition_show_less')
    );
  });
});

describe('StatCards', () => {
  it('renders nothing at all with no cells, so the buy column simply closes up', () => {
    const { container } = renderWithProviders(<StatCards cells={[]} />);
    expect(container.querySelector('.ox-stats')).toBeNull();
  });

  it('writes the surviving cell count onto the strip so the rules can follow it', () => {
    const { container } = renderWithProviders(
      <StatCards
        cells={[
          {
            id: 'pack_size',
            value: '907g',
            glyph: null,
            labelKey: 'ox.pdp.stat_pack_size',
            subKey: null,
            subIsLatin: false,
          },
          {
            id: 'protein',
            value: '20g',
            glyph: null,
            labelKey: 'ox.pdp.stat_protein',
            subKey: 'ox.pdp.stat_per_serving',
            subIsLatin: false,
          },
        ]}
      />
    );
    expect(container.querySelector('.ox-stats')?.getAttribute('data-count')).toBe('2');
    expect(container.querySelectorAll('.ox-stats__cell')).toHaveLength(2);
  });
});

describe('PaymentMarks (B10)', () => {
  it('renders nothing when the store has no readable gateway', () => {
    const { container } = renderWithProviders(<PaymentMarks payments={undefined} />);
    expect(container.querySelector('.ox-pay')).toBeNull();
    expect(renderWithProviders(<PaymentMarks payments={[]} />).container.querySelector('.ox-pay'))
      .toBeNull();
  });

  it('renders the marks row when the store has one, and names no method in text', () => {
    const { container } = renderWithProviders(<PaymentMarks payments={['mada', 'visa']} />);
    expect(container.querySelector('.ox-pay')).not.toBeNull();
    expect(container.textContent).toBe(t('ox.pdp.payment_methods_label'));
  });
});

describe('RatingRow (B1)', () => {
  it('renders nothing at zero reviews and never invents a star', () => {
    const { container } = renderWithProviders(<RatingRow stars={0} count={0} />);
    expect(container.querySelector('.ox-rating')).toBeNull();
  });

  it('draws a partial star as a clipped overlay, never as a faded one', () => {
    renderWithProviders(<RatingRow stars={4.8} count={226} />);
    const stars = document.querySelector('.ox-rating__stars') as HTMLElement;
    expect(stars.style.getPropertyValue('--ox-rating-fill')).toBe('96%');
    expect(screen.getByText('4.8')).toBeTruthy();
    expect(screen.getByText(t('ox.pdp.rating_count', { count: 226 }))).toBeTruthy();
  });
});
