import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

const t = createT('ar');

/** Every HookSlot render, in DOM order, with the context it was given. */
const slots: { name: string; context: Record<string, unknown> | undefined }[] = [];
const detail = vi.fn();
let themeSettings: Record<string, unknown> = {};

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine', () => ({
  useTwilight: () => ({
    theme: { settings: themeSettings },
    store: { country: 'SA', settings: { rating: { show_on_product: false } } },
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

  it('uses the engine Breadcrumb and emits no second breadcrumb of its own (C11)', () => {
    const { container } = renderPage();
    expect(screen.getByTestId('engine-breadcrumb')).toBeTruthy();
    expect(container.querySelectorAll('nav')).toHaveLength(1);
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
  });

  it('puts the chips, the calculator and the delivery lines inside the form', () => {
    renderPage();
    const form = screen.getByTestId('engine-form');
    expect(form.querySelector('.ox-pdp__chips')).not.toBeNull();
    expect(form.querySelector('.ox-supply')).not.toBeNull();
  });

  it('splits the description into its blocks and repeats none of them', () => {
    const { container } = renderPage();
    expect(container.querySelector('.ox-nutrition')).not.toBeNull();
    expect(container.querySelector('.ox-howto')).not.toBeNull();
    expect(container.querySelector('.ox-prose')?.innerHTML).not.toContain('table');
    expect(container.querySelector('.ox-prose')?.textContent).not.toContain('الحصص:');
  });

  it('renders the description through the sanitiser, never raw', () => {
    const { container } = renderPage({
      description: '<p>الحصص: 5</p><p>نص<script>alert(1)</script></p>',
    });
    const prose = container.querySelector('.ox-prose');
    expect(prose?.innerHTML).not.toContain('script');
    expect(prose?.textContent).toContain('نص');
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

  it('renders the sticky bar and the related rail', () => {
    const { container } = renderPage();
    expect(container.querySelector('.ox-sticky')).not.toBeNull();
    expect(screen.getByTestId('related')).toBeTruthy();
  });
});

describe('ProductPage: the claims gates', () => {
  beforeEach(() => {
    slots.length = 0;
    detail.mockClear();
    themeSettings = {};
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

  it('shows no delivery or free-shipping line until the settings carry one', () => {
    const empty = renderPage();
    expect(empty.container.querySelector('.ox-delivery')).toBeNull();

    themeSettings = { free_shipping_threshold: '299', delivery_promise_line: 'يصل خلال يومين' };
    const set = renderPage();
    expect(set.container.querySelectorAll('.ox-delivery__row')).toHaveLength(2);
    expect(set.container.textContent).toContain(t('ox.pdp.free_shipping_prefix'));
  });

  it('never states a reply time, and never a rating the store does not have', () => {
    const { container } = renderPage();
    expect(container.querySelector('.ox-pdp__rating')).toBeNull();
    expect(container.textContent).toContain(t('ox.trust.help_line'));
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

  it('food: keeps the physical composition and adds the calories chip', () => {
    const { container } = renderPage({ type: 'food', calories: 220 });
    expect(container.querySelector('.ox-supply')).not.toBeNull();
    expect(container.querySelector('.ox-pdp__chips')?.textContent).toContain('220');
  });
});
