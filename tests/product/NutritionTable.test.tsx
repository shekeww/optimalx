import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children }: Record<string, unknown>) => (
    <a href={to as string}>{children as React.ReactNode}</a>
  ),
  Image: ({ alt, src }: Record<string, unknown>) => <img alt={String(alt ?? '')} src={src as string} />,
}));

const { NutritionTable } = await import('../../app/components/product/BelowFold/NutritionTable');
const { readNutritionTable } = await import('../../app/components/product/lib/nutritionTable');
const { parseFragment } = await import('../../app/components/product/lib/sanitizeHtml');

const t = createT('ar');
const LABEL =
  '<table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr>' +
  '<tr><td>البروتين</td><td>24 جم</td></tr>' +
  '<tr><td>السعرات الحرارية</td><td>120</td></tr></table>';

describe('NutritionTable', () => {
  it('renders one row per label line with the amount beside it', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelectorAll('tbody tr')).toHaveLength(2);
    expect(screen.getByText('البروتين')).toBeTruthy();
    expect(screen.getByText('24 جم')).toBeTruthy();
  });

  it('stays two columns, so the panel never needs a horizontal scrollbar', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelectorAll('thead th')).toHaveLength(2);
    expect(container.querySelector('.ox-nutrition__meaning')).toBeNull();
  });

  it('puts the glossary line under the nutrient it explains, and only where it knows one', () => {
    const data = readNutritionTable(parseFragment(LABEL), (name) =>
      name === 'البروتين' ? 'ox.card.unflavored' : null
    );
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    // Still two columns with the meaning in place: this is what the earlier
    // third column broke, by forcing a 560px minimum inside a 427px panel.
    expect(container.querySelectorAll('thead th')).toHaveLength(2);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].querySelector('.ox-nutrition__meaning')?.textContent).toContain(
      t('ox.card.unflavored')
    );
    expect(rows[0].querySelector('.ox-nutrition__meaning .ox-sr-only')?.textContent).toBe(
      t('ox.pdp.nutrition_meaning')
    );
    expect(rows[1].querySelector('.ox-nutrition__meaning')).toBeNull();
    expect(rows[1].querySelectorAll('td')).toHaveLength(1);
  });

  it('always carries the note that the figures are transcribed from the label', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    renderWithProviders(<NutritionTable data={data} />);
    expect(screen.getByText(t('ox.pdp.label_data_note'))).toBeTruthy();
  });

  it('always states the per-serving basis, naming the size when the spec line gave one', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    const withSize = renderWithProviders(<NutritionTable data={data} servingSize="31 جم" />);
    expect(withSize.container.querySelector('.ox-nutrition__caption')?.textContent).toBe(
      t('ox.pdp.nutrition_per_serving_caption', { size: '31 جم' })
    );

    // Six bare figures with nothing saying what they are per would state
    // nothing at all, so the basis line falls back rather than disappearing.
    const withoutSize = renderWithProviders(<NutritionTable data={data} />);
    expect(withoutSize.container.querySelector('.ox-nutrition__caption')?.textContent).toBe(
      t('ox.pdp.nutrition_per_serving')
    );
  });

  it('renders nothing at all when the description carried no table', () => {
    const { container } = renderWithProviders(<NutritionTable data={null} />);
    expect(container.querySelector('.ox-nutrition')).toBeNull();
  });

  it('keeps the relative wrapper but no longer asks the table to scroll', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelector('.ox-table-wrap')).not.toBeNull();
    // `--scroll` carries a 560px min-inline-size. Inside a 427px panel that is
    // exactly the horizontal scrollbar the design does not have.
    expect(container.querySelector('.ox-table--scroll')).toBeNull();
  });
});
