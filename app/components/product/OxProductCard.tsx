import { memo, useCallback, useMemo, useState } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useWishlist } from '@salla.sa/twilight-theme-engine/hooks/useWishlist';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import type { ProductCardProps } from '@salla.sa/twilight-theme-engine/product';
import { SallaAddProductButtonCore } from '@salla.sa/twilight-components-react/add-product-button';
import { WebComponentBoundary } from '../common/WebComponentBoundary';
import { Badge, BadgeStack } from '../common/Badge';
import { Bdi } from '../common/Bdi';
import { Price } from '../common/Price';
import { Icon } from '../common/Icon';
import { VariantChips, cardOption, defaultValueId } from './VariantChips';
import { RatingRow } from './RatingRow';
import { parseSpecLine } from './lib/specLine';
import { cardSpecLine } from './lib/cardSpec';
import { bandBadges } from './lib/bandBadges';
import { useHoverCapable } from './lib/useHoverCapable';
import { monthsUntilExpiry } from './lib/supply';
import { effectivePrice, isNewProduct, savingOf } from './lib/claims';

/**
 * OptimalX's product card, registered over the engine's `product:card` key so
 * every listing, slider and wishlist grid gets it (PLAN-final C1), rebuilt to
 * the owner's attached target ("the exact ui/ux design for product cards").
 *
 * It never renders the engine `ProductCard`: that component performs the
 * registry lookup itself, so calling it from here would recurse on every card.
 *
 * The target, and what each part is gated on (CARD-2026-09-23):
 *
 *   wishlist heart   reading-start corner of the plate
 *   badge stack      the opposite corner, at most two, in the section 6.2
 *                    priority: out of stock (suppresses every other one),
 *                    saving, new, a real dietary tag, expiry within 6 months
 *   colour swatches  the trailing edge of the plate, ONLY when the product
 *                    carries real option colours (see `colourSwatches`) AND
 *                    the card's own chip row is not already choosing the
 *                    same colour axis
 *   brand line       ONLY when `product.brand?.name` is set; not reserved
 *   title            two lines, ellipsised
 *   spec line        servings, then the pack size, off the product's own
 *                    parsed description (`cardSpecLine`); always reserved
 *   price row        the amount, plus the struck regular price on a sale
 *   stock line       ONLY on a live `can_show_remained_quantity` quantity
 *                    of 1 to 5; the number itself never prints
 *   action row       quantity stepper + Salla's own add button, outlined
 *   buy row          a full-width accent CTA: Salla's own quick buy where
 *                    `can_quick_buy` is on, otherwise a link to the product
 *
 * Every row keeps its height when its content is absent, which is what lets a
 * row of mixed products put every price on one baseline. The rating slot in
 * particular stays 20px tall at zero reviews (B28), instead of collapsing and
 * dragging the buttons up on one card out of five. A sold-out card is a
 * different render, not a variant of this one (section 5): see
 * `SoldOutControl` and `BuyControls`'s own early return.
 */

/**
 * The candidate ceiling is 300, not the platform's default 500 (CARD-2026-09-23
 * section 11, DIRECTION 10.4 A8): a phone at DPR 3 asks for about 414 whatever
 * `sizes` says and takes the largest candidate at or below that plus the
 * browser's own tolerance, so capping the list at 300 is what keeps a plate at
 * 300 x 300 x 4 bytes (360 KB) instead of the 500 file's 1 MB. Four plates on
 * the first viewport then total 1.44 MB against the 1.4 MB listing line.
 */
const CARD_IMAGE_WIDTHS = [160, 220, 300] as const;
const CARD_IMAGE_SIZES = '(min-width: 1024px) 272px, (min-width: 640px) 30vw, 138px';
/** At most four dots fit the plate's trailing edge without crowding the badge. */
const MAX_SWATCHES = 4;

export const OxProductCard = memo(function OxProductCard({
  product,
  layout = 'vertical',
  className,
  withoutAddButton = false,
  index = 0,
  imagePriority = false,
  sizes,
}: ProductCardProps) {
  const { t } = useTranslation();
  const wishlist = useWishlist();
  const spec = useMemo(() => parseSpecLine(product.description), [product.description]);
  const swatches = useMemo(() => colourSwatches(product), [product]);
  const hoverCapable = useHoverCapable();

  const inWishlist = wishlist.has(product.id);
  const outOfStock = product.is_out_of_stock || product.status === 'out';
  const saving = savingOf(product);
  const percent = savingPercent(product);
  const price = effectivePrice(product);
  const expiryDate = spec?.expiry ?? null;
  const expiryMonths = monthsUntilExpiry(expiryDate);

  /**
   * THE STOCK LINE (CARD-2026-09-23 sections 0.2 and 3.6): text only, no
   * icon, no bar, and never the number itself — the gate is verbatim from the
   * claims table, on the platform's own `can_show_remained_quantity` flag,
   * never inferred from a low number alone.
   */
  const stockQuantity = typeof product.quantity === 'number' ? product.quantity : null;
  const showsLimitedQty =
    !outOfStock &&
    product.can_show_remained_quantity === true &&
    product.is_hidden_quantity !== true &&
    stockQuantity !== null &&
    stockQuantity > 0 &&
    stockQuantity <= 5;
  // Gated behind a hover-capable pointer (CARD-2026-09-23 section 11): mounted
  // only after hydration confirms `(hover: hover) and (pointer: fine)`, so a
  // touch phone never fetches or decodes a second plate photograph it cannot
  // act on. `useHoverCapable()` starts `false`, so the server tree and the
  // first client tree both omit it and hydration never has to reconcile one.
  const hoverImageSource = product.images?.find(
    (image) => image.url && image.url !== product.image?.url
  );
  const hoverImage = hoverCapable ? hoverImageSource : undefined;

  /**
   * THE CARD'S BRAND LINE (CARD-2026-09-23 section 3.2), reserved only when
   * present: the catalogue carries zero brands today, so a reserved row would
   * cost every card the same 26px hole `OxProductCard.tsx` already removed for
   * the rating row, for the same reason.
   */
  const brandName = trimmedText(product.brand?.name);

  /**
   * THE CARD'S SPEC LINE (CARD-2026-09-23 section 3.4) replaces the merchant's
   * free-text `subtitle` pitch, which rendered as a single ellipsised line cut
   * mid word ("واى ايزوليت نقى بـ 25 ج...") and was never a spec: servings,
   * then the pack size, off the same parsed description every stat cell and
   * chip on the product page already reads.
   */
  const specLine = useMemo(() => cardSpecLine(product, spec, t), [product, spec, t]);

  // ONE axis, one control and one preview, never both (section 3.7): when the
  // card's own chip row already lets a shopper choose a colour, the plate's
  // preview dots for that same axis are redundant and are suppressed.
  const chipOption = outOfStock ? null : cardOption(product);
  const showSwatchDots = swatches.length > 0 && chipOption?.type !== 'color';

  // THE BADGE STACK, capped at two, in the priority section 6.2 sets. A real
  // out-of-stock flag suppresses every other one on its own (rendered
  // separately below); past that, the saving pill outranks "new", which
  // outranks a real dietary tag, which outranks an expiry within six months.
  const tagBadge = outOfStock ? null : (bandBadges(product)[0] ?? null);
  const badgeCandidates: { id: 'saving' | 'new' | 'tag' | 'expiry'; show: boolean }[] = [
    { id: 'saving', show: !outOfStock && saving !== null },
    { id: 'new', show: !outOfStock && saving === null && isNewProduct(product) },
    { id: 'tag', show: !outOfStock && tagBadge !== null },
    {
      id: 'expiry',
      show: !outOfStock && expiryMonths !== null && expiryMonths >= 0 && expiryMonths < 6 && expiryDate !== null,
    },
  ];
  const visibleBadges = new Set(
    badgeCandidates
      .filter((candidate) => candidate.show)
      .slice(0, 2)
      .map((candidate) => candidate.id)
  );

  const classes = [
    'ox-card-product',
    'ox-card-product--' + layout,
    outOfStock ? 'is-out' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article className={classes} data-ox-product={product.id}>
      <div className="ox-card-product__plate">
        {/* The plate is not a second link: the card has one stretched title
            link for navigation, plus the wishlist, the quantity stepper, the
            add button and the buy CTA. The swatches are deliberately NOT
            raised above the stretched link, so a tap on one opens the product
            page, which is where Salla's own option chooser lives. */}
        <Image
          src={product.image?.url}
          alt={product.image?.alt ?? product.name}
          aspectRatio="1/1"
          objectFit="contain"
          priority={imagePriority || index < 2}
          srcSetWidths={CARD_IMAGE_WIDTHS}
          sizes={sizes ?? CARD_IMAGE_SIZES}
          className="ox-card-product__img"
        />
        {hoverImage ? (
          <Image
            src={hoverImage.url}
            alt=""
            aspectRatio="1/1"
            objectFit="contain"
            srcSetWidths={CARD_IMAGE_WIDTHS}
            sizes={sizes ?? CARD_IMAGE_SIZES}
            className="ox-card-product__img ox-card-product__img--hover"
          />
        ) : null}
        <BadgeStack className="ox-card-product__badges">
          {outOfStock ? <Badge tone="stop">{t('ox.card.out_of_stock')}</Badge> : null}
          {/* The saving pill. The percentage is the platform's own
              `discount_percentage`, printed verbatim; the amount is the
              difference between two prices the catalogue actually holds.
              Neither is ever computed from a price the store has not set. */}
          {visibleBadges.has('saving') ? (
            <Badge tone="saving" className="ox-card-product__saving-badge">
              {percent !== null ? (
                <>
                  {t('ox.pdp.save_label')} <span className="ox-card-product__percent">{percent}</span>
                </>
              ) : (
                <>
                  {t('ox.pdp.save_label')} <Price amount={saving} currency={product.currency} />
                </>
              )}
            </Badge>
          ) : null}
          {visibleBadges.has('new') ? <Badge tone="new">{t('ox.common.new')}</Badge> : null}
          {visibleBadges.has('tag') && tagBadge ? (
            <Badge tone="tag">
              <Icon name={tagBadge.glyph} size={12} />
              {t(tagBadge.labelKey)}
            </Badge>
          ) : null}
          {visibleBadges.has('expiry') ? (
            <Badge tone="note">{t('ox.card.expiry', { date: expiryDate })}</Badge>
          ) : null}
        </BadgeStack>
        <button
          type="button"
          className={'ox-card-product__wish' + (inWishlist ? ' is-active' : '')}
          aria-label={t('ox.a11y.wishlist_toggle')}
          aria-pressed={inWishlist}
          onClick={() => wishlist.toggle(product.id)}
        >
          <i className="sicon-heart" aria-hidden="true" />
        </button>
        {showSwatchDots ? (
          <ul className="ox-card-product__swatches" aria-label={t('ox.card.colours')}>
            {swatches.slice(0, MAX_SWATCHES).map((swatch) => (
              <li
                key={swatch.id}
                className={
                  'ox-card-product__swatch' + (swatch.selected ? ' is-selected' : '')
                }
                // A product colour, not a design token: the value is the hex
                // the merchant set on the option in Salla, and no other value
                // can stand for it.
                style={{ ['--ox-swatch' as string]: swatch.color }}
              >
                <span className="ox-sr-only">{swatch.name}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="ox-card-product__body">
        {brandName ? (
          <p className="ox-card-product__brand">
            <Bdi>{brandName}</Bdi>
          </p>
        ) : null}
        <h3 className="ox-card-product__name">
          <Link to={product.url} className="ox-card-product__title-link">
            <Bdi>{product.name}</Bdi>
          </Link>
        </h3>
        <p className="ox-card-product__chips">{specLine ? <Bdi>{specLine}</Bdi> : null}</p>
        {/* The WRAPPER is conditional too, not just its contents.
            `RatingRow` already renders null below a real review count, but the
            box around it kept `min-block-size: 20px`, so every card on this
            store carried 20px of empty row plus its 8px gap: 28px of hole
            between the meta line and the price, on all 47 products, for a
            rating none of them has. The savings line below DOES reserve its
            space on purpose, because some products in a row have a saving and
            some do not and the buttons have to stay on one baseline. Nothing
            is gained by reserving a row that is empty on every card at once. */}
        {(product.rating?.count ?? 0) > 0 ? (
          <div className="ox-card-product__rating">
            <RatingRow
              stars={product.rating?.stars ?? 0}
              count={product.rating?.count ?? 0}
              size={12}
            />
          </div>
        ) : null}
        <div className="ox-card-product__price">
          <Price amount={price} size="card" currency={product.currency} />
          {product.is_on_sale ? (
            <>
              <span className="ox-sr-only">{t('ox.pdp.was_price_label')}</span>
              <Price amount={product.regular_price} currency={product.currency} was />
            </>
          ) : null}
        </div>
        {/* No savings line under the price (owner call, 2026-09-22): the pill
            in the image corner already states the saving, and the extra row
            stretched every card for a figure printed twice. */}
        {showsLimitedQty ? (
          <p className="ox-card-product__stock">{t('ox.card.limited_qty')}</p>
        ) : null}
        {withoutAddButton ? null : <BuyControls product={product} outOfStock={outOfStock} />}
      </div>
    </article>
  );
});

/**
 * The quantity stepper, Salla's add button and the buy CTA.
 *
 * **The cart path is Salla's and stays Salla's.** `SallaAddProductButton` owns
 * the whole of it: the options modal, the cart request, the toast, and the
 * notify-me form when the status is out-and-notify. We size and colour it and
 * we hand it a quantity. Nothing here ever calls `salla.cart`.
 *
 * **Sold out is a different render, not a subset of this one** (CARD-2026-09-23
 * section 5): no stepper, no variant chips, no buy CTA, one full-width
 * control. Returning early here, rather than threading `outOfStock` through
 * every row below, is what keeps the in-stock branch from having to reason
 * about a state it can no longer reach.
 */
function BuyControls({ product, outOfStock }: { product: Product; outOfStock: boolean }) {
  const { t } = useTranslation();
  const max = maxQuantity(product);
  const [quantity, setQuantity] = useState(1);

  // THE CARD CHOOSES THE VARIANT NOW, when the product has exactly one simple
  // option. Before this, a product with options showed "اختر الخيارات" and the
  // add button opened Salla's chooser — which never appeared on a grid, so the
  // control read as broken. The shaker's four colours are the whole case today.
  const option = outOfStock ? null : cardOption(product);
  const [valueId, setValueId] = useState<number | string | null>(() =>
    option ? defaultValueId(option) : null
  );

  // The stepper is suppressed on a product with options ONLY while the card
  // cannot choose them. Once it can, quantity is meaningful again.
  const showsStepper = !outOfStock && (allowsQuantity(product) || Boolean(option));

  const decrease = useCallback(() => setQuantity((n) => Math.max(1, n - 1)), []);
  const increase = useCallback(
    () => setQuantity((n) => (max === null ? n + 1 : Math.min(max, n + 1))),
    [max]
  );

  // THE SUBMIT PATH IS SALLA'S OWN. `salla.form.onSubmit('cart.addItem', …)`
  // builds `new FormData(form)` and POSTs it to the same endpoint the product
  // page posts to, so the hidden id, the chosen `options[…]` and the quantity
  // travel exactly as they do there. Nothing here touches the cart itself.
  //
  // `quantity` is not optional decoration: without a `quantity` field the SDK
  // switches to the quick-add endpoint, which is the options-less path and
  // silently drops the chosen variant. `e.nativeEvent` is passed rather than
  // the React event because React's synthetic submit carries no `submitter`,
  // and without it Salla never starts the button's own loading state.
  const onSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const salla = (window as unknown as { salla?: { form?: { onSubmit?: (a: string, b: Event) => void } } }).salla;
    salla?.form?.onSubmit?.('cart.addItem', e.nativeEvent);
  }, []);

  // Every hook above is called unconditionally, so this early return (a plain
  // branch, not a hook) is safe: no hook may follow it. No stepper, no
  // variant chips, no buy CTA — one full-width control, and nothing built
  // above is used past this point for a sold-out product.
  if (outOfStock) {
    return (
      <div className="ox-card-product__action ox-card-product__action--out">
        <SoldOutControl product={product} />
      </div>
    );
  }

  // ONE grid, not a row plus a sibling (owner review, 2026-09-23, item 2):
  // below 768 the stepper takes its own row and the add button joins
  // buy-now on the next one, which needs all three as grid items of one
  // container — buy-now used to be a plain sibling after this div, which
  // cannot regroup across a breakpoint on its own.
  const controls = (
    <div className="ox-card-product__action">
      {showsStepper ? (
        <div className="ox-card-product__qty" role="group" aria-label={t('ox.pdp.quantity')}>
          <button
            type="button"
            className="ox-card-product__qty-btn"
            aria-label={t('ox.pdp.quantity_decrease')}
            onClick={decrease}
            disabled={quantity <= 1}
          >
            <Icon name="minus" size={16} />
          </button>
          {/* `output` is a live region by default, so the new figure is
              announced without an explicit aria-live on a card in a grid. */}
          <output className="ox-card-product__qty-value">{quantity}</output>
          <button
            type="button"
            className="ox-card-product__qty-btn"
            aria-label={t('ox.pdp.quantity_increase')}
            onClick={increase}
            disabled={max !== null && quantity >= max}
          >
            <Icon name="plus" size={16} />
          </button>
        </div>
      ) : null}
      <div className="ox-card-product__add-slot">
        <AddButton
          product={product}
          quantity={showsStepper ? quantity : null}
          submit={Boolean(option)}
        />
      </div>
      <BuyNow product={product} />
    </div>
  );

  // The row reserves its own height whether or not there is anything to
  // choose (VariantChips returns an empty box for `option === null`), so
  // every card in a grid keeps the same row count regardless of which one
  // product actually carries a chippable option.
  const variantsRow = (
    <VariantChips
      option={option}
      uid={`oxcard-${product.id}`}
      value={valueId}
      onChange={setValueId}
    />
  );

  // No option to choose: the row above is the empty reservation, and the rest
  // of the card stays exactly as it was, with no form around it. A form that
  // wraps nothing chooseable is markup for its own sake.
  if (!option) {
    return (
      <>
        {variantsRow}
        {controls}
      </>
    );
  }

  return (
    <form
      className="ox-card-product__form"
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
    >
      {/* Salla reads the product from the form, not from the button. */}
      <input type="hidden" name="id" value={String(product.id)} />
      {variantsRow}
      {/* The stepper above is a React control, so the number it holds has to be
          put into the form as a field of its own for FormData to see it. */}
      <input type="hidden" name="quantity" value={String(showsStepper ? quantity : 1)} />
      {controls}
    </form>
  );
}

/**
 * The sold-out card's one control (CARD-2026-09-23 section 5).
 *
 * Salla's own notify-me path renders when the product can actually offer one
 * — a real `notify_availability` payload, or a status the platform itself
 * marked `out-and-notify` — and nothing is invented when it cannot. The
 * fallback is an honest, focusable "unavailable" state rather than a
 * `<button disabled>`: a disabled control leaves the tab order and explains
 * nothing to a shopper who lands on it.
 */
function SoldOutControl({ product }: { product: Product }) {
  const { t } = useTranslation();
  const canNotify = Boolean(product.notify_availability) || product.status === 'out-and-notify';

  if (canNotify) {
    return (
      <div className="ox-card-product__notify-slot">
        <WebComponentBoundary label={`card notify ${product.id}`}>
          <SallaAddProductButtonCore
            productId={product.id}
            productType={product.type}
            productStatus={product.status}
            width="wide"
            fill="outline"
            loaderPosition="center"
            aria-label={t('ox.card.notify_me')}
          >
            <span className="ox-card-product__notify-label">{t('ox.card.notify_me')}</span>
          </SallaAddProductButtonCore>
        </WebComponentBoundary>
      </div>
    );
  }

  return (
    <button
      type="button"
      className="ox-card-product__unavailable"
      aria-disabled="true"
      onClick={(event) => event.preventDefault()}
    >
      {t('ox.card.unavailable')}
    </button>
  );
}

/**
 * The target's full-width accent CTA.
 *
 * **Where Salla offers a one-tap buy, this IS Salla's one-tap buy.**
 * `salla-add-product-button` carries a `quickBuy` flag, and the engine's own
 * add-to-cart form turns it on from exactly one signal and no other:
 * `product.can_quick_buy` (theme-engine AddToCartForm-NICDUAS3.js:262). This
 * follows that gate verbatim, and passes `amount` the same way the engine
 * unwraps it, so a card can never offer a fast checkout the platform has not
 * enabled for that product. Nothing here calls `salla.cart` or a checkout
 * endpoint; the whole path stays inside Salla's component.
 *
 * **On this store the gate is shut.** `can_quick_buy` is false on all 47
 * products in the catalogue snapshot, so what renders today is the fallback:
 * the same accent button, as a LINK to the product page. It is a navigation
 * control, not a one-tap buy, and it is deliberately not dressed up as one
 * beyond the label the owner's design asks for. The day quick buy is switched
 * on in the dashboard the cards become real fast-checkout buttons with no
 * change here.
 */
function BuyNow({ product }: { product: Product }) {
  const { t } = useTranslation();
  const label = t('ox.card.buy_now');

  if (product.can_quick_buy === true) {
    // Core for the same reason as the add button above: the deferred export's
    // observer left a skeleton where the control should be. This branch does
    // not render on the catalogue today, since `can_quick_buy` is false on
    // every product, but it must not carry the defect the day it is switched on.
    return (
      <WebComponentBoundary label={`card quickbuy ${product.id}`}>
        <SallaAddProductButtonCore
          productId={product.id}
          productType={product.type}
          productStatus={product.status}
          quickBuy
          amount={quickBuyAmount(product)}
          width="wide"
          fill="solid"
          loaderPosition="center"
          className="ox-card-product__buy ox-card-product__buy--native"
          {...(product.is_require_shipping ? { requiredShipping: true } : {})}
        >
          {/* TEXT ONLY, centred (owner review, 2026-09-23): the bolt this
              button carried is gone from every "اشتر الآن" control. */}
          {label}
        </SallaAddProductButtonCore>
      </WebComponentBoundary>
    );
  }

  return (
    <Link to={product.url} className="ox-btn ox-btn--primary ox-btn--block ox-card-product__buy">
      {label}
    </Link>
  );
}

/**
 * The figure `quickBuy` charges, unwrapped the way the engine unwraps it:
 * `base_currency_price` arrives either as a number or as `{currency, amount}`
 * (theme-engine types/index.d.ts:392). It is the catalogue's own number, never
 * a price computed here.
 */
function quickBuyAmount(product: Pick<Product, 'base_currency_price'>): number | undefined {
  const raw = product.base_currency_price;
  const value = typeof raw === 'object' && raw !== null ? raw.amount : raw;
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

/**
 * Salla's add button, restyled to the target's outline treatment.
 *
 * **The label tells the shopper which tap opens a chooser.** A product with
 * variants does not go into the cart on the tap: Salla's own button opens the
 * options modal instead, and a card that says "add to cart" on both kinds of
 * product makes that modal a surprise. `has_options` comes straight from the
 * list payload, not from a second request (checked on the live catalogue
 * 2026-09-20: of the first twenty products it is true on exactly one, the
 * shaker, which is the one with colours), so the signal costs nothing and
 * takes no extra row on the card. A merchant who has typed their own
 * `add_to_cart_label` still wins: theirs is the more specific instruction.
 *
 * `quantity` is the component's own documented property ("custom quantity
 * number to be injected", salla.dev doc-422692), which is what makes the
 * stepper real rather than decorative. It is passed only when the stepper is
 * on screen, so every product that has no stepper keeps exactly the request it
 * sent before this rebuild.
 */
function AddButton({
  product,
  quantity,
  submit = false,
}: {
  product: Product;
  quantity: number | null;
  /** True when the card carries its own chooser, so this submits the form. */
  submit?: boolean;
}) {
  const { t } = useTranslation();
  // "اختر الخيارات" is the right label ONLY while the card cannot choose. Once
  // the chips are on the card the shopper has already chosen, so the button
  // says what it now actually does.
  const label =
    product.add_to_cart_label ??
    t(product.has_options && !submit ? 'ox.card.choose_options' : 'ox.card.add');
  return (
    // CORE, NOT THE DEFERRED EXPORT, and this is what made the button vanish.
    //
    // `SallaAddProductButton` is wrapped in the package's `HydrationBoundary`:
    // it renders a `s-skeleton-button` placeholder and only mounts the real
    // custom element once an IntersectionObserver fires. Measured on the home
    // grid: four cards scrolled fully into view, `readyState` complete, and the
    // slot still held the skeleton — zero `salla-add-product-button` hosts and
    // zero `.s-button-element` on the page. So every rule this theme writes for
    // the add button was styling an element that never existed, which is why
    // the outline treatment and the inline cart glyph looked "reverted": the
    // CSS was intact and its target was missing.
    //
    // The core export mounts immediately and removes the dependency on that
    // observer. An add-to-cart button is not a below-the-fold nicety that can
    // afford to wait for an observer that may never fire; `FrequentlyBought`
    // reached for the same export for the same reason.
    //
    // Core has no error boundary of its own and the package does not export the
    // one its deferred exports get, so it brings ours.
    <WebComponentBoundary label={`card add ${product.id}`}>
      <SallaAddProductButtonCore
        productId={product.id}
        productType={product.type}
        productStatus={product.status}
        width="wide"
        fill="outline"
        loaderPosition="center"
        className="ox-card-product__add"
        // ALWAYS SET, not only on the narrow card that needs it. Below the
        // 240px container query (`_b4-listing.scss`) the label's own text is
        // hidden and only the cart glyph shows, in a fixed 44px box — an
        // icon has no name of its own, so `aria-label` is what keeps the
        // button's accessible name the same word a wide card prints. Setting
        // it here too, identically to the visible label, costs nothing on a
        // wide card (Label in Name still holds, since the two strings match)
        // and means the accessible name never depends on which CSS rule
        // happens to be in effect.
        aria-label={label}
        // `type="submit"` makes the component render a real submit button and
        // return early from its own click handler, so the FORM adds the
        // product — with the chosen option in the payload — instead of the
        // component adding it optionless.
        {...(submit ? { type: 'submit' as const } : {})}
        {...(quantity !== null ? { quantity } : {})}
      >
        {/* THE LABEL ONLY. The cart glyph is drawn in CSS as a mask on
            `.s-button-text::before`, not passed as a child, because this
            component keeps the slotted TEXT and discards element children when
            it upgrades: an `<svg>` child rendered outside the label row, on its
            own line, unstyled — which is exactly how the icon "disappeared"
            from the button. The product page's add button already draws its
            glyph this way for the same reason, off the same `--ox-cart-glyph`
            token, so the two are one technique rather than two.

            The span is not decoration. Until Salla's SDK registers the custom
            element the host IS the button, and the painted-outline treatment
            needs its fill on `::before` — which paints over a bare text node,
            because an anonymous flex item cannot be given a stacking order. An
            element child can. When the component does upgrade it rebuilds from
            the text content, so the label survives the wrapper either way. */}
        <span className="ox-card-product__add-label">{label}</span>
      </SallaAddProductButtonCore>
    </WebComponentBoundary>
  );
}


/** A trimmed non-empty string, or null. */
function trimmedText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const out = value.trim();
  return out.length > 0 ? out : null;
}

/**
 * The platform's own discount percentage, verbatim, or null.
 *
 * Salla sends it as a formatted string ("51%"), so it is printed rather than
 * recomputed: a percentage derived here could disagree with the one the
 * dashboard shows. A zero or unparseable figure yields null and the badge
 * falls back to the amount.
 */
function savingPercent(product: Pick<Product, 'discount_percentage'>): string | null {
  const raw = trimmedText(product.discount_percentage);
  if (raw === null) return null;
  const numeric = Number(raw.replace('%', '').trim());
  // `Number.isFinite(NaN)` is false, so the old `isFinite(n) && n <= 0` guard
  // skipped its own branch for anything unparseable and returned the raw
  // string. An Arabic-Indic figure such as "٥١٪" (whose percent sign is not
  // the ASCII one being stripped) was printed verbatim as the saving, and the
  // savings line rendered with it, against this function's own contract above.
  if (!Number.isFinite(numeric) || numeric <= 0) return null;
  return raw;
}

/** The catalogue's per-order cap, or null when it sets none. */
function maxQuantity(product: Pick<Product, 'max_quantity'>): number | null {
  const raw = Number(product.max_quantity);
  return Number.isFinite(raw) && raw > 0 ? raw : null;
}

/**
 * Whether this product has a quantity axis at all.
 *
 * It follows the engine's own add-to-cart form, which hides the control for a
 * hidden-quantity product and for a booking (AddToCartForm-NICDUAS3.js:238),
 * and adds the two cases a card has to answer for itself: a donation, where
 * the axis is an amount rather than a count, and a product capped at one.
 */
function allowsQuantity(
  product: Pick<Product, 'is_hidden_quantity' | 'type' | 'max_quantity' | 'has_options'>
) {
  if (product.is_hidden_quantity === true) return false;
  if (product.type === 'booking' || product.type === 'donating') return false;
  // A product with options does not go into the cart from the card: Salla's
  // button opens its chooser instead, and that modal collects its own
  // quantity. A stepper beside it is thrown away on every tap, and the one
  // product in this catalogue with options is the shaker, which is also one of
  // the most visible cards on the home page.
  if (product.has_options === true) return false;
  const max = maxQuantity(product);
  return max === null || max > 1;
}

/** One colour dot on the plate's trailing edge. */
interface ColourSwatch {
  id: number;
  name: string;
  color: string;
  selected: boolean;
}

/**
 * The product's real option colours, or an empty list.
 *
 * **A swatch is only ever drawn from a colour the merchant set.** The option
 * payload comes in two shapes: `products/{id}/details` sends `details[]`,
 * which carries the hex (`color: "#bceb0e"`), and the listing endpoint sends
 * `values[]`, which carries the value's NAME and no colour at all. Painting a
 * dot from a name would mean deciding what "green" looks like on this shaker,
 * and the answer on the live catalogue is a lime the word does not describe.
 * So a card built from a listing payload shows no swatches, and that render is
 * the designed one.
 *
 * A single colour is not a choice, so the column needs at least two.
 */
function colourSwatches(product: Product): ColourSwatch[] {
  const options = product.options;
  if (!Array.isArray(options)) return [];
  for (const option of options) {
    if (!option || option.type !== 'color') continue;
    const details = option.details;
    if (!Array.isArray(details)) continue;
    const out: ColourSwatch[] = [];
    for (const detail of details) {
      const color = trimmedText(detail?.color);
      const name = trimmedText(detail?.name);
      const id = Number(detail?.id);
      if (color === null || name === null || !Number.isFinite(id)) continue;
      out.push({ id, name, color, selected: detail.is_default === 1 });
    }
    if (out.length > 1) return out;
  }
  return [];
}

export default OxProductCard;
