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

  it('carries the medical line verbatim under the advisory section and under the scope panel', () => {
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

  it('renders the credit note verbatim from the setting once the owner fills it', async () => {
    setSettings({ consultation_credit_note: 'خصم على الطلب الأول' });
    renderWithProviders(<ServicesHub />);
    const credit = await screen.findByTestId('ox-channel-credit');
    expect(credit.textContent).toBe('خصم على الطلب الأول');
  });

  it('hides the reply-time promise while reply_sla_hours is empty', () => {
    renderWithProviders(<ServicesHub />);
    expect(screen.queryByTestId('ox-reply-line')).toBeNull();
  });

  it('interpolates reply_sla_hours into the reply line once it is set', () => {
    setSettings({ reply_sla_hours: '24' });
    renderWithProviders(<ServicesHub />);
    const line = screen.getByTestId('ox-reply-line');
    expect(line.textContent).toBe(t('ox.services.reply_within', { hours: '24' }));
    expect(line.textContent).toContain('24');
  });

  it('states no written-question reply time under the channel cards until reply_sla_hours is set', () => {
    renderWithProviders(<ServicesHub />);
    expect(screen.queryByTestId('ox-services-reply')).toBeNull();
  });

  it('carries the ox.home.services_reply line under the channel cards once reply_sla_hours is set', () => {
    setSettings({ reply_sla_hours: '24' });
    renderWithProviders(<ServicesHub />);
    const line = screen.getByTestId('ox-services-reply');
    expect(line.textContent).toBe(t('ox.home.services_reply', { hours: '24' }));
  });

  it('shows the three channel cards and the scope list', () => {
    renderWithProviders(<ServicesHub />);
    expect(screen.getAllByTestId('ox-channel-card')).toHaveLength(3);
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
});
