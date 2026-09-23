import { hookRegistry, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
import type { Store } from '@salla.sa/twilight-theme-engine/types';
import { currentUrl, tryOriginOf } from './head';
import {
  BRANCH_GEO,
  BRANCH_LISTING,
  parseBranchHours,
  toSchemaOpeningHours,
} from '../../content/branch';
import {
  graph,
  localBusiness,
  organization,
  toScriptText,
  website,
  type BranchInfo,
} from './jsonld';

/** Social profile URLs the store exposes, for Organization.sameAs. */
function socialLinks(store: Store): string[] {
  const social = store.social ?? {};
  return [
    social.instagram,
    social.twitter,
    social.snapchat,
    social.tiktok,
    social.youtube,
    social.facebook,
    social.pinterest,
    social.maroof,
  ].filter((value): value is string => typeof value === 'string' && value.length > 0);
}

/** A theme setting value: plain string, or `{ar, en}` when multilanguage. */
function localized(value: unknown, locale: string): string | undefined {
  if (typeof value === 'string') return value.trim() || undefined;
  if (value && typeof value === 'object') {
    const map = value as Record<string, unknown>;
    const pick = map[locale] ?? map.ar ?? Object.values(map)[0];
    return typeof pick === 'string' && pick.trim() ? pick.trim() : undefined;
  }
  return undefined;
}

/** The branch city and region, published with the address (FINAL-content 5). */
const BRANCH_LOCALITY = 'ox.branch.locality';
const BRANCH_REGION = 'ox.branch.region';
/**
 * The street line for the site-wide `#localbusiness` node when the merchant
 * has not filled `branch_address` yet (FINAL-claims-source.md:7: street شارع
 * جبار بن صخر, حي الخالدية, المدينة المنورة). This is a structured-data-only
 * fallback: the visible branch page still prints nothing without the setting
 * (`content/branch.ts`), because a shopper reading the page needs the
 * merchant's own words, but a search engine reading the graph is better served
 * by the one claims-backed address the audit already verified than by no
 * address at all.
 */
const BRANCH_STREET_FALLBACK = 'ox.seo.branch.street';

/**
 * Branch facts for the one `#localbusiness` node the site graph declares
 * (twilight.json: branch_address, branch_hours, branch_map_url,
 * whatsapp_number; coordinates from `content/branch.ts`).
 *
 * Opening hours go through the same parser the visible hours table uses
 * (`parseBranchHours` then `toSchemaOpeningHours`), so the table and the
 * structured data can never disagree: a line the table refuses to print is a
 * line the graph does not publish either. A store whose `branch_hours` is
 * empty publishes no `openingHours` at all rather than a default.
 *
 * The geo point is the branch's published coordinate pair from the claims
 * source, and it is emitted only alongside a real address: a pin with no
 * street is a pin a shopper cannot use. The address itself falls back to the
 * claims-backed street line above when the merchant setting is empty, so the
 * geo point (a fixed constant, not a setting) is no longer gated on a setting
 * that starts empty on every fresh install.
 *
 * `mapUrl` (-> `hasMap`, VISIT-2026-09-24 §4.6) prefers the merchant's own
 * `google_place_url`, then `branch_map_url`, then falls back to
 * `BRANCH_LISTING.listingUrl` — the same audited, public Google Business
 * Profile URL `BranchMap.tsx` falls back to for its own "open in Google
 * Maps" link, so a fresh install still publishes one real, checkable map
 * link rather than none.
 */
export function branchFromSettings(
  settings: Record<string, unknown> | undefined,
  locale: string,
  t?: (key: string) => string
): BranchInfo {
  const label = (key: string): string | undefined => {
    const value = t?.(key);
    return value && value !== key ? value : undefined;
  };
  const address = localized(settings?.branch_address, locale) ?? label(BRANCH_STREET_FALLBACK);
  const hours = toSchemaOpeningHours(parseBranchHours(localized(settings?.branch_hours, locale)));
  return {
    address,
    locality: address ? label(BRANCH_LOCALITY) : undefined,
    region: address ? label(BRANCH_REGION) : undefined,
    hours: hours.length ? hours : undefined,
    phone: localized(settings?.whatsapp_number, locale),
    mapUrl:
      localized(settings?.google_place_url, locale) ??
      localized(settings?.branch_map_url, locale) ??
      BRANCH_LISTING.listingUrl,
    geo: address ? BRANCH_GEO : undefined,
  };
}

/** The store's Latin brand form (keywords-ar.md §7.1 conventions), for `alternateName`. */
const BRAND_ALT_NAME = 'ox.seo.brand.alt_name';

/**
 * Site-wide Organization + WebSite + LocalBusiness JSON-LD, built from the
 * store and theme settings in the hook context. Returns null when the store
 * or its URL is missing or malformed, so a bad payload degrades to "no
 * JSON-LD" instead of a render error.
 */
export function siteJsonLd(
  store: Store | undefined,
  locale: string,
  settings?: Record<string, unknown>,
  t?: (key: string) => string
): string | null {
  const origin = tryOriginOf(store?.url);
  if (!store || !origin) return null;
  const prefix = store.settings?.is_multilingual ? locale : null;
  const placeUrl = localized(settings?.google_place_url, locale);
  const alternateName = t?.(BRAND_ALT_NAME);
  const doc = graph(
    organization({
      store,
      alternateName: alternateName && alternateName !== BRAND_ALT_NAME ? alternateName : undefined,
      sameAs: [...socialLinks(store), placeUrl],
    }),
    website({ store, searchUrl: currentUrl(origin, prefix, '/search') }),
    localBusiness({ store, branch: branchFromSettings(settings, locale, t) })
  );
  return toScriptText(doc);
}

/**
 * Registers the `head:end` handler that emits the site-wide JSON-LD on every
 * route. The slot is rendered by the engine's WidgetHead with `ssr`, so the
 * script is in the server HTML. `head:end` is registered by its raw string
 * name (the engine's home-page slots are string-only; keeping one convention).
 * Called once from app/router.tsx, next to registerThemeHooks().
 */
export function registerHeadHooks() {
  hookRegistry.register(
    'head:end',
    (context: HookContext) => {
      const twilight = context.twilight;
      const settings = twilight?.theme?.settings as unknown as Record<string, unknown> | undefined;
      const translate = twilight?.i18n ? (key: string) => String(twilight.i18n.t(key)) : undefined;
      const json = siteJsonLd(twilight?.store, twilight?.locale ?? 'ar', settings, translate);
      if (!json) return null;
      return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
    },
    50
  );
}
