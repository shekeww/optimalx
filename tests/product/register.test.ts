import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * PLAN-final C1: the engine card only swaps when
 * `registry.getOriginal('product:card')` is non-null
 * (theme-engine chunk-UQRLBMIO.js:219-231), and `registry.override` degrades
 * to a plain `register` on an empty key (chunk-342EPVXN.js:12-23). A single
 * `override` call is therefore a silent no-op, which is what B0 shipped.
 *
 * The registry is faithfully re-implemented here rather than imported,
 * because importing the engine root pulls the whole runtime into jsdom. The
 * behaviour under test is `registerOxProductComponents`'s call order, which
 * this double records exactly.
 */
interface Definition {
  component: unknown;
  original?: Definition;
}

class TestRegistry {
  components = new Map<string, Definition>();

  register(name: string, component: unknown) {
    this.components.set(name, { component });
  }

  override(name: string, component: unknown) {
    const existing = this.components.get(name);
    if (existing) this.components.set(name, { component, original: existing });
    else this.register(name, component);
  }

  resolve(name: string) {
    return this.components.get(name)?.component ?? null;
  }

  getOriginal(name: string) {
    return this.components.get(name)?.original?.component ?? null;
  }
}

const registry = new TestRegistry();
const EngineProductCard = function EngineProductCard() {
  return null;
};

vi.mock('@salla.sa/twilight-theme-engine', () => ({ registry }));
vi.mock('@salla.sa/twilight-theme-engine/product', () => ({ ProductCard: EngineProductCard }));
vi.mock('../../app/components/product/OxProductCard', () => ({
  OxProductCard: function OxProductCard() {
    return null;
  },
}));
vi.mock('../../app/components/product/BuyZone/PdpGallery', () => ({
  PdpGallery: function PdpGallery() {
    return null;
  },
}));

const { registerOxProductComponents } = await import('../../app/components/product/register');
const { OxProductCard } = await import('../../app/components/product/OxProductCard');
const { PdpGallery } = await import('../../app/components/product/BuyZone/PdpGallery');

describe('registerOxProductComponents', () => {
  beforeEach(() => {
    registry.components.clear();
  });

  it('leaves getOriginal non-null, which is the switch the engine card reads', () => {
    registerOxProductComponents();
    expect(registry.getOriginal('product:card')).not.toBeNull();
    expect(registry.getOriginal('product:card')).toBe(EngineProductCard);
  });

  it('resolves product:card to OxProductCard', () => {
    registerOxProductComponents();
    expect(registry.resolve('product:card')).toBe(OxProductCard);
  });

  it('registers the gallery override, which needs no second call', () => {
    registerOxProductComponents();
    expect(registry.resolve('product:gallery')).toBe(PdpGallery);
  });

  it('a lone override would not flip the switch (the defect C1 names)', () => {
    registry.override('product:card', OxProductCard);
    expect(registry.resolve('product:card')).toBe(OxProductCard);
    expect(registry.getOriginal('product:card')).toBeNull();
  });

  it('is idempotent enough to survive a double call', () => {
    registerOxProductComponents();
    registerOxProductComponents();
    expect(registry.resolve('product:card')).toBe(OxProductCard);
    expect(registry.getOriginal('product:card')).not.toBeNull();
  });
});
