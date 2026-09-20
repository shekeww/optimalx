import { useCallback, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product as productApi } from '@salla.sa/twilight-theme-engine/api/product';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaAddProductButtonCore } from '@salla.sa/twilight-components-react/add-product-button';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Bdi } from '../../common/Bdi';
import { Button } from '../../common/Button';
import { Price } from '../../common/Price';
import { PdpIcon } from '../PdpIcon';
import { effectivePrice } from '../lib/claims';
import { companionsForProduct, idsForSkus, SHOW_SAMPLE_BUNDLES } from '../../../content/bundles';

/**
 * The completion row: this product, plus the things that go with it, with one
 * button that adds the ticked set.
 *
 * ## The heading is not "frequently bought together"
 *
 * That sentence is a statement about order data, and this store has zero Salla
 * orders. So is "customers also bought", and so is any phrasing that says
 * what shoppers usually or normally do.
 * The heading is `ox.pdp.completes_with`, which describes what the row is for
 * and claims nothing about anybody's basket. The companions come from
 * `content/bundles.ts`, grouped by physical complementarity (a powder and the
 * shaker it is mixed in), never by a behaviour this store cannot observe.
 *
 * ## The cart stays Salla's, once per ticked product
 *
 * Nothing here talks to a cart. The button is a proxy, exactly as
 * `StickyBar` is: it clicks one real Salla add control per ticked row.
 *
 *   - The current product's control is the page's own `AddToCartForm` button,
 *     found at `BUY_ZONE_ADD_SELECTOR`. That is deliberate and not a
 *     convenience: the form owns the chosen quantity and the chosen options,
 *     so adding this product any other way would quietly add the wrong
 *     variant. If the form has not rendered its button yet, the row scrolls
 *     the buy zone into view instead of failing silently.
 *   - Each companion gets its own `salla-add-product-button`, rendered in the
 *     clipped `ox-fbt__proxies` box below and clicked by id.
 *
 * `SallaAddProductButtonCore` is the un-deferred export. The deferred
 * `SallaAddProductButton` waits for an IntersectionObserver hit before it
 * renders the custom element at all (see the package's `HydrationBoundary`),
 * and a control that is clipped to one pixel is exactly the case where that
 * observer is unreliable. The core wrapper renders the element immediately,
 * which is what a proxy target has to do.
 *
 * The proxy box is `inert` and `aria-hidden`: assistive technology and the tab
 * order see the visible checkboxes and the one button, never three phantom
 * add controls. `inert` blocks user hit-testing and focus; it does not block
 * `HTMLElement.click()`, which is how the proxy fires.
 *
 * ## A companion with options is not ticked, it is chosen
 *
 * Salla's add button does not add a product that has options: it opens the
 * chooser. Two ticked products with options would therefore race two choosers
 * against each other. So a companion with `has_options` renders its row with
 * the chooser link in place of the checkbox, its price still visible and its
 * amount out of the total. Nothing is hidden from the shopper and the combined
 * add stays deterministic. The current product is never in that state, because
 * on its own page the options live inside the form the button belongs to.
 *
 * ## What it looks like with nothing to show
 *
 * Nothing at all. `companionsForProduct` answers null for every product while
 * `SHOW_SAMPLE_BUNDLES` is false, and even with a set in hand the section asks
 * the API first and renders only with live companions in hand, so there is
 * never a heading over an empty row.
 */

/** Salla's own add control, wherever it renders. */
const SALLA_ADD_TAG = 'salla-add-product-button';

/** Where the page's own add control lives; `BuyForm` sets `.ox-buy`. */
export const BUY_ZONE_ADD_SELECTOR = `.ox-buy ${SALLA_ADD_TAG}`;

/**
 * Clicks one Salla add control and reports whether it found one.
 *
 * `container` is either the custom element itself (the buy form's button) or a
 * wrapper holding one (a proxy row). The inner `button` is preferred over the
 * host, because on a build where the web component renders its button in light
 * DOM a click on the host never reaches it; where it does not, the host is the
 * control and is clicked directly.
 */
export function fireSallaAdd(container: Element | null | undefined): boolean {
  if (!container) return false;
  const host =
    typeof container.matches === 'function' && container.matches(SALLA_ADD_TAG)
      ? container
      : (container.querySelector(SALLA_ADD_TAG) ?? container);
  const target = (host.querySelector('button') ?? host) as HTMLElement;
  if (typeof target.click !== 'function') return false;
  target.click();
  return true;
}

/**
 * Live products for a list of catalogue ids, in the order asked for.
 *
 * One request for the whole set through the engine's own `selected` source,
 * which is the same source the curated home rails use. It lives here rather
 * than in a lib file because this batch owns two components and no lib file;
 * `Bundle.tsx` imports it from here.
 */
export function useCatalogueProducts(ids: readonly number[]): Product[] {
  const key = ids.join(',');
  const { data } = useQuery({
    queryKey: ['ox', 'bundle-products', key],
    queryFn: async (): Promise<Product[]> => {
      const result = await productApi.list({
        source: 'selected',
        sourceValue: [...ids],
        perPage: Math.max(ids.length, 1),
      });
      return result.items;
    },
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });

  return useMemo(() => {
    if (!data || data.length === 0) return [];
    const byId = new Map(data.map((item) => [String(item.id), item]));
    const out: Product[] = [];
    for (const id of ids) {
      const found = byId.get(String(id));
      if (found) out.push(found);
    }
    return out;
    // `key` is the stable identity of `ids`; the array itself is rebuilt each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, key]);
}

interface CompletionRow {
  id: number;
  name: string;
  url: string;
  image?: string;
  imageAlt: string;
  price: number | undefined;
  /** Passed straight to Salla's button, as the product card passes them. */
  type: Product['type'];
  status: Product['status'];
  /** False when the product has options: Salla opens a chooser, not an add. */
  addable: boolean;
  /** The page's own product, whose control is the buy form's own button. */
  current: boolean;
}

export interface FrequentlyBoughtProps {
  product: Product;
  /** Overrides the content flag. Tests and the offline preview only. */
  sample?: boolean;
}

export function FrequentlyBought({ product, sample = SHOW_SAMPLE_BUNDLES }: FrequentlyBoughtProps) {
  const { t } = useTranslation();
  const proxiesRef = useRef<HTMLDivElement | null>(null);
  const [unticked, setUnticked] = useState<ReadonlySet<number>>(() => new Set<number>());

  const set = useMemo(
    () => companionsForProduct(product.id, { sample }),
    [product.id, sample]
  );
  const companionIds = useMemo(
    () => (set ? idsForSkus(set.companionSkus) : []),
    [set]
  );
  const companions = useCatalogueProducts(companionIds);

  const rows = useMemo<CompletionRow[]>(() => {
    const live = companions.filter(
      (item) =>
        String(item.id) !== String(product.id) &&
        !item.is_out_of_stock &&
        item.status !== 'out' &&
        item.status !== 'hidden'
    );
    if (live.length === 0) return [];
    const anchor: CompletionRow = {
      id: product.id,
      name: product.name,
      url: product.url,
      image: product.image?.url,
      imageAlt: product.image?.alt ?? product.name,
      price: effectivePrice(product),
      type: product.type,
      status: product.status,
      addable: true,
      current: true,
    };
    return [
      anchor,
      ...live.map<CompletionRow>((item) => ({
        id: item.id,
        name: item.name,
        url: item.url,
        image: item.image?.url,
        imageAlt: item.image?.alt ?? item.name,
        price: effectivePrice(item),
        type: item.type,
        status: item.status,
        addable: item.has_options !== true,
        current: false,
      })),
    ];
  }, [companions, product]);

  const ticked = useCallback(
    (row: CompletionRow) => row.addable && !unticked.has(row.id),
    [unticked]
  );

  const toggle = useCallback((id: number) => {
    setUnticked((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const total = rows.reduce(
    (sum, row) => (ticked(row) && typeof row.price === 'number' ? sum + row.price : sum),
    0
  );
  const tickedCount = rows.filter((row) => ticked(row)).length;

  const addTicked = useCallback(() => {
    if (typeof document === 'undefined') return;
    const proxies = proxiesRef.current;
    for (const row of rows) {
      if (!row.addable || unticked.has(row.id)) continue;
      if (row.current) {
        if (!fireSallaAdd(document.querySelector(BUY_ZONE_ADD_SELECTOR))) {
          document.querySelector('.ox-buy')?.scrollIntoView({ block: 'center' });
        }
        continue;
      }
      fireSallaAdd(proxies?.querySelector(`[data-ox-fbt-proxy="${row.id}"]`));
    }
  }, [rows, unticked]);

  if (!set || rows.length < 2) return null;

  return (
    <section className="ox-fbt" aria-labelledby="ox-fbt-title" data-testid="ox-fbt">
      <h2 className="ox-fbt__title ox-h3" id="ox-fbt-title">
        {t('ox.pdp.completes_with')}
      </h2>

      {/* Decorative: every name, price and control below is real text. */}
      <ul className="ox-fbt__strip" aria-hidden="true">
        {rows.map((row, index) => (
          <li className="ox-fbt__strip-item" key={row.id}>
            {index > 0 ? (
              <PdpIcon name="plus" size={14} className="ox-fbt__plus" />
            ) : null}
            <span className="ox-fbt__thumb">
              <Image
                src={row.image}
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

      <div className="ox-fbt__rows" role="group" aria-labelledby="ox-fbt-title">
        {rows.map((row) =>
          row.addable ? (
            <label className="ox-fbt__row" key={row.id}>
              <input
                type="checkbox"
                className="ox-fbt__check"
                checked={ticked(row)}
                onChange={() => toggle(row.id)}
              />
              <span className="ox-fbt__name">
                {row.current ? (
                  <span className="ox-fbt__badge">{t('ox.pdp.fbt_this_product')}</span>
                ) : null}
                <Bdi>{row.name}</Bdi>
              </span>
              <span className="ox-fbt__price">
                <Price amount={row.price} currency={product.currency} />
              </span>
            </label>
          ) : (
            <div className="ox-fbt__row ox-fbt__row--choose" key={row.id}>
              <span className="ox-fbt__check-slot" aria-hidden="true" />
              <span className="ox-fbt__name">
                <Bdi>{row.name}</Bdi>
                <Link to={row.url} className="ox-fbt__choose">
                  {t('ox.card.choose_options')}
                </Link>
              </span>
              <span className="ox-fbt__price">
                <Price amount={row.price} currency={product.currency} />
              </span>
            </div>
          )
        )}
      </div>

      <div className="ox-fbt__foot">
        <p className="ox-fbt__total">
          <span className="ox-fbt__total-label">{t('ox.pdp.fbt_total')}</span>
          <Price amount={total} size="h3" currency={product.currency} />
        </p>
        <Button
          size={48}
          className="ox-fbt__add"
          onClick={addTicked}
          ariaDisabled={tickedCount === 0}
          data-testid="ox-fbt-add"
        >
          {t('ox.pdp.fbt_add_selected')}
        </Button>
      </div>

      {/* The proxy targets. Clipped, inert and aria-hidden: see the header. */}
      <div className="ox-fbt__proxies" ref={proxiesRef} inert aria-hidden="true">
        {rows
          .filter((row) => !row.current && row.addable)
          .map((row) => (
            <span className="ox-fbt__proxy" data-ox-fbt-proxy={row.id} key={row.id}>
              <SallaAddProductButtonCore
                productId={row.id}
                productType={row.type}
                productStatus={row.status}
                tabIndex={-1}
              />
            </span>
          ))}
      </div>
    </section>
  );
}

export default FrequentlyBought;
