import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

/**
 * The service and booking buy zone's "what happens next" completeness
 * (S6, DIRECTION 5.5/6.6, FINAL-content 4.6). Never a slot picker: slot
 * selection is Salla checkout, so no test here asserts a day/time grid.
 */

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: unknown) => <span data-testid="money">{String(amount)}</span>,
    parse: Number,
    isValid: () => true,
  }),
}));

const { ServicePdp } = await import('../../app/components/product/variants/ServicePdp');

const t = createT('ar');

function product(overrides: Partial<Product> = {}): Product {
  return {
    id: 1,
    name: 'خدمة',
    description: '',
    url: '/p1',
    type: 'service',
    status: 'sale',
    price: 0,
    sale_price: 0,
    regular_price: 0,
    base_currency_price: 0,
    currency: 'SAR',
    max_quantity: 1,
    image: { url: '', alt: '' },
    ...overrides,
  } as Product;
}

describe('ServicePdp: the what-happens-next block', () => {
  it('service type: states the plain order-the-service path and the written-question next step', () => {
    renderWithProviders(<ServicePdp product={product({ type: 'service' })} spec={null} />);
    expect(screen.getByText(t('ox.booking.order_service'))).toBeTruthy();
    expect(screen.getByText(t('ox.booking.question_received_body'))).toBeTruthy();
    expect(screen.queryByText(t('ox.booking.slot_at_checkout'))).toBeNull();
    expect(screen.queryByText(t('ox.booking.pick_slot'))).toBeNull();
    expect(screen.queryByText(t('ox.booking.add_calendar'))).toBeNull();
  });

  it('booking type: states the slot-at-checkout line and the full next-steps sequence', () => {
    renderWithProviders(<ServicePdp product={product({ type: 'booking' })} spec={null} />);
    expect(screen.getByText(t('ox.booking.slot_at_checkout'))).toBeTruthy();
    expect(screen.getByText(t('ox.booking.pick_slot'))).toBeTruthy();
    expect(screen.getByText(t('ox.booking.confirmed_body'))).toBeTruthy();
    expect(screen.getByText(t('ox.booking.add_calendar'))).toBeTruthy();
    expect(screen.getByText(t('ox.booking.what_next'))).toBeTruthy();
  });

  it('never renders a slot picker: no day/time grid, only the checkout note', () => {
    renderWithProviders(<ServicePdp product={product({ type: 'booking' })} spec={null} />);
    expect(screen.queryByText(t('ox.booking.no_slots_day'))).toBeNull();
    expect(screen.queryByText(t('ox.booking.slot_taken'))).toBeNull();
  });

  it('names the video change rule for the video-consultation SKU and the visit rule for the branch-visit SKU', () => {
    const video = renderWithProviders(
      <ServicePdp product={product({ type: 'booking', sku: 'OX-045' })} spec={null} />
    );
    expect(video.container.textContent).toContain(t('ox.booking.change_rule_video'));
    video.unmount();

    const visit = renderWithProviders(
      <ServicePdp product={product({ type: 'booking', sku: 'OX-046' })} spec={null} />
    );
    expect(visit.container.textContent).toContain(t('ox.booking.change_rule_visit'));
  });

  it('names no change rule for a product whose catalogue code is not a channel', () => {
    const { container } = renderWithProviders(
      <ServicePdp product={product({ type: 'booking', sku: 'OX-047' })} spec={null} />
    );
    expect(container.textContent).not.toContain(t('ox.booking.change_rule_video'));
    expect(container.textContent).not.toContain(t('ox.booking.change_rule_visit'));
  });

  it('always states the no-purchase-commitment note and the mandated medical line', () => {
    renderWithProviders(<ServicePdp product={product()} spec={null} />);
    expect(screen.getByText(t('ox.booking.no_purchase_note'))).toBeTruthy();
    expect(screen.getByText(t('ox.pdp.medical_line'))).toBeTruthy();
  });
});
