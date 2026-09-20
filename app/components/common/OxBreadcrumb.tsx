import { useMemo } from 'react';
import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Breadcrumb as BreadcrumbItem, Page } from '@salla.sa/twilight-theme-engine/types';

export interface OxBreadcrumbProps {
  page: Page;
  className?: string;
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

export function OxBreadcrumb({ page, className }: OxBreadcrumbProps) {
  const { t } = useTranslation();

  const patched = useMemo<Page>(() => {
    const existing = page.breadcrumbs;

    // A trail the route loader supplied. It is kept, but every entry is
    // checked: the loader labels its home crumb from the platform bundle too,
    // so the key arrives here already unresolved rather than being produced
    // downstream. Only entries that still LOOK like a lookup key are touched.
    if (existing && existing.length > 0) {
      if (!existing.some((item) => isUnresolvedKey(item.name))) return page;
      return {
        ...page,
        breadcrumbs: existing.map((item) =>
          isUnresolvedKey(item.name) ? { ...item, name: t(item.name) } : item
        ),
      };
    }

    // No trail at all: build the engine's own fallback shape, home first.
    const trail: BreadcrumbItem[] = [{ name: t('common.titles.home'), url: '/' }];
    if (page.parent) trail.push({ name: page.parent.name, url: page.parent.url });
    if (page.title) trail.push({ name: page.title, url: page.url ?? '' });

    return { ...page, breadcrumbs: trail };
  }, [page, t]);

  return <Breadcrumb page={patched} className={className} />;
}

export default OxBreadcrumb;
