import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

const themeSettings: Record<string, unknown> = {};
const storeContacts: Record<string, string> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/hooks/useTheme', () => ({
  useTheme: () => ({ color: {}, font: undefined, settings: themeSettings, isRTL: true }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useStore', () => ({
  useStore: () => ({ settings: {}, contacts: storeContacts, social: {} }),
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

const { ServicesHub } = await import('../../app/components/pages/ServicesHub');

const t = createT('ar');
const MEDICAL_LINE = t('ox.services.medical_line');

function setSettings(next: Record<string, unknown>) {
  for (const key of Object.keys(themeSettings)) delete themeSettings[key];
  Object.assign(themeSettings, next);
}

beforeEach(() => {
  setSettings({});
  for (const key of Object.keys(storeContacts)) delete storeContacts[key];
});

describe('ServicesHub', () => {
  it('renders exactly one h1, and it is the hub headline', () => {
    renderWithProviders(<ServicesHub />);
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.content.services.hub_h1'));
  });

  it('carries the medical line verbatim under the advisory band and under the scope panel', () => {
    renderWithProviders(<ServicesHub />);
    const lines = screen.getAllByTestId('ox-medical-line');
    // Two, not four. It used to repeat under each of the three channel cards,
    // which was three copies of the same sentence inside one screenful. The
    // bare channel list is now the shared advisory section (`OxServices`), and
    // the line is said ONCE directly under it — covering the three channels
    // and the three programmes together — and once more under the scope panel.
    // What the claims source requires is that it appears verbatim on the
    // surface, not that it appears a given number of times.
    expect(lines).toHaveLength(2);
    for (const line of lines) expect(line.textContent).toBe(MEDICAL_LINE);
  });

  it('hides the consultation credit line while consultation_credit_note is empty', () => {
    renderWithProviders(<ServicesHub />);
    expect(screen.queryByTestId('ox-channel-credit')).toBeNull();
  });

  it('opens on the advisory band, both rows of it, and never a second channel section', () => {
    renderWithProviders(<ServicesHub />);
    // The page used to draw its own fuller channel cards above the band and
    // the band showed the plan doors alone; the same three services therefore
    // introduced themselves twice on one page (owner review 2026-09-23, late
    // night). One composition carries them now.
    expect(screen.queryAllByTestId('ox-channel-card')).toHaveLength(0);
    expect(screen.getAllByTestId('ox-channel-door')).toHaveLength(3);
    expect(screen.getAllByTestId('ox-plan-card')).toHaveLength(3);
    expect(screen.getAllByTestId('ox-services')).toHaveLength(1);
  });

  it('marks the written-question door as the section primary, since the band routes nobody out', () => {
    const { container } = renderWithProviders(<ServicesHub />);
    expect(container.querySelector('.ox-services__cta')).toBeNull();
    const primary = container.querySelectorAll('.ox-channel-door--primary');
    expect(primary).toHaveLength(1);
    expect(primary[0].getAttribute('data-channel')).toBe('written');
  });

  it('renders the credit note verbatim from the setting once the owner fills it', async () => {
    setSettings({ consultation_credit_note: 'خصم على الطلب الأول' });
    const { container } = renderWithProviders(<ServicesHub />);
    const credit = await screen.findByTestId('ox-channel-credit');
    expect(credit.textContent).toBe('خصم على الطلب الأول');
    // On the video door, which is the one channel the gate belongs to.
    expect(container.querySelector('[data-channel="video"]')?.contains(credit)).toBe(true);
  });

  it('states no reply time anywhere until reply_sla_hours is set', () => {
    renderWithProviders(<ServicesHub />);
    // One place says it now, the band's own row of ways to ask, so the page
    // no longer promises the same thing twice with two wordings.
    expect(screen.queryByTestId('ox-services-reply')).toBeNull();
    expect(screen.queryByTestId('ox-reply-line')).toBeNull();
  });

  it('carries the reply line once, under the offer strip, when reply_sla_hours is set', () => {
    setSettings({ reply_sla_hours: '24' });
    renderWithProviders(<ServicesHub />);
    const lines = screen.getAllByTestId('ox-services-reply');
    expect(lines).toHaveLength(1);
    expect(lines[0].textContent).toBe(t('ox.home.services_reply', { hours: '24' }));
    expect(screen.queryByTestId('ox-reply-line')).toBeNull();
  });

  it('opens on the offer: free advice and the free branch measurement, once each', () => {
    const { container } = renderWithProviders(<ServicesHub />);
    const strip = screen.getByTestId('ox-services-offer');
    expect(screen.getByTestId('ox-offer-advisory').textContent).toBe(
      t('ox.home.offer_advisory')
    );
    expect(screen.getByTestId('ox-offer-inbody').textContent).toBe(
      t('ox.content.services.visit_inbody')
    );
    // The strip belongs to the band, not to the masthead: one offer per page
    // (owner brief 2026-09-24, item 5).
    expect(container.querySelector('.ox-hub__advisory')?.contains(strip)).toBe(true);
    expect(container.querySelectorAll('[data-testid="ox-services-offer"]')).toHaveLength(1);
  });

  it('states the branch measurement once on the page, gated on inbody_included', () => {
    const on = renderWithProviders(<ServicesHub />);
    // UX audit 2026-09-24 P0-12: it used to say two different things on one
    // screen. One sentence, one place.
    expect((on.container.textContent ?? '').split('InBody').length - 1).toBe(1);
    on.unmount();

    setSettings({ inbody_included: false });
    const off = renderWithProviders(<ServicesHub />);
    expect(screen.queryByTestId('ox-offer-inbody')).toBeNull();
    expect(off.container.textContent).not.toContain('InBody');
  });

  it('shows the three ways to ask and the scope list', () => {
    renderWithProviders(<ServicesHub />);
    expect(screen.getAllByTestId('ox-channel-door')).toHaveLength(3);
    const scope = screen.getByTestId('ox-scope-panel');
    expect(within(scope).getAllByRole('listitem')).toHaveLength(7);
  });

  it('compares the five services on one grid, above the five sections', async () => {
    const { container } = renderWithProviders(<ServicesHub />);
    const table = screen.getByTestId('ox-service-compare');
    // One column per service, and a column header that is a link into the
    // section, so the comparison is also the way in.
    const columns = table.querySelectorAll('th[scope="col"]');
    expect(columns).toHaveLength(5);
    expect(columns[0].querySelector('a')?.getAttribute('href')).toBe('#written-question');

    // The same four questions asked of every service: the difference between
    // two services is one row of reading rather than two sections.
    const rowHeads = Array.from(table.querySelectorAll('th[scope="row"]')).map(
      (node) => node.textContent
    );
    expect(rowHeads).toEqual([
      t('ox.services.compare_how'),
      t('ox.services.stat_price'),
      t('ox.services.output_title'),
      t('ox.services.stat_change'),
    ]);

    // Nothing is invented to fill a cell: nutrition-plans has no product of
    // its own and no change policy, so those two cells are empty.
    const priceCells = table.querySelectorAll('[data-compare-row="price"] .ox-compare__cell');
    expect(priceCells[4].textContent).toBe('');
    const changeCells = table.querySelectorAll('[data-compare-row="change"] .ox-compare__cell');
    expect(changeCells[4].textContent).toBe('');

    // It sits before the five full sections, which is where the "which one"
    // question is actually asked.
    const order = Array.from(
      container.querySelectorAll('[data-testid="ox-service-compare"], .ox-services-list')
    ).map((node) => node.className.indexOf('ox-services-list') >= 0);
    expect(order).toEqual([false, true]);
  });

  it('never prices a service in copy: the cells come from the live products', async () => {
    renderWithProviders(<ServicesHub />);
    const table = screen.getByTestId('ox-service-compare');
    // The mocked API answers 0 for every product, so the four that have one
    // show the shared free label and none of them shows a typed number.
    const cells = table.querySelectorAll('[data-compare-row="price"] .ox-compare__cell');
    const free = await screen.findAllByText(t('ox.common.free'));
    expect(free.length).toBeGreaterThan(0);
    expect(cells).toHaveLength(5);
  });

  it('asks the four FAQ rows and never leaves a placeholder in one', () => {
    renderWithProviders(<ServicesHub />);
    expect(screen.getByText(t('ox.services.faq_1_q'))).toBeTruthy();
    expect(screen.getByText(t('ox.services.faq_4_q'))).toBeTruthy();
    expect(document.body.textContent).not.toContain('{{');
  });

  it('hides the contact row when the store has neither a number nor a phone', () => {
    renderWithProviders(<ServicesHub />);
    expect(screen.queryByTestId('ox-contact-row')).toBeNull();
  });

  it('mounts the mobile visit sticky bar (VISIT-2026-09-24 §4.4 item 4)', () => {
    renderWithProviders(<ServicesHub />);
    const bar = screen.getByTestId('ox-visit-sticky');
    expect(bar.getAttribute('aria-hidden')).toBe('true');
    expect(screen.getAllByText(t('ox.content.services.visit_cta_short')).length).toBeGreaterThan(0);
  });
});
