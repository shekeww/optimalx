import { memo, useCallback, useContext, useMemo, useState } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product, ProductOption } from '@salla.sa/twilight-theme-engine/types';
import type { ProductCardProps } from '@salla.sa/twilight-theme-engine/product';
import { SallaAddProductButtonCore } from '@salla.sa/twilight-components-react/add-product-button';
import { WebComponentBoundary } from '../common/WebComponentBoundary';
import { toInternalPath } from '../layout/navLinks';
import { ADD_BUTTON_TAG, currentCartPath, proxyAddToCart, whenCustomElementReady } from './lib/buyNow';
import { Badge, BadgeStack } from '../common/Badge';
import { Bdi } from '../common/Bdi';
import { Price } from '../common/Price';
import { Icon } from '../common/Icon';
import { VariantChips, cardOption, defaultValueId, valueImageUrl } from './VariantChips';
import { RatingRow } from './RatingRow';
import { parseSpecLine } from './lib/specLine';
import { cardSpecLine } from './lib/cardSpec';
import { ListingCategoryContext, productTypeOf } from './lib/productType';
import { bandBadges } from './lib/bandBadges';
import { useHoverCapable } from './lib/useHoverCapable';
import { monthsUntilExpiry } from './lib/supply';
import { bundleMembers } from './lib/variant';
import { effectivePrice, isNewProduct, savingOf } from './lib/claims';
import { channelByCode } from '../../content/services';

/**
 * A service or a booking (the four advisory products, OX-044 to OX-047,
 * still typed `service` because the create API rejected `booking`,
 * lib/variant.ts): a card never offers it as "add 1 to cart at 0.00". It
 * presents the way its own page does (ServicePdp.tsx): the price line reads
 * "مجاني" or the fee, and the one control is the channel's own verb
 * ("احجز زيارتك", "اكتب سؤالك") leading to that page, where the booking is
 * made. No stepper, no add button (Phase B D07, 2026-09-25, the same branch
 * the Shopify port's snippets/product-card.liquid takes).
 */
export function isServiceProduct(product: Pick<Product, 'type'>): boolean {
  return product.type === 'service' || product.type === 'booking';
}

/**
 * OptimalX's product card, registered over the engine's `product:card` key so
 * every listing, slider and wishlist grid gets it (PLAN-final C1), rebuilt to
 * the owner's attached target ("the exact ui/ux design for product cards"),
 * then made compact on the owner's 2026-09-24 review of the home rail: the
 * wishlist heart and the free-consultation link are gone outright, the
 * variant chooser moved onto the plate so it costs the body no height, and
 * the plate's own ground now carries the PDP gallery's grey band and orange
 * mark behind the packshot (`ox-plate-band`/`ox-plate-mark`, `_primitives.scss`).
 *
 * It never renders the engine `ProductCard`: that component performs the
 * registry lookup itself, so calling it from here would recurse on every card.
 *
 * The target, and what each part is gated on (CARD-2026-09-23, as amended):
 *
 *   plate ground     the gallery's own grey band and orange mark, scaled
 *                    down (percentage-based, so no separate numbers)
 *   badge stack      one corner, at most two, in priority order: out of
 *                    stock (suppresses every other one), a real bundle,
 *                    saving, new, a real dietary tag, expiry within 6 months
 *   colour swatches  the trailing edge of the plate, ONLY when the product
 *                    carries real option colours (see `colourSwatches`) AND
 *                    the card's own chip row is not already choosing the
 *                    same colour axis
 *   variant chooser  bottom-start of the plate, over the image, NOT below it
 *                    (owner review, 2026-09-24): reserves zero body height;
 *                    a chosen value with its own photograph swaps the plate
 *                    image (`valueImageUrl`, not observably live on this
 *                    catalogue today); absent while sold out or on a bundle,
 *                    which never offers a card-composed add either
 *   brand line       ONLY when `product.brand?.name` is set; not reserved
 *   title            two lines, ellipsised
 *   spec line        "<type> · <subcategory>" for a typed product, "باقة ·
 *                    <n> منتجات" for a real bundle, else the one fallback
 *                    fact the product carries (`cardSpecLine`); the type
 *                    from `productTypeOf`, never guessed; always reserved;
 *                    never the servings count again (S8g item 1)
 *   price row        the amount, plus the struck regular price on a sale
 *   stock line       ONLY on a live `can_show_remained_quantity` quantity
 *                    of 1 to 5; the number itself never prints
 *   action row       quantity stepper + Salla's own add button, outlined -
 *                    a real bundle without the API's own `can_add` gets a
 *                    link to its own page instead (S8g item 3), the same
 *                    honest fallback a product with options already gets
 *   buy row          a full-width accent CTA: Salla's own quick buy where
 *                    `can_quick_buy` is on, otherwise a proxy of the card's
 *                    own add button that lands on the cart (P0-10)
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
  const spec = useMemo(() => parseSpecLine(product.description), [product.description]);
  const swatches = useMemo(() => colourSwatches(product), [product]);
  const hoverCapable = useHoverCapable();

  const outOfStock = product.is_out_of_stock || product.status === 'out';
  const saving = savingOf(product);
  const price = effectivePrice(product);
  const expiryDate = spec?.expiry ?? null;
  const expiryMonths = monthsUntilExpiry(expiryDate);

  /**
   * THE STOCK LINE (CARD-2026-09-23 sections 0.2 and 3.6): text only, no
   * icon, no bar, and never the number itself, the gate is verbatim from the
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
   * mid word ("واى ايزوليت نقى بـ 25 ج...") and was never a spec.
   */
  // THE TYPE (owner items 2026-09-24, S8a and S8g): a real bundle, else the
  // API category, else the listing this card renders in, else the theme's
  // own SKU membership, else an unambiguous name keyword, resolved for both
  // the root and its child, nothing when no source answers
  // (`lib/productType.ts`). Printed as the short card labels
  // (`ox.card.type.<key>`), not the taxonomy's own name: "الفيتامينات
  // والمعادن" pushed the fact behind the ellipsis on a two-up phone card.
  const listingCategory = useContext(ListingCategoryContext);
  const typeInfo = useMemo(
    () => productTypeOf(product, { categorySlug: listingCategory }),
    [product, listingCategory]
  );
  const isBundle = typeInfo?.kind === 'bundle';
  // "باقة · <n> منتجات" ONLY when the bundle's own member list is real
  // (`consisted_products`, the same field `BundleMembers` on the PDP reads);
  // never a count the API did not carry.
  const bundleMemberCount = useMemo(() => {
    if (!isBundle) return null;
    const count = bundleMembers(product).length;
    return count > 0 ? count : null;
  }, [isBundle, product]);
  const specLine = useMemo(
    () => cardSpecLine(product, spec, t, typeInfo, bundleMemberCount),
    [product, spec, t, typeInfo, bundleMemberCount]
  );

  // THE VARIANT CHOOSER, ON THE PLATE NOW (owner review, 2026-09-24): never
  // sold out, and never a bundle, a bundle's own add path is a link to its
  // page (`BuyControls`'s early return below), never a card-composed add, so
  // the plate never offers a chooser it cannot honour. `option` feeds both
  // this row and the passive preview-dot suppression below, computed once.
  const option = outOfStock || isBundle ? null : cardOption(product);
  const formId = `oxcard-form-${product.id}`;
  const [valueId, setValueId] = useState<number | string | null>(() =>
    option ? defaultValueId(option) : null
  );
  // A chosen value with its own photograph swaps the plate image; a colour
  // alone never does (`valueImageUrl`'s own comment, painting a photograph
  // from a hex would be a guess this file already refuses to make).
  const variantImageUrl = useMemo(() => valueImageUrl(option, valueId), [option, valueId]);

  // ONE axis, one control and one preview, never both (section 3.7): when the
  // card's own chip row already lets a shopper choose a colour, the plate's
  // preview dots for that same axis are redundant and are suppressed.
  const showSwatchDots = swatches.length > 0 && option?.type !== 'color';

  // THE BADGE STACK, capped at two, in the priority section 6.2 sets. A real
  // out-of-stock flag suppresses every other one on its own (rendered
  // separately below); past that, a real bundle (S8g item 3: the card must
  // present as a bundle, not a product) outranks the saving pill, which
  // outranks "new", which outranks a real dietary tag, which outranks an
  // expiry within six months.
  const tagBadge = outOfStock ? null : (bandBadges(product)[0] ?? null);
  const badgeCandidates: { id: 'bundle' | 'saving' | 'new' | 'tag' | 'expiry'; show: boolean }[] = [
    { id: 'bundle', show: !outOfStock && isBundle },
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
            link for navigation, plus the variant chooser, the quantity
            stepper, the add button and the buy CTA. The passive preview dots
            are deliberately NOT raised above the stretched link, so a tap on
            one opens the product page, which is where Salla's own option
            modal lives; the chooser below IS raised, because it is a real
            control of its own. */}
        {/* THE PLATE GROUND (owner review, 2026-09-24): the PDP gallery's own
            grey band and orange mark, off the shared `ox-plate-band`/
            `ox-plate-mark` mixins (`_primitives.scss`) so the two surfaces
            read off one definition. Rendered before the image so paint order
            alone keeps them behind the packshot, with no z-index to manage. */}
        <span className="ox-card-product__band" aria-hidden="true" />
        <span className="ox-card-product__mark" aria-hidden="true" />
        <Image
          // A chosen value with its own photograph swaps the plate image
          // (`variantImageUrl`); a colour alone never does.
          src={variantImageUrl ?? product.image?.url}
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

          {/* The bundle badge (S8g item 3): a real Salla bundle must present as
              one, not as a product, so this outranks every promotional badge
              below it. Same tone as the PDP's own informational badge
              (`ox.pdp.official_distributors`), never a promo colour. */}
          {visibleBadges.has('bundle') ? <Badge tone="neutral">{t('ox.card.bundle')}</Badge> : null}

          {/* The saving pill: the amount in riyals, the difference between two
              prices the catalogue actually holds (`savingOf`), never a
              percentage. The claims law (FINAL-claims-source.md section 5)
              states a saving in riyals only, so the platform's own
              `discount_percentage` is not printed any more (review
              2026-09-24); the Shopify card's pill carries the same markup,
              the label, the amount and the riyal mark. Nothing here is
              computed from a price the store has not set. */}
          {visibleBadges.has('saving') ? (
            <Badge tone="saving" className="ox-card-product__saving-badge">
              {t('ox.pdp.save_label')} <Price amount={saving ?? undefined} currency={product.currency} />
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
        {/* THE VARIANT CHOOSER, ON THE PLATE (owner review, 2026-09-24, item
            3): bottom-start, over the image, so it costs the body zero
            height. Never sold out, never a bundle, see `option`'s own
            comment above. `option === null` still renders (an empty,
            `:not(:empty)`-gated box in `_b4-listing.scss`), so the DOM shape
            does not depend on which one product in a grid happens to carry
            options; a sold-out or bundle card renders nothing here at all,
            matching `BuyControls`'s own early returns for both. */}
        {!outOfStock && !isBundle ? (
          <VariantChips
            option={option}
            uid={`oxcard-${product.id}`}
            value={valueId}
            onChange={setValueId}
            formId={formId}
          />

        ) : null}
      </div>


      <div className="ox-card-product__body">
        {brandName ? (
          <p className="ox-card-product__brand">
            <Bdi>{brandName}</Bdi>

          </p>

        ) : null}
        <h3 className="ox-card-product__name">
          {/* `product.url` is absolute (`https://optimalx.com.sa/...`), and an
              absolute href leaves the build on a click and drops an English
              visitor back into Arabic (UX-2026-09-24 P0-14). */}
          <Link to={toInternalPath(product.url)} className="ox-card-product__title-link">
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
          {/* A free service reads "مجاني" where its page does (ServicePdp.tsx
              `ox.common.free`), never "0.00 ر.س" (Phase B D07). */}
          {isServiceProduct(product) && (price === 0 || price === undefined) ? (
            <span className="ox-price ox-price--card ox-card-product__free">{t('ox.common.free')}</span>
          ) : (
            <Price amount={price} size="card" currency={product.currency} />
          )}

          {product.is_on_sale ? (
            <>
              <span className="ox-sr-only">{t('ox.pdp.was_price_label')}</span>

              <Price amount={product.regular_price} currency={product.currency} was />
            </>

          ) : null}
        </div>

        {/* No savings line under the price (owner call, 2026-09-22): the pill
            in the image corner already states the saving, and the extra row
            stretched every card for a figure printed twice. The
            free-consultation link that used to sit here is gone outright
            (owner review, 2026-09-24: "not necessary... taking unnecessary
            space"); `ox.card.free_consult` stays in the locale files unused,
            per the brief, rather than retired with it. */}
        {showsLimitedQty ? (
          <p className="ox-card-product__stock">{t('ox.card.limited_qty')}</p>

        ) : null}
        {withoutAddButton ? null : (
          <BuyControls
            product={product}
            outOfStock={outOfStock}
            bundle={isBundle}
            option={option}
            formId={formId}
          />

        )}
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
 *
 * **Neither is a bundle without the API's own permission** (S8g item 3): a
 * multi-product bundle cannot be composed from a listing card the way a
 * single coloured product can, so it gets no stepper and no add button
 * either, only a link to its own page, unless `can_add` says the platform
 * itself allows adding it from here.
 *
 * **The chooser itself lives on the plate now** (owner review, 2026-09-24,
 * item 3), a sibling this component never renders; `option` and `formId`
 * arrive as props from `OxProductCard`, which mounts the one `VariantChips`
 * instance both this form and the plate's own row share.
 */
function BuyControls({
  product,
  outOfStock,
  bundle,
  option,
  formId,
}: {
  product: Product;
  outOfStock: boolean;
  /** A real bundle (S8g item 3), not merely a product with options. */
  bundle: boolean;
  /** The plate's own chooser, resolved once by the parent (never on a bundle). */
  option: ProductOption | null;
  /** The `<form>` id below, and the id the plate's own radios `form=` back to. */
  formId: string;
}) {
  const { t } = useTranslation();
  const max = maxQuantity(product);
  const [quantity, setQuantity] = useState(1);

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
  // variant chips, no buy CTA, one full-width control, and nothing built
  // above is used past this point for a sold-out product.
  if (outOfStock) {
    return (
      <div className="ox-card-product__action ox-card-product__action--out">
        <SoldOutControl product={product} />

      </div>

    );
  }

  // A real bundle whose own page has to compose the add (S8g item 3): no
  // stepper, no add button, one link, read defensively, the way
  // `bundleMembers` reads `consisted_products`, since neither field is
  // declared on the engine's own Product type. `can_add` is not present on
  // any product in this catalogue today, so this is the honest state until
  // the platform starts sending it.
  const canAddBundle = bundle && (product as unknown as { can_add?: unknown }).can_add === true;
  if (bundle && !canAddBundle) {
    return (
      <div className="ox-card-product__action">
        <Link
          to={toInternalPath(product.url)}
          className="ox-btn ox-btn--primary ox-btn--block ox-card-product__buy"
        >
          {t('ox.card.buy_now')}
        </Link>

      </div>

    );
  }

  // A service or a booking presents as a booking, never as "add 1 to cart"
  // (Phase B D07, see `isServiceProduct`): one full-width link to its own
  // page carrying the channel's own verb (services.ts `doorCtaKey`, the
  // short form ServicePdp.tsx also prefers), else the generic booking or
  // order-service label the page itself falls back to.
  if (isServiceProduct(product)) {
    const channel = channelByCode(product.sku ?? undefined);
    const serviceLabelKey =
      channel?.doorCtaKey ??
      channel?.ctaKey ??
      (product.type === 'booking' ? 'ox.pdp.book_now' : 'ox.booking.order_service');
    return (
      <div className="ox-card-product__action">
        <Link
          to={toInternalPath(product.url)}
          className="ox-btn ox-btn--primary ox-btn--block ox-card-product__buy"
        >
          {t(serviceLabelKey)}
        </Link>

      </div>

    );
  }

  // ONE grid, not a row plus a sibling (owner review, 2026-09-23, item 2):
  // below 768 the stepper takes its own row and the add button joins
  // buy-now on the next one, which needs all three as grid items of one
  // container, buy-now used to be a plain sibling after this div, which
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

  // No option to choose: nothing here needs a `<form>` around it. A form
  // that wraps nothing chooseable is markup for its own sake; the plate's own
  // `VariantChips` still rendered its empty reservation box, off in the
  // plate, entirely on its own.
  if (!option) {
    return controls;
  }

  return (
    <form
      id={formId}
      className="ox-card-product__form"
      method="post"
      encType="multipart/form-data"
      onSubmit={onSubmit}
    >
      {/* Salla reads the product from the form, not from the button. The
          chosen value itself comes from the plate's own radios, associated
          with this form by `form={formId}` (VariantChips.tsx) even though
          they render outside it in the DOM, the standard HTML mechanism a
          `<button form="…">` uses, so `new FormData(form)` still carries it. */}
      <input type="hidden" name="id" value={String(product.id)} />

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
 * - a real `notify_availability` payload, or a status the platform itself
 * marked `out-and-notify`, and nothing is invented when it cannot. The
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
 * products in the catalogue snapshot, and what used to render then was a LINK
 * to the product page wearing the words "اشتري الآن": an accent button that
 * said buy and navigated (UX-2026-09-24 P0-10, measured on every card on
 * every route). The owner's decision is that the label and the angled primary
 * stay, so the control now does what it says: it clicks the card's own
 * `salla-add-product-button` (`proxyAddToCart`) and moves the shopper to the
 * cart once that component reports success. Still no `salla.cart` call, still
 * no checkout endpoint - the add is Salla's, only the destination is ours.
 *
 * The one product that keeps a link is one with options: buying it needs a
 * choice the card cannot make, so "buy now" opens the page that has it.
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

  // A product whose variant has to be chosen is the ONE case where a link is
  // the honest control: buying it needs a choice this card cannot make for
  // the shopper, so "buy now" opens the page where the choice is (P0-10).
  if (product.has_options === true) {
    return (
      <Link
        to={toInternalPath(product.url)}
        className="ox-btn ox-btn--primary ox-btn--block ox-card-product__buy"
      >
        {label}
      </Link>

    );
  }

  // Quick buy off, no options: the button BUYS. It clicks the card's own
  // `salla-add-product-button` - the one rendered a few nodes away in
  // `.ox-card-product__action` - and moves the shopper to the cart only once
  // that component reports its own success. Salla owns the add, the
  // validation and the toast; this owns where the shopper goes next.
  return (
    <button
      type="button"
      className="ox-btn ox-btn--primary ox-btn--block ox-card-product__buy"
      onClick={(event) => {
        const scope = event.currentTarget.closest('.ox-card-product__action');
        const addButton = scope?.querySelector('salla-add-product-button');
        if (!addButton) return;
        proxyAddToCart({
          button: addButton,
          onSuccess: () => window.location.assign(currentCartPath()),
        });
      }}
    >
      {label}
    </button>

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
 * The card's add control: the theme's own real `<button>`, restyled to the
 * target's outline treatment, that PROXIES to Salla's add button rather than
 * being it (S9i, PDP-ADD-DIAG-2026-09-24.md).
 *
 * **Why the visible element changed.** `salla-add-product-button` gets no
 * click handler of its own until the SDK script from
 * cdn.assets.salla.network has loaded and registered it, a gap the owner
 * saw three times as the add control simply doing nothing ("keeps
 * deleting"). CSS alone cannot fix that: a themed, un-upgraded custom
 * element still LOOKS like a button but has no click behaviour at all, so a
 * tap in that gap was a silent no-op regardless of how it was styled. The
 * fix is a real, native `<button>`, rendered in the server HTML, that is
 * clickable from the first paint the way only a real HTML element can be -
 * and that never touches the cart itself (CLAUDE.md: cart logic stays
 * Salla's). Salla's own component stays mounted, in `.ox-card-product__add-
 * native` right below, visually clipped rather than `display:none` (a
 * hidden-but-connected host still does real work when clicked), and this
 * button waits for it to be ready (`whenCustomElementReady`, immediate if it
 * already is) and then clicks THAT, the exact proxy pattern `BuyNow` below
 * already uses for the card's own buy CTA.
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
 * `quantity` is the hidden component's own documented property ("custom
 * quantity number to be injected", salla.dev doc-422692), which is what makes
 * the stepper real rather than decorative. It is passed only when the stepper
 * is on screen, so every product that has no stepper keeps exactly the
 * request it sent before this rebuild, and since it is a React prop on the
 * hidden element, the proxied click always carries whatever the stepper reads
 * at the moment of the tap, with nothing extra to wire up here.
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
  const [pending, setPending] = useState(false);

  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      const host = event.currentTarget
        .closest('.ox-card-product__add-slot')
        ?.querySelector(ADD_BUTTON_TAG);
      // Structurally always present (rendered a few lines below, in the same
      // slot), defensive only, matching `BuyNow`'s own guard on the same
      // query, never a silent no-op in practice.
      if (!host) return;
      setPending(true);
      whenCustomElementReady(ADD_BUTTON_TAG).then((ready) => {
        if (!ready) {
          // The SDK never registered the element within the wait: restore
          // the button rather than leave it disabled on a control that may
          // never arrive (a hard failure, same as `proxyAddToCart`'s own
          // `failed`/timeout path below).
          setPending(false);
          return;
        }
        if (submit) {
          // The hidden host is `type="submit"` inside the card's own form
          // (`BuyControls`, below): clicking it fires the browser's native
          // submit event, which the form's `onSubmit` hands to Salla's own
          // `form.onSubmit`. That path returns early from the component's
          // own click handler (see the hidden instance's own doc comment)
          // and reports neither `success` nor `failed`, so there is nothing
          // left to wait on.
          (host as HTMLElement).click();
          setPending(false);
          return;
        }
        proxyAddToCart({
          button: host,
          // Salla's own toast is what tells the shopper the add worked;
          // nothing else has to happen here on success.
          onSuccess: () => {},
          onSettled: () => setPending(false),
        });
      });
    },
    [submit]
  );

  return (
    <>
      <button
        type="button"
        className={'ox-card-product__add' + (pending ? ' is-loading' : '')}
        // ALWAYS SET, not only on the narrow card that needs it. Below the
        // 240px container query (`_b4-listing.scss`) the label's own text is
        // hidden and only the cart glyph shows, in a fixed 44px box, an
        // icon has no name of its own, so `aria-label` is what keeps the
        // button's accessible name the same word a wide card prints.
        aria-label={label}
        aria-busy={pending || undefined}
        // Disabled ONLY while a click is in flight, so a second tap cannot
        // stack a second add behind the same wait or the same proxy.
        disabled={pending}
        aria-disabled={pending || undefined}
        onClick={handleClick}
      >
        <span className="ox-card-product__add-label">{label}</span>

        {pending ? (
          <span
            className="ox-card-product__add-loader"
            role="status"
            aria-label={t('ox.common.loading')}
          />

        ) : null}
      </button>

      {/* SALLA'S OWN BUTTON, MOUNTED BUT NEVER SEEN (S9i). Clipped
          (`.ox-card-product__add-native`, `_b4-listing.scss`), not
          `display:none`: a hidden-but-connected host is still a real,
          clickable element the proxy above can reach with `.click()`; a
          `display:none` one risks the component skipping its own connected
          work. `aria-hidden` keeps it out of the accessibility tree, the
          button above is the one control a shopper, sighted or not, is ever
          meant to find. */}
      <span className="ox-card-product__add-native" aria-hidden="true">
        {/* CORE, NOT THE DEFERRED EXPORT, unchanged reasoning from before
            this batch: `SallaAddProductButton` is wrapped in the package's
            `HydrationBoundary`, which mounts the real custom element only
            once an IntersectionObserver fires, and measured on the home grid
            that observer never fired at all. Core mounts immediately, which
            is what this file's own proxy above needs to have something to
            wait on rather than something to wait forever for. Core has no
            error boundary of its own, so it brings ours. */}
        <WebComponentBoundary label={`card add ${product.id}`}>
          <SallaAddProductButtonCore
            productId={product.id}
            productType={product.type}
            productStatus={product.status}
            width="wide"
            fill="outline"
            loaderPosition="center"
            className="ox-card-product__add"
            aria-label={label}
            // `type="submit"` makes the component render a real submit button
            // and return early from its own click handler, so the FORM adds
            // the product, with the chosen option in the payload, instead
            // of the component adding it optionless. The proxy above still
            // reaches this exact button; only who calls `.click()` on it
            // moved.
            {...(submit ? { type: 'submit' as const } : {})}
            {...(quantity !== null ? { quantity } : {})}
          >
            <span className="ox-card-product__add-label">{label}</span>

          </SallaAddProductButtonCore>

        </WebComponentBoundary>

      </span>

    </>

  );
}


/** A trimmed non-empty string, or null. */
function trimmedText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const out = value.trim();
  return out.length > 0 ? out : null;
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
