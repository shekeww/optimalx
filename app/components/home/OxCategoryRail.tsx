import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { OxProductCard } from '../product/OxProductCard';
import { useTaxonomyLinks } from '../listing/useTaxonomyLinks';
import { nodeBySlug } from '../../content/taxonomy';
import { fieldList, fieldText, rowText, type OxBlockData, type OxBlockProps } from './defaults';

/** `products?source=categories&source_value[]=<id>&per_page=8` (S2e brief). */
export const RAIL_PER_PAGE = 8;
/** Below this the row reads as an apology rather than a shelf, so it hides instead. */
const MIN_PRODUCTS = 2;

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
 * The scroller is a plain `overflow-x: auto` list, not the Swiper-backed
 * `ProductsSliderWrapper` every other rail on the theme uses: the brief asks
 * for `scroll-snap-type: x mandatory` and the existing `OxProductCard`
 * specifically, not the engine's own card. Keyboard reachability comes free
 * from the cards' own focusable elements - a browser scrolls a focused
 * descendant into view natively, so no `tabindex` belongs on the scroller
 * itself - and reduced motion is the default: nothing here ever sets
 * `scroll-behavior: smooth`, so there is no motion to gate.
 */
export function OxCategoryRail({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const taxonomy = useTaxonomyLinks();

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
      return result.items;
    },
    enabled: target !== undefined,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  if (!target) return null;
  const products = items ?? [];
  if (products.length < MIN_PRODUCTS) return null;

  const title = fieldText(data, 'title') || target.label;

  return (
    <section className="ox-cat-rail" data-testid="ox-category-rail">
      <div className="ox-container">
        <SectionHeader title={title} viewAll={{ to: target.to }} />
        <ul className="ox-cat-rail__scroller" role="list">
          {products.map((item, index) => (
            <li key={item.id ?? index} className="ox-cat-rail__item">
              <OxProductCard product={item} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
