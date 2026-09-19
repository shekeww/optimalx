import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};
const storeContacts: Record<string, string> = {};
const storeSocial: Record<string, string> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: {}, contacts: storeContacts, social: storeSocial }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => <nav data-testid="ox-breadcrumb" />,
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
  Image: ({ alt, src }: { alt: string; src?: string }) => <img alt={alt} src={src} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      detail: (id: string) => ({ queryKey: ['products', 'detail', id], queryFn: async () => ({ id, price: 0 }) }),
    },
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => String(value), parse: Number, isValid: () => true }),
}));

const { ContactPage } = await import('../../app/components/pages/ContactPage');

const t = createT('ar');

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  for (const key of Object.keys(storeContacts)) delete storeContacts[key];
  for (const key of Object.keys(storeSocial)) delete storeSocial[key];
});

describe('ContactPage', () => {
  it('renders one h1', () => {
    renderWithProviders(<ContactPage />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.pages.contact.h1'));
  });

  it('marks the phone and the email values dir=ltr', () => {
    Object.assign(storeContacts, { phone: '0500000000', email: 'hi@optimalx.sa' });
    renderWithProviders(<ContactPage />);
    for (const id of ['phone', 'email']) {
      const card = screen.getByTestId(`ox-contact-${id}`);
      const bdi = card.querySelector('bdi');
      expect(bdi?.getAttribute('dir')).toBe('ltr');
    }
  });

  it('builds tel: and mailto: hrefs from the store contacts', () => {
    Object.assign(storeContacts, { phone: '0500000000', email: 'hi@optimalx.sa' });
    renderWithProviders(<ContactPage />);
    expect(
      screen.getByTestId('ox-contact-phone').querySelector('a')?.getAttribute('href')
    ).toBe('tel:0500000000');
    expect(
      screen.getByTestId('ox-contact-email').querySelector('a')?.getAttribute('href')
    ).toBe('mailto:hi@optimalx.sa');
  });

  it('hides a channel the store has no value for', () => {
    Object.assign(storeContacts, { email: 'hi@optimalx.sa' });
    renderWithProviders(<ContactPage />);
    expect(screen.getByTestId('ox-contact-email')).toBeTruthy();
    expect(screen.queryByTestId('ox-contact-phone')).toBeNull();
    expect(screen.queryByTestId('ox-contact-whatsapp')).toBeNull();
  });

  it('strips everything but digits out of a merchant-typed WhatsApp number', () => {
    Object.assign(themeSettings, { whatsapp_number: '+966 (50) 000-0000' });
    renderWithProviders(<ContactPage />);
    const href = screen.getByTestId('ox-contact-whatsapp').querySelector('a')?.getAttribute('href');
    expect(href?.startsWith('https://wa.me/966500000000?text=')).toBe(true);
  });

  it('carries the written-question card with the medical line', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.getByTestId('ox-channel-card')).toBeTruthy();
    expect(screen.getByTestId('ox-medical-line').textContent).toBe(t('ox.services.medical_line'));
  });

  it('does not print the lawyer-gated PDPL line while it is a placeholder', () => {
    renderWithProviders(<ContactPage />);
    expect(screen.queryByTestId('ox-pdpl-line')).toBeNull();
    expect(document.body.textContent).not.toContain('TODO-legal');
  });

  it('drops a social link whose url is not http or https', () => {
    Object.assign(storeSocial, {
      instagram: 'https://instagram.com/optimalx',
      twitter: 'javascript:alert(1)',
    });
    renderWithProviders(<ContactPage />);
    expect(screen.getByText('instagram')).toBeTruthy();
    expect(screen.queryByText('twitter')).toBeNull();
    expect(document.body.innerHTML).not.toContain('javascript:');
  });
});
