import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { i18nModuleMock } from '../helpers/i18n';

// The engine sub-paths these primitives import. `tests/setup.tsx` is frozen
// (PLAN-final 2.1), so the mocks are declared per file.
vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('../helpers/i18n')).i18nModuleMock('ar')
);

vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: String(to), ...rest }, children as React.ReactNode),
}));

// Mirrors the engine's own SAR rendering: the amount followed by the
// `sicon-sar` glyph (theme-engine dist/CurrencySymbol-TARAYUOT.js:5).
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: number | string | undefined) =>
      React.createElement(
        React.Fragment,
        null,
        Number(amount ?? 0).toFixed(2),
        React.createElement('i', { className: 'sicon-sar', 'aria-hidden': 'true' })
      ),
    parse: (value: string) => Number(value),
    isValid: () => true,
  }),
}));

const { Button } = await import('../../app/components/common/Button');
const { SectionHeader } = await import('../../app/components/common/SectionHeader');
const { Price } = await import('../../app/components/common/Price');
const { Bdi } = await import('../../app/components/common/Bdi');
const { Accordion } = await import('../../app/components/common/Accordion');
const { EmptyState } = await import('../../app/components/common/EmptyState');
const { Table } = await import('../../app/components/common/Table');
const { Tabs } = await import('../../app/components/common/Tabs');

const t = i18nModuleMock('ar').useTranslation().t;

describe('Button', () => {
  it('renders the four variants plus the on-dark context, each with its class', () => {
    const variants = ['primary', 'secondary', 'ghost', 'link'] as const;
    const { container } = renderWithProviders(
      <div>
        {variants.map((variant) => (
          <Button key={variant} variant={variant}>
            {variant}
          </Button>
        ))}
        <div className="ox-band-dark">
          <Button variant="secondary">on dark</Button>
        </div>
      </div>
    );
    for (const variant of variants) {
      expect(container.querySelector(`.ox-btn--${variant}`)).not.toBeNull();
    }
    expect(container.querySelectorAll('.ox-btn')).toHaveLength(5);
    expect(container.querySelector('.ox-band-dark .ox-btn--secondary')).not.toBeNull();
  });

  it('locks the resting width and announces itself while loading', () => {
    const { container, rerender } = renderWithProviders(<Button>أضف إلى السلة</Button>);
    const button = container.querySelector('.ox-btn') as HTMLButtonElement;
    // jsdom reports a zero box, so the lock is asserted through the contract
    // rather than a pixel: the class, aria-busy and the loader are present and
    // the label stays in the DOM (it is hidden with opacity, never removed).
    expect(button.classList.contains('is-loading')).toBe(false);
    rerender(<Button loading>أضف إلى السلة</Button>);
    const loadingButton = container.querySelector('.ox-btn') as HTMLButtonElement;
    expect(loadingButton.classList.contains('is-loading')).toBe(true);
    expect(loadingButton.getAttribute('aria-busy')).toBe('true');
    expect(loadingButton.querySelector('.ox-btn__loader')).not.toBeNull();
    expect(loadingButton.querySelector('.ox-btn__label')?.textContent).toBe('أضف إلى السلة');
    expect(screen.getByRole('status').getAttribute('aria-label')).toBe(t('ox.common.loading'));
  });

  it('keeps an aria-disabled control focusable and a disabled one out of the tab order', () => {
    const { container } = renderWithProviders(
      <div>
        <Button ariaDisabled>aria</Button>
        <Button disabled>native</Button>
      </div>
    );
    const [aria, native] = Array.from(container.querySelectorAll('button'));
    expect(aria.getAttribute('aria-disabled')).toBe('true');
    expect(aria.hasAttribute('disabled')).toBe(false);
    expect(native.hasAttribute('disabled')).toBe(true);
  });
});

describe('SectionHeader', () => {
  it('omits the eyebrow row when no eyebrow is given (amendment A4)', () => {
    const { container } = renderWithProviders(<SectionHeader title="تسوق حسب هدفك" />);
    expect(container.querySelector('.ox-sh__eyebrow')).toBeNull();
    expect(container.querySelector('h2.ox-sh__title')).not.toBeNull();
  });

  it('renders the eyebrow and the view-all link when both are given', () => {
    const { container } = renderWithProviders(
      <SectionHeader title="فرعنا" eyebrow="الخالدية" viewAll={{ to: '/branch' }} />
    );
    expect(container.querySelector('.ox-sh__eyebrow')?.textContent).toBe('الخالدية');
    const link = container.querySelector('.ox-sh__link') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/branch');
    expect(link.textContent).toContain(t('ox.common.view_all'));
    // The chevron mirrors on the icon only (DIRECTION 3.4).
    expect(link.querySelector('.ox-mirror')).not.toBeNull();
  });
});

describe('Price', () => {
  it('keeps the engine icon glyph visible, wrapped for bots and screen readers', () => {
    const { container } = renderWithProviders(<Price amount={349} size="h2" />);
    const wrapper = container.querySelector('.ox-price') as HTMLElement;
    expect(wrapper).not.toBeNull();
    expect(wrapper.classList.contains('ox-price--h2')).toBe(true);
    const mark = wrapper.querySelector('.ox-price__mark') as HTMLElement;
    expect(mark).not.toBeNull();
    // Verified 2026-09-22 against the live sallaicons font (codepoint
    // U+E9BC): the glyph draws Salla's current Saudi Riyal symbol, not the
    // old U+FDFC ligature, so it stays the visible mark rather than being
    // replaced by text.
    const icon = mark.querySelector('i.sicon-sar') as HTMLElement;
    expect(icon).not.toBeNull();
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    // The glyph is 10% larger than its `.ox-price__mark` context (owner
    // addendum, 2026-09-23): an inline style, since it always outranks the
    // stylesheet's own `.sicon-sar { font-size: inherit }` regardless of
    // that rule's specificity.
    expect(icon.style.fontSize).toBe('1.1em');
    // Bots, crawlers and screen readers get the written mark two ways: the
    // wrapper's accessible name, and a genuinely-selectable sr-only node.
    expect(mark.getAttribute('role')).toBe('img');
    expect(mark.getAttribute('aria-label')).toBe(t('ox.common.sar'));
    expect(mark.querySelector('.ox-sr-only')?.textContent).toBe(t('ox.common.sar'));
    expect(mark.textContent).toBe('ر.س');
    expect(wrapper.textContent).toContain('349.00');
    expect(wrapper.textContent).not.toContain(String.fromCharCode(0xfdfc));
  });

  it('strikes the was-price and still writes the mark', () => {
    const { container } = renderWithProviders(<Price amount={399} was />);
    expect(container.querySelector('.ox-price--was s')).not.toBeNull();
    expect(container.querySelector('.ox-price--was s .ox-price__mark')).not.toBeNull();
  });
});

describe('Bdi', () => {
  it('carries lang="en" by default and dir="ltr" only when asked (amendment A5)', () => {
    const { container } = renderWithProviders(
      <p>
        من <Bdi>Optimum Nutrition</Bdi> ورقم الطلب <Bdi ltr>OX-2026-0042</Bdi>
      </p>
    );
    const [name, code] = Array.from(container.querySelectorAll('bdi'));
    expect(name.getAttribute('lang')).toBe('en');
    expect(name.hasAttribute('dir')).toBe(false);
    expect(code.getAttribute('dir')).toBe('ltr');
    expect(code.classList.contains('ox-ltr')).toBe(true);
  });

  it('omits the lang attribute when lang is null', () => {
    const { container } = renderWithProviders(<Bdi lang={null}>نص</Bdi>);
    expect(container.querySelector('bdi')?.hasAttribute('lang')).toBe(false);
  });
});

describe('Accordion', () => {
  const items = [
    { id: 'a', title: 'سؤال أول', children: <p>جواب أول</p> },
    { id: 'b', title: 'سؤال ثان', children: <p>جواب ثان</p> },
    { id: 'c', title: 'تنبيه', children: <p>سطر مقفل</p>, locked: true },
  ];

  it('wires aria-expanded and aria-controls, and gives the locked row no control', () => {
    const { container } = renderWithProviders(<Accordion items={items} defaultOpen={['a']} />);
    const triggers = Array.from(container.querySelectorAll('.ox-acc__trigger'));
    expect(triggers).toHaveLength(2);
    expect(triggers[0].getAttribute('aria-expanded')).toBe('true');
    expect(triggers[1].getAttribute('aria-expanded')).toBe('false');
    const panelId = triggers[0].getAttribute('aria-controls') as string;
    expect(container.querySelector(`#${CSS.escape(panelId)}`)).not.toBeNull();
    const locked = container.querySelector('.ox-acc__static') as HTMLElement;
    expect(locked.querySelector('button')).toBeNull();
    expect(locked.textContent).toContain('سطر مقفل');
  });

  it('opens one row at a time unless allowMultiple is set', () => {
    const { container } = renderWithProviders(<Accordion items={items} defaultOpen={['a']} />);
    const triggers = Array.from(container.querySelectorAll('.ox-acc__trigger')) as HTMLElement[];
    fireEvent.click(triggers[1]);
    const after = Array.from(container.querySelectorAll('.ox-acc__trigger'));
    expect(after.map((node) => node.getAttribute('aria-expanded'))).toEqual(['false', 'true']);
  });
});

describe('EmptyState, Table and Tabs', () => {
  it('renders the empty state mark, title and both routes out', () => {
    const { container } = renderWithProviders(
      <EmptyState
        icon="help"
        title="سلتك فارغة"
        body="ابدأ من هدفك"
        primary={<Button>تسوق حسب هدفك</Button>}
        secondary={<Button variant="secondary">تصفح حسب النوع</Button>}
      />
    );
    expect(container.querySelector('.ox-empty__mark .ox-icon')).not.toBeNull();
    expect(container.querySelector('h3.ox-empty__title')?.textContent).toBe('سلتك فارغة');
    expect(container.querySelectorAll('.ox-empty__actions .ox-btn')).toHaveLength(2);
  });

  it('marks the label column as a row header and end-aligns numeric cells', () => {
    const rows = [{ day: 'الأحد', servings: 60 }];
    const { container } = renderWithProviders(
      <Table
        caption="ساعات العمل"
        columns={[
          { id: 'day', header: 'اليوم', cell: (row) => row.day, rowHeader: true },
          { id: 'n', header: 'الحصص', cell: (row) => row.servings, numeric: true },
        ]}
        rows={rows}
      />
    );
    expect(container.querySelector('tbody th')?.getAttribute('scope')).toBe('row');
    expect(container.querySelector('tbody td')?.classList.contains('ox-table__num')).toBe(true);
    expect(container.querySelector('caption')?.textContent).toBe('ساعات العمل');
  });

  it('gives tabs a roving tabindex and hides the panels that are not selected', () => {
    const { container } = renderWithProviders(
      <Tabs
        label="tabs"
        items={[
          { id: 'one', label: 'الأول', children: <p>أول</p> },
          { id: 'two', label: 'الثاني', children: <p>ثان</p> },
        ]}
      />
    );
    const tabs = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
    expect(tabs.map((tab) => tab.getAttribute('tabindex'))).toEqual(['0', '-1']);
    const panels = Array.from(container.querySelectorAll('[role="tabpanel"]')) as HTMLElement[];
    expect(panels.map((panel) => panel.hasAttribute('hidden'))).toEqual([false, true]);
    fireEvent.click(tabs[1]);
    const after = Array.from(container.querySelectorAll('[role="tab"]')) as HTMLElement[];
    expect(after.map((tab) => tab.getAttribute('aria-selected'))).toEqual(['false', 'true']);
  });
});
