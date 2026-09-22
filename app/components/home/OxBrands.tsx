import { useQuery } from '@tanstack/react-query';
import { brand } from '@salla.sa/twilight-theme-engine/api/brands';
import type { Brand } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { fieldList, fieldText, type OxBlockProps } from './defaults';

/**
 * The brand strip (DIRECTION 6.2 row 6): a section header, logos on plates,
 * a scroller on mobile and eight per row on desktop.
 *
 * Hidden under four brands, because three logos in a row read as a claim about
 * the whole catalogue rather than as a strip. The strip is a `nav`-less list of
 * links inside a labelled region so a screen reader still knows what it is.
 *
 * The manifest's `image` field (S2c, 2026-09-22) is the owner's generated
 * background, exposed as `--ox-band-image` and painted at low opacity behind
 * the header and the strip: the logo plates stay opaque, so legibility never
 * depends on what the merchant drops in, and the section looks finished with
 * no image at all (the custom property's own fallback is `none`).
 */

export const MIN_BRANDS = 4;

function isBrand(value: unknown): value is Brand {
  return Boolean(value) && typeof value === 'object' && typeof (value as Brand).name === 'string';
}

export function OxBrands({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const selected = fieldList(data, 'brands').filter(isBrand);
  const { data: group } = useQuery({ ...brand.queries.list(), enabled: selected.length === 0 });

  const brands = selected.length > 0 ? selected : Object.values(group ?? {}).flat();
  if (brands.length < MIN_BRANDS) return null;

  const image = fieldText(data, 'image');

  return (
    <section
      className="ox-brands"
      aria-labelledby="ox-brands-title"
      data-testid="ox-brands"
      style={image ? { ['--ox-band-image' as string]: `url("${image}")` } : undefined}
    >
      <div className="ox-container">
        <div className="ox-brands__head">
          {/* The section's one true accent element and its one angled edge,
              in a single shape (identity rule): the accent bar the needs
              section's cards already draw, skewed on the shared token. */}
          <span className="ox-brands__accent" aria-hidden="true" />
          <SectionHeader title={t('ox.home.brands_title')} titleId="ox-brands-title" as="h2" />
        </div>
        <ul className="ox-brands__strip">
          {brands.map((item) => (
            <li className="ox-brands__item" key={item.id ?? item.name}>
              <Link to={item.url} className="ox-brands__link">
                {item.logo ? (
                  <Image
                    src={item.logo}
                    alt={item.name}
                    width={120}
                    height={48}
                    srcSetWidths={[120, 240]}
                    sizes="120px"
                    objectFit="contain"
                    className="ox-brands__logo"
                    noWrapper
                  />
                ) : (
                  <span className="ox-brands__name ox-small">{item.name}</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
