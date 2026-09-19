/**
 * Which PDP composition a product gets (PLAN-final B3 binding spec, C14).
 *
 * The engine's nine ProductType values (dist/types/index.d.ts:372) map onto
 * five compositions:
 *   physical  product, food, donating, financial_support  (DIRECTION 6.5)
 *   service   service, booking                            (DIRECTION 6.6)
 *   digital   digital                                     (DIRECTION 6.7)
 *   giftCard  codes                                       (DIRECTION 6.7)
 *   bundle    group_products                              (DIRECTION 6.7)
 *
 * OX-045 to OX-047 exist as `service` because the create API rejected
 * `booking`; ServicePdp renders for both, and the "choose your slot at
 * checkout" line renders only for `booking` (C14, open question Q12).
 */
import type { Product, ProductType } from '@salla.sa/twilight-theme-engine/types';

export type PdpVariant = 'physical' | 'service' | 'digital' | 'giftCard' | 'bundle';

export function variantOf(type: ProductType | string | undefined): PdpVariant {
  switch (type) {
    case 'service':
    case 'booking':
      return 'service';
    case 'digital':
      return 'digital';
    case 'codes':
      return 'giftCard';
    case 'group_products':
      return 'bundle';
    default:
      return 'physical';
  }
}

/** The supply calculator is for consumable packages only (donations are not). */
export function hasSupplyCalculator(type: ProductType | string | undefined): boolean {
  return type === 'product' || type === 'food';
}

/** Food products add the calories line; nothing else changes (DIRECTION 6.5). */
export function isFood(type: ProductType | string | undefined): boolean {
  return type === 'food';
}

/** Digital goods and gift codes ship no parcel, so no delivery or pickup line. */
export function isShippable(product: Pick<Product, 'type' | 'is_require_shipping'>): boolean {
  const variant = variantOf(product.type);
  if (variant === 'digital' || variant === 'giftCard' || variant === 'service') return false;
  return product.is_require_shipping !== false;
}

/** The slot line is truthful only for a real booking product (C14). */
export function picksSlotAtCheckout(type: ProductType | string | undefined): boolean {
  return type === 'booking';
}

/**
 * A bundle's member list. The engine's Product type does not declare
 * `consisted_products`, but the Salla API sends it for `group_products`; it is
 * read defensively here and an unrecognised shape yields an empty list rather
 * than a render error.
 */
export interface BundleMember {
  id: number;
  name: string;
  url?: string;
  image?: string;
  quantity?: number;
}

export function bundleMembers(product: Product): BundleMember[] {
  const raw = (product as unknown as { consisted_products?: unknown }).consisted_products;
  if (!Array.isArray(raw)) return [];
  const out: BundleMember[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const id = typeof record.id === 'number' ? record.id : Number(record.id);
    const name = typeof record.name === 'string' ? record.name : '';
    if (!Number.isFinite(id) || name.length === 0) continue;
    const image = record.image;
    out.push({
      id,
      name,
      url: typeof record.url === 'string' ? record.url : undefined,
      image:
        typeof image === 'string'
          ? image
          : image && typeof image === 'object' && typeof (image as { url?: unknown }).url === 'string'
            ? (image as { url: string }).url
            : undefined,
      quantity: typeof record.quantity === 'number' ? record.quantity : undefined,
    });
  }
  return out;
}
