import { useMemo } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { useTaxonomyLinks, type TaxonomyLinks } from '../listing/useTaxonomyLinks';
import { matchesSlug, searchFallback } from '../listing/resolve';
import { CATEGORIES, HOME_TYPE_SLUGS, HOME_TILE_TONES } from '../../content/categories';
import { nodeBySlug } from '../../content/taxonomy';
import type { OxIconName } from '../common/Icon';
import { CategoryTile, type CategoryTileTone } from './CategoryTile';
import { useSectionReveal } from './useSectionReveal';
import { fieldList, rowText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * "Browse by type" (owner restyle 2026-09-22, reverting the "shop by need"
 * merge back into two separate sections: `OxGoals`' dark photo cards stay as
 * they were, and this is the OTHER one, the type grid).
 *
 * Source order, unchanged from before the merge: the merchant's own
 * selection first (the `categories` field is a `source: categories`
 * multichoice), then the eight type roots below, resolved through
 * `useTaxonomyLinks` - the SAME loader-fed resolution the header and
 * `OxGoals` use, so the server HTML already carries the real category URL,
 * count and image and a visitor never sees a hydration flip from a search
 * fallback to a live link.
 *
 * Eight tiles, all coloured (S2b's pastel run, `_b2-home.scss`'s
 * `--ox-need-tint-*`): the four categories that already carried a shaker
 * tone before this restyle (protein, creatine, vitamins-minerals,
 * collagen-beauty) plus the four the owner named for their own tint
 * (pre-workout, amino-acids, omega-3, daily-health). `collagen-beauty` keeps
 * the black emphasis card.
 */

export const DEFAULT_TILE_COUNT = 8;

/** A merchant selection is clamped to a full row: 4, 8 or 12 (the manifest field's own floor and ceiling). */
function fullRowCount(requested: number): number {
  if (requested >= 12) return 12;
  if (requested >= 8) return 8;
  return 4;
}

/**
 * The tint run, one per default tile, in tile order - `HOME_TILE_TONES`
 * (`content/categories.ts`), shared with `/categories`' own type cards so a
 * slug never carries two different colours on two pages.
 */
const TYPE_TONE = HOME_TILE_TONES as Record<string, CategoryTileTone>;

/** `cardLineKey`, by slug: the claims-clean list of product types the shelf stocks. */
const TYPE_LINE_KEY: Record<string, string> = Object.fromEntries(
  CATEGORIES.filter((entry) => entry.cardLineKey).map((entry) => [entry.slug, entry.cardLineKey as string])
);

interface TileVM {
  slug: string;
  tone: CategoryTileTone;
  icon: OxIconName;
  label: string;
  line: string;
  to: string;
  count?: number;
  image?: string;
  /** `CategoryContent.backgroundImage` (S2h, 2026-09-23): the curated art tile. */
  art?: string;
}

/** The merchant's own `categories` selection, read unchanged from before the merge. */
function buildSelectedTiles(rows: unknown[], t: (key: string) => string): TileVM[] {
  return rows
    .map((row, index) => {
      const label = rowText(row, 'name');
      const url = rowText(row, 'url');
      const image = rowText(row, 'image');
      const slug = HOME_TYPE_SLUGS.find((candidate) => url && matchesSlug(url, candidate));
      const node = slug ? nodeBySlug(slug) : undefined;
      const content = slug ? CATEGORIES.find((entry) => entry.slug === slug) : undefined;
      const title = node ? t(node.nameKey) : label;
      return {
        slug: slug ?? `merchant-${index}`,
        tone: (slug && TYPE_TONE[slug]) || 'ash',
        icon: content?.icon ?? 'protein',
        label: title,
        line: slug && TYPE_LINE_KEY[slug] ? t(TYPE_LINE_KEY[slug]) : '',
        to: url || searchFallback(label),
        image: image || undefined,
        art: content?.backgroundImage,
      } satisfies TileVM;
    })
    .filter((tile) => tile.label !== '')
    .slice(0, fullRowCount(rows.length));
}

function buildDefaultTiles(taxonomy: TaxonomyLinks, t: (key: string) => string): TileVM[] {
  return HOME_TYPE_SLUGS.map((slug) => {
    const link = taxonomy.bySlug(slug);
    const content = CATEGORIES.find((entry) => entry.slug === slug);
    const node = nodeBySlug(slug);
    const title = node ? t(node.nameKey) : slug;
    return {
      slug,
      tone: TYPE_TONE[slug] ?? 'ash',
      icon: content?.icon ?? 'protein',
      label: title,
      line: TYPE_LINE_KEY[slug] ? t(TYPE_LINE_KEY[slug]) : '',
      to: link?.to ?? searchFallback(title),
      count: link?.count,
      image: link?.image,
      art: content?.backgroundImage,
    } satisfies TileVM;
  });
}

function buildTiles(data: OxBlockData, taxonomy: TaxonomyLinks, t: (key: string) => string): TileVM[] {
  const selected = fieldList(data, 'categories');
  return selected.length > 0 ? buildSelectedTiles(selected, t) : buildDefaultTiles(taxonomy, t);
}

export function OxCategories({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const taxonomy = useTaxonomyLinks();
  const gridRef = useSectionReveal<HTMLUListElement>();
  const tiles = useMemo(() => buildTiles(data, taxonomy, t), [data, taxonomy, t]);

  if (tiles.length === 0) return null;

  return (
    <section className="ox-cats" data-testid="ox-categories">
      <div className="ox-container">
        <SectionHeader title={t('ox.home.categories_title')} viewAll={{ to: '/categories' }} />
        <ul className="ox-cats__grid ox-reveal" ref={gridRef} role="list">
          {tiles.map((tile, index) => (
            <li key={tile.slug} style={{ ['--i' as string]: String(index) }}>
              <CategoryTile
                slug={tile.slug}
                tone={tile.tone}
                icon={tile.icon}
                label={tile.label}
                line={tile.line}
                to={tile.to}
                count={tile.count}
                image={tile.image}
                art={tile.art}
                index={index}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
