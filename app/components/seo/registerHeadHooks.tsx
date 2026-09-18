import { hookRegistry, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
import type { Store } from '@salla.sa/twilight-theme-engine/types';
import { currentUrl, tryOriginOf } from './head';
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

/** schema.org openingHours line, e.g. "Sa-Th 16:00-23:00". Free text is dropped. */
const OPENING_HOURS = /^(Mo|Tu|We|Th|Fr|Sa|Su)(-(Mo|Tu|We|Th|Fr|Sa|Su))? \d\d:\d\d-\d\d:\d\d$/;

/**
 * Branch facts from the theme settings (twilight.json: branch_address,
 * branch_hours, whatsapp_number). Geo and structured hours arrive with the
 * branch content map (B5); until then only schema-shaped hours lines pass.
 */
export function branchFromSettings(
  settings: Record<string, unknown> | undefined,
  locale: string
): BranchInfo {
  const hours = (localized(settings?.branch_hours, locale) ?? '')
    .split(String.fromCharCode(10))
    .map((line) => line.trim())
    .filter((line) => OPENING_HOURS.test(line));
  return {
    address: localized(settings?.branch_address, locale),
    hours: hours.length ? hours : undefined,
    phone: localized(settings?.whatsapp_number, locale),
  };
}

/**
 * Site-wide Organization + WebSite + LocalBusiness JSON-LD, built from the
 * store and theme settings in the hook context. Returns null when the store
 * or its URL is missing or malformed, so a bad payload degrades to "no
 * JSON-LD" instead of a render error.
 */
export function siteJsonLd(
  store: Store | undefined,
  locale: string,
  settings?: Record<string, unknown>
): string | null {
  const origin = tryOriginOf(store?.url);
  if (!store || !origin) return null;
  const prefix = store.settings?.is_multilingual ? locale : null;
  const doc = graph(
    organization({ store, sameAs: socialLinks(store) }),
    website({ store, searchUrl: currentUrl(origin, prefix, '/search') }),
    localBusiness({ store, branch: branchFromSettings(settings, locale) })
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
      const json = siteJsonLd(twilight?.store, twilight?.locale ?? 'ar', settings);
      if (!json) return null;
      return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
    },
    50
  );
}
