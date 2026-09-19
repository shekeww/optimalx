/**
 * Shared types and re-exports for the PDP variants, so a variant file never
 * reaches across the tree for a helper it uses once.
 */
export type { SpecLine as SpecLineLike } from '../lib/specLine';
export { picksSlotAtCheckout, variantOf, type PdpVariant } from '../lib/variant';
