import { useEffect, useMemo, useRef } from 'react';
import { Breadcrumb, RenderWhenVisible } from '@salla.sa/twilight-theme-engine/common';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks/HookSlot';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useProduct } from '@salla.sa/twilight-theme-engine/hooks/useProduct';
import { useComments } from '@salla.sa/twilight-theme-engine/hooks/useComments';
import { useGtm } from '@salla.sa/twilight-theme-engine/hooks/useGtm';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { ProductPageProps } from '@salla.sa/twilight-theme-engine/routes/product';
import { SallaOffer } from '@salla.sa/twilight-components-react/offer';
import { PdpGallery } from './BuyZone/PdpGallery';
import { PdpTitleBlock } from './BuyZone/PdpTitleBlock';
import { PdpPriceBlock } from './BuyZone/PdpPriceBlock';
import { StatCards } from './BuyZone/StatCards';
import { PaymentMarks } from './BuyZone/PaymentMarks';
import { SpecChips, SpecFacts } from './BuyZone/SpecChips';
import { SupplyCalculator } from './BuyZone/SupplyCalculator';
import { DeliveryPromise } from './BuyZone/DeliveryPromise';
import { BuyForm } from './BuyZone/BuyForm';
import { TrustGrid } from './BuyZone/TrustGrid';
import { StickyBar } from './BuyZone/StickyBar';
import { BrandBand } from './BelowFold/BrandBand';
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
import { ServicePdp } from './variants/ServicePdp';
import { splitDescription } from './lib/nutritionTable';
import { createGlossaryLookup } from './lib/glossary';
import { categorySlugOf, pdpFaqItems, prePurchaseRows } from './lib/faq';
import { statCells } from './lib/stats';
import { LABEL_EXPIRY, LABEL_FORM, LABEL_SERVINGS, LABEL_SERVING_SIZE } from './lib/specLine';
import { bundleMembers, hasSupplyCalculator, isShippable, variantOf } from './lib/variant';

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
        {/* Present for its BreadcrumbList JSON-LD and for a screen reader, out
            of the visual flow: the design has no breadcrumb row, and
            display:none would take it out of the accessibility tree too. */}
        <div className="ox-sr-only">
          <Breadcrumb page={page} />
        </div>
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
                  servings={hasSupplyCalculator(product.type) ? parts.specLine?.servings : null}
                  expiry={parts.specLine?.expiry}
                  settings={settings}
                  country={store?.country}
                  language={locale}
                  payments={payments}
                />
              </>
            )}

            <HookSlot name="product:single.description" context={hookContext} />
            <HookSlot name="product:single.description.end" context={hookContext} />
            <HookSlot name="product:details.end" context={hookContext} />
            <HookSlot name="product:single.form.start" context={hookContext} />

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
            />

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
              footer={
                hasSupplyCalculator(product.type) ? (
                  <SupplyCalculator servings={parts.specLine?.servings} />
                ) : null
              }
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
            {reviewCount > 0 ? (
              /* The React wrapper types `type` as the components package's
                 CommentType enum, which is not a direct dependency here; the
                 custom element takes the same string and is what the engine
                 renders. */
              <salla-comments key={commentsKey} item-id={product.id} type="product" />
            ) : (
              <p className="ox-pdp__no-reviews">{t('ox.pdp.no_reviews')}</p>
            )}
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

      {isService ? null : <StickyBar product={product} anchorRef={buyZoneRef} />}
    </div>
  );
}

export default ProductPage;
