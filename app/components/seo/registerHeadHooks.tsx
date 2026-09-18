import { hookRegistry, type HookContext } from '@salla.sa/twilight-theme-engine/hooks';
import type { Store } from '@salla.sa/twilight-theme-engine/types';
import { currentUrl, tryOriginOf } from './head';
import { graph, organization, toScriptText, website } from './jsonld';

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

/**
 * Site-wide Organization + WebSite JSON-LD, built from the store in the hook
 * context. Returns null when the store or its URL is missing or malformed, so
 * a bad payload degrades to "no JSON-LD" instead of a render error.
 */
export function siteJsonLd(store: Store | undefined, locale: string): string | null {
  const origin = tryOriginOf(store?.url);
  if (!store || !origin) return null;
  const prefix = store.settings?.is_multilingual ? locale : null;
  const doc = graph(
    organization({ store, sameAs: socialLinks(store) }),
    website({ store, searchUrl: currentUrl(origin, prefix, '/search') })
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
      const json = siteJsonLd(context.twilight?.store, context.twilight?.locale ?? 'ar');
      if (!json) return null;
      return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
    },
    50
  );
}
