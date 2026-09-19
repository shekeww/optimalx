import fs from 'node:fs';
import path from 'node:path';
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from '../helpers/render';

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('./i18n-mock')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: unknown) => (
      <>
        {String(amount)} <i className="sicon-sar" />
      </>
    ),
  }),
}));
vi.mock('@salla.sa/twilight-components-react/installment', () => ({
  SallaInstallment: () => <div data-testid="SallaInstallment" />,
}));

const { PdpPriceBlock } = await import('../../app/components/product/BuyZone/PdpPriceBlock');
const { hasInstallmentGateway, INSTALLMENT_GATEWAYS } = await import(
  '../../app/components/product/lib/claims'
);

const product = {
  id: 1,
  name: 'Whey',
  type: 'product',
  currency: 'SAR',
  price: 349,
  sale_price: 0,
  regular_price: 349,
  is_on_sale: false,
  is_out_of_stock: false,
  status: 'sale',
} as never;

/** What the live store actually has, read from store.settings.payments. */
const LIVE_PAYMENTS = ['mada', 'credit_card', 'stc_pay', 'apple_pay'];

describe('hasInstallmentGateway', () => {
  it('is false for a store whose gateways are all one-shot payment methods', () => {
    expect(hasInstallmentGateway(LIVE_PAYMENTS)).toBe(false);
  });

  it('is true for every split provider the platform names', () => {
    for (const slug of INSTALLMENT_GATEWAYS) {
      expect(hasInstallmentGateway([...LIVE_PAYMENTS, slug])).toBe(true);
    }
  });

  it('survives a slug that carries a suffix, and anything that is not a list', () => {
    expect(hasInstallmentGateway(['tamara_installment'])).toBe(true);
    expect(hasInstallmentGateway(undefined)).toBe(false);
    expect(hasInstallmentGateway('tabby')).toBe(false);
  });
});

describe('PdpPriceBlock', () => {
  it('draws no installment slot when the store has no split provider', () => {
    // The widget mounts on any store and, with nothing to offer, holds its own
    // `s-skeleton-card` open forever: 116px of pulsing grey between the price
    // and the buy button, measured on the live store on 2026-09-20.
    const { container, queryByTestId } = renderWithProviders(
      <PdpPriceBlock product={product} payments={LIVE_PAYMENTS} />
    );
    expect(container.querySelector('.ox-pdp__installment')).toBeNull();
    expect(queryByTestId('SallaInstallment')).toBeNull();
  });

  it('draws the installment slot the moment a split provider is enabled', () => {
    const { container, getByTestId } = renderWithProviders(
      <PdpPriceBlock product={product} payments={[...LIVE_PAYMENTS, 'tabby']} />
    );
    expect(container.querySelector('.ox-pdp__installment')).not.toBeNull();
    expect(getByTestId('SallaInstallment')).toBeTruthy();
  });

  it('draws no badge row when nothing in the product earns a badge', () => {
    const { container } = renderWithProviders(<PdpPriceBlock product={product} />);
    expect(container.querySelector('.ox-pdp__badges')).toBeNull();
  });

  it('draws the badge row for a real saving', () => {
    const onSale = {
      ...(product as unknown as Record<string, unknown>),
      is_on_sale: true,
      sale_price: 279,
      regular_price: 349,
    } as never;
    const { container } = renderWithProviders(<PdpPriceBlock product={onSale} />);
    expect(container.querySelectorAll('.ox-pdp__badges .ox-badge')).toHaveLength(1);
  });

  it('writes the riyal as the Arabic mark, never the ligature glyph', () => {
    const { container } = renderWithProviders(<PdpPriceBlock product={product} />);
    const hero = container.querySelector('.ox-price--hero');
    expect(hero?.querySelector('.ox-price__mark')?.textContent).toBe('ر.س');
    expect(hero?.querySelector('.sicon-sar')).toBeNull();
    expect(hero?.textContent ?? '').not.toContain('﷼');
  });

  it('leaves the Latin locale a Latin mark, so the swap cannot regress /en', () => {
    // The live store carries Arabic only (store.languages read on 2026-09-20),
    // so the English render cannot be looked at in a browser against it. What
    // the swap substitutes is `ox.common.sar`, per locale, so the guarantee is
    // that the English key is Latin and is not the ligature.
    const en = JSON.parse(
      fs.readFileSync(path.join('locales', 'en.json'), 'utf8')
    ) as Record<string, string>;
    expect(en['ox.common.sar']).toBe('SAR');
    expect(en['ox.common.sar']).not.toContain('﷼');
  });
});
