// @vitest-environment node
import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  ROOT_TYPE_KEYS,
  productTypeOf,
  typeFromCategory,
  typeFromListing,
  typeFromMembership,
  typeFromName,
  childTypeFromCategory,
  childTypeFromListing,
  childTypeFromMembership,
  childTypeFromName,
} from '../../app/components/product/lib/productType';
import { MENU, TAXONOMY } from '../../app/content/taxonomy';

/**
 * The product TYPE on the card's facts line (owner items 2026-09-24, S8a and
 * S8g). `productTypeOf` answers one of three ways: `{ kind: 'bundle' }` for a
 * real Salla bundle, `{ kind: 'type', root, child }` for one of the ten root
 * types (the child only when the product genuinely belongs to one), or
 * `null` when no source can say. The rule every test here holds: a wrong
 * answer never prints; nothing does.
 */
interface FixtureProduct {
  id: number;
  name: string;
  sku: string;
  type: string;
}

const PRODUCTS: FixtureProduct[] = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), 'fixtures', 'store', 'products.json'), 'utf8')
);

const byName = (name: string): FixtureProduct => {
  const found = PRODUCTS.find((product) => product.name === name);
  if (!found) throw new Error(`not in the fixture catalogue: ${name}`);
  return found;
};

/** The five protein children, read off the taxonomy itself rather than repeated here. */
const CHILD_TYPE_KEYS = TAXONOMY.filter((node) => node.scope === 'type' && node.parent !== null).map(
  (node) => node.key
);

describe('the ten root types', () => {
  it('are exactly the taxonomy type roots, in menu order', () => {
    expect([...ROOT_TYPE_KEYS]).toEqual(MENU.types.map((node) => node.key));
  });

  it('each carry a short card label in both locales, sized for the two-up phone card (S8a)', () => {
    // The taxonomy's own names ("الفيتامينات والمعادن", "سناكات وبروتين بار")
    // pushed the fact behind the ellipsis at 390; the card label is the
    // same type, article-less and at most 16 characters.
    for (const lang of ['ar', 'en']) {
      const dict = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'locales', `${lang}.json`), 'utf8'));
      for (const key of ROOT_TYPE_KEYS) {
        const label: unknown = dict[`ox.card.type.${key}`];
        expect(typeof label, `${lang} ox.card.type.${key}`).toBe('string');
        if (lang === 'ar') expect((label as string).length, `ox.card.type.${key}`).toBeLessThanOrEqual(16);
      }
    }
  });

  it('never share a SKU, so the membership answer is unique', () => {
    const seen = new Map<string, string>();
    for (const node of MENU.types) {
      for (const sku of node.skus) {
        expect(seen.get(sku), `${sku} is in ${seen.get(sku)} and ${node.key}`).toBeUndefined();
        seen.set(sku, node.key);
      }
    }
  });
});

describe('the five protein children (S8g item 2)', () => {
  it('are exactly the taxonomy nodes one level under a root', () => {
    expect(CHILD_TYPE_KEYS.sort()).toEqual(
      ['whey_protein', 'whey_isolate', 'casein', 'plant_protein', 'mass_gainer'].sort()
    );
  });

  it('each carry a short card label in both locales, at most 16 Arabic characters (S8g)', () => {
    for (const lang of ['ar', 'en']) {
      const dict = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'locales', `${lang}.json`), 'utf8'));
      for (const key of CHILD_TYPE_KEYS) {
        const label: unknown = dict[`ox.card.type.${key}`];
        expect(typeof label, `${lang} ox.card.type.${key}`).toBe('string');
        if (lang === 'ar') expect((label as string).length, `ox.card.type.${key}`).toBeLessThanOrEqual(16);
      }
    }
  });

  it('never share a SKU with each other or with another root, so membership is unique', () => {
    const seen = new Map<string, string>();
    for (const node of MENU.types) {
      for (const sku of node.skus) seen.set(sku, node.key);
    }
    for (const node of TAXONOMY.filter((n) => n.scope === 'type' && n.parent !== null)) {
      for (const sku of node.skus) {
        // A protein child's SKUs are a subset of the root's own list
        // (protein carries every child's SKUs too), so this only checks
        // that no TWO children share one.
        const owner = seen.get(sku);
        if (owner && owner !== node.parent) {
          expect.fail(`${sku} claimed by both ${owner} and ${node.key}`);
        }
      }
    }
  });
});

describe('typeFromName, the keyword fallback, over ten real catalogue names', () => {
  const CASES: [string, string][] = [
    ['جولد ستاندرد 100% واي بروتين - اوبتيموم نيوترشن', 'protein'],
    ['كرياتين مونوهيدرات - ثورن', 'creatine'],
    ['بلاك سيريس نوك اوت 2.0 ما قبل التمرين - اوليمب', 'pre_workout'],
    ['امينو بيلد BCAA - مسل تك', 'amino_acids'],
    ['زيت السمك اوميغا 3 الاسكي 1250 ملجم - سبورتس ريسيرش', 'omega_3'],
    ['مغنيسيوم 400 ملجم كبسولات - ناو فودز', 'vitamins_minerals'],
    // What follows "مع" is an add-in, not the type.
    ['كولاجين ببتيدات مع فيتامين ج وبيوتين أقراص - نيوسيل', 'collagen_beauty'],
    // The brand after " - " (Nature's Way, "نيتشرز واي") never votes "whey".
    ['كلوروفريش كلوروفيل سائل بالنعناع - نيتشرز واي', 'daily_health'],
    // "بروتين تشيبس" is one snack phrase; the bare "بروتين" inside it does not vote.
    ['بروتين تشيبس بنمط التورتيا علبة 8 - كويست', 'snacks_bars'],
    ['شيكر اوبتيمال اكس V2 سعة 820 مل - بلندر بوتل', 'accessories'],
  ];

  for (const [name, type] of CASES) {
    it(`${name} -> ${type}`, () => {
      byName(name);
      expect(typeFromName(name)).toBe(type);
    });
  }

  it('answers nothing for a bundle, a service, a gift card or an ambiguous name', () => {
    for (const name of [
      'حزمة البداية - اوبتيمال اكس',
      'زيارة الفرع في المدينة المنورة',
      'بطاقة هدية اوبتيمال اكس',
      'دليل المبتدئين للمكملات الغذائية (PDF)',
      // An amino-acid energy drink the owner files under pre-workout: the
      // name alone cannot tell, so it says nothing rather than "amino acids".
      'امينو انرجي - اوبتيموم نيوترشن',
    ]) {
      byName(name);
      expect(typeFromName(name), name).toBeNull();
    }
    expect(typeFromName('بروتين + كرياتين')).toBeNull();
  });

  it('reads English names too, brand-neutral', () => {
    expect(typeFromName('Gold Standard 100% Whey')).toBe('protein');
    expect(typeFromName('Quest Protein Bar - Cookies')).toBe('snacks_bars');
    expect(typeFromName('Creatine Monohydrate')).toBe('creatine');
    expect(typeFromName('C4 Pre-Workout')).toBe('pre_workout');
    expect(typeFromName('Omega-3 Fish Oil')).toBe('omega_3');
  });

  it('is never wrong across the whole fixture catalogue (it agrees with the membership or stays silent)', () => {
    let answered = 0;
    for (const product of PRODUCTS) {
      const fromName = typeFromName(product.name);
      if (fromName === null) continue;
      answered += 1;
      expect(fromName, product.name).toBe(typeFromMembership({ id: product.id, sku: product.sku }));
    }
    // 39 of the 40 physical products; the one silent is "امينو انرجي",
    // argued above. The seven bundle, service, digital and gift entries all
    // stay silent too.
    expect(answered).toBe(39);
  });
});

describe('typeFromMembership, the theme SKU map', () => {
  it('maps a product by its SKU, else by its id through salla-ids, to the ROOT type', () => {
    expect(typeFromMembership({ id: 0, sku: 'OX-005' })).toBe('protein');
    expect(typeFromMembership({ id: 1836761674, sku: '' })).toBe('pre_workout');
    expect(typeFromMembership({ id: 1141798217, sku: 'OX-041' })).toBeNull();
    expect(typeFromMembership({ id: 1, sku: null })).toBeNull();
  });
});

describe('typeFromListing and typeFromCategory', () => {
  it('maps a type listing, a protein child included, to its root; a goal or a utility listing to nothing', () => {
    expect(typeFromListing('protein')).toBe('protein');
    expect(typeFromListing('whey-isolate')).toBe('protein');
    expect(typeFromListing('omega-3')).toBe('omega_3');
    expect(typeFromListing('goal-energy')).toBeNull();
    expect(typeFromListing('bundles')).toBeNull();
    expect(typeFromListing(undefined)).toBeNull();
  });

  it('maps the API category by its URL slug, else by its name', () => {
    expect(typeFromCategory({ name: 'x', url: 'https://optimalx.com.sa/creatine/c9002' })).toBe('creatine');
    expect(typeFromCategory({ name: 'x', url: '/whey-protein/c9011' })).toBe('protein');
    expect(typeFromCategory({ name: 'سناكات وبروتين بار', url: 'https://optimalx.com.sa/c123' })).toBe(
      'snacks_bars'
    );
    expect(typeFromCategory({ name: 'العروض', url: '/offers' })).toBeNull();
    expect(typeFromCategory(undefined)).toBeNull();
  });
});

describe('the child resolvers, the same four sources one level down (S8g item 2)', () => {
  it('typeFromListing/typeFromCategory: only a CHILD slug answers, never the root itself', () => {
    expect(childTypeFromListing('whey-isolate')).toBe('whey_isolate');
    expect(childTypeFromListing('protein')).toBeNull(); // the root, not a child
    expect(childTypeFromListing('casein')).toBe('casein');
    expect(childTypeFromListing(undefined)).toBeNull();

    expect(childTypeFromCategory({ name: 'x', url: '/whey-protein/c9011' })).toBe('whey_protein');
    expect(childTypeFromCategory({ name: 'x', url: '/protein/c9001' })).toBeNull();
    expect(childTypeFromCategory(undefined)).toBeNull();
  });

  it('typeFromMembership: the product SKU in one child list, never two', () => {
    expect(childTypeFromMembership({ id: 0, sku: 'OX-001' })).toBe('whey_protein');
    expect(childTypeFromMembership({ id: 0, sku: 'OX-005' })).toBe('whey_isolate');
    expect(childTypeFromMembership({ id: 0, sku: 'OX-009' })).toBe('casein');
    expect(childTypeFromMembership({ id: 0, sku: 'OX-011' })).toBe('plant_protein');
    expect(childTypeFromMembership({ id: 0, sku: 'OX-013' })).toBe('mass_gainer');
    // A non-protein product has no child at all.
    expect(childTypeFromMembership({ id: 995134839, sku: '' })).toBeNull();
  });

  it('typeFromName: واي/whey, ايزوليت/isolate, كازين/casein, نباتي/plant/vegan protein, ماس جينر/gainer', () => {
    expect(childTypeFromName('جولد ستاندرد 100% واي بروتين - اوبتيموم نيوترشن')).toBe('whey_protein');
    expect(childTypeFromName('جوست بروتين نباتي - جوست')).toBe('plant_protein');
    expect(childTypeFromName('ايليت كازين - ديماتيز')).toBe('casein');
    expect(childTypeFromName('سيريس ماس ماس جينر - اوبتيموم نيوترشن')).toBe('mass_gainer');
    expect(childTypeFromName('Gold Standard 100% Whey')).toBe('whey_protein');
    expect(childTypeFromName('Plant Protein Blend')).toBe('plant_protein');
    // A name naming both واي and ايزوليت is ambiguous at the child level —
    // never guessed — even though the membership resolves it (next test).
    expect(childTypeFromName('ايزو 100 واي ايزوليت محلل مائيا - ديماتيز')).toBeNull();
    // "بروتين" alone names only the ROOT, never a child.
    expect(childTypeFromName('ستاكد بروتين - ايفليوشن نيوترشن')).toBeNull();
    expect(childTypeFromName(null)).toBeNull();
  });
});

describe('productTypeOf, the four sources in order, over real catalogue names', () => {
  const whey = byName('جولد ستاندرد 100% واي بروتين - اوبتيموم نيوترشن'); // OX-001, whey_protein

  it('prefers the API category, and never pairs a stale child with a different root', () => {
    const product = { ...whey, category: { name: 'كرياتين', url: '/creatine/c9002' } };
    // OX-001's own SKU is in whey_protein, but the root here is creatine —
    // childBelongsToRoot rejects the mismatch rather than printing
    // "كرياتين · واي بروتين".
    expect(productTypeOf(product, { categorySlug: 'protein' })).toEqual({
      kind: 'type',
      root: 'creatine',
      child: null,
    });
  });

  it('then the listing the card renders in', () => {
    expect(productTypeOf({ ...whey, category: undefined }, { categorySlug: 'omega-3' })).toEqual({
      kind: 'type',
      root: 'omega_3',
      child: null,
    });
  });

  it('then the membership (root and child both), then the name', () => {
    expect(productTypeOf({ ...whey, category: undefined })).toEqual({
      kind: 'type',
      root: 'protein',
      child: 'whey_protein',
    });
    expect(productTypeOf({ id: 1, sku: null, name: 'كرياتين مونوهيدرات - ثورن' })).toEqual({
      kind: 'type',
      root: 'creatine',
      child: null,
    });
    expect(productTypeOf({ id: 1, sku: null, name: 'منتج بدون نوع' })).toBeNull();
  });

  it('resolves a real whey-isolate name to its root AND its child', () => {
    const isolate = byName('ايزو 100 واي ايزوليت محلل مائيا - ديماتيز'); // OX-005
    expect(productTypeOf({ ...isolate, category: undefined })).toEqual({
      kind: 'type',
      root: 'protein',
      child: 'whey_isolate',
    });
  });

  it('falls through a goal listing and an unmapped category to the next source', () => {
    const product = { ...whey, category: { name: 'العروض', url: '/offers' } };
    expect(productTypeOf(product, { categorySlug: 'goal-energy' })).toEqual({
      kind: 'type',
      root: 'protein',
      child: 'whey_protein',
    });
  });

  it('answers nothing when no source can type the product at all', () => {
    expect(productTypeOf({ id: 1, sku: null, name: 'منتج' })).toBeNull();
  });
});

describe('productTypeOf, the bundle kind (S8g item 3)', () => {
  it('is a bundle for the real Salla type, group_products, over a name that reads as an ordinary product', () => {
    expect(
      productTypeOf({ id: 1141798217, sku: 'OX-041', type: 'group_products', name: 'أي اسم عادي' })
    ).toEqual({ kind: 'bundle' });
  });

  it('is a bundle for a name that starts with حزمة، باقة or bundle, even without the API type', () => {
    expect(productTypeOf({ id: 1, sku: null, name: 'حزمة البداية - اوبتيمال اكس' })).toEqual({
      kind: 'bundle',
    });
    expect(productTypeOf({ id: 1, sku: null, name: 'باقة الأداء الكاملة' })).toEqual({ kind: 'bundle' });
    expect(productTypeOf({ id: 1, sku: null, name: 'Bundle: Whey and Creatine' })).toEqual({
      kind: 'bundle',
    });
  });

  it('is checked before any type source, so a bundle never also types as one of its own members', () => {
    // A whey protein's own name, but flagged group_products: the bundle
    // answer wins outright rather than "protein".
    expect(
      productTypeOf({ id: 1, sku: 'OX-001', type: 'group_products', name: 'جولد ستاندرد واي بروتين' })
    ).toEqual({ kind: 'bundle' });
  });

  it('does not fire on a name that merely contains one of the words mid-sentence', () => {
    // Only the FIRST word triggers the bundle answer, the same convention
    // the catalogue itself uses; a product that happens to mention "باقة"
    // later in its name (here, inside the "مع ..." add-in) is not a bundle
    // just because of that — it still types normally, from its own head word.
    expect(productTypeOf({ id: 1, sku: null, name: 'شيكر مع باقة هدايا' })).toEqual({
      kind: 'type',
      root: 'accessories',
      child: null,
    });
  });

  it('the real starter-kit product resolves as a bundle end to end', () => {
    const starter = byName('حزمة البداية - اوبتيمال اكس'); // OX-041
    expect(starter.type).toBe('group_products');
    expect(productTypeOf(starter)).toEqual({ kind: 'bundle' });
  });
});
