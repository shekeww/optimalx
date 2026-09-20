import { useMemo } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaAddProductButton } from '@salla.sa/twilight-components-react/add-product-button';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Bdi } from '../../common/Bdi';
import { Button } from '../../common/Button';
import { Price } from '../../common/Price';
import { PdpIcon } from '../PdpIcon';
import { effectivePrice } from '../lib/claims';
import { isAddable, useCatalogueProducts } from '../lib/catalogue';
import { bundlesForProduct, idsForSkus, SHOW_SAMPLE_BUNDLES, type OxBundle } from '../../../content/bundles';
import { idForSku } from '../../../content/salla-ids';

/**
 * The bundle offer: "this product is also part of a bundle".
 *
 * ## It extends Salla's bundle, it does not invent one
 *
 * Salla already models a bundle as a `group_products` product: it has its own
 * page, its own price, its own `consisted_products` and its own add button,
 * and `BundleMembers.tsx` already renders that page's contents. The one thing
 * the platform does not do is tell a member's page that a bundle containing it
 * exists. That pointer is the only thing `content/bundles.ts` adds, and this
 * card is its surface.
 *
 * Everything else on the card comes from the store: the bundle's name, its
 * price, its members' names and their prices are all live products fetched
 * through the engine's own `selected` source, and the action is the bundle
 * product's own `SallaAddProductButton`. One product, one Salla add path, no
 * custom cart call anywhere.
 *
 * Salla's promotions stay Salla's too: `<SallaOffer />` renders above this on
 * the same page and is the authority for a live offer. This card never
 * competes with it and never restates one.
 *
 * ## The numbers it may print, and the one it may not
 *
 * Each member's price and the bundle's own price are facts the store returned,
 * so both render. A **saving** does not: this store has no bundle discount
 * defined, and computing one by subtracting the bundle price from the sum of
 * its members would be the theme asserting a promotion nobody has made. So
 * there is no sum, no was-price, no percentage and no saving line at all. The
 * `discount` field exists on the bundle type for the day the owner sets one in
 * the dashboard, and it is null on every entry, so that row never renders
 * today.
 *
 * ## With nothing defined, there is nothing here
 *
 * `bundlesForProduct` returns an empty list for every product while
 * `SHOW_SAMPLE_BUNDLES` is false, and a bundle whose product or members do not
 * come back live is dropped rather than half-drawn. A bundle also never
 * appears on its own page. So the product page below the fold is unchanged
 * until a real bundle exists.
 */

export interface BundleProps {
  product: Product;
  /** Overrides the content flag. Tests and the offline preview only. */
  sample?: boolean;
}

interface ResolvedBundle {
  bundle: OxBundle;
  head: Product;
  members: Product[];
}

function isSellable(item: Product | undefined): item is Product {
  if (!item) return false;
  // Was `!is_out_of_stock && status !== 'hidden'`, which let `'out'` and
  // `'out-and-notify'` through: a head in either state rendered a price and a
  // live add button. `isAddable` is the same predicate the product card and
  // the completion row use, so all three agree about what "sellable" means.
  return isAddable(item);
}

export function Bundle({ product, sample = SHOW_SAMPLE_BUNDLES }: BundleProps) {
  const { t } = useTranslation();

  const bundles = useMemo(
    () => bundlesForProduct(product.id, { sample }),
    [product.id, sample]
  );

  // One request for every bundle on the page: hooks cannot run per item, and
  // two bundles sharing a member would otherwise ask for it twice.
  const ids = useMemo(() => {
    const skus = bundles.flatMap((bundle) => [bundle.productSku, ...bundle.memberSkus]);
    return idsForSkus(skus);
  }, [bundles]);
  const fetched = useCatalogueProducts(ids);

  const resolved = useMemo<ResolvedBundle[]>(() => {
    if (fetched.length === 0) return [];
    const byId = new Map(fetched.map((item) => [String(item.id), item]));
    const lookup = (sku: OxBundle['productSku']) => {
      const id = idForSku(sku);
      return id === undefined ? undefined : byId.get(String(id));
    };
    const out: ResolvedBundle[] = [];
    for (const bundle of bundles) {
      const head = lookup(bundle.productSku);
      if (!isSellable(head)) continue;
      const members = bundle.memberSkus
        .map(lookup)
        .filter((item): item is Product => item !== undefined);
      // EVERY member, not merely two of them. `members.length < 2` let a four
      // item bundle render with three plates and three priced rows beneath the
      // four item price, which is a wrong total presented as a real offer, and
      // it contradicted the header above: a bundle whose members do not all
      // come back live is dropped rather than half-drawn.
      if (members.length !== bundle.memberSkus.length) continue;
      if (members.length < 2) continue;
      out.push({ bundle, head, members });
    }
    return out;
  }, [bundles, fetched]);

  if (resolved.length === 0) return null;

  return (
    <section className="ox-bundle-offer" aria-labelledby="ox-bundle-offer-title" data-testid="ox-bundle-offer">
      <h2 className="ox-bundle-offer__title ox-h3" id="ox-bundle-offer-title">
        {t('ox.pdp.bundle_offer_title')}
      </h2>

      {resolved.map(({ bundle, head, members }) => {
        const addLabel =
          head.add_to_cart_label ??
          t(head.has_options ? 'ox.card.choose_options' : 'ox.card.add');
        return (
          <article className="ox-bundle-offer__card" key={bundle.id} data-ox-bundle={bundle.id}>
            <h3 className="ox-bundle-offer__name">
              <Link to={head.url}>
                <Bdi>{head.name}</Bdi>
              </Link>
            </h3>

            {/* Decorative: the named list below carries the same products. */}
            <ul className="ox-bundle-offer__strip" aria-hidden="true">
              {members.map((member, index) => (
                <li className="ox-bundle-offer__strip-item" key={member.id}>
                  {index > 0 ? (
                    <PdpIcon name="plus" size={14} className="ox-bundle-offer__plus" />
                  ) : null}
                  <span className="ox-bundle-offer__thumb">
                    <Image
                      src={member.image?.url}
                      alt=""
                      aspectRatio="1/1"
                      objectFit="contain"
                      noWrapper
                      srcSetWidths={[160]}
                      sizes="80px"
                    />
                  </span>
                </li>
              ))}
            </ul>

            <ul className="ox-bundle-offer__items">
              {members.map((member) => (
                <li className="ox-bundle-offer__item" key={member.id}>
                  <span className="ox-bundle-offer__item-name">
                    <Link to={member.url}>
                      <Bdi>{member.name}</Bdi>
                    </Link>
                  </span>
                  <span className="ox-bundle-offer__item-price">
                    <Price amount={effectivePrice(member)} currency={member.currency} />
                  </span>
                </li>
              ))}
            </ul>

            {/* Renders only when the owner has set a real bundle discount. */}
            {bundle.discount ? (
              <p className="ox-bundle-offer__discount">
                {bundle.discount.kind === 'amount' ? (
                  <>
                    <span className="ox-bundle-offer__discount-label">
                      {t('ox.pdp.bundle_discount')}
                    </span>
                    <Price amount={bundle.discount.value} go currency={head.currency} />
                  </>
                ) : (
                  t('ox.pdp.bundle_discount_percent', { value: bundle.discount.value })
                )}
              </p>
            ) : null}

            <div className="ox-bundle-offer__foot">
              <p className="ox-bundle-offer__price">
                <span className="ox-bundle-offer__price-label">{t('ox.pdp.bundle_price')}</span>
                <Price amount={effectivePrice(head)} size="h3" currency={head.currency} />
              </p>
              <div className="ox-bundle-offer__actions">
                <SallaAddProductButton
                  productId={head.id}
                  productType={head.type}
                  productStatus={head.status}
                  width="wide"
                  fill="solid"
                  loaderPosition="center"
                  className="ox-bundle-offer__add"
                >
                  <PdpIcon name="cart" size={16} className="ox-bundle-offer__add-icon" />
                  {addLabel}
                </SallaAddProductButton>
                <Button to={head.url} variant="secondary" size={44} className="ox-bundle-offer__view">
                  {t('ox.pdp.bundle_view')}
                </Button>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}

export default Bundle;
