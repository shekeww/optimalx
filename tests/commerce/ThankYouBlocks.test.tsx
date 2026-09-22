import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import type { Order } from '@salla.sa/twilight-theme-engine/routes/account';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

/**
 * The thank-you page's booking branch (S6, FINAL-content 4.6): a service-only
 * order shows the confirmed/question-received block instead of the
 * physical-product "how to start using it" card. Never a slot picker.
 */

const themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
}));

const { ThankYouBlocks } = await import('../../app/components/commerce/ThankYouBlocks');

const t = createT('ar');

function orderOf(items: Order['items']): Order {
  return { items } as Order;
}

const WRITTEN = { id: 1, sku: 'OX-044', product: { id: 487045117, url: '', type: 'service' } };
const VIDEO = { id: 2, sku: 'OX-045', product: { id: 2000960449, url: '', type: 'service' } };
const VISIT = { id: 3, sku: 'OX-046', product: { id: 1051830221, url: '', type: 'service' } };
const TRAINING = { id: 4, sku: 'OX-047', product: { id: 103621577, url: '', type: 'service' } };
const WHEY = { id: 5, sku: 'OX-001', product: { id: 1996831868, url: '', type: 'product' } };

describe('ThankYouBlocks: the booking branch', () => {
  it('shows the physical-product steps card, not the booking card, for a whey order', () => {
    renderWithProviders(<ThankYouBlocks order={orderOf([WHEY] as never)} />);
    expect(screen.queryByTestId('ox-ty-booking')).toBeNull();
    expect(screen.getByText(t('ox.content.thankyou.title'))).toBeTruthy();
  });

  it('shows the question-received block, not the steps card, for a written-question-only order', () => {
    renderWithProviders(<ThankYouBlocks order={orderOf([WRITTEN] as never)} />);
    expect(screen.queryByText(t('ox.content.thankyou.title'))).toBeNull();
    expect(screen.getByText(t('ox.booking.question_received_title'))).toBeTruthy();
    expect(screen.getByText(t('ox.booking.question_received_body'))).toBeTruthy();
  });

  it('shows the confirmed block with the video change rule for a video-consultation order', () => {
    const { container } = renderWithProviders(<ThankYouBlocks order={orderOf([VIDEO] as never)} />);
    expect(screen.getByText(t('ox.booking.confirmed_title'))).toBeTruthy();
    expect(screen.getByText(t('ox.booking.confirmed_body'))).toBeTruthy();
    expect(container.textContent).toContain(t('ox.booking.change_rule_video'));
    expect(container.textContent).toContain(t('ox.booking.add_calendar'));
  });

  it('shows the confirmed block with the visit change rule for a branch-visit order', () => {
    const { container } = renderWithProviders(<ThankYouBlocks order={orderOf([VISIT] as never)} />);
    expect(container.textContent).toContain(t('ox.booking.change_rule_visit'));
  });

  it('falls back to the confirmed block for the training session, an unrecognised channel', () => {
    renderWithProviders(<ThankYouBlocks order={orderOf([TRAINING] as never)} />);
    expect(screen.getByText(t('ox.booking.confirmed_title'))).toBeTruthy();
  });

  it('never renders a slot picker on the confirmation', () => {
    const { container } = renderWithProviders(<ThankYouBlocks order={orderOf([VIDEO] as never)} />);
    expect(container.textContent).not.toContain(t('ox.booking.pick_slot'));
    expect(container.textContent).not.toContain(t('ox.booking.no_slots_day'));
  });

  it('states the no-purchase-commitment note on the booking card', () => {
    renderWithProviders(<ThankYouBlocks order={orderOf([WRITTEN] as never)} />);
    expect(screen.getByText(t('ox.booking.no_purchase_note'))).toBeTruthy();
  });
});
