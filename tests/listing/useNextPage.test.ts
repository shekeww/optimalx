import { describe, it, expect, vi } from 'vitest';

vi.mock('@salla.sa/twilight-theme-engine/api/product', () => ({
  product: { list: vi.fn() },
}));

const { cursorOf } = await import('../../app/components/listing/useNextPage');

/**
 * The API returns the next page either as an opaque token or as a full URL
 * carrying `?cursor=`; the engine's own loader handles both
 * (dist/routes/product-listing.js:329-343) and so must ours, or load-more
 * silently refetches page one.
 */
describe('cursorOf', () => {
  it('reads the cursor out of a next-page url and decodes it', () => {
    expect(cursorOf('https://api.salla.sa/products?source=latest&cursor=abc%3D%3D')).toBe('abc==');
  });

  it('reads it when it is the first query parameter', () => {
    expect(cursorOf('/products?cursor=page-2&source=latest')).toBe('page-2');
  });

  it('passes an opaque token through unchanged', () => {
    expect(cursorOf('eyJwYWdlIjoyfQ')).toBe('eyJwYWdlIjoyfQ');
  });

  it('is undefined at the end of the list', () => {
    expect(cursorOf(null)).toBeUndefined();
    expect(cursorOf(undefined)).toBeUndefined();
    expect(cursorOf('')).toBeUndefined();
  });
});
