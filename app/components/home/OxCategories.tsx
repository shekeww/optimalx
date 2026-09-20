import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import type { Category } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { matchesSlug } from '../layout/Header/useHeaderMenu';
import { CATEGORIES, ROOT_CATEGORY_SLUGS } from '../../content/categories';
import type { OxIconName } from '../common/Icon';
import { CategoryTile } from './CategoryTile';
import { useSectionReveal } from './useSectionReveal';
import { fieldList, rowText, type OxBlockProps } from './defaults';

/**
 * The type grid (DIRECTION 5.2 CategoryTile, 6.2 row 4).
 *
 * Source order: the merchant's own selection first (the `categories` field is a
 * `source: categories` multichoice, so the API sends whole category objects,
 * the same shape the Raed main-links block receives), then the ten root type
 * slugs from the content map, resolved against the live category list by slug
 * and falling back to a search for the label (PLAN-final C15).
 *
 * Eight tiles, in one row at 1024 and up and two rows of four below it, which
 * is what the reference draws on both panes (homepage-spec section 3). The
 * merchant field is clamped to 4, 8 or 12 so a row is never left half empty.
 *
 * **At full measure, not as chips** (homepage-scale-spec section 3). The row
 * used to draw eight 148 by 140 tiles with a 34px glyph, which read as eight
 * small controls under a heading rather than as the page's first invitation
 * to shop. The tile is now 168 tall at desktop with a 44px glyph, the row
 * fills the 1296 measure, and the section is the first of the two answers to
 * "what do you sell".
 *
 * The tiles carry no imagery: `CategoryTile` draws the sprite glyph and the
 * name, so the API's `image` is deliberately not read here any more. Eight
 * supplier packshots at eight crops was the single thing that stopped this row
 * reading as one set.
 */

export const DEFAULT_TILE_COUNT = 8;

interface Tile {
  key: string;
  label: string;
  to: string;
  icon: OxIconName;
}

function fullRowCount(requested: number): number {
  if (requested >= 12) return 12;
  if (requested >= 8) return 8;
  return 4;
}

export function OxCategories({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const gridRef = useSectionReveal<HTMLUListElement>();
  const selected = fieldList(data, 'categories');
  const { data: live } = useQuery({ ...category.queries.list(), enabled: selected.length === 0 });

  const tiles = useMemo<Tile[]>(() => {
    if (selected.length > 0) {
      return selected
        .map((row, index) => {
          const label = rowText(row, 'name');
          const url = rowText(row, 'url');
          const slug = ROOT_CATEGORY_SLUGS.find((candidate) => url && matchesSlug(url, candidate));
          const content = CATEGORIES.find((candidate) => candidate.slug === slug);
          return {
            key: `${label}-${index}`,
            label,
            to: url || `/search?q=${encodeURIComponent(label)}`,
            icon: content?.icon ?? 'protein',
          } satisfies Tile;
        })
        .filter((tile) => tile.label !== '')
        .slice(0, fullRowCount(selected.length));
    }

    const all: Category[] = live ?? [];
    return ROOT_CATEGORY_SLUGS.slice(0, DEFAULT_TILE_COUNT).map((slug) => {
      const content = CATEGORIES.find((candidate) => candidate.slug === slug);
      const label = content ? t(content.h1Key) : slug;
      const match = all.find((item) => typeof item.url === 'string' && matchesSlug(item.url, slug));
      return {
        key: slug,
        label: match?.name ?? label,
        to: match?.url ?? `/search?q=${encodeURIComponent(label)}`,
        icon: content?.icon ?? 'protein',
      } satisfies Tile;
    });
  }, [selected, live, t]);

  if (tiles.length === 0) return null;

  return (
    <section className="ox-cats" data-testid="ox-categories">
      <div className="ox-container">
        <SectionHeader
          title={t('ox.home.categories_title')}
          viewAll={{ to: '/categories' }}
        />
        <ul className="ox-cats__grid ox-reveal" ref={gridRef}>
          {tiles.map((tile, index) => (
            <li key={tile.key} style={{ ['--i' as string]: String(index) }}>
              <CategoryTile label={tile.label} to={tile.to} icon={tile.icon} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
