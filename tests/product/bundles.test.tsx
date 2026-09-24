import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../helpers/render';

/**
 * Bundles, the completion row, and the gate that keeps both off the live
 * storefront.
 *
 * The three things these tests hold:
 *
 *   1. **The sample data is off.** `SHOW_SAMPLE_BUNDLES` ships `false`, the two
 *      real arrays are empty, and with the flag off both components render
 *      nothing and ask the API for nothing. That is the state a visitor meets
 *      today, and it is the state the product page is checked in.
 *   2. **No claim, no invented number.** No sample entry carries a discount, a
 *      saving or a price; every amount on either surface comes from a product
 *      the API returned.
 *   3. **The cart stays Salla's.** The completion row's one button clicks one
 *      real Salla add control per ticked product, the page's own buy-form
 *      button for the product whose page it is, and nothing at all for a row
 *      the shopper unticked.
 */

/** Every Salla add control the run clicked, in click order. */
const adds: number[] = [];
/** Every `product.list` call the run made. */
const listCalls: { source: string; ids: number[] }[] = [];

vi.mock('@salla.sa/twilight-theme-engine/i18n', async () =>
  (await import('./i18n-mock')).i18nModuleMock('ar')
);
vi.mock('@salla.sa/twilight-theme-engine/common', () => ({
  Link: ({ to, children, className }: Record<string, unknown>) => (
    <a href={String(to ?? '')} className={className as string | undefined}>
      {children as React.ReactNode}
    </a>

  ),
  Image: ({ src, alt }: Record<string, unknown>) => (
    <img src={String(src ?? '')} alt={String(alt ?? '')} />

  ),
}));
vi.mock('@salla.sa/twilight-theme-engine/hooks/useMoney', () => ({
  useMoney: () => ({
    format: (amount: unknown) => <span data-testid="money">{String(amount)}</span>,

    parse: Number,
    isValid: () => true,
  }),
}));
vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: {
    list: async ({ source, sourceValue }: { source: string; sourceValue: number[] }) => {
      const ids = (sourceValue ?? []).map(Number);
      listCalls.push({ source, ids });
      return { items: ids.map((id) => CATALOGUE[id]).filter(Boolean), next: null };
    },
  },
}));
vi.mock('@salla.sa/twilight-components-react/add-product-button', () => {
  const Stub = ({ productId, children, onSuccess }: Record<string, unknown>) => (
    <salla-add-product-button data-product={String(productId)}>
      <button
        type="button"
        onClick={() => {
          adds.push(Number(productId));
          // The real component reports back, and the row's combined add waits
          // for that before firing the next one. A stub that stayed silent
          // would make every add sit out the queue's timeout.
          (onSuccess as (() => void) | undefined)?.();
        }}
      >
        {children as React.ReactNode}
      </button>

    </salla-add-product-button>

  );
  return { SallaAddProductButton: Stub, SallaAddProductButtonCore: Stub };
});

const {
  SHOW_SAMPLE_BUNDLES,
  REAL_BUNDLES,
  REAL_COMPANION_SETS,
  bundlesForProduct,
  companionsForProduct,
} = await import('../../app/content/bundles');
const { SALLA_IDS, idForSku } = await import('../../app/content/salla-ids');
const { FrequentlyBought } = await import(
  '../../app/components/product/BelowFold/FrequentlyBought'
);
const { Bundle } = await import('../../app/components/product/BelowFold/Bundle');

type TestProduct = Record<string, unknown>;

function makeProduct(sku: string, overrides: TestProduct = {}): TestProduct {
  const id = idForSku(sku) as number;
  return {
    id,
    name: sku,
    url: `/p${id}`,
    type: 'product',
    status: 'sale',
    price: 100,
    sale_price: 0,
    regular_price: 100,
    currency: 'SAR',
    is_on_sale: false,
    is_out_of_stock: false,
    image: { url: `https://example.test/${sku}.jpg`, alt: sku },
    ...overrides,
  };
}

const WHEY = makeProduct('OX-001', { name: 'OX-001 whey', price: 349 });
const SHAKER = makeProduct('OX-036', { name: 'OX-036 shaker', price: 59, has_options: true });
const OATS = makeProduct('OX-040', { name: 'OX-040 oats', price: 55 });
const PEANUT = makeProduct('OX-039', { name: 'OX-039 peanut', price: 65 });
const CREATINE = makeProduct('OX-015', { name: 'OX-015 creatine', price: 149 });
const MULTI = makeProduct('OX-028', { name: 'OX-028 multi', price: 56 });
const STARTER = makeProduct('OX-041', {
  name: 'OX-041 starter',
  price: 509,
  type: 'group_products',
  has_options: true,
});

const CATALOGUE: Record<number, TestProduct> = {};
for (const item of [WHEY, SHAKER, OATS, PEANUT, CREATINE, MULTI, STARTER]) {
  CATALOGUE[item.id as number] = item;
}

/** The page's own buy-form control, which the completion row must proxy. */
function BuyZoneStub() {
  return (
    <div className="ox-buy">
      <salla-add-product-button>
        <button type="button" onClick={() => adds.push(WHEY.id as number)}>
          buy
        </button>

      </salla-add-product-button>

    </div>

  );
}

beforeEach(() => {
  adds.length = 0;
  listCalls.length = 0;
});

describe('the gate, and what stays behind it', () => {
  it('ships off; the starter bundle is real data, not a sample behind it', () => {
    expect(SHOW_SAMPLE_BUNDLES).toBe(false);
    expect(REAL_BUNDLES).toEqual([
      { id: 'starter', productSku: 'OX-041', memberSkus: ['OX-001', 'OX-015', 'OX-028'], discount: null },
    ]);
    expect(REAL_COMPANION_SETS).toEqual([]);
  });

  it('offers the real bundle on its three member pages, and nowhere else, gate shut', () => {
    for (const sku of ['OX-001', 'OX-015', 'OX-028']) {
      const bundles = bundlesForProduct(idForSku(sku) as number);
      expect(bundles, sku).toHaveLength(1);
      expect(bundles[0]?.productSku).toBe('OX-041');
    }
    // Never on the bundle's own page, and never on an unrelated product.
    expect(bundlesForProduct(idForSku('OX-041') as number)).toEqual([]);
    const STARTER_SKUS = new Set(['OX-041', 'OX-001', 'OX-015', 'OX-028']);
    for (const [sku, entry] of Object.entries(SALLA_IDS)) {
      if (STARTER_SKUS.has(sku)) continue;
      expect(bundlesForProduct(entry.id), sku).toEqual([]);
    }
  });

  it('answers no companion set for every product while the gate is shut', () => {
    for (const entry of Object.values(SALLA_IDS)) {
      expect(companionsForProduct(entry.id)).toBeNull();
    }
  });
});

describe('the starter bundle, real, and the sample companion sets behind the gate', () => {
  it('REAL_BUNDLES resolves its own productSku and every memberSku to a real catalogue id', () => {
    for (const bundle of REAL_BUNDLES) {
      expect(idForSku(bundle.productSku), bundle.productSku).toBeTypeOf('number');
      for (const sku of bundle.memberSkus) expect(idForSku(sku), sku).toBeTypeOf('number');
    }
  });

  it('states no discount anywhere', () => {
    const bundles = bundlesForProduct(WHEY.id as number, { sample: true });
    expect(bundles.length).toBeGreaterThan(0);
    for (const bundle of bundles) expect(bundle.discount).toBeNull();
  });

  it('is composed only of SKUs the id map carries', () => {
    const bundles = bundlesForProduct(WHEY.id as number, { sample: true });
    const skus = bundles.flatMap((bundle) => [bundle.productSku, ...bundle.memberSkus]);
    const set = companionsForProduct(WHEY.id as number, { sample: true });
    for (const sku of [...skus, ...(set?.companionSkus ?? [])]) {
      expect(idForSku(sku)).toBeTypeOf('number');
    }
  });

  it('pairs a powder with the shaker it is mixed in, and a creatine with a protein', () => {
    const powder = companionsForProduct(WHEY.id as number, { sample: true });
    expect(powder?.companionSkus).toContain('OX-036');
    const creatine = companionsForProduct(idForSku('OX-015') as number, { sample: true });
    expect(creatine?.companionSkus).toContain('OX-001');
  });

  it('never offers a bundle on the bundle product’s own page', () => {
    expect(bundlesForProduct(STARTER.id as number, { sample: true })).toEqual([]);
  });

  it('never offers a product to itself', () => {
    const set = companionsForProduct(idForSku('OX-036') as number, { sample: true });
    expect(set?.companionSkus ?? []).not.toContain('OX-036');
  });
});

describe('FrequentlyBought with the gate shut', () => {
  it('renders nothing and asks the API for nothing', async () => {
    renderWithProviders(<FrequentlyBought product={WHEY as never} />);

    await waitFor(() => expect(screen.queryByTestId('ox-fbt')).toBeNull());
    expect(listCalls).toEqual([]);
  });
});

describe('FrequentlyBought with the sample set', () => {
  it('lists this product and its companions, and prices each one', async () => {
    renderWithProviders(
      <>
        <BuyZoneStub />
        <FrequentlyBought product={WHEY as never} sample />
      </>

    );
    await screen.findByTestId('ox-fbt');
    expect(screen.getByText('OX-001 whey')).toBeTruthy();
    expect(screen.getByText('OX-036 shaker')).toBeTruthy();
    expect(screen.getByText('OX-040 oats')).toBeTruthy();
    expect(screen.getByText('OX-039 peanut')).toBeTruthy();
    // One request for the whole set, through the engine's own curated source.
    expect(listCalls).toHaveLength(1);
    expect(listCalls[0]?.source).toBe('selected');
  });

  it('asks the shopper to choose options instead of ticking a variant product', async () => {
    renderWithProviders(<FrequentlyBought product={WHEY as never} sample />);
    await screen.findByTestId('ox-fbt');
    const boxes = screen.getAllByRole('checkbox');
    // This product, the oats and the peanut butter; the shaker has colours.
    expect(boxes).toHaveLength(3);
    const choose = screen.getByRole('link', { name: /.+/ });
    expect(choose.getAttribute('href')).toBe(SHAKER.url);
  });

  it('totals the ticked rows only, and leaves the chooser row out of the sum', async () => {
    renderWithProviders(<FrequentlyBought product={WHEY as never} sample />);
    await screen.findByTestId('ox-fbt');
    const amounts = screen.getAllByTestId('money').map((node) => node.textContent);
    // 349 + 55 + 65; the 59 shaker is priced on its row but never in the total.
    expect(amounts).toContain('469');
  });

  it('drives one Salla add per ticked product, and the buy form for this one', async () => {
    renderWithProviders(
      <>
        <BuyZoneStub />
        <FrequentlyBought product={WHEY as never} sample />
      </>

    );
    await screen.findByTestId('ox-fbt');

    // Untick the oats; the shaker was never tickable.
    const boxes = screen.getAllByRole('checkbox') as HTMLInputElement[];
    fireEvent.click(boxes[1] as HTMLInputElement);

    fireEvent.click(screen.getByTestId('ox-fbt-add'));

    // ONE AT A TIME, in row order. The adds used to all fire in a single
    // synchronous loop, which started a cart request per product at once;
    // Salla's cart is server-authoritative and each response rewrites it, so
    // the last one home could drop an earlier item. Each now waits for its own
    // button to report back, so the assertion has to wait too.
    await waitFor(() => expect(adds).toEqual([WHEY.id, PEANUT.id]));
  });

  it('adds nothing while no row is ticked', async () => {
    renderWithProviders(
      <>
        <BuyZoneStub />
        <FrequentlyBought product={WHEY as never} sample />
      </>

    );
    await screen.findByTestId('ox-fbt');
    for (const box of screen.getAllByRole('checkbox')) fireEvent.click(box);
    fireEvent.click(screen.getByTestId('ox-fbt-add'));
    expect(adds).toEqual([]);
  });
});

describe('Bundle', () => {
  it('renders nothing for a product that is not part of the real bundle', async () => {
    renderWithProviders(<Bundle product={SHAKER as never} />);

    await waitFor(() => expect(screen.queryByTestId('ox-bundle-offer')).toBeNull());
    expect(listCalls).toEqual([]);
  });

  it('shows the Salla bundle product, its members and no saving line, real, no sample flag needed (the member PDP renders the bundle card)', async () => {
    const { container } = renderWithProviders(<Bundle product={WHEY as never} />);

    await screen.findByTestId('ox-bundle-offer');
    expect(screen.getByText('OX-041 starter')).toBeTruthy();
    expect(screen.getByText('OX-001 whey')).toBeTruthy();
    expect(screen.getByText('OX-015 creatine')).toBeTruthy();
    expect(screen.getByText('OX-028 multi')).toBeTruthy();
    expect(container.querySelector('.ox-bundle-offer__discount')).toBeNull();
  });

  it('adds the bundle through the bundle product’s own Salla button, once', async () => {
    renderWithProviders(<Bundle product={WHEY as never} />);

    await screen.findByTestId('ox-bundle-offer');
    const [button] = screen.getAllByRole('button');
    fireEvent.click(button as HTMLElement);
    expect(adds).toEqual([STARTER.id]);
  });
});
