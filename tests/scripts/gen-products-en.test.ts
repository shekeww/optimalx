// Unit tests for scripts/gen-products-en.mjs, reads
// docs/build/research/optimalx-catalogue.csv, gates each twin the same way
// check-copy.mjs / check-claims.mjs gate the locale files, and builds the
// overlay object scripts/serve-store.mjs serves for `accept-language: en`.
// Uses the repo's own CSV (the same file the real script reads) for the
// "47 SKUs, 43 clean twins" assertions, plus synthetic fixtures for the
// gate's own behaviour.
import { describe, expect, it } from 'vitest';
import { loadTwinsFromCsv, gateTwin, buildOverlay, CSV_PATH } from '../../scripts/gen-products-en.mjs';

describe('loadTwinsFromCsv \u2014 the real catalogue', () => {
  it('reads all 47 SKUs, every one carrying a complete English twin', () => {
    const twins = loadTwinsFromCsv({ csvPath: CSV_PATH });
    expect(twins.size).toBe(47);
    const ox001 = twins.get('OX-001');
    expect(ox001?.name).toBe('Gold Standard 100% Whey Protein - Optimum Nutrition');
    expect(ox001?.subtitle).toContain('whey protein');
    expect(ox001?.description).toContain('<p>');
  });
});

describe('gateTwin', () => {
  it('passes a clean twin with no findings', () => {
    expect(
      gateTwin({ sku: 'OX-TEST', name: 'Whey Protein', subtitle: '24 g protein per scoop', description: '<p>Suits daily training.</p>' })
    ).toEqual([]);
  });

  it('flags an em dash (check-copy.mjs rule, language-independent)', () => {
    const problems = gateTwin({ sku: 'OX-TEST', name: 'Whey \u2014 Protein', subtitle: 'x', description: 'x' });
    expect(problems.some((p) => p.includes('[copy:em-dash]'))).toBe(true);
  });

  it('flags an unearned superlative via the check-claims.mjs gate', () => {
    const problems = gateTwin({ sku: 'OX-TEST', name: 'x', subtitle: 'x', description: 'One of the best-selling items in Saudi Arabia.' });
    expect(problems.some((p) => p.includes('[claims:superlative]'))).toBe(true);
  });

  it('flags a banned health/outcome claim the claims-source explicitly names in English', () => {
    const problems = gateTwin({ sku: 'OX-TEST', name: 'x', subtitle: 'x', description: 'Clinically proven to work faster.' });
    expect(problems.some((p) => p.includes('[claim:banned-word]'))).toBe(true);
  });

  it('the real catalogue: exactly the four SKUs citing a third-party best-seller ranking are gated', () => {
    const twins = loadTwinsFromCsv({ csvPath: CSV_PATH });
    const gated = [...twins.values()].filter((twin) => gateTwin(twin).length > 0).map((twin) => twin.sku);
    expect(gated.sort()).toEqual(['OX-021', 'OX-023', 'OX-026', 'OX-035']);
  });
});

describe('buildOverlay', () => {
  const twins = new Map([
    ['OX-001', { sku: 'OX-001', name: 'Whey Protein', subtitle: '24 g protein', description: '<p>Clean.</p>' }],
    ['OX-002', { sku: 'OX-002', name: 'x', subtitle: 'x', description: 'One of the best-selling items.' }],
  ]);
  const details = {
    '101': { id: 101, sku: 'OX-001' },
    '102': { id: 102, sku: 'OX-002' },
    '103': { id: 103, sku: 'OX-003' }, // no CSV twin at all
  };

  it('writes only clean, twinned products into the overlay, keyed by numeric id', () => {
    const { overlay, missing, excluded } = buildOverlay({ details, twins });
    expect(Object.keys(overlay)).toEqual(['101']);
    expect(overlay['101']).toEqual({ name: 'Whey Protein', subtitle: '24 g protein', description: '<p>Clean.</p>' });
    expect(missing).toEqual(['OX-003']);
    expect(excluded).toHaveLength(1);
    expect(excluded[0].sku).toBe('OX-002');
    expect(excluded[0].problems[0]).toContain('[claims:superlative]');
  });

  it('never invents an entry for a product with no CSV twin or a gated twin', () => {
    const { overlay } = buildOverlay({ details, twins });
    expect(overlay['102']).toBeUndefined();
    expect(overlay['103']).toBeUndefined();
  });
});
