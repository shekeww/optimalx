import { useMemo } from 'react';
import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Breadcrumb as BreadcrumbItem, Page } from '@salla.sa/twilight-theme-engine/types';
import { toInternalPath } from '../layout/navLinks';
import { resolvedLabel } from '../seo/head';

export interface OxBreadcrumbProps {
  page: Page;
  className?: string;
  /**
   * The trail this page knows to be true, replacing whatever the engine
   * inferred. The product page passes the product's OWN taxonomy here: the
   * engine's fallback second crumb is `page.parent`, which it fills with the
   * LAST PAGE THE VISITOR VISITED, so the same shaker read `الطاقة` at 1440
   * and `مكملات غذائية في المدينة المنورة: فرع الخالدية` at 390, both linking
   * to the shaker itself (UX-2026-09-24 P0-6).
   */
  trail?: BreadcrumbItem[];
}

/**
 * The engine's breadcrumb, with a home crumb that is actually translated.
 *
 * THE BUG THIS EXISTS FOR. When a route does not supply `page.breadcrumbs`,
 * the engine's `useBreadcrumbs` builds a fallback trail and labels its first
 * entry from the PLATFORM string bundle, which Salla serves from its own CDN
 * rather than from the theme. Any render where that bundle has not resolved
 * prints the lookup key instead of a word, so the product page's trail read
 *
 *     common.titles.home > مكملات الصحة العامة > حزمة البداية
 *
 * and, worse, the key went into `itemprop="name"` of the BreadcrumbList
 * microdata, so the structured data asserted that the store's home page is
 * called "common.titles.home".
 *
 * The theme already defines `common.titles.home` in its own dictionary, so the
 * fix is to stop depending on the platform bundle for this one label: build
 * the same trail the engine's fallback builds, and translate the first entry
 * here where the key resolves.
 *
 * A route that supplies its own `breadcrumbs` keeps them: that trail was built
 * by a loader with more context than this component has. But its entries are
 * still checked, because the loader labels ITS home crumb from the same
 * platform bundle, so the key arrives here already unresolved rather than
 * being produced further down. Only a label that still looks like a lookup key
 * is rewritten.
 */
/**
 * Whether a label is still an i18n lookup key rather than a word.
 *
 * Deliberately narrow: dotted lowercase ASCII segments and nothing else. Every
 * real label on this store is Arabic, and no Arabic string can match, so this
 * cannot rewrite a genuine name. An English label like "Home" has no dot and
 * does not match either.
 */
function isUnresolvedKey(name: string): boolean {
  return /^[a-z][a-z0-9_]*(\.[a-z0-9_]+)+$/.test(name.trim());
}

/** Two URLs that point at the same page, origin and trailing slash aside. */
function sameDestination(a: string, b: string): boolean {
  const normalize = (url: string) => {
    const path = toInternalPath(url).replace(/[?#].*$/, '');
    const bare = path.replace(/\/+$/, '');
    return (bare === '' ? '/' : bare).toLowerCase();
  };
  return normalize(a) === normalize(b);
}

export function OxBreadcrumb({ page, className, trail }: OxBreadcrumbProps) {
  const { t } = useTranslation();

  const patched = useMemo<Page>(() => {
    const existing = trail && trail.length > 0 ? trail : page.breadcrumbs;

    // A trail the route or the loader supplied. It is kept, but every entry
    // is checked twice. Its labels: the loader labels its home crumb from the
    // platform bundle, so the key arrives here already unresolved rather than
    // being produced downstream. And its urls: a crumb that points at the
    // page the visitor is already on is not a way back, it is a reload
    // wearing a parent's name, so it is dropped before it can ship (P0-6).
    if (existing && existing.length > 0) {
      const here = page.url;
      const kept = existing.filter(
        (item, index) =>
          index === existing.length - 1 || !here || !item.url || !sameDestination(item.url, here)
      );
      if (!kept.some((item) => isUnresolvedKey(item.name)) && kept.length === existing.length) {
        return trail ? { ...page, breadcrumbs: kept } : page;
      }
      return {
        ...page,
        breadcrumbs: kept.map((item) =>
          isUnresolvedKey(item.name) ? { ...item, name: resolvedLabel(item.name, t) } : item
        ),
      };
    }

    // No trail at all: build the engine's own fallback shape, home first.
    const fallback: BreadcrumbItem[] = [{ name: resolvedLabel('common.titles.home', t), url: '/' }];
    if (page.parent && (!page.url || !sameDestination(page.parent.url, page.url))) {
      fallback.push({ name: resolvedLabel(page.parent.name, t), url: page.parent.url });
    }
    // The page's own title is a lookup key on several engine routes
    // (`common.titles.brands` on /brands, measured live): the last crumb is
    // resolved exactly like the first, or the key ships both on screen and
    // inside `itemprop="name"` of the BreadcrumbList microdata.
    if (page.title) fallback.push({ name: resolvedLabel(page.title, t), url: page.url ?? '' });

    return { ...page, breadcrumbs: fallback };
  }, [page, t, trail]);

  return <Breadcrumb page={patched} className={className} />;
}

export default OxBreadcrumb;
