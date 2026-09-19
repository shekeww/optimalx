import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { HOME_BLOCK_FIELDS, type OxBlockData } from '../../app/components/home/defaults';

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-components-react/payments', () => ({
  SallaPayments: () => React.createElement('salla-payments', { 'data-testid': 'salla-payments' }),
}));

const { OxTrustStrip } = await import('../../app/components/home/OxTrustStrip');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

function data(extra: Record<string, unknown> = {}): OxBlockData {
  return {
    path: 'ox-trust-strip',
    key: 'trust',
    ...HOME_BLOCK_FIELDS['ox-trust-strip'],
    ...extra,
  } as OxBlockData;
}

describe('OxTrustStrip', () => {
  it('renders the four FINAL-content 1.3 items', () => {
    setSettings({});
    renderWithProviders(<OxTrustStrip data={data()} />);
    expect(screen.getByTestId('ox-trust-authentic').textContent).toContain('منتجات أصلية');
    expect(screen.getByTestId('ox-trust-shipping').textContent).toContain('شحن من المدينة المنورة');
    expect(screen.getByTestId('ox-trust-payment').textContent).toContain('دفع آمن');
    expect(screen.getByTestId('ox-trust-help').textContent).toContain('مساعدة في الاختيار');
  });

  it('is drawn as the shared statistic strip, hairlines and all', () => {
    setSettings({});
    const { container } = renderWithProviders(<OxTrustStrip data={data()} />);
    const row = container.querySelector('.ox-stats') as HTMLElement;
    // `.ox-stats` is the product page's strip, consumed unchanged. `data-count`
    // is what re-spaces the survivors when a cell is gated away, so it has to
    // be the real number of cells and never a literal.
    expect(row).not.toBeNull();
    expect(row.getAttribute('data-count')).toBe('4');
    expect(container.querySelectorAll('.ox-stats__cell')).toHaveLength(4);
    expect(container.querySelectorAll('.ox-stats__cell .ox-stats__label')).toHaveLength(4);
  });

  it('claims official distributors only when the owner has turned the gate on', () => {
    setSettings({});
    const closed = renderWithProviders(<OxTrustStrip data={data()} />);
    expect(closed.container.textContent).not.toContain('موزعون رسميون');
    closed.unmount();

    setSettings({ claim_official_distributors: true });
    renderWithProviders(<OxTrustStrip data={data()} />);
    expect(screen.getByTestId('ox-trust-authentic').textContent).toContain('موزعون رسميون');
  });

  it('opens one definition at a time and closes it on a second press', () => {
    setSettings({});
    renderWithProviders(<OxTrustStrip data={data()} />);
    const authentic = screen.getByTestId('ox-trust-authentic');
    const shipping = screen.getByTestId('ox-trust-shipping');
    const panel = screen.getByTestId('ox-trust-panel');

    expect(authentic.getAttribute('aria-expanded')).toBe('false');
    expect(panel.getAttribute('data-open')).toBe('false');

    fireEvent.click(authentic);
    expect(authentic.getAttribute('aria-expanded')).toBe('true');
    expect(panel.textContent).toContain('كل منتج يحمل عدد حصصه');

    fireEvent.click(shipping);
    expect(authentic.getAttribute('aria-expanded')).toBe('false');
    expect(shipping.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(shipping);
    expect(panel.getAttribute('data-open')).toBe('false');
  });

  it('shows payment marks, never a method name, when the payment item opens', async () => {
    setSettings({});
    renderWithProviders(<OxTrustStrip data={data()} />);
    fireEvent.click(screen.getByTestId('ox-trust-payment'));
    // The marks row is lazy (a Suspense boundary), like the footer's.
    expect(await screen.findByTestId('salla-payments')).toBeTruthy();
    const panel = screen.getByTestId('ox-trust-panel');
    for (const name of ['مدى', 'أبل باي', 'تابي', 'فيزا']) {
      expect(panel.textContent).not.toContain(name);
    }
  });

  it('points every control at the one panel it opens', () => {
    setSettings({});
    renderWithProviders(<OxTrustStrip data={data()} />);
    const panelId = screen.getByTestId('ox-trust-panel').id;
    expect(panelId).not.toBe('');
    for (const id of ['authentic', 'shipping', 'payment', 'help']) {
      expect(screen.getByTestId(`ox-trust-${id}`).getAttribute('aria-controls')).toBe(panelId);
    }
  });

  it('takes the merchant collection when there is one, with no control on a row that has no definition', () => {
    setSettings({});
    renderWithProviders(
      <OxTrustStrip
        data={data({
          items: [
            { 'items.icon': 'shipping', 'items.title': 'عنوان التاجر', 'items.line': 'سطر التاجر' },
          ],
        })}
      />
    );
    const row = screen.getByTestId('ox-trust-item-1');
    expect(row.textContent).toContain('عنوان التاجر');
    expect(row.tagName).toBe('DIV');
    expect(screen.queryByTestId('ox-trust-authentic')).toBeNull();
  });
});
