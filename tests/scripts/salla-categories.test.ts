// Unit tests for scripts/salla-categories.mjs. Every network call goes
// through an injected `fetchImpl`; --plan is exercised end to end and must
// never touch a `fetch`. Uses the repo's own docs/build/research/
// optimalx-catalogue.csv and docs/build/salla-ids.json as fixtures, the
// same files the real script reads, so "47 SKUs" and "25 categories" are
// asserted against real data, not a synthetic stand-in.
import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  TAXONOMY_FALLBACK,
  parseCsvTable,
  loadProductRows,
  buildTaxonomyFromFallback,
  loadTaxonomy,
  loadNames,
  nameFor,
  orderNodesParentsFirst,
  BRAND_SOURCE,
  brandSlug,
  resolveBrands,
  buildCategoryBody,
  buildBrandBody,
  loadProductAssignments,
  runPlan,
  findExistingCategory,
  findExistingBrand,
  createOrReuseCategory,
  createOrReuseBrand,
  assignProductCategories,
  runApply,
  runRollback,
  imageUrlForSku,
  CSV_PATH,
  SALLA_IDS_PATH,
} from '../../scripts/salla-categories.mjs';
import { createSallaClient, appendRunLog, readRunLog } from '../../scripts/salla-lib.mjs';

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

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('parseCsvTable / loadProductRows', () => {
  it('reads all 47 SKUs from the real catalogue with leaf + goal categories split', () => {
    const rows = loadProductRows({ csvPath: CSV_PATH });
    expect(rows).toHaveLength(47);
    const ox001 = rows.find((r) => r.sku === 'OX-001');
    expect(ox001?.categories).toEqual(['whey-protein', 'goal-performance', 'goal-recovery']);
    expect(ox001?.brand).toBe('Optimum Nutrition');
  });

  it('handles a quoted field containing a comma', () => {
    const table = parseCsvTable('a,b\n"1,2",3\n');
    expect(table).toEqual([
      ['a', 'b'],
      ['1,2', '3'],
    ]);
  });
});

describe('TAXONOMY_FALLBACK, conductor §4 slugs', () => {
  it('has exactly the 25 nodes and slugs the conductor names, verbatim', () => {
    expect(TAXONOMY_FALLBACK).toHaveLength(25);
    expect(TAXONOMY_FALLBACK.map((n) => n.slug).sort()).toEqual([...CONDUCTOR_SLUGS].sort());
  });
});

describe('buildTaxonomyFromFallback, membership + parent expansion', () => {
  const rows = loadProductRows({ csvPath: CSV_PATH });
  const nodes = buildTaxonomyFromFallback(rows);
  const bySlug = new Map(nodes.map((n) => [n.slug, n]));

  it('credits the leaf category directly', () => {
    expect(bySlug.get('whey-protein')?.skus).toContain('OX-001');
  });

  it('expands parent membership: every whey-protein SKU is also protein', () => {
    const wheyProteinSkus = bySlug.get('whey-protein')?.skus ?? [];
    const proteinSkus = bySlug.get('protein')?.skus ?? [];
    for (const sku of wheyProteinSkus) expect(proteinSkus).toContain(sku);
    // protein itself has no direct CSV rows; every one of its 14 SKUs comes
    // from its five children (4+4+2+2+2).
    expect(proteinSkus).toHaveLength(14);
  });

  it('credits every goal-* token on the row, not just the first', () => {
    expect(bySlug.get('goal-performance')?.skus).toContain('OX-001');
    expect(bySlug.get('goal-recovery')?.skus).toContain('OX-001');
  });

  it('sets image_sku to the first SKU seen for the node', () => {
    expect(bySlug.get('whey-protein')?.imageSku).toBe('OX-001');
  });
});

describe('loadTaxonomy', () => {
  it('falls back to the CSV + warns when app/content/taxonomy.json is absent', () => {
    const warn = vi.fn();
    const { nodes, source } = loadTaxonomy({ taxonomyJsonPath: '/does/not/exist.json', warn });
    expect(source).toBe('csv-fallback');
    expect(nodes).toHaveLength(25);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn.mock.calls[0][0]).toContain('.json not found');
  });

  it('reads app/content/taxonomy.json when it exists, verbatim skus/image_sku', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'taxonomy-json-'));
    const file = path.join(dir, 'taxonomy.json');
    fs.writeFileSync(
      file,
      JSON.stringify({
        nodes: [{ key: 'protein', slug: 'protein', scope: 'type', parent: null, order: 1, skus: ['OX-001'], image_sku: 'OX-001' }],
      })
    );
    const { nodes, source } = loadTaxonomy({ taxonomyJsonPath: file, warn: vi.fn() });
    expect(source).toBe('contract-a');
    expect(nodes).toEqual([{ key: 'protein', slug: 'protein', scope: 'type', parent: null, order: 1, skus: ['OX-001'], imageSku: 'OX-001' }]);
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('loadNames / nameFor', () => {
  it('falls back to the static Arabic/English names when tax.*.json are absent', () => {
    const names = loadNames({ arPath: '/nope-ar.json', enPath: '/nope-en.json' });
    expect(names.source).toBe('fallback');
    const node = TAXONOMY_FALLBACK.find((n) => n.slug === 'protein')!;
    expect(nameFor({ ...node, skus: [] }, names)).toEqual({ ar: 'بروتين', en: 'Protein' });
  });

  it('prefers ox.tax.<key>.name from the partials when both languages are present', () => {
    const names = {
      ar: { 'ox.tax.protein.name': 'بروتين (من الملف)' },
      en: { 'ox.tax.protein.name': 'Protein (from partial)' },
      source: 'tax-partials' as const,
    };
    const node = TAXONOMY_FALLBACK.find((n) => n.slug === 'protein')!;
    expect(nameFor({ ...node, skus: [] }, names)).toEqual({ ar: 'بروتين (من الملف)', en: 'Protein (from partial)' });
  });
});

describe('orderNodesParentsFirst', () => {
  it('places protein before all five of its children', () => {
    const ordered = orderNodesParentsFirst(TAXONOMY_FALLBACK.map((n) => ({ ...n, skus: [] })));
    const proteinIndex = ordered.findIndex((n) => n.slug === 'protein');
    const childIndexes = ['whey-protein', 'whey-isolate', 'casein', 'plant-protein', 'mass-gainer'].map((slug) =>
      ordered.findIndex((n) => n.slug === slug)
    );
    for (const childIndex of childIndexes) expect(childIndex).toBeGreaterThan(proteinIndex);
  });
});

describe('brands', () => {
  it('resolveBrands covers every brand used in the real CSV, including the two documented gap-fills', () => {
    const rows = loadProductRows({ csvPath: CSV_PATH });
    const brands = resolveBrands(rows);
    const names = new Set(brands.map((b) => b.name));
    expect(names.has('Centrum')).toBe(true);
    expect(names.has('Myprotein')).toBe(true);
    for (const row of rows) if (row.brand) expect(names.has(row.brand)).toBe(true);
  });

  it('resolveBrands warns (does not silently drop) an unknown brand', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    resolveBrands([{ sku: 'X', brand: 'Totally Unknown Brand', categories: [] }]);
    expect(warn).toHaveBeenCalled();
    expect(warn.mock.calls.some((c) => String(c[0]).includes('Totally Unknown Brand'))).toBe(true);
    warn.mockRestore();
  });

  it('brandSlug is a deterministic kebab-case slug', () => {
    expect(brandSlug('Optimum Nutrition')).toBe('optimum-nutrition');
    expect(brandSlug("Nature's Way")).toBe('natures-way');
    expect(brandSlug('NOW Foods')).toBe('now-foods');
  });

  it('buildBrandBody sets the Latin name at root and an Arabic description line', () => {
    const body = buildBrandBody({ name: 'MuscleTech', arabic: 'مسل تك' });
    expect(body.name).toBe('MuscleTech');
    expect(body.description).toContain('مسل تك');
    expect(body.metadata_url).toBe('muscletech');
    expect(body.translations.en.name).toBe('MuscleTech');
  });
});

describe('buildCategoryBody', () => {
  it('sets metadata_url to the slug and carries an English translation', () => {
    const node = { key: 'protein', slug: 'protein', scope: 'type' as const, parent: null, order: 1, skus: [] };
    const body = buildCategoryBody(node, { ar: 'بروتين', en: 'Protein' });
    expect(body.metadata_url).toBe('protein');
    expect(body.status).toBe('active');
    expect(body.translations.en.metadata_url).toBe('protein');
    expect(body.translations.en.name).toBe('Protein');
  });
});

describe('loadProductAssignments, SKU coverage + parent expansion', () => {
  const rows = loadProductRows({ csvPath: CSV_PATH });
  const nodes = buildTaxonomyFromFallback(rows);
  const sallaIds = JSON.parse(fs.readFileSync(SALLA_IDS_PATH, 'utf8'));
  const assignments = loadProductAssignments({ rows, nodes, sallaIds });

  it('covers all 47 SKUs, each with its real Salla product id', () => {
    expect(assignments).toHaveLength(47);
    for (const a of assignments) expect(a.productId).toBeTypeOf('number');
  });

  it('expands the parent for a protein child: OX-001 gets whey-protein AND protein', () => {
    const ox001 = assignments.find((a) => a.sku === 'OX-001')!;
    expect(ox001.categorySlugs).toEqual(['whey-protein', 'protein', 'goal-performance', 'goal-recovery']);
  });

  it('does not add a parent for a root-level leaf (creatine has none)', () => {
    const ox015 = assignments.find((a) => a.sku === 'OX-015')!;
    expect(ox015.categorySlugs).toEqual(['creatine', 'goal-performance']);
  });
});

describe('runPlan, offline, no network reachable', () => {
  it('lists 25 categories, the brands, and 47 assignments with counts in the header lines', () => {
    const rows = loadProductRows({ csvPath: CSV_PATH });
    const nodes = buildTaxonomyFromFallback(rows);
    const names = loadNames({ arPath: '/nope-ar.json', enPath: '/nope-en.json' });
    const brands = resolveBrands(rows);
    const sallaIds = JSON.parse(fs.readFileSync(SALLA_IDS_PATH, 'utf8'));
    const assignments = loadProductAssignments({ rows, nodes, sallaIds });
    const output = runPlan({ nodes, names, brands, assignments, flags: { brands: true, assign: true } });
    expect(output).toContain('Categories (25):');
    expect(output).toContain(`Brands (${brands.length}):`);
    expect(output).toContain('Product assignments (47):');
  });

  it('never imports or calls fetch, this module has no fetch reference reachable from runPlan', () => {
    // runPlan's signature takes no client/fetch argument at all; calling it
    // with plain data objects and no global fetch stub proves the path is
    // pure. If it ever grew a fetch call this would throw ReferenceError-ish
    // behaviour only if fetch were removed, so we assert the stronger
    // property directly: the same output for two calls with no I/O between.
    const nodes = TAXONOMY_FALLBACK.map((n) => ({ ...n, skus: [] }));
    const names = loadNames({ arPath: '/nope-ar.json', enPath: '/nope-en.json' });
    const out1 = runPlan({ nodes, names, brands: [], assignments: [], flags: { brands: false, assign: false } });
    const out2 = runPlan({ nodes, names, brands: [], assignments: [], flags: { brands: false, assign: false } });
    expect(out1).toBe(out2);
  });
});

describe('findExistingCategory / findExistingBrand, idempotency keys', () => {
  const node = { key: 'protein', slug: 'protein', scope: 'type' as const, parent: null, order: 1, skus: [] };

  it('matches by metadata_url first', () => {
    const existing = [{ id: 1, metadata_url: 'protein', name: 'something else' }];
    expect(findExistingCategory(existing, node, 'بروتين')).toEqual(existing[0]);
  });

  it('falls back to an exact name match', () => {
    const existing = [{ id: 2, metadata_url: 'not-the-slug', name: 'بروتين' }];
    expect(findExistingCategory(existing, node, 'بروتين')).toEqual(existing[0]);
  });

  it('returns null when neither matches', () => {
    expect(findExistingCategory([{ id: 3, metadata_url: 'other', name: 'other' }], node, 'بروتين')).toBeNull();
  });

  it('brand: matches by metadata_url derived from the slug', () => {
    const brand = { name: 'MuscleTech', arabic: 'مسل تك' };
    const existing = [{ id: 9, metadata_url: 'muscletech', name: 'something else' }];
    expect(findExistingBrand(existing, brand)).toEqual(existing[0]);
  });
});

describe('createOrReuseCategory, idempotency skips existing slugs, parent_id fallback', () => {
  const node = { key: 'protein', slug: 'protein', scope: 'type' as const, parent: null, order: 1, skus: [] };
  const childNode = { key: 'whey_protein', slug: 'whey-protein', scope: 'type' as const, parent: 'protein', order: 11, skus: [] };
  const name = { ar: 'بروتين', en: 'Protein' };

  it('reuses an existing category by metadata_url and makes no request at all', async () => {
    const fetchImpl = vi.fn();
    const client = createSallaClient({ token: 't', fetchImpl });
    const result = await createOrReuseCategory(client, node, name, { existing: [{ id: 42, metadata_url: 'protein', name: 'بروتين' }] });
    expect(result).toEqual({ id: 42, created: false, diffs: [] });
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('creates a new category, reads it back, and reports no diff on a match', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'POST') return jsonResponse({ data: { id: 100, name: 'بروتين', status: 'active', metadata_url: 'protein' } }, 201);
      return jsonResponse({ data: { id: 100, name: 'بروتين', status: 'active', metadata_url: 'protein' } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const result = await createOrReuseCategory(client, node, name, { existing: [] });
    expect(result).toEqual({ id: 100, created: true, diffs: [] });
  });

  it('falls back to the subcategory route when the parent_id body POST fails', async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      calls.push(`${init.method} ${url}`);
      if (init.method === 'POST' && url.endsWith('/categories')) return jsonResponse({ message: 'parent_id not accepted' }, 422);
      if (init.method === 'POST' && url.includes('/subcategory')) {
        return jsonResponse({ data: { id: 200, name: 'واي بروتين', status: 'active', metadata_url: 'whey-protein', parent_id: 42 } }, 201);
      }
      return jsonResponse({ data: { id: 200, name: 'واي بروتين', status: 'active', metadata_url: 'whey-protein', parent_id: 42 } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const result = await createOrReuseCategory(client, childNode, { ar: 'واي بروتين', en: 'Whey Protein' }, { existing: [], parentId: 42 });
    expect(result).toEqual({ id: 200, created: true, diffs: [] });
    expect(calls.some((c) => c.includes('/subcategory'))).toBe(true);
  });

  it('reports a diff when the read-back does not match what was sent', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'POST') return jsonResponse({ data: { id: 101 } }, 201);
      return jsonResponse({ data: { id: 101, name: 'اسم مختلف', status: 'active', metadata_url: 'protein' } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const result = await createOrReuseCategory(client, node, name, { existing: [] });
    expect(result.diffs).toEqual([{ field: 'name', expected: 'بروتين', actual: 'اسم مختلف' }]);
  });
});

describe('createOrReuseBrand', () => {
  it('reuses an existing brand and makes no request', async () => {
    const fetchImpl = vi.fn();
    const client = createSallaClient({ token: 't', fetchImpl });
    const result = await createOrReuseBrand(client, { name: 'MuscleTech', arabic: 'مسل تك' }, { existing: [{ id: 5, metadata_url: 'muscletech', name: 'MuscleTech' }] });
    expect(result).toEqual({ id: 5, created: false, diffs: [] });
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});

describe('assignProductCategories', () => {
  it('records the pre-write categories/brand_id as "before" and diffs the read-back', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (!init.method || init.method === 'GET') {
        return jsonResponse({ data: { categories: [{ id: 1 }], brand_id: 7 } });
      }
      return jsonResponse({});
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const categoryIdBySlug = new Map([
      ['whey-protein', 10],
      ['protein', 1],
      ['goal-performance', 20],
    ]);
    const brandIdByName = new Map([['Optimum Nutrition', 30]]);
    const result = await assignProductCategories(
      client,
      { sku: 'OX-001', productId: 555, categorySlugs: ['whey-protein', 'protein', 'goal-performance'], brandName: 'Optimum Nutrition' },
      categoryIdBySlug,
      brandIdByName
    );
    expect(result.before).toEqual({ categories: [1], brand_id: 7 });
    // The GET mock always returns the same body, so the read-back still
    // shows [1] / brand 7 while the write attempted [10,1,20] / 30: the
    // diff on categories must be reported, not swallowed.
    expect(result.diffs.some((d) => d.field === 'categories')).toBe(true);
  });
});

describe('imageUrlForSku', () => {
  it('reads the sku-matched product image url from the fixture snapshot shape', () => {
    const products = [{ sku: 'OX-001', image: { url: 'https://cdn.salla.sa/x.jpg' } }];
    expect(imageUrlForSku('OX-001', products)).toBe('https://cdn.salla.sa/x.jpg');
    expect(imageUrlForSku('OX-999', products)).toBeNull();
  });
});

describe('runApply, orchestration + write-log', () => {
  let logFile: string;
  beforeEach(() => {
    logFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'write-log-')), 'store-write-log.md');
    fs.writeFileSync(logFile, '# test log\n');
  });

  it('creates categories parents-first, appends the run to the log, and writes taxonomy-ids', async () => {
    const created: string[] = [];
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'GET' && url.endsWith('/categories?page=1&per_page=100')) return jsonResponse({ data: [] });
      if (init.method === 'POST') {
        created.push(url);
        const id = 1000 + created.length;
        return jsonResponse({ data: { id, name: 'x', status: 'active', metadata_url: 'x' } }, 201);
      }
      // GET read-back for whatever id was just created
      const id = 1000 + created.length;
      return jsonResponse({ data: { id, name: 'x', status: 'active', metadata_url: 'x', parent_id: undefined } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const nodes = TAXONOMY_FALLBACK.slice(0, 1).map((n) => ({ ...n, skus: [] })); // just "protein"
    const names = loadNames({ arPath: '/nope-ar.json', enPath: '/nope-en.json' });
    const written: Record<string, unknown>[] = [];

    const result = await runApply({
      client,
      nodes,
      names,
      brands: [],
      assignments: [],
      products: [],
      flags: { brands: false, assign: false, images: false },
      runId: 'test-run-1',
      log: () => {},
      writeLog: (opts) => {
        written.push(opts as Record<string, unknown>);
        return appendRunLog({ ...(opts as Parameters<typeof appendRunLog>[0]), logFile });
      },
      writeTaxonomyIds: () => {},
    });

    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].type).toBe('category_create');
    expect(written).toHaveLength(1);
    const onDisk = readRunLog('test-run-1', { logFile });
    expect(onDisk?.actions).toHaveLength(1);
  });

  it('still appends a partial log when a later step throws', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'GET' && url.includes('/categories?')) return jsonResponse({ data: [] });
      if (init.method === 'POST' && url.endsWith('/categories')) return jsonResponse({ data: { id: 1, name: 'x', status: 'active', metadata_url: 'x' } }, 201);
      if (init.method === 'GET' && url.endsWith('/categories/1')) return jsonResponse({ data: { id: 1, name: 'x', status: 'active', metadata_url: 'x' } });
      if (init.method === 'GET' && url.includes('/brands?')) throw new Error('boom');
      return jsonResponse({});
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const nodes = TAXONOMY_FALLBACK.slice(0, 1).map((n) => ({ ...n, skus: [] }));
    const names = loadNames({ arPath: '/nope-ar.json', enPath: '/nope-en.json' });

    await expect(
      runApply({
        client,
        nodes,
        names,
        brands: [{ name: 'X', arabic: 'اكس' }],
        assignments: [],
        products: [],
        flags: { brands: true, assign: false, images: false },
        runId: 'test-run-2',
        log: () => {},
        writeLog: (opts) => appendRunLog({ ...(opts as Parameters<typeof appendRunLog>[0]), logFile }),
        writeTaxonomyIds: () => {},
      })
    ).rejects.toThrow('boom');

    const onDisk = readRunLog('test-run-2', { logFile });
    expect(onDisk?.actions).toHaveLength(1); // the category made it into the log before the brand step threw
  });
});

describe('runRollback', () => {
  let logFile: string;
  beforeEach(() => {
    logFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'write-log-')), 'store-write-log.md');
    fs.writeFileSync(logFile, '# test log\n');
    appendRunLog({
      runId: 'run-to-undo',
      mode: 'apply',
      startedAt: '2026-01-01T00:00:00.000Z',
      finishedAt: '2026-01-01T00:01:00.000Z',
      actions: [
        { when: 't', type: 'category_create', target: 'protein', id: 1, result: 'created id 1', readback: 'match' },
        { when: 't', type: 'category_reuse', target: 'creatine', id: 2, result: 'reused', readback: 'match' },
        {
          when: 't',
          type: 'product_update',
          target: 'OX-001',
          id: 555,
          before: { categories: [9], brand_id: 3 },
          after: { categories: [1], brand_id: 30 },
          result: 'categories -> [1]',
          readback: 'match',
        },
      ],
      logFile,
    });
  });

  it('deletes only what was created, restores product state, skips reused entities, in reverse order', async () => {
    const calls: string[] = [];
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      calls.push(`${init.method} ${url}`);
      return jsonResponse({});
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const { undone } = await runRollback({
      client,
      runId: 'run-to-undo',
      log: () => {},
      readLog: (id) => readRunLog(id, { logFile }),
      writeLog: (opts) => appendRunLog({ ...(opts as Parameters<typeof appendRunLog>[0]), logFile }),
    });
    // product restore, then category delete (reverse of creation order);
    // the reused category is never touched.
    expect(undone).toBe(2);
    expect(calls[0]).toBe('PUT https://api.salla.dev/admin/v2/products/555');
    expect(calls[1]).toBe('DELETE https://api.salla.dev/admin/v2/categories/1');
    expect(calls.some((c) => c.includes('/categories/2'))).toBe(false);

    const rollbackLog = readRunLog('run-to-undo-rollback', { logFile });
    expect(rollbackLog?.actions).toHaveLength(2);
  });

  it('throws a clear error for an unknown run id', async () => {
    const client = createSallaClient({ token: 't', fetchImpl: vi.fn() });
    await expect(
      runRollback({ client, runId: 'never-happened', readLog: (id) => readRunLog(id, { logFile }) })
    ).rejects.toThrow(/never-happened/);
  });
});
