import { describe, it, expect } from 'vitest';
import type { Product, ProductType } from '@salla.sa/twilight-theme-engine/types';
import {
  bundleMembers,
  hasSupplyCalculator,
  isFood,
  isShippable,
  picksSlotAtCheckout,
  variantOf,
  type PdpVariant,
} from '../../app/components/product/lib/variant';

/** The nine values of the engine union (dist/types/index.d.ts:372). */
const ALL_TYPES: ProductType[] = [
  'product',
  'service',
  'group_products',
  'codes',
  'digital',
  'food',
  'donating',
  'booking',
  'financial_support',
];

describe('variant dispatch', () => {
  it('maps every ProductType value to a composition', () => {
    const map: Record<ProductType, PdpVariant> = {
      product: 'physical',
      food: 'physical',
      donating: 'physical',
      financial_support: 'physical',
      service: 'service',
      booking: 'service',
      digital: 'digital',
      codes: 'giftCard',
      group_products: 'bundle',
    };
    for (const type of ALL_TYPES) {
      expect(variantOf(type), type).toBe(map[type]);
    }
  });

  it('falls back to the physical composition for an unknown type', () => {
    expect(variantOf(undefined)).toBe('physical');
    expect(variantOf('something_new')).toBe('physical');
  });

  it('shows the supply calculator only for consumable packages', () => {
    const allowed = ALL_TYPES.filter((type) => hasSupplyCalculator(type));
    expect(allowed).toEqual(['product', 'food']);
  });

  it('marks only the food type as food', () => {
    expect(ALL_TYPES.filter((type) => isFood(type))).toEqual(['food']);
  });

  it('promises a slot at checkout only for a real booking product', () => {
    expect(ALL_TYPES.filter((type) => picksSlotAtCheckout(type))).toEqual(['booking']);
    expect(picksSlotAtCheckout('service')).toBe(false);
  });

  it('ships physical goods only', () => {
    expect(isShippable({ type: 'product', is_require_shipping: true })).toBe(true);
    expect(isShippable({ type: 'food', is_require_shipping: true })).toBe(true);
    expect(isShippable({ type: 'digital', is_require_shipping: false })).toBe(false);
    expect(isShippable({ type: 'codes', is_require_shipping: false })).toBe(false);
    expect(isShippable({ type: 'booking', is_require_shipping: false })).toBe(false);
    expect(isShippable({ type: 'product', is_require_shipping: false })).toBe(false);
  });
});

describe('bundle members', () => {
  const base = { id: 1, name: 'حزمة', type: 'group_products' } as unknown as Product;

  it('reads the API field the engine type does not declare', () => {
    const product = {
      ...base,
      consisted_products: [
        { id: 7, name: 'واي', url: '/p7', image: { url: 'https://cdn.test/a.jpg' }, quantity: 2 },
        { id: 8, name: 'كرياتين', image: 'https://cdn.test/b.jpg' },
      ],
    } as unknown as Product;
    expect(bundleMembers(product)).toEqual([
      { id: 7, name: 'واي', url: '/p7', image: 'https://cdn.test/a.jpg', quantity: 2 },
      { id: 8, name: 'كرياتين', url: undefined, image: 'https://cdn.test/b.jpg', quantity: undefined },
    ]);
  });

  it('returns an empty list rather than throwing on a missing or odd shape', () => {
    expect(bundleMembers(base)).toEqual([]);
    expect(bundleMembers({ ...base, consisted_products: 'nope' } as unknown as Product)).toEqual([]);
    expect(
      bundleMembers({ ...base, consisted_products: [null, {}, { id: 'x' }] } as unknown as Product)
    ).toEqual([]);
  });
});
