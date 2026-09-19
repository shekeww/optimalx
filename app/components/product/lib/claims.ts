/**
 * The claims gates, in one place so a reviewer can read them all at once
 * (PLAN-final 5.1, brief B3 "Claims gates (binding)").
 *
 * Each gate answers one question: may this line render at all? A gate that is
 * shut renders nothing; it never degrades to a softer promise and never fills
 * in a number the owner has not given us.
 */
import type { Product } from '@salla.sa/twilight-theme-engine/types';

/** Theme settings are merchant-supplied and may hold anything (or nothing). */
export type Settings = Record<string, unknown> | undefined;

/** A non-empty trimmed string setting, or null. */
export function settingText(settings: Settings, key: string): string | null {
  const value = settings?.[key];
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) return String(value);
  return null;
}

/** A boolean setting; anything that is not literally true reads as false. */
export function settingFlag(settings: Settings, key: string): boolean {
  const value = settings?.[key];
  return value === true || value === 'true' || value === 1 || value === '1';
}

/** A positive number setting (the free shipping threshold), or null. */
export function settingNumber(settings: Settings, key: string): number | null {
  const raw = settings?.[key];
  const value = typeof raw === 'string' ? Number(raw.trim()) : raw;
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) return null;
  return value;
}

/**
 * The VAT-inclusive line renders only when the owner has entered a VAT number
 * (open question Q4: it is empty today, so the line is hidden).
 */
export function showsVatLine(settings: Settings): boolean {
  return settingText(settings, 'vat_number') !== null;
}

/**
 * "موزعون رسميون" renders only when the owner has confirmed the invoices
 * exist (Q3). Otherwise the trust grid keeps "منتجات أصلية".
 */
export function claimsOfficialDistributors(settings: Settings): boolean {
  return settingFlag(settings, 'claim_official_distributors');
}

/**
 * A reply-time promise renders only when `reply_sla_hours` is set (Q15), and
 * then interpolates it. Nothing in the theme states a reply time otherwise,
 * including a reply time a merchant typed into a product description.
 */
export function replySlaHours(settings: Settings): string | null {
  return settingText(settings, 'reply_sla_hours');
}

/** The 50 SAR consultation credit line, verbatim from the setting or nothing (Q9). */
export function consultationCreditNote(settings: Settings): string | null {
  return settingText(settings, 'consultation_credit_note');
}

/** The free shipping threshold, from the dashboard rule; never a literal. */
export function freeShippingThreshold(settings: Settings): number | null {
  return settingNumber(settings, 'free_shipping_threshold');
}

/**
 * The price to display.
 *
 * The API sends `sale_price: 0` for a product that is NOT discounted
 * (verified on OX-001: price 349, regular_price 349, sale_price 0), so
 * rendering `sale_price` unconditionally prints 0.00 on every product at full
 * price. The engine's own form reads `starting_price ?? price` in that case
 * and `sale_price` only when `is_on_sale`
 * (dist/AddToCartForm-NICDUAS3.js:196-224); this follows it exactly, so our
 * price block and the engine's form can never disagree.
 */
export function effectivePrice(
  product: Pick<Product, 'is_on_sale' | 'price' | 'sale_price' | 'starting_price'>
): number | undefined {
  const toNumber = (value: unknown): number | undefined => {
    const parsed = typeof value === 'string' ? Number(value) : value;
    return typeof parsed === 'number' && Number.isFinite(parsed) ? parsed : undefined;
  };
  if (product.is_on_sale) {
    const sale = toNumber(product.sale_price);
    if (sale !== undefined && sale > 0) return sale;
  }
  return toNumber(product.starting_price) ?? toNumber(product.price) ?? toNumber(product.sale_price);
}

/** The real saving on a sale, or null when the product is not on sale. */
export function savingOf(product: Pick<Product, 'is_on_sale' | 'regular_price' | 'sale_price'>): number | null {
  if (!product.is_on_sale) return null;
  const regular = Number(product.regular_price);
  const sale = Number(product.sale_price);
  if (!Number.isFinite(regular) || !Number.isFinite(sale)) return null;
  const saving = Math.round((regular - sale) * 100) / 100;
  return saving > 0 ? saving : null;
}

/** Days a "new" badge is allowed to run for (DIRECTION 5.3 badge rules). */
export const NEW_PRODUCT_DAYS = 30;

/**
 * True only when the product itself carries a creation date inside the window.
 * The engine's Product type does not declare `created_at`, so the field is
 * read defensively; no date means no badge, never a guess.
 */
export function isNewProduct(product: Product, now: Date = new Date()): boolean {
  const raw = (product as unknown as { created_at?: unknown }).created_at;
  const value =
    typeof raw === 'string' || typeof raw === 'number'
      ? raw
      : raw && typeof raw === 'object' && typeof (raw as { date?: unknown }).date === 'string'
        ? (raw as { date: string }).date
        : null;
  if (value === null) return false;
  const created = new Date(value);
  const time = created.getTime();
  if (!Number.isFinite(time)) return false;
  const days = (now.getTime() - time) / 86400000;
  return days >= 0 && days <= NEW_PRODUCT_DAYS;
}

/**
 * The delivery window, in days, from the store's own shipping configuration.
 *
 * The design prints "within 2 to 4 days". That figure exists nowhere in this
 * repository and never will: it is two settings the owner fills in once a
 * carrier agreement is signed. Until both are numbers the delivery row does
 * not render at all, and the buy column closes the gap (B3, B4, B5).
 */
export interface DeliveryWindow {
  from: number;
  to: number;
}

export function deliveryWindow(settings: Settings): DeliveryWindow | null {
  const from = settingNumber(settings, 'delivery_estimate_min_days');
  const to = settingNumber(settings, 'delivery_estimate_max_days');
  if (from === null || to === null || to < from) return null;
  return { from: Math.round(from), to: Math.round(to) };
}

/**
 * The city the estimate is quoted for: the shopper's own selection where the
 * store keeps one, otherwise the store's configured default. Never a literal.
 */
export function deliveryCity(settings: Settings, fallback?: string | null): string | null {
  return settingText(settings, 'delivery_city') ?? (fallback ? fallback.trim() || null : null);
}

/**
 * The authenticity page. The trust item's sub-line asserts a guarantee, so it
 * renders only when there is a page that states what the guarantee is (B18).
 */
export function authenticityPageUrl(settings: Settings): string | null {
  return settingText(settings, 'authenticity_page_url');
}

/**
 * Order tracking. "تتبع طلبك" is a carrier capability, not a wish: without a
 * tracking destination the trust item shows its title alone (B17).
 */
export function orderTrackingUrl(settings: Settings): string | null {
  return settingText(settings, 'order_tracking_url');
}

/**
 * The badge on the image plate.
 *
 * It renders the platform's own promotion label, verbatim, and only when Salla
 * has one on this product. The theme never computes "best seller" from sales,
 * because the store has no sales to compute it from (B2).
 */
export function promotionLabel(product: Pick<Product, 'promotion_title'>): string | null {
  const value = product.promotion_title;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** The gateway slugs the store actually has enabled, or an empty list. */
export function enabledPayments(payments: unknown): string[] {
  if (!Array.isArray(payments)) return [];
  const out: string[] = [];
  for (const entry of payments) {
    if (typeof entry === 'string' && entry.trim().length > 0) out.push(entry.trim());
  }
  return out;
}
