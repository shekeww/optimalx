import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { screen, fireEvent, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const storeContacts: Record<string, string> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: {}, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: {}, contacts: storeContacts, social: {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => <nav data-testid="ox-breadcrumb" />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
}));

const { FaqPage } = await import('../../app/components/pages/FaqPage');
const { isFaqPage } = await import('../../app/components/commerce/policyKind');
const { FAQ_PAGE_GROUPS } = await import('../../app/content/faq');

const t = createT('ar');

describe('isFaqPage', () => {
  it('matches the store FAQ page in either language and nothing else', () => {
    expect(isFaqPage('faq', 'FAQ')).toBe(true);
    expect(isFaqPage(undefined, t('ox.pages.faq.h1'))).toBe(true);
    expect(isFaqPage('shipping-policy', 'سياسة الشحن')).toBe(false);
    expect(isFaqPage(undefined, undefined)).toBe(false);
  });
});

describe('FaqPage', () => {
  it('opens on the band, which carries the page one h1', () => {
    renderWithProviders(<FaqPage />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.pages.faq.h1'));
    expect(screen.getByTestId('ox-band')).toBeTruthy();
  });

  it('groups the questions into panels and lists them in the anchor strip', () => {
    renderWithProviders(<FaqPage />);
    for (const group of FAQ_PAGE_GROUPS) {
      const panel = document.getElementById(group.id);
      expect(panel).toBeTruthy();
      expect(within(panel as HTMLElement).getByText(t(group.titleKey))).toBeTruthy();
    }
    expect(document.querySelector('.ox-strip')).toBeTruthy();
  });

  it('reuses the answers the hub and the branch already publish', () => {
    renderWithProviders(<FaqPage />);
    expect(screen.getByText(t('ox.services.faq_1_q'))).toBeTruthy();
    expect(screen.getByText(t('ox.content.faq.price_q'))).toBeTruthy();
  });

  it('narrows the rows as the shopper types, and keeps the page finished', () => {
    renderWithProviders(<FaqPage />);
    const field = screen.getByTestId('ox-faq-filter');
    fireEvent.change(field, { target: { value: t('ox.services.faq_1_q') } });
    expect(screen.getByText(t('ox.services.faq_1_q'))).toBeTruthy();
    expect(screen.queryByText(t('ox.content.faq.price_q'))).toBeNull();
  });

  it('offers a route out rather than an empty page when nothing matches', () => {
    renderWithProviders(<FaqPage />);
    fireEvent.change(screen.getByTestId('ox-faq-filter'), { target: { value: 'zzzzqqq' } });
    expect(screen.getByText(t('ox.pages.faq.empty_title'))).toBeTruthy();
    expect(document.querySelector('.ox-faq-groups')).toBeNull();
  });

  it('publishes no rating, no review count and no invented statistic', () => {
    renderWithProviders(<FaqPage />);
    const text = document.body.textContent ?? '';
    for (const banned of ['تقييم العملاء', 'أفضل في السعودية', 'رقم 1', '%']) {
      expect(text).not.toContain(banned);
    }
  });
});
