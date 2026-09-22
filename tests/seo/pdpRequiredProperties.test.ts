import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * PLAN-ship-2026-09-21.md §2 Batch S3 step 3: "assert Product has name,
 * image, description, offers.price/priceCurrency/availability with
 * OutOfStock for is_out_of_stock; strip AggregateRating when
 * rating.count === 0." The Product node itself is the engine's
 * (`Product.head`, dist/routes/product.js); this is the build-time audit
 * over every shipped PDP fixture rather than a second implementation of the
 * engine's own builder.
 */

const FIXTURE_DIR = path.join('tests', 'fixtures', 'jsonld');
const PDP_FIXTURES = [
  'b3-product.json',
  'b3-food.json',
  'b3-bundle.json',
  'b3-digital.json',
  'b3-giftcard.json',
  'b3-service.json',
];

function productNodeOf(fixture: string): Record<string, unknown> {
  const doc = JSON.parse(fs.readFileSync(path.join(FIXTURE_DIR, fixture), 'utf8'));
  const nodes = doc['@graph'] as Record<string, unknown>[];
  const product = nodes.find((node) => node['@type'] === 'Product');
  expect(product, `${fixture} has a Product node`).toBeDefined();
  return product as Record<string, unknown>;
}

describe('PDP Product node required properties', () => {
  for (const fixture of PDP_FIXTURES) {
    it(`${fixture}: Product carries name, image, description and a priced, available Offer`, () => {
      const product = productNodeOf(fixture);
      expect(typeof product.name, 'name').toBe('string');
      expect(product.name).not.toBe('');
      expect(product.image, 'image').toBeDefined();
      expect(typeof product.description, 'description').toBe('string');
      expect(product.description).not.toBe('');
      const offers = product.offers as Record<string, unknown>;
      expect(offers, 'offers').toBeDefined();
      expect(typeof offers.price, 'offers.price').toBe('number');
      expect(offers.priceCurrency, 'offers.priceCurrency').toBe('SAR');
      expect(['https://schema.org/InStock', 'https://schema.org/OutOfStock']).toContain(
        offers.availability
      );
    });

    it(`${fixture}: never carries an AggregateRating (no rating.count > 0 fixture exists yet)`, () => {
      const product = productNodeOf(fixture);
      expect(product.aggregateRating).toBeUndefined();
    });
  }
});
