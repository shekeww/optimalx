import { useEffect, useMemo, useRef } from 'react';
import { RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useProduct } from '@salla.sa/twilight-theme-engine/hooks/useProduct';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { useGtm } from '@salla.sa/twilight-theme-engine/hooks/useGtm';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { Button } from '../common/Button';
import { AddAlso } from './BuyZone/AddAlso';
import { ExpiryLine } from './BuyZone/ExpiryLine';
import { PdpGallery } from './BuyZone/PdpGallery';
import { PdpTitleBlock } from './BuyZone/PdpTitleBlock';
import { PdpPriceBlock } from './BuyZone/PdpPriceBlock';
import { StatCards } from './BuyZone/StatCards';
import { PaymentMarks } from './BuyZone/PaymentMarks';
import { SpecChips, SpecFacts } from './BuyZone/SpecChips';
import { SupplyCalculator } from './BuyZone/SupplyCalculator';
import { DeliveryPromise } from './BuyZone/DeliveryPromise';
import { BuyForm } from './BuyZone/BuyForm';
import { BuyActions } from './BuyZone/BuyActions';
import { TrustGrid } from './BuyZone/TrustGrid';
import { StickyBar } from './BuyZone/StickyBar';
import { BrandBand } from './BelowFold/BrandBand';
import { AdvisoryCta } from './BelowFold/AdvisoryCta';
import { AnchorStrip, type AnchorItem } from './BelowFold/AnchorStrip';
import { InfoPanels } from './BelowFold/InfoPanels';
import { DetailsPanel } from './BelowFold/DetailsPanel';
import { RelatedRail } from './BelowFold/RelatedRail';
import { Description } from './BelowFold/Description';
import { NutritionTable } from './BelowFold/NutritionTable';
import { HowToUse } from './BelowFold/HowToUse';
import { PrePurchaseInfo } from './BelowFold/PrePurchaseInfo';
import { Faq } from './BelowFold/Faq';
import { BundleMembers } from './BelowFold/BundleMembers';
import { Bundle } from './BelowFold/Bundle';
import { FrequentlyBought } from './BelowFold/FrequentlyBought';
import { ServicePdp } from './variants/ServicePdp';
import { splitDescription } from './lib/nutritionTable';
import { createGlossaryLookup } from './lib/glossary';
import { categorySlugOf, pdpFaqItems, prePurchaseRows } from './lib/faq';
import { statCells } from './lib/stats';
import { LABEL_EXPIRY, LABEL_FORM, LABEL_SERVINGS, LABEL_SERVING_SIZE } from './lib/specLine';
import { isConsumablePack } from './lib/supply';
import { bundleMembers, hasSupplyCalculator, isShippable, variantOf } from './lib/variant';
import { OxBreadcrumb } from '../common/OxBreadcrumb';
import { toInternalPath } from '../layout/navLinks';

/**
 * The OptimalX product page: our composition over the engine's product
 * primitives, rebuilt to the approved design (regions 12 to 42).
 *
 * What stays the engine's: the loader and head (in the route file),
 * `useProduct` for live price and stock, `AddToCartForm` for every cart
 * interaction, `Breadcrumb` (which also emits the BreadcrumbList JSON-LD, so
 * this page emits none, PLAN-final C11), `SallaOffer`, `SallaComments` and the
 * related rail's own slider.
 *
 * What this page adds over the engine's own ProductPage: the same eleven hook
 * slots in the same order, but now with `context={{ product }}`, which is what
 * makes the theme's `product:single.description` handler fire at all; and
 * `useGtm().detail(product)` once on mount, which the engine never called.
 *
 * The page reads top to bottom as the design does: the two column buy zone,
 * the dark brand band, the anchor strip, the three information panels, the
 * benefits prose, the questions, the reviews and the related carousel. Every
 * region below the strip is an anchor, and a region with no content has
 * neither a panel nor a tab, so the strip can never point at nothing.
 *
 * One page still serves five compositions. `service` and `booking` swap the
 * buy column and drop the label blocks; `digital`, `codes` and
 * `group_products` differ by a handful of conditionals each.
 */
export function ProductPage({ product: initialProduct, page }: ProductPageProps) {
  const { theme, store, locale } = useTwilight();
  const { t } = useTranslation();
  const { product } = useProduct(initialProduct);
  const { commentsKey } = useComments();
  const gtm = useGtm();
  const buyZoneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gtm.detail(product);
    // One detail event per product id, as GA4 expects.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  /**
   * The trail this page KNOWS (UX-2026-09-24 P0-6). The engine's fallback
   * second crumb is `page.parent`, which it fills with the last page the
   * visitor happened to visit: the same shaker read `الطاقة` at 1440 and the
   * branch page's own title at 390, and both linked back to the shaker. The
   * product's own category is a fact about the product, so it reads the same
   * however the shopper arrived; a product with no category falls back to the
   * type index rather than to a guess.
   */
  const crumbs = useMemo(
    () => [
      { name: 'common.titles.home', url: '/' },
      product.category?.url
        ? { name: product.category.name, url: toInternalPath(product.category.url) }
        : { name: 'ox.nav.all_types', url: '/categories' },
      { name: product.name, url: toInternalPath(product.url ?? page.url ?? '') },
    ],
    [product.category?.url, product.category?.name, product.name, product.url, page.url]
  );

  const glossary = useMemo(() => createGlossaryLookup(t), [t]);
  const parts = useMemo(
    () => splitDescription(product.description, glossary),
    [product.description, glossary]
  );
  const hookContext = useMemo(() => ({ product }), [product]);

  const variant = variantOf(product.type);
  const isService = variant === 'service';
  const isBundle = variant === 'bundle';
  const isDigital = variant === 'digital';
  const isGiftCard = variant === 'giftCard';
  const isPhysical = variant === 'physical';
  const members = isBundle ? bundleMembers(product) : [];
  const faqItems = pdpFaqItems(t, product.category?.url);
  const settings = theme.settings as Record<string, unknown> | undefined;
  const payments = store.settings?.payments;

  /**
   * The days-of-supply question is asked of a consumable package only
   * (UX-2026-09-24 P0-13). The type gate alone let it run on a reusable
   * shaker bottle, which the page then described as lasting one day and
   * running out tomorrow; the form and the servings count answer whether
   * anyone doses this package at all.
   */
  const showsSupply =
    hasSupplyCalculator(product.type) && isConsumablePack(parts.specLine);

  const stats = useMemo(
    () => (isService ? [] : statCells({ product, spec: parts.specLine, nutrition: parts.nutrition })),
    [isService, product, parts.specLine, parts.nutrition]
  );

  // Which regions exist decides which tabs exist (B19 to B21). Nothing below
  // is drawn from a default: each flag is the same condition the region's own
  // component gates itself on.
  const reviewCount = product.rating?.count ?? 0;
  const showsReviews = Boolean(store.settings?.rating?.show_on_product);
  const hasNutrition = isPhysical && (parts.nutrition?.rows.length ?? 0) > 0;
  const hasMethod = !isService && parts.howToUse.length > 0;
  const hasBenefits = parts.bodyHtml.length > 0;
  const hasDetails = !isService;

  const tabs: AnchorItem[] = [];
  if (hasDetails) tabs.push({ id: 'ox-details', label: t('ox.pdp.tab_details') });
  if (hasBenefits) tabs.push({ id: 'ox-benefits', label: t('ox.pdp.tab_benefits') });
  if (hasMethod) tabs.push({ id: 'ox-howto', label: t('ox.pdp.how_to_use') });
  if (hasNutrition) tabs.push({ id: 'ox-nutrition', label: t('ox.pdp.tab_nutrition') });
  if (showsReviews && reviewCount > 0) {
    tabs.push({ id: 'ox-reviews', label: t('ox.pdp.reviews') });
  }

  return (
    <div className={'ox-pdp ox-pdp--' + variant} key={product.id}>
      <div className="ox-container">
        {/* Visible, not `ox-sr-only`. It was hidden on the reading that the
            approved image draws no breadcrumb row; the image is one frame of
            one product, and most people who reach a product page arrive on it
            from search with no idea what else the store sells. The trail is
            the cheapest orientation on the page and it is already the page's
            one BreadcrumbList JSON-LD (PLAN-final C11). */}
        <OxBreadcrumb page={page} trail={crumbs} className="ox-crumbs ox-pdp__crumbs" />
        <HookSlot name="product:start" context={hookContext} />

        <div className="ox-pdp__top" id={'product-' + product.id}>
          <div className="ox-pdp__media">
            <PdpGallery product={product} />
          </div>

          <div className="ox-pdp__buy">
            <HookSlot name="product:details.start" context={hookContext} />
            <HookSlot name="product:single.description.start" context={hookContext} />

            <PdpTitleBlock
              product={product}
              lead={parts.lead}
              hasReviews={showsReviews && reviewCount > 0}
            />

            {isService ? (
              <ServicePdp product={product} spec={parts.specLine} settings={settings} />
            ) : (
              <>
                <StatCards cells={stats} />
                <PdpPriceBlock
                  product={product}
                  servings={showsSupply ? parts.specLine?.servings : null}
                  expiry={parts.specLine?.expiry}
                  settings={settings}
                  country={store?.country}
                  language={locale}
                  payments={payments}
                />
                {/* Digital goods and gift codes carry their expiry in the
                    chip row inside the form instead, so this would be the
                    same fact twice on those two compositions. */}
                {isDigital || isGiftCard ? null : (
                  <ExpiryLine expiry={parts.specLine?.expiry} />
                )}
              </>
            )}

            <HookSlot name="product:single.description" context={hookContext} />
            <HookSlot name="product:single.description.end" context={hookContext} />
            <HookSlot name="product:details.end" context={hookContext} />
            <HookSlot name="product:single.form.start" context={hookContext} />

            {/* A service and a booking do not mount the engine form at all
                (UX-2026-09-24 P0-2). `AddToCartForm` renders shipping fields
                - an English `Weight 0.1` row, an English `Quantity` row and a
                total of 0 - which mean nothing for a branch visit, and its
                quantity input and add button sat as permanent `s-skeleton`
                pulses on that page. `ServicePdp` above renders Salla's own
                add button instead, which is the whole cart path a booking
                needs. */}
            {isService ? null : (
              <BuyForm
                product={product}
                anchorRef={buyZoneRef}
                formStartSlot={
                  isDigital || isGiftCard ? (
                    <>
                      <SpecChips spec={parts.specLine} settings={settings} />
                      <SpecFacts
                        spec={parts.specLine}
                        settings={settings}
                        skip={[LABEL_SERVINGS, LABEL_SERVING_SIZE, LABEL_EXPIRY, LABEL_FORM]}
                        title={t('ox.pdp.facts')}
                      />
                    </>
                  ) : null
                }
                afterForm={
                  /* The other half of the pair. The engine's form owns the
                     stepper and the add button; this adds the buy-now beneath
                     them, inside the same block so the two sit 12px apart, and
                     proxies that same button, so the quantity and options the
                     shopper chose are what reaches the cart. A service is
                     booked rather than bought, and never reaches this form. */
                  <BuyActions product={product} anchorRef={buyZoneRef} />
                }
              />
            )}

            <HookSlot name="product:single.form.end" context={hookContext} />

            {isService ? null : (
              <>
                <PaymentMarks payments={payments} />
                <DeliveryPromise
                  settings={settings}
                  currency={product.currency}
                  shippable={isShippable(product)}
                  storeCity={store?.country}
                />
              </>
            )}

            {/* DIRECTION lists the trust grid on the physical, digital and
                bundle compositions only: a gift card has no shipping or expiry
                to promise, and the service page makes its promises in its own
                scope line. */}
            {isGiftCard || isService ? null : (
              <TrustGrid settings={settings} digital={isDigital} payments={payments} />
            )}
          </div>
        </div>

        <SallaOffer />

        {/* The cross-sell slot: directly under the buy zone, which is where
            the shopper has just read the price. It renders nothing unless
            the merchant has linked related products or assigned a category,
            so it never repeats the bottom rail. */}
        {isService ? null : (
          <RenderWhenVisible>
            <AddAlso productId={product.id} categoryId={product.category?.id ?? null} />
          </RenderWhenVisible>
        )}

        {/* The completion row and the bundle offer. Both are absent until a
            real companion set or a real bundle is defined, so today this slot
            renders nothing at all and the page is unchanged.

            Deliberately NOT inside `RenderWhenVisible`. That wrapper emits a
            `<section>` with `min-height: 400px` holding a pulsing grey
            skeleton until its IntersectionObserver fires, which is the right
            trade for a region that will certainly have content, and exactly
            the wrong one for a region that is gated off: it would put a 400px
            grey ghost under the buy zone on every product page, in the SSR
            output and for every visitor without JavaScript, advertising a
            block that does not exist.

            Nothing is lost by dropping it. Both components return null
            synchronously when no set matches, and their one API request is a
            `useQuery` that stays `enabled: false` until there are ids to ask
            for, so the gated page pays neither DOM nor network. */}
        {isService ? null : (
          <>
            <FrequentlyBought product={product} />
            <Bundle product={product} />
          </>
        )}
      </div>

      {isService ? null : (
        <div className="ox-container">
          <BrandBand product={product} categorySlug={categorySlugOf(product.category?.url)} />
        </div>
      )}

      <div className="ox-container ox-pdp__below">
        <AnchorStrip items={tabs} />

        {members.length > 0 ? <BundleMembers members={members} /> : null}

        <InfoPanels>
          {hasDetails ? (
            <DetailsPanel
              product={product}
              spec={parts.specLine}
              footer={<PrePurchaseInfo warning={parts.warning} rows={prePurchaseRows(t)} />}
            />
          ) : null}
          {hasMethod ? (
            <HowToUse
              steps={parts.howToUse}
              footer={showsSupply ? <SupplyCalculator servings={parts.specLine?.servings} /> : null}
            />
          ) : null}
          {hasNutrition ? (
            <NutritionTable data={parts.nutrition} servingSize={parts.specLine?.servingSize} />
          ) : null}
        </InfoPanels>

        <Description html={parts.bodyHtml} />
        <Faq items={faqItems} />
      </div>

      {showsReviews ? (
        <RenderWhenVisible>
          <div className="ox-container ox-pdp__reviews" id="ox-reviews">
            {/* At zero reviews the honest sentence stays, and an action goes
                under it. It was a full stop: the page said there are no
                reviews and offered nothing instead. It cannot offer a "rate
                this product" button, because Salla collects a rating after a
                delivered order and the store has none; what it can offer is
                the thing this store actually sells beside the box, which is
                the advice. That is also the only place a product page linked
                to the advisory at all. */}
            {reviewCount > 0 ? null : (
              <div className="ox-pdp__no-reviews" data-testid="ox-pdp-no-reviews">
                <p className="ox-pdp__no-reviews-line">{t('ox.pdp.no_reviews')}</p>
                <p className="ox-pdp__no-reviews-line">{t('ox.pdp.no_reviews_ask')}</p>
                <Button to="/services" variant="secondary" size={44}>
                  {t('ox.nav.services')}
                </Button>
              </div>
            )}
            {/* Mounted at zero too, which is what lets the first review be
                left at all: the element renders nothing for a visitor who
                cannot review (measured on the live store, 0px tall), and the
                native form for a customer who can. Gating it on
                `reviewCount > 0` made the first review unreachable from the
                page.

                The React wrapper types `type` as the components package's
                CommentType enum, which is not a direct dependency here; the
                custom element takes the same string and is what the engine
                renders. */}
            <salla-comments key={commentsKey} item-id={product.id} type="product" />
          </div>
        </RenderWhenVisible>
      ) : null}

      <HookSlot name="product:related.start" context={hookContext} />
      <RenderWhenVisible>
        <div className="ox-container">
          <RelatedRail productId={product.id} categoryId={product.category?.id ?? null} />
        </div>
      </RenderWhenVisible>
      <HookSlot name="product:related.end" context={hookContext} />
      <HookSlot name="product:end" context={hookContext} />

      {/* The free advisory + InBody CTA (owner brief 2026-09-24): after the
          related rail and the FAQ, before the footer. Never on a service or
          booking product — that page IS one of the advisory channels, and it
          would be selling itself. */}
      {isService ? null : (
        <div className="ox-container">
          <AdvisoryCta productName={product.name} settings={settings} />
        </div>
      )}

      {isService ? null : <StickyBar product={product} anchorRef={buyZoneRef} />}
    </div>
  );
}

export default ProductPage;
