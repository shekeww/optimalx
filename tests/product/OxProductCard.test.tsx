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
vi.mock('@salla.sa/twilight-components-react/add-product-button', () => ({
  SallaAddProductButton: ({ children, ...rest }: Record<string, unknown>) => (
    <button
      type="button"
      data-testid={rest.quickBuy ? 'quick-buy-button' : 'add-button'}
      data-product-id={String(rest.productId)}
      data-quantity={rest.quantity === undefined ? 'unset' : String(rest.quantity)}
      data-fill={String(rest.fill ?? '')}
      data-amount={rest.amount === undefined ? 'unset' : String(rest.amount)}
      data-required-shipping={rest.requiredShipping ? 'yes' : 'no'}
      className={String(rest.className ?? '')}
    >
      {children as React.ReactNode}
    </button>
  ),
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
    // The brand row is gone: the target folds the brand into the meta line, so
    // the card no longer reserves a row for a fact it now prints elsewhere.
    expect(container.querySelector('.ox-card-product__brand')).toBeNull();
    for (const cls of [
      '.ox-card-product__name',
      '.ox-card-product__chips',
      '.ox-card-product__price',
      // The savings line reserves its height whether or not this product has
      // a saving, because a row mixes discounted and undiscounted products
      // and the buttons have to stay on one baseline.
      '.ox-card-product__saving',
      '.ox-card-product__action',
    ]) {
      expect(container.querySelector(cls), cls).not.toBeNull();
    }
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

  it("carries the merchant's own line for the product, not a serving count", () => {
    // The row used to read "30 حصة". A scoop count does not help anyone choose
    // between two proteins, and the "category | servings" lead the design
    // wanted was always half empty: this store has ZERO categories and ZERO
    // brands in Salla, so the category never resolved and the brand fallback
    // never resolved either. `subtitle` is set on all 47 products and is the
    // merchant's own pitch for that specific one, already published on the
    // product page, so surfacing it here asserts nothing new.
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ subtitle: 'واي بروتين معزول بلا سكر مضاف' })} />
    );
    const line = container.querySelector('.ox-card-product__chips')?.textContent ?? '';
    expect(line).toBe('واي بروتين معزول بلا سكر مضاف');
    expect(line).not.toContain(t('ox.card.servings', { n: 30 }));
  });

  it('keeps the row reserved and silent when the merchant wrote no line', () => {
    // The height stays so a grid of mixed products shares one baseline, but
    // nothing is invented to fill it.
    const { container } = renderWithProviders(
      <OxProductCard product={makeProduct({ subtitle: undefined })} />
    );
    const empty = container.querySelector('.ox-card-product__chips');
    expect(empty).not.toBeNull();
    expect(empty?.textContent).toBe('');
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
    // The row is reserved so the buttons stay on one baseline, and empty so no
    // discount is implied.
    expect(container.querySelector('.ox-card-product__saving')?.textContent).toBe('');
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
    // The green line is the same saving read a second way: 310 - 240.
    const saving = container.querySelector('.ox-card-product__saving [data-testid="money"]');
    expect(saving?.textContent).toBe('70');
  });

  it('never prints the saving twice: no percentage means the line stays empty', () => {
    const { container } = renderWithProviders(
      <OxProductCard
        product={makeProduct({ is_on_sale: true, regular_price: 310, sale_price: 240 })}
      />
    );
    // The pill falls back to the amount, so the line under the price is empty.
    expect(container.querySelector('.ox-card-product__saving-badge')).not.toBeNull();
    expect(container.querySelector('.ox-card-product__saving [data-testid="money"]')).toBeNull();
  });

  it('drops the saving pill and the buy CTA when the product is out of stock', () => {
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
    // Salla's button stays: it is the one that carries the notify-me form.
    expect(container.querySelector('[data-testid="add-button"]')).not.toBeNull();
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

  it('renders the buy CTA as a link to the product page while quick buy is off', () => {
    const { container } = renderWithProviders(<OxProductCard product={makeProduct()} />);
    const buy = container.querySelector('a.ox-card-product__buy');
    expect(buy).not.toBeNull();
    expect(buy?.getAttribute('href')).toBe('/p1996831868');
    expect(buy?.textContent).toContain(t('ox.card.buy_now'));
    expect(screen.queryByTestId('quick-buy-button')).toBeNull();
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
