import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SallaAddProductButtonCore } from '@salla.sa/twilight-components-react/add-product-button';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Bdi } from '../../common/Bdi';
import { Button } from '../../common/Button';
import { Price } from '../../common/Price';
import { PdpIcon } from '../PdpIcon';
import { effectivePrice } from '../lib/claims';
import { isAddable, useCatalogueProducts } from '../lib/catalogue';
import { WebComponentBoundary } from '../../common/WebComponentBoundary';
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
  const [busy, setBusy] = useState(false);
  /** Resolves the promise `addTicked` is awaiting for a given proxy. */
  const settlersRef = useRef<Map<number, () => void>>(new Map());

  const set = useMemo(
    () => companionsForProduct(product.id, { sample }),
    [product.id, sample]
  );

  // `ProductPage` re-renders in place on a client-side move between products,
  // so this component keeps its state. Without this, unticking a companion on
  // one product left that companion unticked and out of the total on the next
  // product that happens to share it, with the shopper never having touched it
  // there.
  useEffect(() => {
    setUnticked(new Set<number>());
    settlersRef.current.clear();
  }, [product.id]);
  const companionIds = useMemo(
    () => (set ? idsForSkus(set.companionSkus) : []),
    [set]
  );
  const companions = useCatalogueProducts(companionIds);

  const rows = useMemo<CompletionRow[]>(() => {
    const live = companions.filter(
      (item) => String(item.id) !== String(product.id) && isAddable(item)
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
      // Was hard-coded `true`. On an out-of-stock product that meant the row
      // ticked its own anchor, priced it into the total, and pointed the
      // combined add at the buy zone, where Salla renders a NOTIFY-ME control
      // in that state: the shopper was offered a restock alert dressed as an
      // add to cart, with an unavailable item counted in the sum.
      addable: isAddable(product) && product.has_options !== true,
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
        addable: isAddable(item) && item.has_options !== true,
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

  /** Called by a proxy's own success or failure handler. */
  const settle = useCallback((id: number) => {
    const done = settlersRef.current.get(id);
    if (!done) return;
    settlersRef.current.delete(id);
    done();
  }, []);

  /**
   * A promise that resolves when the proxy for `id` reports either outcome, or
   * when it has had long enough. The timeout matters: a proxy that never fires
   * either handler must not strand the rest of the queue forever.
   */
  const awaitAdd = useCallback((id: number) => {
    return new Promise<void>((resolve) => {
      const timer = setTimeout(() => {
        settlersRef.current.delete(id);
        resolve();
      }, 8000);
      settlersRef.current.set(id, () => {
        clearTimeout(timer);
        resolve();
      });
    });
  }, []);

  /**
   * ONE AT A TIME. This used to fire every ticked product in a single
   * synchronous loop, which started N cart requests at once. Salla's cart is
   * server-authoritative and each response rewrites the whole cart, so a later
   * response could land on an earlier one and silently drop an item, and the
   * shopper got a stack of toasts. Each add now waits for its own button to
   * report back before the next one starts.
   */
  const addTicked = useCallback(async () => {
    if (typeof document === 'undefined' || busy) return;
    setBusy(true);
    try {
      const proxies = proxiesRef.current;
      for (const row of rows) {
        if (!row.addable || unticked.has(row.id)) continue;

        if (row.current) {
          // The buy zone's button belongs to the page, not to us, so its
          // result cannot be observed from here. It is paced rather than
          // awaited, and it goes first so the anchor is in the cart before
          // anything that completes it.
          if (!fireSallaAdd(document.querySelector(BUY_ZONE_ADD_SELECTOR))) {
            document.querySelector('.ox-buy')?.scrollIntoView({ block: 'center' });
          }
          await new Promise((resolve) => setTimeout(resolve, 450));
          continue;
        }

        const pending = awaitAdd(row.id);
        if (!fireSallaAdd(proxies?.querySelector(`[data-ox-fbt-proxy="${row.id}"]`))) {
          settle(row.id);
        }
        await pending;
      }
    } finally {
      setBusy(false);
    }
  }, [awaitAdd, busy, rows, settle, unticked]);

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
          ariaDisabled={tickedCount === 0 || busy}
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
              {/* Core has no error boundary of its own and the package does not
                  export the one its deferred exports get, so it brings ours. */}
              <WebComponentBoundary label={`fbt proxy ${row.id}`}>
                <SallaAddProductButtonCore
                  productId={row.id}
                  productType={row.type}
                  productStatus={row.status}
                  tabIndex={-1}
                  onSuccess={() => settle(row.id)}
                  onFailed={() => settle(row.id)}
                />
              </WebComponentBoundary>
            </span>
          ))}
      </div>
    </section>
  );
}

export default FrequentlyBought;
