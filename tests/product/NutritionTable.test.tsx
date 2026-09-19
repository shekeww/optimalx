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

  it('drops the meaning column entirely when the glossary knows nothing here', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelectorAll('thead th')).toHaveLength(2);
    expect(screen.queryByText(t('ox.pdp.nutrition_meaning'))).toBeNull();
  });

  it('adds the meaning column when the glossary has an entry, and leaves the unknown cell empty', () => {
    const data = readNutritionTable(parseFragment(LABEL), (name) =>
      name === 'البروتين' ? 'ox.card.unflavored' : null
    );
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelectorAll('thead th')).toHaveLength(3);
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[0].querySelectorAll('td')[1].textContent).toBe(t('ox.card.unflavored'));
    expect(rows[1].querySelectorAll('td')[1].textContent).toBe('');
  });

  it('always carries the note that the figures are transcribed from the label', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    renderWithProviders(<NutritionTable data={data} />);
    expect(screen.getByText(t('ox.pdp.label_data_note'))).toBeTruthy();
  });

  it('shows the serving size caption only when the spec line gave one', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    const withSize = renderWithProviders(<NutritionTable data={data} servingSize="31 جم" />);
    expect(withSize.container.textContent).toContain(t('ox.card.serving_size', { size: '31 جم' }));

    const withoutSize = renderWithProviders(<NutritionTable data={data} />);
    expect(withoutSize.container.querySelector('.ox-nutrition__caption')).toBeNull();
  });

  it('renders nothing at all when the description carried no table', () => {
    const { container } = renderWithProviders(<NutritionTable data={null} />);
    expect(container.querySelector('.ox-nutrition')).toBeNull();
  });

  it('scrolls inside a relative wrapper so the sticky column belongs to the scroller', () => {
    const data = readNutritionTable(parseFragment(LABEL));
    const { container } = renderWithProviders(<NutritionTable data={data} />);
    expect(container.querySelector('.ox-table-wrap')).not.toBeNull();
    expect(container.querySelector('.ox-table--scroll')).not.toBeNull();
  });
});
