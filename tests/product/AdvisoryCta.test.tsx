import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';
import { vi } from 'vitest';

/**
 * The free advisory + InBody CTA at the foot of every boxed product page
 * (owner brief 2026-09-24). Same identity plate as the services offer strip
 * (S7c), its own copy, its own gates: the InBody clause on `inbody_included`,
 * the WhatsApp button on `whatsapp_number`.
 *
 * VISIT-2026-09-24 §4.3 adds the store rating and the directions link, both
 * still driven off the `settings` prop rather than a hook. `StoreRating`
 * itself calls `useTheme()` unconditionally even when a `value` override is
 * passed (it cannot branch around a hook), so this file mocks that hook too,
 * or every test here would throw for the missing `TwilightProvider`.
 */

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('./i18n-mock')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: {}, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
}));

const { AdvisoryCta } = await import('../../app/components/product/BelowFold/AdvisoryCta');
const { SERVICE_CHANNELS } = await import('../../app/content/services');
const { BRANCH_LISTING } = await import('../../app/content/branch');

const t = createT('ar');
const VISIT_TO = SERVICE_CHANNELS.find((channel) => channel.id === 'visit')?.to;

describe('AdvisoryCta', () => {
  it('renders the plate with the title, the full line and the primary booking button', () => {
    const { getByTestId } = renderWithProviders(
      <AdvisoryCta productName="Gold Standard Whey" settings={{}} />
    );
    const block = getByTestId('ox-pdp-advisory');
    expect(block.textContent).toContain(t('ox.pdp.advisory_title'));
    expect(block.textContent).toContain(t('ox.pdp.advisory_line'));
    expect(block.textContent).not.toContain('{{');

    const primary = block.querySelector('.ox-advisory__action.ox-btn--primary') as HTMLAnchorElement;
    expect(primary.textContent).toBe(t('ox.pdp.advisory_cta'));
    expect(primary.getAttribute('href')).toBe(VISIT_TO);
  });

  it('drops the InBody clause and ends the line after the free consultation once the setting is off', () => {
    const { getByTestId } = renderWithProviders(
      <AdvisoryCta productName="Gold Standard Whey" settings={{ inbody_included: false }} />
    );
    const block = getByTestId('ox-pdp-advisory');
    expect(block.textContent).toContain(t('ox.pdp.advisory_line_base'));
    expect(block.textContent).not.toContain('InBody');
    expect(block.textContent).not.toContain(t('ox.pdp.advisory_line'));
  });

  it('links the secondary action to a prefilled WhatsApp chat once whatsapp_number is set', () => {
    const { getByTestId } = renderWithProviders(
      <AdvisoryCta
        productName="Gold Standard Whey"
        settings={{ whatsapp_number: '+966 50 123 4567' }}
      />
    );
    const block = getByTestId('ox-pdp-advisory');
    const secondary = block.querySelector(
      '.ox-advisory__action.ox-btn--secondary'
    ) as HTMLAnchorElement;
    expect(secondary.textContent).toBe(t('ox.pdp.advisory_whatsapp_cta'));
    expect(secondary.getAttribute('href')).toBe(
      'https://wa.me/966501234567?text=' +
        encodeURIComponent(
          t('ox.pdp.advisory_whatsapp_text', { product: 'Gold Standard Whey' })
        )
    );
    expect(secondary.getAttribute('target')).toBe('_blank');
  });

  it('falls back to a text link to /services with no WhatsApp number configured', () => {
    const { getByTestId } = renderWithProviders(
      <AdvisoryCta productName="Gold Standard Whey" settings={{}} />
    );
    const block = getByTestId('ox-pdp-advisory');
    expect(block.querySelector('.ox-advisory__action.ox-btn--secondary')).toBeNull();
    const link = block.querySelector('.ox-advisory__action.ox-btn--link') as HTMLAnchorElement;
    expect(link.textContent).toBe(t('ox.services.view_all'));
    expect(link.getAttribute('href')).toBe('/services');
  });

  it('closes on the same reused scope line as every other advisory surface', () => {
    const { getByTestId } = renderWithProviders(
      <AdvisoryCta productName="Gold Standard Whey" settings={{}} />
    );
    expect(getByTestId('ox-pdp-advisory').textContent).toContain(
      t('ox.content.services.card_footer')
    );
  });

  it('adds a third quiet link to the branch directions, after the two buttons', () => {
    const { getByTestId } = renderWithProviders(
      <AdvisoryCta productName="Gold Standard Whey" settings={{}} />
    );
    const block = getByTestId('ox-pdp-advisory');
    const links = Array.from(
      block.querySelectorAll<HTMLAnchorElement>('.ox-advisory__actions .ox-advisory__action')
    );
    const directions = links[links.length - 1];
    expect(directions.textContent).toBe(t('ox.pdp.advisory_directions'));
    expect(directions.getAttribute('href')).toBe(BRANCH_LISTING.directionsUrl);
    expect(directions.getAttribute('target')).toBe('_blank');
    expect(directions.getAttribute('rel')).toBe('noopener noreferrer');
    expect(directions.className).toContain('ox-btn--link');
  });

  it('shows the store rating beside the closing note once the four google_* settings are filled', () => {
    const off = renderWithProviders(
      <AdvisoryCta productName="Gold Standard Whey" settings={{}} />
    );
    expect(off.getByTestId('ox-pdp-advisory').querySelector('[data-testid="ox-store-rating"]')).toBeNull();
    off.unmount();

    const on = renderWithProviders(
      <AdvisoryCta
        productName="Gold Standard Whey"
        settings={{
          google_place_url: 'https://maps.google.com/?cid=1',
          google_rating: '5.0',
          google_review_count: '80',
          google_verified_at: '2026-09-24',
        }}
      />
    );
    const block = on.getByTestId('ox-pdp-advisory');
    const rating = block.querySelector('[data-testid="ox-store-rating"]');
    expect(rating).not.toBeNull();
    expect(block.querySelector('.ox-advisory__foot')?.contains(rating)).toBe(true);
  });
});
