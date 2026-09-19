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
 * Eight tiles by default so every row is full at 2-up and 4-up (6.2 row 4); the
 * merchant field accepts 4, 8 or 12 for the same reason.
 */

export const DEFAULT_TILE_COUNT = 8;

interface Tile {
  key: string;
  label: string;
  to: string;
  image?: string;
  icon: OxIconName;
  count?: number;
}

function fullRowCount(requested: number): number {
  if (requested >= 12) return 12;
  if (requested >= 8) return 8;
  return 4;
}

export function OxCategories({ data }: OxBlockProps) {
  const { t } = useTranslation();
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
            image: rowText(row, 'image') || undefined,
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
        image: match?.image ?? undefined,
        icon: content?.icon ?? 'protein',
        ...(typeof match?.products_count === 'number' ? { count: match.products_count } : {}),
      } satisfies Tile;
    });
  }, [selected, live, t]);

  if (tiles.length === 0) return null;

  return (
    <section className="ox-cats" data-testid="ox-categories">
      <div className="ox-container">
        <SectionHeader
          title={t('ox.home.categories_title')}
          descriptor={t('ox.home.categories_intro')}
        />
        <ul className="ox-cats__grid">
          {tiles.map((tile) => (
            <li key={tile.key}>
              <CategoryTile
                label={tile.label}
                to={tile.to}
                {...(tile.image ? { image: tile.image } : {})}
                icon={tile.icon}
                {...(tile.count !== undefined ? { count: tile.count } : {})}
              />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
