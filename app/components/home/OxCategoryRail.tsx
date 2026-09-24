import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { SectionHeader } from '../common/SectionHeader';
import { OxProductCard } from '../product/OxProductCard';
import { isBundleProduct } from '../product/lib/productType';
import { useTaxonomyLinks } from '../listing/useTaxonomyLinks';
import { useRailProgress } from '../common/hooks/useRailProgress';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { nodeBySlug } from '../../content/taxonomy';
import { fieldList, fieldText, rowText, type OxBlockData, type OxBlockProps } from './defaults';

/** `products?source=categories&source_value[]=<id>&per_page=8` (S2e brief). */
export const RAIL_PER_PAGE = 8;
/** Below this the row reads as an apology rather than a shelf, so it hides instead. */
const MIN_PRODUCTS = 2;
/**
 * The number of 300px cards a 1024 container (960px) fits three of with the
 * 16px gap (932px used of 960), where `SectionHeader`'s own `actions` slot
 * first shows the arrows, and the step every press moves (owner brief
 * 2026-09-23 late night, item 1: every carousel adopts the shared rail
 * primitive, same STEP_AT_DESKTOP convention `OxBrands`/`FeaturedRail` use).
 */
const STEP_AT_DESKTOP = 3;

interface RailTarget {
  id: number;
  label: string;
  to: string;
}

/**
 * The merchant's own `category` field: one real category row, straight off
 * the `source: categories` picker, `id` included - the same shape
 * `OxProducts.resolveSource` already reads a numeric id off a selected row
 * with (PLAN-final C1 precedent).
 */
function selectedTarget(data: OxBlockData): RailTarget | undefined {
  const row = fieldList(data, 'category')[0];
  if (!row || typeof row !== 'object') return undefined;
  const id = (row as { id?: unknown }).id;
  if (typeof id !== 'number') return undefined;
  const label = rowText(row, 'name');
  const to = rowText(row, 'url');
  if (!label || !to) return undefined;
  return { id, label, to };
}

/**
 * A product rail per root category (S2e, 2026-09-22: "create all categories
 * sections needed in homepage"). One registered block, `home.ox-category-rail`,
 * drawn once per `HOME_TYPE_SLUGS` root in the default composition
 * (`DEFAULT_HOME_COMPONENTS`'s own docblock in defaults.ts) plus however many
 * more a merchant adds through the dashboard field.
 *
 * TARGET RESOLUTION, in order: the merchant's own `category` selection first
 * (a real row, id included, straight off the API); otherwise the instance's
 * own `rootSlug` (defaults.ts's internal signal, not a manifest field),
 * resolved through `useTaxonomyLinks` - the SAME loader-fed, SSR-consistent
 * resolution the header, `OxGoals` and `OxCategories` already share, so a
 * rail never asks the catalogue for a category id the server has not already
 * resolved. Neither resolving is the honest "nothing to show here yet": the
 * section renders null, and its `ox-category-rail` row reserves 0
 * (`optionalBlocks.test.ts`).
 *
 * HIDDEN, ALSO, under two products: a rail of one is not a shelf, and a
 * category whose whole catalogue is one item reads better folded into the
 * type grid's own tile than repeated here.
 *
 * The scroller is the shared rail primitive (`_rail.scss`), not the
 * Swiper-backed `ProductsSliderWrapper` every non-home rail on the theme
 * uses: the brief asks for `scroll-snap-type: x mandatory`, the existing
 * `OxProductCard` specifically, and (owner review 2026-09-23 late night, item
 * 1) no native scrollbar, the accent chevron cue and the progress strap
 * every carousel now carries. Keyboard reachability comes free from the
 * cards' own focusable elements - a browser scrolls a focused descendant into
 * view natively, so no `tabindex` belongs on the scroller itself.
 */
export function OxCategoryRail({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const taxonomy = useTaxonomyLinks();
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLUListElement>(null);
  const railRef = useRailProgress(trackRef);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [startIndex, setStartIndex] = useState(0);

  const target = useMemo<RailTarget | undefined>(() => {
    const merchant = selectedTarget(data);
    if (merchant) return merchant;
    const rootSlug = typeof data.rootSlug === 'string' ? data.rootSlug : undefined;
    if (!rootSlug) return undefined;
    const link = taxonomy.bySlug(rootSlug);
    if (!link || link.id === undefined) return undefined;
    const node = nodeBySlug(rootSlug);
    return { id: link.id, label: node ? t(node.nameKey) : link.label, to: link.to };
  }, [data, taxonomy, t]);

  const { data: items } = useQuery({
    queryKey: ['ox', 'category-rail', target?.id ?? null],
    queryFn: async (): Promise<Product[]> => {
      if (!target) return [];
      const result = await product.list({
        source: 'categories',
        sourceValue: [target.id],
        perPage: RAIL_PER_PAGE,
      });
      // A real bundle is not a product on a category shelf (S9d).
      return result.items.filter((item) => !isBundleProduct(item));
    },
    enabled: target !== undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!target) return null;
  const products = items ?? [];
  if (products.length < MIN_PRODUCTS) return null;

  const title = fieldText(data, 'title') || target.label;
  const maxStart = Math.max(0, products.length - STEP_AT_DESKTOP);
  const showNav = products.length > STEP_AT_DESKTOP;

  const goTo = (nextStart: number) => {
    const clamped = Math.min(Math.max(nextStart, 0), maxStart);
    setStartIndex(clamped);
    itemRefs.current[clamped]?.scrollIntoView({
      inline: 'start',
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="ox-cat-rail" data-testid="ox-category-rail">
      <div className="ox-container">
        <SectionHeader
          title={title}
          viewAll={{ to: target.to }}
          actions={
            showNav ? (
              <div className="ox-cat-rail__nav">
                <button
                  type="button"
                  className="ox-cat-rail__arrow"
                  onClick={() => goTo(startIndex - STEP_AT_DESKTOP)}
                  disabled={startIndex === 0}
                  aria-label={t('ox.listing.featured_prev')}
                >
                  <span className="ox-cat-rail__arrow-face ox-iconbtn--angled" aria-hidden="true">
                    <Icon name="chevron-start" size={16} />

                  </span>

                </button>

                <button
                  type="button"
                  className="ox-cat-rail__arrow ox-cat-rail__arrow--next"
                  onClick={() => goTo(startIndex + STEP_AT_DESKTOP)}
                  disabled={startIndex >= maxStart}
                  aria-label={t('ox.listing.featured_next')}
                >
                  <span className="ox-cat-rail__arrow-face ox-iconbtn--angled" aria-hidden="true">
                    <Icon name="chevron-end" size={16} />

                  </span>

                </button>

              </div>

            ) : undefined
          }
        />

        {/* The shared rail primitive (`_rail.scss`): no native scrollbar, the
            accent chevron cue at the reading end, and the progress strap
            under the row. */}
        <div className="ox-rail ox-cat-rail__rail" ref={railRef}>
          <ul
            className="ox-rail__track ox-cat-rail__scroller"
            ref={trackRef}
            role="list"
            aria-roledescription={t('ox.listing.featured_carousel_role')}
          >
            {products.map((item, index) => (
              <li
                key={item.id ?? index}
                className="ox-cat-rail__item"
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                aria-roledescription={t('ox.listing.featured_slide_role')}
                aria-label={t('ox.listing.featured_slide_label', {
                  index: index + 1,
                  total: products.length,
                })}
              >
                <OxProductCard product={item} index={index} />

              </li>

            ))}
          </ul>

          <button
            type="button"
            className="ox-rail__cue"
            onClick={() => goTo(startIndex + STEP_AT_DESKTOP)}
            aria-label={t('ox.listing.featured_next')}
          >
            <span className="ox-rail__cue-arm" aria-hidden="true" />
            <span className="ox-rail__cue-arm ox-rail__cue-arm--down" aria-hidden="true" />
          </button>

          <div className="ox-rail__progress" />
        </div>

      </div>

    </section>

  );
}
