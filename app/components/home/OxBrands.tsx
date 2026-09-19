import { useQuery } from '@tanstack/react-query';
import { brand } from '@salla.sa/twilight-theme-engine/api/brands';
import type { Brand } from '@salla.sa/twilight-theme-engine/routes/brands';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { fieldList, type OxBlockProps } from './defaults';

/**
 * The brand strip (DIRECTION 6.2 row 6): logos on plates, no section header,
 * a scroller on mobile and eight per row on desktop.
 *
 * Hidden under four brands, because three logos in a row read as a claim about
 * the whole catalogue rather than as a strip. The strip is a `nav`-less list of
 * links inside a labelled region so a screen reader still knows what it is.
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

  return (
    <section className="ox-brands" aria-label={t('ox.home.brands_label')} data-testid="ox-brands">
      <div className="ox-container">
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
