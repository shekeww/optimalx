import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';
import { createT } from './i18n-mock';

const toggle = vi.fn();
const wishlistIds: number[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () => (await import('./i18n-mock')).i18nModuleMock('ar'));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useWishlist', () => ({
  useWishlist: () => ({
    ids: wishlistIds,
    count: wishlistIds.length,
    has: (id: number) => wishlistIds.includes(id),
    toggle,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: unknown) => <span data-testid="money">{String(amount)}</span>,
    parse: Number,
    isValid: () => true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, ...rest }: Record<string, unknown>) =>
    React.createElement('a', { href: to as string, ...rest }, children as React.ReactNode),
  Image: ({ alt, src, className }: Record<string, unknown>) => (
    <img alt={String(alt ?? '')} src={src as string} className={className as string} />
  ),
}));
// The mock stands in for Salla's web component and records the props that
// carry behaviour, so a test can prove the card hands the cart path over
// rather than reimplementing it. The quick-buy instance gets its own testid
// because a card can render both.
// Both exports render the same stand-in. The card uses the CORE one, because
// the deferred export only mounts the custom element after an
// IntersectionObserver hit and was leaving a skeleton in the slot forever on
// the live grid; the deferred name stays mocked because other components under
// test still import it.
const addButtonStub = ({ children, ...rest }: Record<string, unknown>) => (
  <button
    type="button"
    data-testid={rest.quickBuy ? 'quick-buy-button' : 'add-button'}
    data-product-id={String(rest.productId)}
    data-quantity={rest.quantity === undefined ? 'unset' : String(rest.quantity)}
    data-fill={String(rest.fill ?? '')}
    data-amount={rest.amount === undefined ? 'unset' : String(rest.amount)}
    data-required-shipping={rest.requiredShipping ? 'yes' : 'no'}
    className={String(rest.className ?? '')}
    aria-label={rest['aria-label'] as string | undefined}
  >
    {children as React.ReactNode}
  </button>
);
vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: addButtonStub,
  SallaAddProductButtonCore: addButtonStub,
}));
vi.mock('@salla.sa/twilight-components-react/button', () => ({
  SallaButton: ({ children, ariaLabel, onClick, className }: Record<string, unknown>) => (
    <button
      type="button"
      aria-label={ariaLabel as string}
      className={className as string}
      onClick={onClick as () => void}
    >
      {children as React.ReactNode}
    </button>
  ),
}));
vi.mock('@salla.sa/twilight-components-react/rating-stars', () => ({
  SallaRatingStars: ({ value }: { value: number }) => (
    <span data-testid="rating-stars">{value}</span>
  ),
}));

const { OxProductCard } = await import('../../app/components/product/OxProductCard');

const t = createT('ar');

const SPEC = '<p>الحصص: 30 | حجم الحصة: 31 جم | الصلاحية: 2029-03 | الشكل: بودرة</p>';

/** A `YYYY-MM` string a fixed number of months from today, for the expiry gate. */
function nearExpiry(monthsAhead = 2): string {
  const now = new Date();
  const total = now.getFullYear() * 12 + now.getMonth() + monthsAhead;
  const year = Math.floor(total / 12);
  const month = (total % 12) + 1;
  return `${year}-${String(month).padStart(2, '0')}`;
}

function makeProduct(overrides: Record<string, unknown> = {}) {
  return {
    id: 1996831868,
    name: 'Gold Standard Whey',
    description: SPEC + '<p>وصف.</p>',
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
    brand: { id: 4, name: 'Optimum Nutrition' },
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

describe('OxProductCard', () => {
  it('renders no engine card markup at all (the override must replace it)', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('.s-product-card-vertical')).toBeNull();
    expect(container.querySelector('.s-product-card-content-footer')).toBeNull();
    expect(container.querySelector('.ox-card-product')).not.toBeNull();
  });

  it('carries the data-ox-product attribute B6 names its view transitions by', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('[data-ox-product="1996831868"]')).not.toBeNull();
  });

  it('keeps the fixed-height rows so a grid of cards shares one baseline', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    for (const cls of [
      '.ox-card-product__name',
      '.ox-card-product__chips',
      '.ox-card-product__excerpt',
      '.ox-card-product__price',
      '.ox-card-product__action',
    ]) {
      expect(container.querySelector(cls), cls).not.toBeNull();
    }
  });

  it('renders the brand line only when the product actually carries one (CARD 3.2)', () => {
    const withBrand = renderWithProviders(<OxProductCard product={makeProduct()} />);
    const brand = withBrand.container.querySelector('.ox-card-product__brand');
    expect(brand).not.toBeNull();
    expect(brand?.textContent).toBe('Optimum Nutrition');
    withBrand.unmount();

    // Not reserved when absent: the row costs no hole on the 47 products in
    // this catalogue that carry no brand at all.
    const noBrand = renderWithProviders(
      <OxProductCard product={makeProduct({ brand: undefined })} />
    );
    expect(noBrand.container.querySelector('.ox-card-product__brand')).toBeNull();
  });

  it('collapses the rating row entirely rather than reserving an empty one', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    // The row used to render as an empty 20px box. That is the right call for
    // the savings line, where a row genuinely mixes products with and without
    // one; it is the wrong call here, because NO product on this store has a
    // rating, so every card in every row carried the same hole between its
    // meta line and its price.
    expect(container.querySelector('.ox-card-product__rating')).toBeNull();
    expect(screen.queryByTestId('rating-stars')).toBeNull();
  });

  it('draws the rating row when a product genuinely carries one', () => {
    const rated = { ...makeProduct(), rating: { stars: 4.5, count: 12 } };
    const { container } = renderWithProviders(<OxProductCard product={rated as never} />);
    expect(container.querySelector('.ox-card-product__rating')).not.toBeNull();
  });

  it('shows the stars only when the store has real reviews', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ rating: { count: 12, stars: 4 } })} />
    );
    expect(container.querySelector('.ox-rating')).not.toBeNull();
    expect(container.querySelector('.ox-rating__value')?.textContent).toBe('4.0');
    expect(screen.getByText(t('ox.pdp.rating_count', { count: 12 }))).toBeTruthy();
  });

  it('renders the spec line from the parsed description, never the merchant pitch (CARD 3.4)', () => {
    // The row used to print the merchant's free-text `subtitle`, which
    // rendered as a single ellipsised line cut mid word ("واى ايزوليت نقى بـ
    // 25 ج..."). It reads the catalogue's own spec-line convention now, and
    // `subtitle` is ignored entirely, even when the merchant has typed one.
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ subtitle: 'واي بروتين معزول بلا سكر مضاف' })} />
    );
    const line = container.querySelector('.ox-card-product__chips')?.textContent ?? '';
    expect(line).toBe(t('ox.card.servings', { n: 30 }));
    expect(line).not.toContain('واي بروتين');
  });

  it('keeps the spec-line row reserved and empty when the description carries no spec line', () => {
    // The height stays so a grid of mixed products shares one baseline, but
    // nothing is invented to fill it.
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ description: '<p>وصف عام بدون بيانات محددة.</p>' })} />
    );
    const empty = container.querySelector('.ox-card-product__chips');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toBe('');
  });

  it('joins servings and pack size with the divider, and falls back to the dosage form', () => {
    const both = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          description: '<p>الحصص: 30 | حجم العبوة: 907 جم | الشكل: بودرة</p>',
        })}
      />
    );
    const line = both.container.querySelector('.ox-card-product__chips')?.textContent ?? '';
    expect(line).toContain(t('ox.card.servings', { n: 30 }));
    expect(line).toContain('907 جم');
    both.unmount();

    // Neither servings nor a pack size, but a dosage form: the form alone.
    const formOnly = renderWithProviders(
      <OxProductCard product={makeProduct({ description: '<p>الشكل: بودرة</p>' })} />
    );
    expect(formOnly.container.querySelector('.ox-card-product__chips')?.textContent).toBe('بودرة');
  });

  it('prepends the root category name to the spec line, when the catalogue set one (coordinator addendum, 2026-09-23)', () => {
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({ category: { id: 9001, name: 'بروتين واي', url: '/protein/c9001' } })}
      />
    );
    const line = container.querySelector('.ox-card-product__chips')?.textContent ?? '';
    expect(line.startsWith('بروتين واي')).toBe(true);
    expect(line).toContain(t('ox.card.servings', { n: 30 }));
  });

  it('restores the description excerpt under the spec line, as the description\'s own prose sentence (coordinator addendum, 2026-09-23)', () => {
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          description: `${SPEC}<p>حزمة البداية تجمع ثلاثة منتجات أساسية. مناسبة للمبتدئين.</p>`,
        })}
      />
    );
    // Only the FIRST sentence, never the whole paragraph and never the spec
    // line's own label/value pairs.
    const excerpt = container.querySelector('.ox-card-product__excerpt')?.textContent ?? '';
    expect(excerpt).toBe('حزمة البداية تجمع ثلاثة منتجات أساسية.');
    expect(excerpt).not.toContain('مناسبة للمبتدئين');
    expect(excerpt).not.toContain('الحصص');
  });

  it('reads the first paragraph directly as the excerpt when it is not a spec line', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ description: '<p>وصف عام بدون بيانات محددة.</p>' })} />
    );
    expect(container.querySelector('.ox-card-product__excerpt')?.textContent).toBe(
      'وصف عام بدون بيانات محددة.'
    );
  });

  it('keeps the excerpt row reserved and empty when the description carries no prose paragraph', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ description: SPEC })} />
    );
    const excerpt = container.querySelector('.ox-card-product__excerpt');
    expect(excerpt).not.toBeNull();
    expect(excerpt?.textContent).toBe('');
  });

  it('invents no stars on a store with no reviews (B28)', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    // The gate that matters is still here and unchanged: no stars, no count,
    // nothing invented. What changed is that the empty BOX no longer reserves
    // its 20px, because it is empty on every card at once and so reserves a
    // hole rather than a baseline.
    expect(container.querySelector('.ox-rating')).toBeNull();
    expect(container.querySelector('.ox-card-product__rating')).toBeNull();
  });

  it('badges only from real product flags: out of stock and a real saving', () => {
    const out = renderWithProviders(
      <OxProductCard product={makeProduct({ is_out_of_stock: true, status: 'out' })} />
    );
    expect(out.container.querySelector('.ox-badge--stop')).not.toBeNull();
    expect(out.container.querySelector('.ox-badge--popular')).toBeNull();

    const sale = renderWithProviders(
      <OxProductCard
        product={makeProduct({ is_on_sale: true, regular_price: 300, sale_price: 240 })}
      />
    );
    expect(sale.container.querySelector('.ox-badge--saving')).not.toBeNull();
  });

  it('never renders a "new" badge without a real created_at inside the window', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('.ox-badge--new')).toBeNull();
  });

  it('renders a real dietary tag off the product\'s own Salla tags (CARD 6.2 badge 4)', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ tags: [{ id: 1, name: 'نباتي' }] })} />
    );
    const tag = container.querySelector('.ox-badge--tag');
    expect(tag).not.toBeNull();
    expect(tag?.textContent).toContain(t('ox.pdp.stat_vegan'));
  });

  it('caps the badge stack at two, in the saving/new/tag/expiry priority (CARD 6.2)', () => {
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          is_on_sale: true,
          regular_price: 310,
          sale_price: 240,
          tags: [{ id: 1, name: 'نباتي' }],
          description: SPEC.replace('2029-03', nearExpiry()) + '<p>وصف.</p>',
        })}
      />
    );
    const badges = container.querySelectorAll('.ox-card-product__badges > *');
    expect(badges.length).toBe(2);
    expect(container.querySelector('.ox-card-product__saving-badge')).not.toBeNull();
    expect(container.querySelector('.ox-badge--tag')).not.toBeNull();
    // Lower priority than both: never rendered once two already qualify.
    expect(container.querySelector('.ox-badge--note')).toBeNull();
  });

  it('shows the limited-quantity line only on the exact gate, and never prints the number', () => {
    const shown = renderWithProviders(
      <OxProductCard product={makeProduct({ quantity: 3, can_show_remained_quantity: true })} />
    );
    const stock = shown.container.querySelector('.ox-card-product__stock');
    expect(stock?.textContent).toBe(t('ox.card.limited_qty'));
    expect(stock?.textContent).not.toContain('3');
    shown.unmount();

    const hidden = renderWithProviders(
      <OxProductCard product={makeProduct({ quantity: 3, can_show_remained_quantity: false })} />
    );
    expect(hidden.container.querySelector('.ox-card-product__stock')).toBeNull();
  });

  it('suppresses the plate colour dots when the chip row already chooses that axis (CARD 3.7)', () => {
    const colourOption = {
      id: 1,
      type: 'color',
      details: [
        { id: 11, name: 'Lime', color: '#bceb0e', is_default: 1 },
        { id: 12, name: 'Black', color: '#111111', is_default: 0 },
      ],
      values: [
        { id: 11, name: 'Lime' },
        { id: 12, name: 'Black' },
      ],
    };
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ options: [colourOption] })} />
    );
    // The chip row is the control for this axis (`cardOption` picks the
    // same colour option), so the plate's own preview dots for it are
    // redundant and do not render.
    expect(container.querySelector('.ox-card-product__swatches')).toBeNull();
    expect(container.querySelector('.ox-swatch')).not.toBeNull();
  });

  it('passes the product to the engine add button instead of adding to cart itself', () => {
    renderWithProviders(<OxProductCard product={makeProduct()} />);
    const button = screen.getByTestId('add-button');
    expect(button.getAttribute('data-product-id')).toBe('1996831868');
  });

  it('says the tap opens a chooser when the product has variants', () => {
    // A card with options does not go into the cart on the tap: Salla's own
    // button opens the options modal, and the same label on both kinds of
    // product made that modal a surprise.
    const plain = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(screen.getByTestId('add-button').textContent).toContain(t('ox.card.add'));
    plain.unmount();

    const withOptions = renderWithProviders(
      <OxProductCard product={makeProduct({ has_options: true })} />
    );
    expect(screen.getByTestId('add-button').textContent).toContain(t('ox.card.choose_options'));
    withOptions.unmount();

    // A merchant who typed their own label still wins: theirs is the more
    // specific instruction.
    renderWithProviders(
      <OxProductCard
        product={makeProduct({ has_options: true, add_to_cart_label: 'اطلب الآن' })}
      />
    );
    expect(screen.getByTestId('add-button').textContent).toContain('اطلب الآن');
  });

  it('carries the label as aria-label too, so a narrow card that hides the text keeps its name', () => {
    // Below the 240px container query (_b4-listing.scss) the visible label
    // collapses to a fixed-size icon button; the accessible name cannot then
    // depend on text a screen reader would not see, so it is set here
    // unconditionally rather than only for the narrow case CSS alone cannot
    // express in a jsdom test.
    const plain = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(screen.getByTestId('add-button').getAttribute('aria-label')).toBe(t('ox.card.add'));
    plain.unmount();

    renderWithProviders(<OxProductCard product={makeProduct({ has_options: true })} />);
    expect(screen.getByTestId('add-button').getAttribute('aria-label')).toBe(
      t('ox.card.choose_options')
    );
  });

  it('toggles the wishlist through the engine hook', () => {
    renderWithProviders(<OxProductCard product={makeProduct()} />);
    screen.getByLabelText(t('ox.a11y.wishlist_toggle')).click();
    expect(toggle).toHaveBeenCalledWith(1996831868);
  });

  // -------------------------------------------------------------------------
  // The owner's target: the saving pill, the savings line, the swatch column,
  // the stepper and the two buttons. Each is checked in the state this store
  // is actually in today as well as in the state the design draws.
  // -------------------------------------------------------------------------

  it('prints no saving badge and no savings line off a sale', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('.ox-card-product__saving-badge')).toBeNull();
    expect(container.querySelector('.ox-price--was')).toBeNull();
  });

  it('prints the saving from real sale data and never from a computed one', () => {
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          is_on_sale: true,
          regular_price: 310,
          sale_price: 240,
          discount_percentage: '23%',
        })}
      />
    );
    // The pill carries the platform's own percentage string, verbatim.
    expect(container.querySelector('.ox-card-product__percent')?.textContent).toBe('23%');
    // The struck regular price is the catalogue's own number.
    const prices = container.querySelectorAll('.ox-card-product__price [data-testid="money"]');
    expect(Array.from(prices).map((node) => node.textContent)).toEqual(['240', '310']);
    // No second reading under the price: the pill is the only place the
    // saving is printed (owner call, 2026-09-22).
    expect(container.querySelector('.ox-card-product__saving')).toBeNull();
  });

  it('never prints the saving twice: no percentage means the line stays empty', () => {
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({ is_on_sale: true, regular_price: 310, sale_price: 240 })}
      />
    );
    // The pill falls back to the amount; there is no line under the price.
    expect(container.querySelector('.ox-card-product__saving-badge')).not.toBeNull();
    expect(container.querySelector('.ox-card-product__saving')).toBeNull();
  });

  it('drops the saving pill, the stepper, the chips and the buy CTA when out of stock (CARD section 5)', () => {
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          is_out_of_stock: true,
          status: 'out',
          is_on_sale: true,
          regular_price: 310,
          sale_price: 240,
          discount_percentage: '23%',
        })}
      />
    );
    expect(container.querySelector('.ox-card-product__saving-badge')).toBeNull();
    expect(container.querySelector('.ox-card-product__buy')).toBeNull();
    expect(container.querySelector('.ox-card-product__qty')).toBeNull();
    expect(container.querySelector('.ox-card-product__variants')).toBeNull();
    // No `notify_availability` and a plain `out` status: the honest
    // unavailable state, focusable but never a `<button disabled>`.
    const unavailable = container.querySelector('.ox-card-product__unavailable');
    expect(unavailable).not.toBeNull();
    expect(unavailable?.getAttribute('aria-disabled')).toBe('true');
    expect((unavailable as HTMLButtonElement)?.disabled).toBe(false);
    expect(unavailable?.textContent).toBe(t('ox.card.unavailable'));
  });

  it('offers the notify-me control when the product can actually notify', () => {
    const withFlag = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          is_out_of_stock: true,
          status: 'out',
          notify_availability: { channels: ['email'], subscribed: false },
        })}
      />
    );
    expect(withFlag.container.querySelector('.ox-card-product__unavailable')).toBeNull();
    expect(screen.getByTestId('add-button').textContent).toContain(t('ox.card.notify_me'));
    withFlag.unmount();

    const outAndNotify = renderWithProviders(
      <OxProductCard product={makeProduct({ is_out_of_stock: true, status: 'out-and-notify' })} />
    );
    expect(screen.getByTestId('add-button').textContent).toContain(t('ox.card.notify_me'));
  });

  it('draws swatches only from colours the merchant really set', () => {
    const none = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(none.container.querySelector('.ox-card-product__swatches')).toBeNull();
    none.unmount();

    // A listing payload sends option VALUES with names and no colour. Painting
    // a dot from a name would be deciding what the colour looks like.
    const named = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          options: [
            { id: 1, type: 'color', values: [{ id: 1, name: 'Lime' }, { id: 2, name: 'Black' }] },
          ],
        })}
      />
    );
    expect(named.container.querySelector('.ox-card-product__swatches')).toBeNull();
    named.unmount();

    const real = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          options: [
            {
              id: 1,
              type: 'color',
              details: [
                { id: 11, name: 'Lime', color: '#bceb0e', is_default: 1 },
                { id: 12, name: 'Black', color: '#111111', is_default: 0 },
              ],
            },
          ],
        })}
      />
    );
    const dots = real.container.querySelectorAll('.ox-card-product__swatch');
    expect(dots.length).toBe(2);
    expect(dots[0].className).toContain('is-selected');
    expect((dots[0] as HTMLElement).style.getPropertyValue('--ox-swatch')).toBe('#bceb0e');
    // A preview, not a chooser: nothing in the column is focusable, because
    // Salla's option modal on the product page is the only thing that selects.
    expect(real.container.querySelector('.ox-card-product__swatches button')).toBeNull();
    expect(real.container.querySelector('.ox-card-product__swatches input')).toBeNull();
  });

  it('reserves the variant row on every card so a grid keeps one baseline', () => {
    // No option at all: the row is still there, empty, holding its own height.
    const plain = renderWithProviders(<OxProductCard product={makeProduct()} />);
    const plainRow = plain.container.querySelector('.ox-card-product__variants');
    expect(plainRow).not.toBeNull();
    expect(plainRow?.querySelector('input')).toBeNull();
    plain.unmount();

    // A chippable option: the same row now carries real, keyboard-reachable
    // swatches, radio semantics intact.
    const withOption = renderWithProviders(
      <OxProductCard
        product={makeProduct({
          options: [
            { id: 1, type: 'color', values: [{ id: 1, name: 'Lime' }, { id: 2, name: 'Black' }] },
          ],
        })}
      />
    );
    const row = withOption.container.querySelector('.ox-card-product__variants');
    expect(row).not.toBeNull();
    const inputs = row?.querySelectorAll<HTMLInputElement>('.ox-swatch__input') ?? [];
    expect(inputs.length).toBe(2);
    expect(inputs[0].getAttribute('name')).toBe('options[1]');
  });

  it('feeds the stepper value into the Salla button quantity instead of faking it', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    const add = screen.getByTestId('add-button');
    expect(add.getAttribute('data-quantity')).toBe('1');
    expect(add.getAttribute('data-fill')).toBe('outline');

    const [minus, plus] = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.ox-card-product__qty-btn')
    );
    expect(minus.disabled).toBe(true);
    fireEvent.click(plus);
    fireEvent.click(plus);
    expect(container.querySelector('.ox-card-product__qty-value')?.textContent).toBe('3');
    expect(screen.getByTestId('add-button').getAttribute('data-quantity')).toBe('3');
  });

  it('stops the stepper at the catalogue max and never below one', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ max_quantity: 2 })} />
    );
    const [minus, plus] = Array.from(
      container.querySelectorAll<HTMLButtonElement>('.ox-card-product__qty-btn')
    );
    fireEvent.click(plus);
    fireEvent.click(plus);
    expect(container.querySelector('.ox-card-product__qty-value')?.textContent).toBe('2');
    fireEvent.click(minus);
    fireEvent.click(minus);
    expect(container.querySelector('.ox-card-product__qty-value')?.textContent).toBe('1');
  });

  it('leaves the stepper out with no quantity axis, and then sends no quantity', () => {
    for (const overrides of [
      { is_hidden_quantity: true },
      { type: 'booking' },
      { max_quantity: 1 },
    ]) {
      const view = renderWithProviders(<OxProductCard product={makeProduct(overrides)} />);
      expect(view.container.querySelector('.ox-card-product__qty')).toBeNull();
      // A stepper that is not on screen must not leave a quantity behind: the
      // request has to be exactly the one the card sent before it existed.
      expect(screen.getByTestId('add-button').getAttribute('data-quantity')).toBe('unset');
      view.unmount();
    }
  });

  it('buys with the buy CTA while quick buy is off, instead of navigating', () => {
    // UX-2026-09-24 P0-10: the control used to be an <a> to the product page
    // wearing the words "buy now". It is a button now, and it clicks the
    // card's own Salla add button (tests/product/buyNow.test.ts proves the
    // mechanism) rather than moving the shopper one page closer to a second
    // press.
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('a.ox-card-product__buy')).toBeNull();
    const buy = container.querySelector('button.ox-card-product__buy');
    expect(buy).not.toBeNull();
    expect(buy?.textContent).toContain(t('ox.card.buy_now'));
    expect(screen.queryByTestId('quick-buy-button')).toBeNull();
  });

  it('keeps a link on a product whose variant has to be chosen first', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ has_options: true })} />
    );
    const buy = container.querySelector('a.ox-card-product__buy');
    expect(buy).not.toBeNull();
    expect(buy?.getAttribute('href')).toBe('/p1996831868');
    expect(buy?.textContent).toContain(t('ox.card.buy_now'));
  });

  it('keeps every card anchor inside the build, locale and all', () => {
    // The live catalogue publishes `product.url` absolute; 24 of 58 anchors on
    // /ar left the build before the one link resolution rule (P0-14).
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({ url: 'https://optimalx.com.sa/whey/p1996831868' })}
      />
    );
    const hrefs = Array.from(container.querySelectorAll('a')).map((a) => a.getAttribute('href'));
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) expect(href?.includes('optimalx.com.sa')).toBe(false);
    expect(container.querySelector('.ox-card-product__title-link')?.getAttribute('href')).toBe(
      '/whey/p1996831868'
    );
  });

  it('uses the platform quick buy where the platform has enabled it', () => {
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ can_quick_buy: true })} />
    );
    // No hand-rolled checkout: the CTA becomes the same Salla component with
    // the engine's own flag, and the anchor fallback is gone.
    expect(container.querySelector('a.ox-card-product__buy')).toBeNull();
    const quick = screen.getByTestId('quick-buy-button');
    expect(quick.getAttribute('data-product-id')).toBe('1996831868');
    expect(quick.getAttribute('data-amount')).toBe('240');
    expect(quick.getAttribute('data-required-shipping')).toBe('yes');
    expect(quick.className).toContain('ox-card-product__buy--native');
  });

  it('adds no rating row markup and no popularity badge of its own', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    expect(container.querySelector('.ox-rating')).toBeNull();
    expect(container.querySelector('.ox-badge--popular')).toBeNull();
    expect(container.textContent).not.toContain('%');
  });
});
