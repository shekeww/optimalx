import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * The commerce hook registration (PLAN-final B6 tests: "each hook registered
 * exactly once"). A second handler on a slot would render the block twice,
 * which is what the module-level guard prevents.
 *
 * Both the registry and the four blocks are doubled. Importing
 * `@salla.sa/twilight-theme-engine/hooks` or any of the blocks for real pulls
 * the whole components-react runtime into jsdom (the same reason B3's
 * register test doubles the component registry); what is under test is which
 * slots the registration writes to and how many times, which the double
 * records exactly.
 */
interface Definition {
  id: number;
  handler: (context: unknown) => unknown;
  priority: number;
}

class TestHookRegistry {
  hooks = new Map<string, Definition[]>();
  private nextId = 1;

  register(name: string, handler: (context: unknown) => unknown, priority = 50) {
    const list = this.hooks.get(name) ?? [];
    list.push({ id: this.nextId++, handler, priority });
    this.hooks.set(name, list);
  }

  getHandlers(name: string): Definition[] {
    return this.hooks.get(name) ?? [];
  }

  clearAll() {
    this.hooks.clear();
  }
}

const hookRegistry = new TestHookRegistry();

// Only the two members the register file uses; the enum value is the engine's
// own string (types/hooks.d.ts:29).
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  hookRegistry,
  HookName: { CART_ITEMS_END: 'cart:items.end', CART_ITEMS_START: 'cart:items.start' },
}));
vi.mock('../../app/components/commerce/CartTrust', () => ({
  CartTrust: function CartTrust() {
    return null;
  },
}));
vi.mock('../../app/components/commerce/BlogIndexHeader', () => ({
  BlogIndexHeader: function BlogIndexHeader() {
    return null;
  },
}));
vi.mock('../../app/components/commerce/ArticleExtras', () => ({
  ArticleExtras: function ArticleExtras() {
    return null;
  },
  ArticleKeyPoints: function ArticleKeyPoints() {
    return null;
  },
}));

const { registerOxCommerceHooks, resetOxCommerceHooks } = await import(
  '../../app/components/commerce/register'
);

/** The four slots B6 owns, in the engine's own naming. */
const SLOTS = ['cart:items.end', 'blog:start', 'blog:single.start', 'blog:single.end'];

describe('registerOxCommerceHooks', () => {
  beforeEach(() => {
    hookRegistry.clearAll();
    resetOxCommerceHooks();
  });

  it('registers one handler in each of the four engine slots', () => {
    registerOxCommerceHooks();
    for (const slot of SLOTS) {
      expect(hookRegistry.getHandlers(slot)).toHaveLength(1);
    }
  });

  it('registers nothing a second time', () => {
    registerOxCommerceHooks();
    registerOxCommerceHooks();
    registerOxCommerceHooks();
    for (const slot of SLOTS) {
      expect(hookRegistry.getHandlers(slot)).toHaveLength(1);
    }
  });

  it('touches no slot it does not own', () => {
    registerOxCommerceHooks();
    expect(hookRegistry.getHandlers('cart:items.start')).toHaveLength(0);
    expect(hookRegistry.getHandlers('cart:summary.end')).toHaveLength(0);
    expect(hookRegistry.getHandlers('thank-you:end')).toHaveLength(0);
    expect([...hookRegistry.hooks.keys()].sort()).toEqual([...SLOTS].sort());
  });

  it('returns an element from every handler it registered', () => {
    registerOxCommerceHooks();
    for (const slot of SLOTS) {
      const [definition] = hookRegistry.getHandlers(slot);
      expect(definition.handler({})).toBeTruthy();
      expect(definition.priority).toBe(50);
    }
  });
});
