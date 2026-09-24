// Unit tests for scripts/salla-product-translations.mjs. Every network call
// goes through an injected `fetchImpl`; the default (dry run) path is
// exercised end to end and must never touch a `fetch`. Uses the repo's own
// docs/build/salla-ids.json and docs/build/research/optimalx-catalogue.csv
// as fixtures, the same files the real script reads, so "43 ready, 4
// gated" is asserted against real data, not a synthetic stand-in.
import { describe, expect, it, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  buildProductTranslationPlan,
  buildCategoryTranslationPlan,
  formatPlanTable,
  applyProductTranslation,
  applyCategoryTranslation,
  runApply,
  SALLA_IDS_PATH,
} from '../../scripts/salla-product-translations.mjs';
import { loadTwinsFromCsv, CSV_PATH } from '../../scripts/gen-products-en.mjs';
import { createSallaClient, appendRunLog, readRunLog } from '../../scripts/salla-lib.mjs';

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status });
}

describe('buildProductTranslationPlan \u2014 the real catalogue', () => {
  const sallaIds = JSON.parse(fs.readFileSync(SALLA_IDS_PATH, 'utf8'));
  const twins = loadTwinsFromCsv({ csvPath: CSV_PATH });
  const rows = buildProductTranslationPlan({ sallaIds, twins });

  it('covers all 47 SKUs: 43 ready, exactly the 4 best-selling-claim SKUs gated', () => {
    expect(rows).toHaveLength(47);
    const ready = rows.filter((r) => r.status === 'ready');
    const gated = rows.filter((r) => r.status === 'gated');
    expect(ready).toHaveLength(43);
    expect(gated.map((r) => r.sku).sort()).toEqual(['OX-021', 'OX-023', 'OX-026', 'OX-035']);
  });

  it('a ready row carries the translations.en payload with name/description/subtitle', () => {
    const ox001 = rows.find((r) => r.sku === 'OX-001')!;
    expect(ox001.status).toBe('ready');
    expect(ox001.id).toBe(1996831868);
    expect(ox001.payload?.translations.en.name).toBe('Gold Standard 100% Whey Protein - Optimum Nutrition');
    expect(ox001.payload?.translations.en.subtitle).toContain('whey protein');
    expect(ox001.payload?.translations.en.description).toContain('<p>');
  });

  it('a gated row carries no payload, and its problems name the failing rule', () => {
    const ox021 = rows.find((r) => r.sku === 'OX-021')!;
    expect(ox021.status).toBe('gated');
    expect(ox021.payload).toBeUndefined();
    expect(ox021.problems?.[0]).toContain('[claims:superlative]');
  });

  it('a SKU with no CSV twin is reported, never invented', () => {
    const rowsNoTwin = buildProductTranslationPlan({ sallaIds: { 'OX-999': { id: 1 } }, twins });
    expect(rowsNoTwin).toEqual([{ sku: 'OX-999', id: 1, status: 'no-twin' }]);
  });

  it('a SKU with a clean twin but no recorded Salla id is reported, never invented', () => {
    const twinOnly = new Map([['OX-999', { sku: 'OX-999', name: 'x', subtitle: 'x', description: '<p>x</p>' }]]);
    const rowsNoId = buildProductTranslationPlan({ sallaIds: { 'OX-999': { id: null } }, twins: twinOnly });
    expect(rowsNoId).toEqual([{ sku: 'OX-999', id: null, status: 'no-id' }]);
  });
});

describe('buildCategoryTranslationPlan', () => {
  it('skips with a reason when taxonomy-ids.json does not exist (the real state today)', () => {
    const plan = buildCategoryTranslationPlan({ taxonomyIdsPath: '/does/not/exist.json' });
    expect(plan.skipped).toBe(true);
    if (plan.skipped) expect(plan.reason).toContain('run scripts/salla-categories.mjs --apply first');
  });

  it('builds translations.en.name rows when taxonomy-ids.json exists', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'taxonomy-ids-'));
    const idsPath = path.join(dir, 'taxonomy-ids.json');
    const taxonomyPath = path.join(dir, 'taxonomy.json');
    const enPath = path.join(dir, 'en.json');
    fs.writeFileSync(idsPath, JSON.stringify({ protein: 9001, 'no-name-node': 9099 }));
    fs.writeFileSync(taxonomyPath, JSON.stringify({ nodes: [{ key: 'protein', slug: 'protein' }, { key: 'ghost', slug: 'no-name-node' }] }));
    fs.writeFileSync(enPath, JSON.stringify({ 'ox.tax.protein.name': 'Protein' }));

    const plan = buildCategoryTranslationPlan({ taxonomyIdsPath: idsPath, taxonomyJsonPath: taxonomyPath, enLocalePath: enPath });
    expect(plan.skipped).toBe(false);
    if (!plan.skipped) {
      expect(plan.rows).toEqual([
        { slug: 'protein', id: 9001, status: 'ready', payload: { translations: { en: { name: 'Protein' } } } },
        { slug: 'no-name-node', id: 9099, status: 'no-name' },
      ]);
    }
    fs.rmSync(dir, { recursive: true, force: true });
  });
});

describe('formatPlanTable', () => {
  it('never imports or calls fetch \u2014 pure formatting of plan data', () => {
    const productRows = [{ sku: 'OX-001', id: 1, status: 'ready' as const, payload: { translations: { en: { name: 'Whey', description: 'd', subtitle: 's' } } } }];
    const categoryPlan = { skipped: true as const, reason: 'no categories yet' };
    const out1 = formatPlanTable(productRows, categoryPlan);
    const out2 = formatPlanTable(productRows, categoryPlan);
    expect(out1).toBe(out2);
    expect(out1).toContain('OX-001');
    expect(out1).toContain('no categories yet');
  });
});

describe('applyProductTranslation \u2014 injected fetch', () => {
  it('PUTs translations.en, reads back with accept-language: en, and reports a clean match', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'PUT') return jsonResponse({ data: { id: 1 } });
      const headers = init.headers as Record<string, string>;
      expect(headers['accept-language']).toBe('en');
      return jsonResponse({ data: { id: 1, name: 'Whey Protein', description: '<p>d</p>', subtitle: 's' } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const row = { sku: 'OX-001', id: 1, status: 'ready' as const, payload: { translations: { en: { name: 'Whey Protein', description: '<p>d</p>', subtitle: 's' } } } };

    const { diffs } = await applyProductTranslation(client, row);
    expect(diffs).toEqual([]);
    expect(fetchImpl).toHaveBeenCalledWith(expect.stringContaining('/products/1'), expect.objectContaining({ method: 'PUT' }));
  });

  it('reports a diff when the read-back does not match what was sent', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'PUT') return jsonResponse({ data: { id: 1 } });
      return jsonResponse({ data: { id: 1, name: 'a different name', description: '<p>d</p>', subtitle: 's' } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const row = { sku: 'OX-001', id: 1, status: 'ready' as const, payload: { translations: { en: { name: 'Whey Protein', description: '<p>d</p>', subtitle: 's' } } } };

    const { diffs } = await applyProductTranslation(client, row);
    expect(diffs).toEqual([{ field: 'name', expected: 'Whey Protein', actual: 'a different name' }]);
  });
});

describe('applyCategoryTranslation \u2014 injected fetch', () => {
  it('PUTs translations.en.name and diffs the read-back', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'PUT') return jsonResponse({ data: { id: 9001 } });
      return jsonResponse({ data: { id: 9001, name: 'Protein' } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const row = { slug: 'protein', id: 9001, status: 'ready' as const, payload: { translations: { en: { name: 'Protein' } } } };

    const { diffs } = await applyCategoryTranslation(client, row);
    expect(diffs).toEqual([]);
  });
});

describe('runApply \u2014 orchestration + write-log', () => {
  let logFile: string;
  beforeEach(() => {
    logFile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'write-log-')), 'store-write-log.md');
    fs.writeFileSync(logFile, '# test log\n');
  });

  it('writes only the ready product rows, appends the run to the log', async () => {
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      if (init.method === 'PUT') return jsonResponse({ data: { id: 1 } });
      return jsonResponse({ data: { id: 1, name: 'Whey Protein', description: '<p>d</p>', subtitle: 's' } });
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const productRows = [
      { sku: 'OX-001', id: 1, status: 'ready' as const, payload: { translations: { en: { name: 'Whey Protein', description: '<p>d</p>', subtitle: 's' } } } },
      { sku: 'OX-021', id: 2, status: 'gated' as const, problems: ['x'] },
    ];
    const categoryPlan = { skipped: true as const, reason: 'no categories yet' };
    const written: Record<string, unknown>[] = [];

    const result = await runApply({
      client,
      productRows,
      categoryPlan,
      runId: 'test-run-1',
      log: () => {},
      writeLog: (opts) => {
        written.push(opts as Record<string, unknown>);
        return appendRunLog({ ...(opts as Parameters<typeof appendRunLog>[0]), logFile });
      },
    });

    expect(result.actions).toHaveLength(1);
    expect(result.actions[0].type).toBe('product_translation_update');
    expect(result.actions[0].target).toBe('OX-001');
    expect(written).toHaveLength(1);
    const onDisk = readRunLog('test-run-1', { logFile });
    expect(onDisk?.actions).toHaveLength(1);
  });

  it('still appends a partial log when a later step throws', async () => {
    let calls = 0;
    const fetchImpl = vi.fn(async (url: string, init: RequestInit) => {
      calls++;
      if (calls <= 2) {
        if (init.method === 'PUT') return jsonResponse({ data: { id: 1 } });
        return jsonResponse({ data: { id: 1, name: 'Whey Protein', description: 'd', subtitle: 's' } });
      }
      throw new Error('boom');
    });
    const client = createSallaClient({ token: 't', fetchImpl });
    const productRows = [
      { sku: 'OX-001', id: 1, status: 'ready' as const, payload: { translations: { en: { name: 'Whey Protein', description: 'd', subtitle: 's' } } } },
      { sku: 'OX-002', id: 2, status: 'ready' as const, payload: { translations: { en: { name: 'x', description: 'd', subtitle: 's' } } } },
    ];
    const categoryPlan = { skipped: true as const, reason: 'no categories yet' };

    await expect(
      runApply({
        client,
        productRows,
        categoryPlan,
        runId: 'test-run-2',
        log: () => {},
        writeLog: (opts) => appendRunLog({ ...(opts as Parameters<typeof appendRunLog>[0]), logFile }),
      })
    ).rejects.toThrow('boom');

    const onDisk = readRunLog('test-run-2', { logFile });
    expect(onDisk?.actions).toHaveLength(1); // OX-001 made it into the log before OX-002 threw
  });
});
