import type { Order } from '@salla.sa/twilight-theme-engine/routes/account';
import { CATEGORIES } from '../../content/categories';
import { SALLA_IDS } from '../../content/salla-ids';
import { channelByCode, type ServiceChannel } from '../../content/services';

/** The four service/booking catalogue codes (FINAL-catalogue A.2, OX-044 to OX-047). */
const SERVICE_SKUS = ['OX-044', 'OX-045', 'OX-046', 'OX-047'];

/**
 * Product id to category slug, built once from the two content maps.
 *
 * The order API returns `items[].product.id` and no category at all
 * (engine routes/account/types.d.ts `OrderItem`), so the category has to come
 * from our own catalogue: `categories.ts` lists the SKUs in each category and
 * `salla-ids.ts` maps a SKU to the id the store created. A product that is
 * not in the map contributes no line, which is what FINAL-content 6.4 asks
 * for ("unknown categories show the three general steps only").
 *
 * A child category overwrites its parent deliberately: `CATEGORIES` lists
 * parents first, so the last write for a product is its most specific
 * category.
 *
 * The four service/booking SKUs are a utility category (FINAL-catalogue A.2)
 * that `CATEGORIES` deliberately excludes (`content/categories.ts`'s own
 * header), so they are mapped to `'services'` here directly; this is what
 * lets `THANKYOU_LINE_BY_CATEGORY.services` and the thank-you page's booking
 * branch ever match a real order.
 */
const CATEGORY_BY_PRODUCT_ID: ReadonlyMap<number, string> = (() => {
  const map = new Map<number, string>();
  for (const category of CATEGORIES) {
    for (const sku of category.skus) {
      const ref = (SALLA_IDS as Record<string, { id: number } | undefined>)[sku];
      if (ref) map.set(ref.id, category.slug);
    }
  }
  for (const sku of SERVICE_SKUS) {
    const ref = (SALLA_IDS as Record<string, { id: number } | undefined>)[sku];
    if (ref) map.set(ref.id, 'services');
  }
  return map;
})();

/** Category slugs the order touches, in item order, de-duplicated. */
export function orderCategorySlugs(order: Order | undefined): string[] {
  const slugs: string[] = [];
  for (const item of order?.items ?? []) {
    const id = item.product?.id;
    const slug = typeof id === 'number' ? CATEGORY_BY_PRODUCT_ID.get(id) : undefined;
    if (slug && !slugs.includes(slug)) slugs.push(slug);
  }
  return slugs;
}

/**
 * True when every category the order touches is `'services'`: the order is
 * one or more of OX-044 to OX-047 and nothing else, so the thank-you page's
 * booking branch renders instead of the "how to start using it" card that
 * assumes a physical product (S6, FINAL-content 4.6).
 */
export function isServiceOnlyOrder(order: Order | undefined): boolean {
  const slugs = orderCategorySlugs(order);
  return slugs.length === 1 && slugs[0] === 'services';
}

/**
 * The service channel of the first recognisable service/booking item in the
 * order, read off the order item's own `sku` (engine
 * routes/account/types.d.ts `OrderItem.sku`) rather than the product id, so
 * no second id map is needed. `undefined` for an unrecognised or missing sku
 * (the training session, OX-047, is not a channel): the thank-you page falls
 * back to the slot-based confirmation rather than guessing a change rule.
 */
export function orderServiceChannel(order: Order | undefined): ServiceChannel | undefined {
  for (const item of order?.items ?? []) {
    const channel = channelByCode(item.sku ?? undefined);
    if (channel) return channel;
  }
  return undefined;
}

/**
 * True only on an explicit branch-pickup signal.
 *
 * The typed order payload carries no pickup flag (engine
 * routes/account/types.d.ts `Order`): a shipped order has `shipping` and a
 * carrier, and an order awaiting a carrier looks the same as a pickup. Rather
 * than guess from an absence, this reads the two fields the API does set on a
 * pickup order when it sets anything at all, `order.type` and a `branch` on
 * the shipping object, and returns false for everything else.
 *
 * With no live pickup order to verify against yet (PLAN-final open question
 * Q14) a hidden note is the correct failure: a wrong "collect from the
 * branch" instruction on a shipped order is worse than no note at all.
 */
export function isPickupOrder(order: Order | undefined): boolean {
  if (!order) return false;
  const type = typeof order.type === 'string' ? order.type.toLowerCase() : '';
  if (type.includes('pickup')) return true;
  const shipping = order.shipping as (typeof order.shipping & { branch?: unknown }) | undefined;
  return Boolean(shipping?.branch);
}
