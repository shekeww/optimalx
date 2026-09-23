import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

const t = createT('ar');

/** Every HookSlot render, in DOM order, with the context it was given. */
const slots: { name: string; context: Record<string, unknown> | undefined }[] = [];
const detail = vi.fn();
let themeSettings: Record<string, unknown> = {};
let ratingSettings: Record<string, unknown> = { show_on_product: false };

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine', () => ({
  useTwilight: () => ({
    theme: { settings: themeSettings },
    store: { country: 'SA', settings: { rating: ratingSettings } },
    locale: 'ar',
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useProduct', () => ({
  useProduct: (initial: unknown) => ({ product: initial, reload: async () => {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useComments', () => ({
  useComments: () => ({ commentsKey: 0, refresh: () => {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useGtm', () => ({
  useGtm: () => ({ enabled: true, detail }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({ ids: [], count: 0, has: () => false, toggle: () => {} }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: unknown) => <span data-testid="money">{String(amount)}</span>,
    parse: Number,
    isValid: () => true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/HookSlot', () => ({
  HookSlot: ({ name, context }: { name: string; context?: Record<string, unknown> }) => {
    slots.push({ name, context });
    return <div data-hook-slot={name} />;
  },
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Breadcrumb: () => <nav data-testid="engine-breadcrumb" />,
  RenderWhenVisible: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  Link: ({ to, children }: Record<string, unknown>) => <a href={to as string}>{children as React.ReactNode}</a>,
  Image: ({ alt, src }: Record<string, unknown>) => <img alt={String(alt ?? '')} src={src as string} />,
}));
vi.mock('@salla.sa/twilight-theme-engine/collapse', () => {
  const Collapse = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  Collapse.Trigger = ({ children, onClick }: Record<string, unknown>) => (
    <button type="button" onClick={onClick as () => void}>
      {children as React.ReactNode}
    </button>
  );
  Collapse.Content = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
  return { Collapse };
});
vi.mock('@salla.sa/twilight-theme-engine/product', () => ({
  AddToCartForm: ({ formStartSlot, formEndSlot, stickyAddToCart }: Record<string, unknown>) => (
    <form data-testid="engine-form" data-sticky={String(stickyAddToCart)}>
      {formStartSlot as React.ReactNode}
      {formEndSlot as React.ReactNode}
      <salla-add-product-button />
    </form>
  ),
  ProductCard: ({ product }: { product: { name: string } }) => <article>{product.name}</article>,
}));
vi.mock('../../app/components/blocks/ProductsSliderWrapper', () => ({
  ProductsSliderWrapper: ({ title }: { title: React.ReactNode }) => (
    <div data-testid="related">{title}</div>
  ),
}));
/** What `AddAlso` gets back per source; empty is the live store's answer. */
const listBySource: Record<string, { id: number; name: string }[]> = {};
const listCalls: string[] = [];
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    list: async ({ source }: { source: string }) => {
      listCalls.push(source);
      return { items: listBySource[source] ?? [], next: null };
    },
  },
}));

const stub = (name: string) => ({ [name]: () => <div data-testid={name} /> });
vi.mock('@salla.sa/twilight-components-react/offer', () => stub('SallaOffer'));
vi.mock('@salla.sa/twilight-components-react/quick-order', () => stub('SallaQuickOrder'));
vi.mock('@salla.sa/twilight-components-react/bought-together', () => stub('SallaBoughtTogether'));
vi.mock('@salla.sa/twilight-components-react/installment', () => stub('SallaInstallment'));
vi.mock('@salla.sa/twilight-components-react/social-share', () => stub('SallaSocialShare'));
vi.mock('@salla.sa/twilight-components-react/rating-stars', () => ({
  SallaRatingStars: ({ value }: { value: number }) => <span data-testid="stars">{value}</span>,
}));
vi.mock('@salla.sa/twilight-components-react/slider', () => ({
  SallaSlider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="salla-slider">{children}</div>
  ),
}));

const { ProductPage } = await import('../../app/components/product/ProductPage');

/** The engine's own order (dist/routes/product.js:85-117). */
const ENGINE_SLOT_ORDER = [
  'product:start',
  'product:details.start',
  'product:single.description.start',
  'product:single.description',
  'product:single.description.end',
  'product:details.end',
  'product:single.form.start',
  'product:single.form.end',
  'product:related.start',
  'product:related.end',
  'product:end',
];

const WHEY_DESCRIPTION =
  '<p>الحصص: 73 | حجم الحصة: 31 جم | الصلاحية: 2029-03 | الشكل: بودرة</p>' +
  '<p>بروتين واي سريع الامتصاص.</p>' +
  '<table><tr><th>الحقائق الغذائية</th><th>لكل حصة</th></tr>' +
  '<tr><td>البروتين</td><td>24 جم</td></tr></table>' +
  '<p>طريقة الاستخدام: تخلط مغرفة مع 200 مل ماء.</p>' +
  '<p>تنبيه: يحتوي على الحليب.</p>';

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 1996831868,
    name: 'Gold Standard Whey',
    description: WHEY_DESCRIPTION,
    url: '/p1996831868',
    type: 'product',
    status: 'sale',
    price: 240,
    sale_price: 240,
    regular_price: 240,
    base_currency_price: 240,
    currency: 'SAR',
    max_quantity: 10,
    image: { url: 'https://cdn.test/a.jpg', alt: 'a' },
    images: [{ id: 1, url: 'https://cdn.test/a.jpg', alt: 'a' }],
    is_taxable: true,
    has_read_more: false,
    can_add_note: false,
    can_show_remained_quantity: false,
    can_upload_file: false,
    has_custom_form: false,
    has_metadata: false,
    is_on_sale: false,
    is_hidden_quantity: false,
    is_available: true,
    is_out_of_stock: false,
    is_require_shipping: true,
    has_size_guide: false,
    ...overrides,
  } as never;
}

const page = { slug: 'product.single', title: 'Gold Standard Whey', breadcrumbs: [] } as never;

/** `YYYY-MM`, n whole months from today, so a date assertion cannot rot. */
function monthsFromNow(n: number): string {
  const now = new Date();
  const then = new Date(now.getFullYear(), now.getMonth() + n, 1);
  return `${then.getFullYear()}-${String(then.getMonth() + 1).padStart(2, '0')}`;
}

function renderPage(overrides: Record<string, unknown> = {}) {
  return renderWithProviders(<ProductPage product={makeProduct(overrides)} page={page} />);
}

describe('ProductPage: the engine contract', () => {
  beforeEach(() => {
    slots.length = 0;
    detail.mockClear();
    themeSettings = {};
  });

  it('renders the eleven hook slots in the engine order', () => {
    renderPage();
    expect(slots.map((slot) => slot.name)).toEqual(ENGINE_SLOT_ORDER);
  });

  it('passes context.product to every slot, which the engine never did (C4)', () => {
    renderPage();
    for (const slot of slots) {
      expect((slot.context as { product?: { id: number } })?.product?.id, slot.name).toBe(
        1996831868
      );
    }
  });

  it('fires the GTM detail event exactly once', () => {
    renderPage();
    expect(detail).toHaveBeenCalledTimes(1);
  });

  it('uses the engine Breadcrumb, shows it, and emits no second one (C11)', () => {
    const { container } = renderPage();
    const breadcrumb = screen.getByTestId('engine-breadcrumb');
    expect(breadcrumb).toBeTruthy();
    expect(container.querySelectorAll('[data-testid="engine-breadcrumb"]')).toHaveLength(1);
    // Visible, not clipped. A visitor who arrives on a product from search
    // has no other answer to "what kind of store is this, and what else is
    // in it".
    expect(breadcrumb.closest('.ox-sr-only')).toBeNull();
  });

  it('leaves the cart to the engine form and turns its CDN sticky bar off', () => {
    renderPage();
    expect(screen.getByTestId('engine-form').getAttribute('data-sticky')).toBe('false');
  });

  it('renders exactly one h1', () => {
    const { container } = renderPage();
    expect(container.querySelectorAll('h1')).toHaveLength(1);
  });
});

describe('ProductPage: the physical composition', () => {
  beforeEach(() => {
    slots.length = 0;
    detail.mockClear();
    themeSettings = {};
    for (const key of Object.keys(listBySource)) delete listBySource[key];
    listCalls.length = 0;
  });

  it('puts the statistic strip above the price and the calculator in the method panel', () => {
    const { container } = renderPage();
    expect(container.querySelector('.ox-stats')).not.toBeNull();
    expect(container.querySelector('.ox-howto .ox-supply')).not.toBeNull();
    const buy = container.querySelector('.ox-pdp__buy');
    const order = Array.from(buy?.children ?? []).map((node) => node.className);
    const stats = order.findIndex((name) => name.indexOf('ox-stats') >= 0);
    const price = order.findIndex((name) => name.indexOf('ox-pdp__price-block') >= 0);
    expect(stats).toBeGreaterThanOrEqual(0);
    expect(stats).toBeLessThan(price);
  });

  it('splits the description into its blocks and repeats none of them', () => {
    const { container } = renderPage();
    expect(container.querySelector('.ox-nutrition')).not.toBeNull();
    expect(container.querySelector('.ox-howto')).not.toBeNull();
    const lead = container.querySelector('.ox-pdp__lead')?.textContent ?? '';
    expect(lead.length).toBeGreaterThan(0);
    expect(lead).not.toContain('الحصص:');
    // One prose paragraph only, so it is the short description and the
    // benefits region is correctly absent, along with its tab.
    expect(container.querySelector('.ox-prose')).toBeNull();
    expect(container.textContent).not.toContain(t('ox.pdp.tab_benefits'));
  });

  it('renders the description through the sanitiser, never raw', () => {
    const { container } = renderPage({
      description: '<p>الحصص: 5</p><p>نص<script>alert(1)</script></p><p>مزيد<b>x</b></p>',
    });
    expect(container.innerHTML).not.toContain('<script');
    expect(container.querySelector('.ox-pdp__lead')?.textContent).toContain('نص');
    expect(container.querySelector('.ox-prose')?.textContent).toContain('مزيد');
  });

  it('always carries the mandated medical line, verbatim and open', () => {
    renderPage();
    expect(screen.getByText(t('ox.pdp.medical_line'))).toBeTruthy();
  });

  it('hides the supply calculator when the label printed no servings', () => {
    const { container } = renderPage({ description: '<p>وصف بلا سطر مواصفات.</p>' });
    expect(container.querySelector('.ox-supply')).toBeNull();
    expect(container.querySelector('.ox-pdp__chips')).toBeNull();
  });

  it('renders the sticky bar and the related rail at the bottom', () => {
    const { container } = renderPage();
    expect(container.querySelector('.ox-sticky')).not.toBeNull();
    expect(screen.getByTestId('related')).toBeTruthy();
    expect(container.querySelector('.ox-related__title')?.textContent).toBe(
      t('ox.pdp.you_may_like')
    );
  });

  it('mounts the advisory CTA after the related rail, and never on a service or booking page', () => {
    const physical = renderPage();
    const advisory = physical.container.querySelector('[data-testid="ox-pdp-advisory"]');
    expect(advisory).not.toBeNull();
    const order = Array.from(physical.container.querySelectorAll('.ox-sticky, [data-testid="ox-pdp-advisory"]'));
    expect(order[0]?.getAttribute('data-testid')).toBe('ox-pdp-advisory');

    const service = renderPage({ type: 'service', description: '<p>المدة: 20 دقيقة</p>' });
    expect(service.container.querySelector('[data-testid="ox-pdp-advisory"]')).toBeNull();
    const booking = renderPage({ type: 'booking', description: '<p>المدة: 20 دقيقة</p>' });
    expect(booking.container.querySelector('[data-testid="ox-pdp-advisory"]')).toBeNull();
  });

  it('leaves the cross-sell slot out entirely until there is something in it', async () => {
    // The live store answers `related` with nothing and puts no product in a
    // category, so the honest render of this region is no region: no
    // heading, no reserved box, nothing that appears and then collapses.
    const { container } = renderPage();
    await waitFor(() => expect(listCalls).toContain('related'));
    expect(container.querySelector('[data-testid="ox-add-also"]')).toBeNull();
  });

  it('cross-sells under the buy zone once the merchant has linked products', async () => {
    listBySource.related = [
      { id: 11, name: 'Creatine' },
      { id: 12, name: 'Shaker' },
      { id: 13, name: 'Bar' },
      { id: 14, name: 'A fourth the strip does not take' },
    ];
    const { container } = renderPage();
    const strip = await screen.findByTestId('ox-add-also');
    // Three, directly under the buy zone, above the brand band and the tabs.
    expect(strip.querySelectorAll('li')).toHaveLength(3);
    // The heading claims nothing about anybody else's basket.
    expect(strip.querySelector('h2')?.textContent).toBe(t('ox.pdp.add_also'));
    const order = Array.from(
      container.querySelectorAll('[data-testid="ox-add-also"], .ox-brand-band, .ox-strip')
    );
    expect(order[0]?.getAttribute('data-testid')).toBe('ox-add-also');
  });

  it('never offers the product the shopper is already looking at', async () => {
    listBySource.related = [
      { id: 1996831868, name: 'Gold Standard Whey' },
      { id: 12, name: 'Shaker' },
    ];
    renderPage();
    const strip = await screen.findByTestId('ox-add-also');
    expect(strip.textContent).not.toContain('Gold Standard Whey');
    expect(strip.querySelectorAll('li')).toHaveLength(1);
  });

  it('states the expiry above the fold once the date is far enough out', () => {
    // The trust strip promises a clear expiry on every product, and the buy
    // column used to show one only when it was nearly expired. The fixture
    // label's own date is years out, so it is the reassurance case.
    const { container } = renderPage();
    const line = container.querySelector('[data-testid="ox-pdp-expiry"]');
    expect(line?.textContent).toContain('2029-03');

    // Inside six months the date is a warning and the price block already
    // badges it, so the fact is above the fold either way and never twice.
    // Two months out, computed from today so the assertion cannot rot.
    const near = monthsFromNow(2);
    const soon = renderPage({
      description: `<p>الحصص: 10 | الصلاحية: ${near} | الشكل: بودرة</p><p>وصف قصير.</p>`,
    });
    expect(soon.container.querySelector('[data-testid="ox-pdp-expiry"]')).toBeNull();
    expect(soon.container.querySelector('.ox-pdp__badges')?.textContent).toContain(near);
  });
});

describe('ProductPage: the claims gates', () => {
  beforeEach(() => {
    slots.length = 0;
    detail.mockClear();
    themeSettings = {};
    ratingSettings = { show_on_product: false };
  });

  it('hides the VAT line until vat_number is set', () => {
    const empty = renderPage();
    expect(empty.container.querySelector('.ox-pdp__tax')).toBeNull();

    themeSettings = { vat_number: '310000000000003' };
    const set = renderPage();
    expect(set.container.querySelector('.ox-pdp__tax')?.textContent).toBe(
      t('ox.trust.vat_included')
    );
  });

  it('says "authentic products" until claim_official_distributors is true', () => {
    const before = renderPage();
    expect(before.container.textContent).toContain(t('ox.trust.authentic'));
    expect(before.container.textContent).not.toContain(t('ox.pdp.official_distributors'));

    themeSettings = { claim_official_distributors: true };
    const after = renderPage();
    expect(after.container.textContent).toContain(t('ox.pdp.official_distributors'));
  });

  it('shows no merchant delivery or free-shipping line until the settings carry one', () => {
    const empty = renderPage();
    expect(empty.container.querySelector('.ox-delivery')).toBeNull();

    themeSettings = { free_shipping_threshold: '299', delivery_promise_line: 'يصل خلال يومين' };
    const set = renderPage();
    expect(set.container.querySelectorAll('.ox-delivery__row')).toHaveLength(2);
    expect(set.container.textContent).toContain(t('ox.pdp.free_shipping_prefix'));
  });

  it('never states a rating the store does not have', () => {
    const { container } = renderPage();
    expect(container.querySelector('.ox-rating')).toBeNull();
    expect(container.querySelector('.ox-trust-grid')).not.toBeNull();
  });

  it('turns the zero-review state into an offer without inventing a review', () => {
    ratingSettings = { show_on_product: true };
    const { container } = renderPage();
    const block = container.querySelector('[data-testid="ox-pdp-no-reviews"]');
    // The honest sentence is unchanged and is still first.
    expect(block?.textContent).toContain(t('ox.pdp.no_reviews'));
    // What follows it is the one thing the store can actually offer instead,
    // and it is also the only link from a product page to the advisory.
    expect(block?.textContent).toContain(t('ox.pdp.no_reviews_ask'));
    expect(block?.querySelector('a')?.getAttribute('href')).toBe('/services');
    // No star, no average, no count, no "be the first to rate" that the
    // platform would not accept from a visitor who has not bought.
    expect(container.querySelector('.ox-rating')).toBeNull();

    // Salla's own comments element is mounted at zero too, so a customer who
    // can review is not locked out of leaving the first one.
    expect(container.querySelector('salla-comments')).not.toBeNull();
  });

  it('drops the zero-review copy once the product has real reviews', () => {
    ratingSettings = { show_on_product: true };
    const { container } = renderPage({ rating: { stars: 4.5, count: 3 } });
    expect(container.querySelector('[data-testid="ox-pdp-no-reviews"]')).toBeNull();
    expect(container.querySelector('salla-comments')).not.toBeNull();
  });

  it('gates every trust sub-line on the setting that would make it true', () => {
    const before = renderPage();
    expect(before.container.querySelectorAll('.ox-trust-grid__line')).toHaveLength(0);
    expect(before.container.textContent).not.toContain(t('ox.pdp.trust_track_order'));
    expect(before.container.textContent).not.toContain(t('ox.pdp.trust_authentic_sub'));

    themeSettings = {
      order_tracking_url: 'https://track.test/',
      authenticity_page_url: 'https://optimalx.test/authentic',
    };
    const after = renderPage();
    expect(after.container.textContent).toContain(t('ox.pdp.trust_track_order'));
    expect(after.container.textContent).toContain(t('ox.pdp.trust_authentic_sub'));
  });

  it('shows no delivery estimate until both ends of the window are configured', () => {
    const none = renderPage();
    expect(none.container.querySelector('.ox-delivery')).toBeNull();

    themeSettings = { delivery_estimate_min_days: 2 };
    const half = renderPage();
    expect(half.container.querySelector('.ox-delivery')).toBeNull();

    themeSettings = { delivery_estimate_min_days: 2, delivery_estimate_max_days: 4 };
    const full = renderPage();
    expect(full.container.querySelectorAll('.ox-delivery__row')).toHaveLength(1);
  });

  it('shows the plate badge only from the platform promotion label', () => {
    const none = renderPage();
    expect(none.container.querySelector('.ox-gallery__badge')).toBeNull();

    const flagged = renderPage({ promotion_title: 'الأكثر مبيعا' });
    expect(flagged.container.querySelector('.ox-gallery__badge')?.textContent).toBe(
      'الأكثر مبيعا'
    );
  });

  it('draws a statistic cell only where the product carries the figure', () => {
    const plain = renderPage();
    // The fixture label carries protein only: no weight, no tags, no calories.
    expect(plain.container.querySelectorAll('.ox-stats__cell')).toHaveLength(1);
    expect(plain.container.textContent).not.toContain(t('ox.pdp.stat_vegan_latin'));

    const tagged = renderPage({ weight: '907g', tags: [{ name: 'نباتي', url: '/t/1' }] });
    expect(tagged.container.querySelectorAll('.ox-stats__cell')).toHaveLength(3);
    expect(tagged.container.textContent).toContain(t('ox.pdp.stat_vegan_latin'));
  });

  it('gives the band a badge only from a real tag, and none by default', () => {
    const plain = renderPage();
    expect(plain.container.querySelectorAll('.ox-bband__badge')).toHaveLength(0);
    expect(plain.container.querySelector('.ox-bband')?.className).toContain('ox-bband--short');

    const tagged = renderPage({
      tags: [
        { name: 'نباتي', url: '/t/1' },
        { name: 'خالي من الغلوتين', url: '/t/2' },
      ],
    });
    expect(tagged.container.querySelectorAll('.ox-bband__badge')).toHaveLength(2);
  });

  it('builds the anchor strip only out of regions that are on the page', () => {
    const { container } = renderPage();
    const tabs = Array.from(container.querySelectorAll('.ox-strip__tab')).map((node) =>
      node.getAttribute('href')
    );
    expect(tabs).toEqual(['#ox-details', '#ox-howto', '#ox-nutrition']);
    for (const href of tabs) {
      expect(container.querySelector(href as string), href as string).not.toBeNull();
    }
  });

  it('shows no reviews tab and no invented reviews on a store with none', () => {
    const { container } = renderPage();
    expect(container.textContent).not.toContain(t('ox.pdp.reviews'));
    expect(container.querySelector('salla-comments')).toBeNull();
  });
});

describe('ProductPage: the variants', () => {
  beforeEach(() => {
    slots.length = 0;
    detail.mockClear();
    themeSettings = {};
  });

  it('service: swaps in the service buy zone, drops the calculator and the sticky bar', () => {
    const { container } = renderPage({
      type: 'service',
      description: '<p>المدة: 20 دقيقة | القناة: مكالمة مرئية | الرد خلال: 24 ساعة عمل</p>',
      is_require_shipping: false,
    });
    expect(container.querySelector('.ox-service')).not.toBeNull();
    expect(container.querySelector('.ox-supply')).toBeNull();
    expect(container.querySelector('.ox-sticky')).toBeNull();
    expect(container.querySelector('.ox-nutrition')).toBeNull();
    expect(container.querySelector('.ox-trust-grid')).toBeNull();
    expect(container.querySelector('.ox-bband')).toBeNull();
    expect(screen.getByText(t('ox.pdp.medical_line'))).toBeTruthy();
  });

  it('service: suppresses the reply-time field the merchant typed into the data', () => {
    const { container } = renderPage({
      type: 'service',
      description: '<p>المدة: 20 دقيقة | الرد خلال: 24 ساعة عمل</p>',
    });
    expect(container.textContent).toContain('المدة');
    expect(container.textContent).not.toContain('الرد خلال');
  });

  it('booking: adds the slot line that a service product must not show (C14)', () => {
    const service = renderPage({ type: 'service', description: '<p>المدة: 20 دقيقة</p>' });
    expect(service.container.textContent).not.toContain(t('ox.booking.slot_at_checkout'));

    const booking = renderPage({ type: 'booking', description: '<p>المدة: 20 دقيقة</p>' });
    expect(booking.container.textContent).toContain(t('ox.booking.slot_at_checkout'));
  });

  it('service: shows the consultation credit line only when the owner wrote one', () => {
    const before = renderPage({ type: 'booking', description: '<p>المدة: 20 دقيقة</p>' });
    expect(before.container.querySelector('.ox-service__credit')).toBeNull();

    themeSettings = { consultation_credit_note: 'يخصم مبلغ الاستشارة من طلبك التالي.' };
    const after = renderPage({ type: 'booking', description: '<p>المدة: 20 دقيقة</p>' });
    expect(after.container.querySelector('.ox-service__credit')?.textContent).toBe(
      'يخصم مبلغ الاستشارة من طلبك التالي.'
    );
  });

  it('digital: no delivery lines, and the trust grid promises instant delivery', () => {
    const { container } = renderPage({
      type: 'digital',
      is_require_shipping: false,
      description: '<p>الصفحات: 40 | الصيغة: PDF | الشكل: ملف رقمي</p>',
    });
    expect(container.querySelector('.ox-delivery')).toBeNull();
    expect(container.textContent).toContain(t('ox.pdp.trust_digital'));
    expect(container.querySelector('.ox-pdp__facts')).not.toBeNull();
    // A digital guide has no label, so no nutrition table even if the
    // merchant left a table in the description (DIRECTION 6.7).
    expect(container.querySelector('.ox-nutrition')).toBeNull();
  });

  it('gift card: no trust grid at all, because shipping and expiry do not apply', () => {
    const { container } = renderPage({
      type: 'codes',
      is_require_shipping: false,
      description: '<p>القيمة: 100 ريال | الصلاحية: 12 شهرا | الشكل: بطاقة رقمية</p>',
    });
    expect(container.querySelector('.ox-trust-grid')).toBeNull();
  });

  it('bundle: lists the members and drops the bundle-level nutrition table', () => {
    const { container } = renderPage({
      type: 'group_products',
      description: WHEY_DESCRIPTION,
      consisted_products: [{ id: 2, name: 'كرياتين', url: '/p2' }],
    });
    expect(container.querySelector('.ox-bundle')).not.toBeNull();
    expect(container.querySelector('.ox-nutrition')).toBeNull();
    expect(container.querySelector('.ox-supply')).toBeNull();
  });

  it('food: keeps the physical composition and adds the calories statistic', () => {
    const { container } = renderPage({ type: 'food', calories: 220 });
    expect(container.querySelector('.ox-supply')).not.toBeNull();
    expect(container.querySelector('.ox-stats')?.textContent).toContain('220');
  });
});
