import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect, vi } from 'vitest';
import type { Store } from '@salla.sa/twilight-theme-engine/types';

// The hook registry lives in `@salla.sa/twilight-theme-engine/hooks`, which
// re-exports the whole CDN component package; a jsdom run cannot resolve it
// and none of these assertions touch the registry.
vi.mock('@salla.sa/twilight-theme-engine/hooks', () => ({
  hookRegistry: { register: () => {} },
}));

const { branchFromSettings, siteJsonLd } = await import(
  '../../app/components/seo/registerHeadHooks'
);
import { findDuplicateKeys } from '../../scripts/check-jsonld.mjs';
import { BRANCH_GEO } from '../../app/content/branch';
import { createT } from '../helpers/i18n';

const t = createT('ar');

const store = {
  name: 'اوبتيمال اكس',
  url: 'https://optimalx.sa',
  logo: 'https://cdn.salla.sa/logo.png',
  contacts: { phone: '0500000000', email: 'hi@optimalx.sa' },
  social: { instagram: 'https://instagram.com/optimalx' },
  country: 'SA',
  settings: { is_multilingual: true },
} as unknown as Store;

const HOURS = ['الأحد إلى الخميس: 16:00 - 23:00', 'الجمعة: 16:00 - 23:00'].join('\n');
const SETTINGS = {
  branch_address: 'حي الخالدية، شارع جبار بن صخر',
  branch_hours: HOURS,
  branch_map_url: 'https://maps.example/branch',
  whatsapp_number: '0500000000',
};

describe('branchFromSettings', () => {
  it('parses the merchant hours through the same parser the table uses', () => {
    const branch = branchFromSettings(SETTINGS, 'ar', t);
    expect(branch.hours).toEqual(['Su-Th 16:00-23:00', 'Fr 16:00-23:00']);
  });

  it('publishes the geo point and the locality only alongside a real address', () => {
    const withAddress = branchFromSettings(SETTINGS, 'ar', t);
    expect(withAddress.geo).toEqual(BRANCH_GEO);
    expect(withAddress.locality).toBe(t('ox.branch.locality'));
    expect(withAddress.region).toBe(t('ox.branch.region'));
  });

  it('falls back to the claims-backed street address when the merchant has not set one', () => {
    const fallback = branchFromSettings({}, 'ar', t);
    expect(fallback.address).toBe(t('ox.seo.branch.street'));
    expect(fallback.geo).toEqual(BRANCH_GEO);
    expect(fallback.locality).toBe(t('ox.branch.locality'));
  });

  it('publishes no address, geo or locality without a translator to resolve the fallback', () => {
    const without = branchFromSettings({}, 'ar');
    expect(without.address).toBeUndefined();
    expect(without.geo).toBeUndefined();
    expect(without.locality).toBeUndefined();
  });

  it('publishes no openingHours when the setting is empty or unparsable', () => {
    expect(branchFromSettings({ branch_address: 'x' }, 'ar', t).hours).toBeUndefined();
    expect(
      branchFromSettings({ branch_address: 'x', branch_hours: 'نفتح كل يوم' }, 'ar', t).hours
    ).toBeUndefined();
  });

  it('leaves the locality out when no translator is given', () => {
    expect(branchFromSettings(SETTINGS, 'ar').locality).toBeUndefined();
  });
});

describe('siteJsonLd', () => {
  it('declares Organization, WebSite and Store once each with distinct ids', () => {
    const text = siteJsonLd(store, 'ar', SETTINGS, t);
    expect(text).not.toBeNull();
    const doc = JSON.parse(
      (text as string).replaceAll('\\u003c', '<').replaceAll('\\u003e', '>').replaceAll('\\u0026', '&')
    );
    const nodes = doc['@graph'] as Array<Record<string, string>>;
    expect(nodes.map((node) => node['@type'])).toEqual(['Organization', 'WebSite', 'Store']);
    const ids = nodes.map((node) => node['@id']);
    expect(new Set(ids).size).toBe(3);
    expect(ids).toEqual([
      'https://optimalx.sa/#organization',
      'https://optimalx.sa/#website',
      'https://optimalx.sa/#localbusiness',
    ]);
  });

  it('carries the branch geo and hours on the Store node', () => {
    const doc = JSON.parse(siteJsonLd(store, 'ar', SETTINGS, t) as string);
    const local = (doc['@graph'] as Array<Record<string, unknown>>)[2];
    expect(local.geo).toEqual({
      '@type': 'GeoCoordinates',
      latitude: BRANCH_GEO.latitude,
      longitude: BRANCH_GEO.longitude,
    });
    expect(local.openingHours).toEqual(['Su-Th 16:00-23:00', 'Fr 16:00-23:00']);
    expect(local.hasMap).toBe('https://maps.example/branch');
  });

  it('prefers google_place_url over branch_map_url for hasMap and sameAs', () => {
    const withPlace = { ...SETTINGS, google_place_url: 'https://maps.google.com/place/1' };
    const doc = JSON.parse(siteJsonLd(store, 'ar', withPlace, t) as string);
    const [organization, , local] = doc['@graph'] as Array<Record<string, unknown>>;
    expect(local.hasMap).toBe('https://maps.google.com/place/1');
    expect(organization.sameAs).toContain('https://maps.google.com/place/1');
  });

  it('gives the Organization node an alternateName, areaServed and contactPoint', () => {
    const doc = JSON.parse(siteJsonLd(store, 'ar', SETTINGS, t) as string);
    const organization = (doc['@graph'] as Array<Record<string, unknown>>)[0];
    expect(organization.alternateName).toBe(t('ox.seo.brand.alt_name'));
    expect(organization.areaServed).toBe('SA');
    expect(organization.contactPoint).toEqual({
      '@type': 'ContactPoint',
      telephone: '0500000000',
      email: 'hi@optimalx.sa',
      contactType: 'customer service',
      areaServed: 'SA',
    });
  });

  it('escapes every character that could close the script tag', () => {
    const text = siteJsonLd({ ...store, name: '</script><img>' } as Store, 'ar', SETTINGS, t);
    expect(text).not.toBeNull();
    expect(text).not.toContain('<');
    expect(text).not.toContain('>');
  });

  it('returns null rather than a broken document for a missing or malformed store', () => {
    expect(siteJsonLd(undefined, 'ar', SETTINGS, t)).toBeNull();
    expect(siteJsonLd({ ...store, url: 'not a url' } as Store, 'ar', SETTINGS, t)).toBeNull();
  });

  it('matches the committed fixture, which check:jsonld also scans', () => {
    const file = path.join('tests', 'fixtures', 'jsonld', 'b5-site-branch.json');
    const raw = fs.readFileSync(file, 'utf8');
    expect(findDuplicateKeys(raw)).toEqual([]);
    const fixture = JSON.parse(raw);
    const built = JSON.parse(siteJsonLd(store, 'ar', SETTINGS, t) as string);
    expect(built).toEqual(fixture);
  });
});
