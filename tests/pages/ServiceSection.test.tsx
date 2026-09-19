import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};
let productPrice: number | string | undefined;

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
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    queries: {
      detail: (id: string) => ({
        queryKey: ['products', 'detail', id],
        queryFn: async () => ({ id, price: productPrice }),
      }),
    },
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({ format: (value: unknown) => String(value), parse: Number, isValid: () => true }),
}));

const { ServiceSection } = await import('../../app/components/pages/ServiceSection');
const { SERVICE_PAGES, servicePageBySlug } = await import('../../app/content/services');

const t = createT('ar');
const written = servicePageBySlug('written-question')!;
const nutrition = servicePageBySlug('nutrition-plans')!;

beforeEach(() => {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  productPrice = undefined;
});

describe('ServiceSection', () => {
  it('gives every service an anchor id, so /services#slug is a real address', () => {
    for (const service of SERVICE_PAGES) {
      const { unmount } = renderWithProviders(<ServiceSection page={service} />);
      const section = screen.getByTestId(`ox-service-${service.slug}`);
      expect(section.getAttribute('id')).toBe(service.slug);
      expect(section.getAttribute('aria-labelledby')).toBe(`${service.slug}-title`);
      unmount();
    }
  });

  it('carries the limit-of-our-work line verbatim', () => {
    renderWithProviders(<ServiceSection page={written} />);
    expect(screen.getByTestId('ox-service-limit-written-question').textContent).toBe(
      t(written.footerKey)
    );
  });

  it('prints no price cell at all while the product price is unknown', () => {
    renderWithProviders(<ServiceSection page={written} />);
    const strip = screen.queryByTestId('ox-stat-strip');
    expect(strip?.textContent ?? '').not.toContain(t('ox.services.stat_price'));
  });

  it('shows no price cell for a service with no product behind it', () => {
    renderWithProviders(<ServiceSection page={nutrition} />);
    expect(screen.queryByTestId('ox-stat-strip')?.textContent ?? '').not.toContain(
      t('ox.services.stat_price')
    );
  });

  it('says nothing about reply time until reply_sla_hours is set', () => {
    renderWithProviders(<ServiceSection page={written} />);
    expect(document.body.textContent).not.toContain(t('ox.services.stat_reply'));
  });

  it('interpolates the owner reply-time setting once it exists', () => {
    Object.assign(themeSettings, { reply_sla_hours: '24' });
    renderWithProviders(<ServiceSection page={written} />);
    const strip = screen.getByTestId('ox-stat-strip');
    expect(strip.textContent).toContain(t('ox.services.stat_reply'));
    expect(strip.textContent).toContain('24');
  });

  it('routes the primary action at the live product, not at a dead url', () => {
    renderWithProviders(<ServiceSection page={written} />);
    const hrefs = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/p487045117');
  });

  it('routes the editorial service at the video consultation product', () => {
    renderWithProviders(<ServiceSection page={nutrition} />);
    const hrefs = Array.from(document.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/p2000960449');
  });

  it('states no outcome, no timeframe, no title and no invented statistic', () => {
    for (const service of SERVICE_PAGES) {
      const { unmount } = renderWithProviders(<ServiceSection page={service} />);
      const text = document.body.textContent ?? '';
      for (const banned of [
        'يعالج',
        'يشفي',
        'مضمون',
        'نتائج خلال',
        'نتائج حقيقية',
        'أخصائي',
        'مدرب معتمد',
        '%',
      ]) {
        expect(text).not.toContain(banned);
      }
      unmount();
    }
  });

  it('never writes a diet or reads a test on the nutrition section', () => {
    renderWithProviders(<ServiceSection page={nutrition} />);
    expect(screen.getByTestId('ox-service-limit-nutrition-plans').textContent).toBe(
      t('ox.services.nutrition.footer')
    );
  });
});
