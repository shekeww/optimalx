import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Brand } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Bdi } from '../common/Bdi';

/**
 * The one brand tile every brand surface draws: the home carousel, the
 * `/brands` index grid and the "other brands" chips' bigger sibling.
 *
 * Anatomy (owner brief 2026-09-23 late, item 1): a plate carrying the mark's
 * own arm-foot corner cut (X-IDENTITY §3.3, `ox-x-corner`, drawn in
 * `_b2-home.scss`/`_b4-listing.scss` on `.ox-brand-tile__plate` so the clip
 * never sits on the focusable element and clips its focus ring — §7.1's
 * `focus-clipped` rule), the brand's own artwork when the API carries one,
 * else the NAME MARK (first grapheme in `--ox-accent`, Cairo 700), and one
 * count line.
 *
 * The count is `products_count` from the API and nothing else. It is absent
 * when the payload has no number: a brand tile never states a count the
 * store cannot stand behind (GOV-013), and never infers one from the number
 * of products that happen to be loaded on the page.
 *
 * No hover lift (BUILD 3.4, `docs/build/progress/S3c.md` finding 6): hover
 * is a border and a plate value step, never a translate.
 */

export interface BrandWithCount extends Brand {
  /** Not part of the engine's typed `Brand`; the API and the offline fixture
   * both carry it, so a tile can state a live count. Optional by design: no
   * count renders when it is missing. */
  products_count?: number;
  /**
   * The ground the brand's own artwork needs, when its mark is drawn in white
   * and would otherwise be invisible on a light plate (Optimum Nutrition and
   * Dymatize both publish white-only marks). `dark` puts the logo field on the
   * ink ground; anything else, and the default, keeps the light one.
   *
   * Not part of the engine's typed `Brand` either: it is a fact about the
   * ASSET, carried beside it in the same overlay row, so the theme never has
   * to sample a logo's pixels or recolour someone else's trademark.
   */
  logo_ground?: 'dark' | 'light';
}

/** True for a payload object that can be rendered as a brand tile. */
export function isBrand(value: unknown): value is BrandWithCount {
  return Boolean(value) && typeof value === 'object' && typeof (value as Brand).name === 'string';
}

/**
 * The logo field's class, with its ground modifier. The ground is a property
 * of the artwork, never of the surface: the same brand reads the same way on
 * the home carousel, the index grid and its own banner.
 */
export function logoBoxClass(base: string, brand: Pick<BrandWithCount, 'logo_ground'>): string {
  return brand.logo_ground === 'dark' ? `${base} ${base}--dark` : base;
}

/** The first grapheme and the rest, by codepoint (`Array.from`) rather than a
 * UTF-16 slice, so a name mark never splits a surrogate pair. */
export function splitMark(name: string): [string, string] {
  const chars = Array.from(name.trim());
  return [chars[0] ?? '', chars.slice(1).join('')];
}

export interface BrandTileProps {
  brand: BrandWithCount;
  /** Extra classes on the link (the carousel adds its own snap class). */
  className?: string;
  /** Logo widths the tile renders at; the grid and the carousel differ. */
  sizes?: string;
}

export function BrandTile({ brand, className, sizes = '208px' }: BrandTileProps) {
  const { t } = useTranslation();
  const [first, rest] = splitMark(brand.name);
  const count = typeof brand.products_count === 'number' ? brand.products_count : null;

  return (
    <Link to={brand.url} className={['ox-brand-tile', className].filter(Boolean).join(' ')}>
      <span className="ox-brand-tile__plate">
        {brand.logo ? (
          // The brand's own artwork, contained in a fixed 3:2 field whose
          // ground the asset itself asks for (light by default, ink when the
          // mark is white), so nothing is ever cropped or recoloured. The
          // accessible name is still the brand's name, so a tile reads the
          // same with or without a logo.
          <span className={logoBoxClass('ox-brand-tile__logobox', brand)}>
            <Image
              className="ox-brand-tile__logo"
              src={brand.logo}
              alt={brand.name}
              width={208}
              height={139}
              srcSetWidths={[208, 416]}
              sizes={sizes}
              objectFit="contain"
              noWrapper
            />
          </span>
        ) : (
          <span className="ox-brand-tile__mark">
            {/* lang is omitted rather than forced to `en`: a brand name comes
                from the merchant's own catalogue and may be in either script. */}
            <Bdi lang={null}>
              <span className="ox-brand-tile__mark-first">{first}</span>
              {rest}
            </Bdi>
          </span>
        )}
        {count !== null ? (
          <span className="ox-brand-tile__count ox-small">
            {t('ox.brands.products_count', { count })}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export default BrandTile;
