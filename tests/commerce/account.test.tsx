import React from 'react';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import { screen, within } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from '../helpers/i18n';

/**
 * The account frame (PLAN-final 6.3, reference `account.png`).
 *
 * Three things are under test and they are the three the engine gets wrong
 * for this store: that the rail exists at every width and lists only routes
 * the theme serves, that the current row is marked without JavaScript having
 * to read the URL, and that every surface's empty state is a finished block
 * with a route out rather than the platform placeholder.
 */
vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);
// The engine `Link` pulls the whole router runtime into jsdom; the account
// rail only needs it to render an anchor with the right href.
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: { to: string; children: React.ReactNode }) =>
    React.createElement('a', { href: to, ...rest }, children),
}));
const documentClassCalls: unknown[] = [];
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  useDocumentClass: (descriptor: unknown) => {
    documentClassCalls.push(descriptor);
  },
}));

const { AccountNav, ACCOUNT_NAV } = await import('../../app/components/commerce/AccountNav');
const { AccountShell } = await import('../../app/components/commerce/AccountShell');
const { AccountEmpty } = await import('../../app/components/commerce/AccountEmpty');

const ROUTES_DIR = path.join('app', 'routes');
const t = createT('ar');

describe('AccountNav', () => {
  it('links only to routes the theme actually serves', () => {
    const files = new Set(fs.readdirSync(ROUTES_DIR));
    for (const group of ACCOUNT_NAV) {
      for (const item of group.items) {
        // `/account/orders` -> `account.orders.tsx`, `/loyalty` -> `loyalty.tsx`
        const file = `${item.to.replace(/^\//, '').replace(/\//g, '.')}.tsx`;
        expect(files.has(file), `${item.to} has no route file (${file})`).toBe(true);
      }
    }
  });

  /**
   * The engine's own `pendingOrdersRedirectLoader` sends `/pending-orders` to
   * `/{locale}/orders`, a route this theme does not have: its order history
   * is `/account/orders`. The theme writes the redirect itself, and the file
   * must stay free of the `@auto-generated` marker or the next build puts the
   * broken target back (`app/routes.ts`).
   */
  it('sends /pending-orders to the order history this theme actually serves', () => {
    const source = fs.readFileSync(path.join(ROUTES_DIR, 'pending-orders.tsx'), 'utf8');
    expect(source.includes('/account/orders?status=pending')).toBe(true);
    expect(source.includes("from '@salla.sa/twilight-theme-engine/routes/seo-redirects'")).toBe(
      false
    );
    expect(source.trimStart().startsWith('// @auto-generated')).toBe(false);
  });

  it('lists no surface BUILD.md defers to V2', () => {
    const ids = ACCOUNT_NAV.flatMap((group) => group.items.map((item) => item.id));
    // `references/account.png` shows both; PLAN-final 6.2 rules them out.
    expect(ids).not.toContain('recommended');
    expect(ids).not.toContain('supply');
  });

  it('renders every row at every width, which the engine menu does not', () => {
    renderWithProviders(<AccountNav current="orders" />);
    const nav = screen.getByTestId('ox-account-nav');
    const links = within(nav).getAllByRole('link');
    const expected = ACCOUNT_NAV.reduce((sum, group) => sum + group.items.length, 0);
    expect(links).toHaveLength(expected);
  });

  it('marks the current row, and only that row, before hydration', () => {
    renderWithProviders(<AccountNav current="wishlist" />);
    const current = screen.getAllByRole('link').filter((a) => a.getAttribute('aria-current'));
    expect(current).toHaveLength(1);
    expect(current[0].textContent).toBe(t('ox.account.wishlist'));
    expect(current[0].className).toContain('is-current');
  });

  it('resolves every label from the locale rather than printing a key', () => {
    renderWithProviders(<AccountNav current="profile" />);
    for (const group of ACCOUNT_NAV) {
      expect(screen.getByText(t(group.headingKey))).toBeTruthy();
      for (const item of group.items) {
        const label = t(item.labelKey);
        expect(label.startsWith('ox.'), `${item.labelKey} is missing`).toBe(false);
        expect(screen.getByText(label)).toBeTruthy();
      }
    }
  });
});

describe('AccountShell', () => {
  it('registers the body class the frame rules are scoped by', () => {
    documentClassCalls.length = 0;
    renderWithProviders(
      <AccountShell current="orders" titleKey="ox.account.orders">
        <p>rows</p>
      </AccountShell>
    );
    expect(documentClassCalls).toContainEqual({ body: { class: 'ox-account' } });
  });

  it('renders exactly one h1, in the theme voice', () => {
    renderWithProviders(
      <AccountShell current="orders" titleKey="ox.account.orders" leadKey="ox.account.orders_lead">
        <p>rows</p>
      </AccountShell>
    );
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0].textContent).toBe(t('ox.account.orders'));
    expect(screen.getByText(t('ox.account.orders_lead'))).toBeTruthy();
  });

  it('carries the rail and the surface content side by side', () => {
    renderWithProviders(
      <AccountShell current="wallet" titleKey="ox.account.wallet">
        <p data-testid="surface">rows</p>
      </AccountShell>
    );
    const shell = screen.getByTestId('ox-account-shell');
    expect(shell.getAttribute('data-surface')).toBe('wallet');
    expect(within(shell).getByTestId('ox-account-nav')).toBeTruthy();
    expect(within(shell).getByTestId('surface')).toBeTruthy();
  });

  it('omits the lead line when the surface has none to give', () => {
    renderWithProviders(
      <AccountShell current="orders" titleKey="ox.order.details">
        <p>order</p>
      </AccountShell>
    );
    expect(document.querySelector('.ox-acct__lead')).toBeNull();
  });
});

describe('AccountEmpty', () => {
  it('sits inside a panel so the column still reads as a finished page', () => {
    renderWithProviders(
      <AccountEmpty icon="plan" titleKey="ox.empty.orders_title" bodyKey="ox.empty.orders_body" />
    );
    const panel = screen.getByTestId('ox-panel');
    expect(within(panel).getByText(t('ox.empty.orders_title'))).toBeTruthy();
    expect(within(panel).getByText(t('ox.empty.orders_body'))).toBeTruthy();
  });

  it('always offers a route out to something real', () => {
    renderWithProviders(
      <AccountEmpty
        titleKey="ox.empty.wishlist_title"
        bodyKey="ox.empty.wishlist_body"
        secondaryTo="/"
        secondaryKey="ox.empty.cta_goals"
      />
    );
    const links = screen.getAllByRole('link');
    expect(links.map((a) => a.getAttribute('href'))).toEqual(['/latest-products', '/']);
  });

  it('invents no figure: the copy it renders is the locale value, unchanged', () => {
    renderWithProviders(
      <AccountEmpty titleKey="ox.empty.wallet_title" bodyKey="ox.empty.wallet_body" />
    );
    const body = screen.getByText(t('ox.empty.wallet_body'));
    expect(body.textContent).toBe(t('ox.empty.wallet_body'));
    expect(/[0-9]/.test(body.textContent ?? '')).toBe(false);
  });
});
