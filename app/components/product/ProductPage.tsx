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
import { SallaQuickOrder } from '@salla.sa/twilight-components-react/quick-order';
import { SallaBoughtTogether } from '@salla.sa/twilight-components-react/bought-together';
import { PdpGallery } from './BuyZone/PdpGallery';
import { PdpTitleBlock } from './BuyZone/PdpTitleBlock';
import { PdpPriceBlock } from './BuyZone/PdpPriceBlock';
import { SpecChips, SpecFacts } from './BuyZone/SpecChips';
import { SupplyCalculator } from './BuyZone/SupplyCalculator';
import { DeliveryPromise } from './BuyZone/DeliveryPromise';
import { BuyForm } from './BuyZone/BuyForm';
import { WishlistShare } from './BuyZone/WishlistShare';
import { TrustGrid } from './BuyZone/TrustGrid';
import { StickyBar } from './BuyZone/StickyBar';
import { Description } from './BelowFold/Description';
import { NutritionTable } from './BelowFold/NutritionTable';
import { HowToUse } from './BelowFold/HowToUse';
import { PrePurchaseInfo } from './BelowFold/PrePurchaseInfo';
import { Faq } from './BelowFold/Faq';
import { Alternatives } from './BelowFold/Alternatives';
import { BundleMembers } from './BelowFold/BundleMembers';
import { ServicePdp } from './variants/ServicePdp';
import { splitDescription } from './lib/nutritionTable';
import { createGlossaryLookup } from './lib/glossary';
import { pdpFaqItems, prePurchaseRows } from './lib/faq';
import { LABEL_EXPIRY, LABEL_FORM, LABEL_SERVINGS, LABEL_SERVING_SIZE } from './lib/specLine';
import { bundleMembers, hasSupplyCalculator, isFood, isShippable, variantOf } from './lib/variant';

/**
 * The OptimalX product page: our composition over the engine's product
 * primitives (PLAN-final B3, DIRECTION 6.5 to 6.7).
 *
 * What stays the engine's: the loader and head (in the route file),
 * `useProduct` for live price and stock, `AddToCartForm` for every cart
 * interaction, `Breadcrumb` (which also emits the BreadcrumbList JSON-LD, so
 * this page emits none, PLAN-final C11), `SallaOffer`, `SallaQuickOrder`,
 * `SallaComments` and `SallaBoughtTogether`.
 *
 * What this page adds over the engine's own ProductPage
 * (dist/routes/product.js:77-118): the same eleven hook slots in the same
 * order, but now with `context={{ product }}`, which is what makes the
 * theme's `product:single.description` handler fire at all (PLAN-final C4);
 * and `useGtm().detail(product)` once on mount, which the engine never called.
 *
 * One page serves five compositions. `service` and `booking` swap the buy
 * column and drop the below-fold label blocks (DIRECTION 6.6); `digital`,
 * `codes` and `group_products` differ from the physical page by three
 * conditionals each (DIRECTION 6.7), which is why they are branches here
 * rather than four near-identical page files.
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
  const members = isBundle ? bundleMembers(product) : [];
  const faqItems = pdpFaqItems(t, product.category?.url);
  const settings = theme.settings as Record<string, unknown> | undefined;
  const extraChips =
    isFood(product.type) && typeof product.calories === 'number'
      ? [{ label: String(product.calories) }]
      : [];

  return (
    <div className={'ox-pdp ox-pdp--' + variant} key={product.id}>
      <div className="ox-container">
        <Breadcrumb page={page} />
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
              expiry={parts.specLine?.expiry}
              settings={settings}
            />
            {isService ? (
              <ServicePdp product={product} spec={parts.specLine} settings={settings} />
            ) : (
              <PdpPriceBlock
                product={product}
                servings={hasSupplyCalculator(product.type) ? parts.specLine?.servings : null}
                settings={settings}
                country={store?.country}
                language={locale}
              />
            )}

            <HookSlot name="product:single.description" context={hookContext} />
            <HookSlot name="product:single.description.end" context={hookContext} />
            <HookSlot name="product:details.end" context={hookContext} />
            <HookSlot name="product:single.form.start" context={hookContext} />

            <BuyForm
              product={product}
              anchorRef={buyZoneRef}
              formStartSlot={
                isService ? null : (
                  <>
                    <SpecChips spec={parts.specLine} settings={settings} extra={extraChips} />
                    {isDigital || isGiftCard ? (
                      <SpecFacts
                        spec={parts.specLine}
                        settings={settings}
                        skip={[LABEL_SERVINGS, LABEL_SERVING_SIZE, LABEL_EXPIRY, LABEL_FORM]}
                        title={t('ox.pdp.facts')}
                      />
                    ) : null}
                    {hasSupplyCalculator(product.type) ? (
                      <SupplyCalculator servings={parts.specLine?.servings} />
                    ) : null}
                    <DeliveryPromise
                      settings={settings}
                      currency={product.currency}
                      shippable={isShippable(product)}
                    />
                  </>
                )
              }
            />

            <HookSlot name="product:single.form.end" context={hookContext} />
            <WishlistShare productId={product.id} />
            {/* DIRECTION lists the trust grid on the physical (6.5 row 11),
                digital (6.7 row 8) and bundle (6.7 row 9) compositions only:
                a gift card has no shipping or expiry to promise, and the
                service page makes its promises in its own scope line. */}
            {isGiftCard || isService ? null : (
              <TrustGrid settings={settings} digital={isDigital} />
            )}
            <SallaQuickOrder className="ox-pdp__quick-order" />
          </div>
        </div>

        <SallaOffer />
      </div>

      <div className="ox-container ox-container--narrow ox-pdp__below">
        {members.length > 0 ? <BundleMembers members={members} /> : null}
        <Description html={parts.bodyHtml} />
        {/* Only the physical and food compositions carry label nutrition
            (DIRECTION 6.5 row 15). A bundle's members each carry their own,
            and a digital guide or a gift card has no label at all, even when
            the merchant left a table in the description. */}
        {variant === 'physical' ? (
          <NutritionTable data={parts.nutrition} servingSize={parts.specLine?.servingSize} />
        ) : null}
        <HowToUse steps={parts.howToUse} />
        {isService ? null : (
          <PrePurchaseInfo warning={parts.warning} rows={prePurchaseRows(t)} />
        )}
        <Faq items={faqItems} />
      </div>

      {product.type === 'product' || product.type === 'food' ? (
        <RenderWhenVisible>
          <div className="ox-container">
            <SallaBoughtTogether />
          </div>
        </RenderWhenVisible>
      ) : null}

      {store.settings?.rating?.show_on_product ? (
        <RenderWhenVisible>
          <div className="ox-container" id="ox-reviews">
            {/* The React wrapper types `type` as the components package's
                CommentType enum, which is not a direct dependency here; the
                custom element takes the same string (ambient
                salla-components.d.ts:176) and is what the engine renders. */}
            <salla-comments key={commentsKey} item-id={product.id} type="product" />
          </div>
        </RenderWhenVisible>
      ) : null}

      <HookSlot name="product:related.start" context={hookContext} />
      <RenderWhenVisible>
        <div className="ox-container">
          <Alternatives productId={product.id} />
        </div>
      </RenderWhenVisible>
      <HookSlot name="product:related.end" context={hookContext} />
      <HookSlot name="product:end" context={hookContext} />

      {isService ? null : <StickyBar product={product} anchorRef={buyZoneRef} />}
    </div>
  );
}

export default ProductPage;
