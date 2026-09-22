import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import {
  build,
  readInputs,
  renderFiles,
  ID_BASE,
  OVERLAY_DIR,
} from '../../scripts/gen-taxonomy-fixture.mjs';
import { TAXONOMY, childrenOf, nodeBySlug } from '../../app/content/taxonomy';

/**
 * The offline preview's taxonomy overlay (PLAN-ship Batch S1 step 7): what
 * `scripts/gen-taxonomy-fixture.mjs` derives from the taxonomy, the fixture
 * products and the Arabic names, and that the files checked in under
 * fixtures/store/overlay/ are what it would write today.
 */

const input = readInputs();
const { categories, menus, membership } = build(input);
const flat = (() => {
  const out: Array<Record<string, unknown> & { sub_categories: unknown[] }> = [];
  const walk = (list: typeof categories) => {
    for (const item of list) {
      out.push(item);
      walk(item.sub_categories);
    }
  };
  walk(categories);
  return out;
})();

describe('gen-taxonomy-fixture', () => {
  it('writes the 25 nodes as 20 roots with protein carrying its five children', () => {
    expect(categories).toHaveLength(20);
    expect(flat).toHaveLength(25);
    const protein = categories.find((c) => c.id === ID_BASE + 1)!;
    expect(protein.sub_categories.map((c: { url: string }) => c.url)).toEqual(
      childrenOf('protein').map((node) => `${input.storeUrl}/${node.slug}/c${ID_BASE + node.order}`)
    );
  });

  it('gives every node id 9000 + order, both id forms, and a store-origin url', () => {
    for (const node of TAXONOMY) {
      const category = flat.find((c) => c.id === ID_BASE + node.order);
      expect(category, node.slug).toBeDefined();
      expect(category!.id_).toBe(ID_BASE + node.order);
      expect(category!.url).toBe(`${input.storeUrl}/${node.slug}/c${ID_BASE + node.order}`);
      expect(String(category!.url).startsWith('https://')).toBe(true);
    }
  });

  it('names each category from the tax partial and counts only products the fixture has', () => {
    for (const node of TAXONOMY) {
      const category = flat.find((c) => c.id === ID_BASE + node.order)!;
      expect(category.name).toBe(input.names[`ox.tax.${node.key}.name`]);
      const ids = membership[String(ID_BASE + node.order)];
      expect(category.products_count).toBe(ids.length);
      expect(ids.length).toBeLessThanOrEqual(node.skus.length);
    }
    // Every fixture product that carries a taxonomy SKU is assigned somewhere.
    const skus = new Set(input.products.map((p) => p.sku));
    const protein = nodeBySlug('protein')!;
    expect(membership[String(ID_BASE + protein.order)]).toHaveLength(
      protein.skus.filter((sku) => skus.has(sku)).length
    );
  });

  it('takes the image from the image_sku product, and none when the node names no image', () => {
    const bySku = new Map(input.products.map((p) => [p.sku, p]));
    for (const node of TAXONOMY) {
      const category = flat.find((c) => c.id === ID_BASE + node.order)!;
      const expected = node.imageSku ? (bySku.get(node.imageSku)?.image?.url ?? null) : null;
      expect(category.image, node.slug).toBe(expected);
    }
    expect(categories.find((c) => c.id === ID_BASE + 1)!.image).toMatch(/^https:\/\/cdn\.salla\.sa\//);
  });

  it('mirrors the tree as a header menu, protein expandable', () => {
    expect(menus.header).toHaveLength(20);
    expect(menus.footer).toEqual([]);
    const protein = menus.header[0];
    expect(protein.has_children).toBe(true);
    expect(protein.children).toHaveLength(5);
    expect(protein.url).toBe(`${input.storeUrl}/protein/c${ID_BASE + 1}`);
  });

  it('matches the files checked in under fixtures/store/overlay', () => {
    const files = renderFiles(input);
    for (const [name, output] of Object.entries(files)) {
      const target = path.join(OVERLAY_DIR, name);
      expect(fs.existsSync(target), target).toBe(true);
      expect(fs.readFileSync(target, 'utf8'), `${target} is stale; run node scripts/gen-taxonomy-fixture.mjs`).toBe(output);
    }
  });
});
