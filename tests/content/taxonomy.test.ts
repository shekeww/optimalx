import { describe, it, expect } from 'vitest';
import { MENU, TAXONOMY, childrenOf, nodeBySlug } from '../../app/content/taxonomy';
import { SALLA_IDS } from '../../app/content/salla-ids';
import { loadDictionary } from '../helpers/i18n';

/**
 * Conductor §4, verbatim: 10 type roots, 5 protein children, 4 utility, 6
 * goals, in that order (Contract A/B, PLAN-ship "Batch S1" Accept list).
 */
const CONDUCTOR_SLUGS = [
  'protein',
  'creatine',
  'pre-workout',
  'amino-acids',
  'omega-3',
  'vitamins-minerals',
  'collagen-beauty',
  'daily-health',
  'snacks-bars',
  'accessories',
  'whey-protein',
  'whey-isolate',
  'casein',
  'plant-protein',
  'mass-gainer',
  'bundles',
  'services',
  'digital-library',
  'gift-cards',
  'goal-energy',
  'goal-general-health',
  'goal-performance',
  'goal-recovery',
  'goal-hair-skin',
  'goal-ideal-weight',
];

const ar = loadDictionary('ar');
const en = loadDictionary('en');

describe('taxonomy.ts (Contract A/B)', () => {
  it('has 25 nodes with the conductor §4 slugs, in order', () => {
    expect(TAXONOMY).toHaveLength(25);
    expect(TAXONOMY.map((node) => node.slug)).toEqual(CONDUCTOR_SLUGS);
  });

  it('nests the five protein children under protein and leaves everything else parentless', () => {
    expect(childrenOf('protein').map((node) => node.slug)).toEqual([
      'whey-protein',
      'whey-isolate',
      'casein',
      'plant-protein',
      'mass-gainer',
    ]);
    const otherParents = TAXONOMY.filter((node) => node.slug !== 'protein' && node.parent !== null).map(
      (node) => node.slug
    );
    expect(otherParents.every((slug) => childrenOf('protein').some((child) => child.slug === slug))).toBe(
      true
    );
  });

  it('resolves a slug and returns undefined for an unknown one', () => {
    expect(nodeBySlug('protein')?.scope).toBe('type');
    expect(nodeBySlug('goal-energy')?.scope).toBe('goal');
    expect(nodeBySlug('bundles')?.scope).toBe('utility');
    expect(nodeBySlug('nope')).toBeUndefined();
  });

  it('groups MENU into ten types, six goals and four utility categories', () => {
    expect(MENU.types).toHaveLength(10);
    expect(MENU.goals).toHaveLength(6);
    expect(MENU.utility).toHaveLength(4);
  });

  it('resolves every node’s five key kinds in Arabic and English', () => {
    const missing: string[] = [];
    for (const node of TAXONOMY) {
      const keys = [node.nameKey, node.h1Key, node.titleKey, node.descriptionKey, node.introKey];
      for (const key of keys) {
        if (ar[key] === undefined) missing.push(`ar:${node.slug}:${key}`);
        if (en[key] === undefined) missing.push(`en:${node.slug}:${key}`);
      }
      expect(node.faq, node.slug).toHaveLength(3);
      for (const item of node.faq) {
        if (ar[item.qKey] === undefined) missing.push(`ar:${node.slug}:${item.qKey}`);
        if (ar[item.aKey] === undefined) missing.push(`ar:${node.slug}:${item.aKey}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('keeps every Arabic meta description between 120 and 155 characters', () => {
    const outOfRange = TAXONOMY.map((node) => ({ slug: node.slug, length: (ar[node.descriptionKey] ?? '').length }))
      .filter(({ length }) => length < 120 || length > 155);
    expect(outOfRange).toEqual([]);
  });

  it('names only SKUs that exist in the id map', () => {
    const unknown = TAXONOMY.flatMap((node) => node.skus).filter((sku) => !(sku in SALLA_IDS));
    expect(unknown).toEqual([]);
  });

  it('gives every SKU exactly one type leaf-or-root, its parent skus including it', () => {
    const typeLeavesOrRoots = TAXONOMY.filter(
      (node) => node.scope === 'type' && (node.parent !== null || childrenOf(node.slug).length === 0)
    );
    const owners = new Map<string, string[]>();
    for (const node of typeLeavesOrRoots) {
      for (const sku of node.skus) {
        owners.set(sku, [...(owners.get(sku) ?? []), node.slug]);
      }
    }
    const allSkus = Object.keys(SALLA_IDS);
    const utilitySkus = new Set(TAXONOMY.filter((n) => n.scope === 'utility').flatMap((n) => n.skus));
    const productSkus = allSkus.filter((sku) => !utilitySkus.has(sku));

    const notExactlyOne = productSkus.filter((sku) => (owners.get(sku) ?? []).length !== 1);
    expect(notExactlyOne).toEqual([]);

    // A protein child's SKUs are also carried by the protein root.
    const protein = nodeBySlug('protein');
    for (const child of childrenOf('protein')) {
      for (const sku of child.skus) {
        expect(protein?.skus, `${child.slug}:${sku}`).toContain(sku);
      }
    }

    // Every utility SKU belongs to exactly one utility node.
    const utilityOwners = new Map<string, string[]>();
    for (const node of TAXONOMY.filter((n) => n.scope === 'utility')) {
      for (const sku of node.skus) utilityOwners.set(sku, [...(utilityOwners.get(sku) ?? []), node.slug]);
    }
    const utilityNotExactlyOne = allSkus
      .filter((sku) => utilitySkus.has(sku))
      .filter((sku) => (utilityOwners.get(sku) ?? []).length !== 1);
    expect(utilityNotExactlyOne).toEqual([]);
  });
});
