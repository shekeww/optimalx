import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Bdi } from '../common/Bdi';
import { logoBoxClass, splitMark, type BrandWithCount } from './BrandTile';

/**
 * The brand page's banner (owner brief 2026-09-23 late, item 3): the identity
 * plate carrying the brand's name mark, its artwork when the API has one, and
 * the live product count.
 *
 * It is the page's one PANEL-scale angled gesture — the mark's arm-foot corner
 * cut at §3.3's tier ladder (lean 40 / 48 / 64), legal here because the plate
 * is 200 to 240 tall, well over §3.2's 158px floor, and the run is 7.5% of the
 * container at 390 and 3.3% at 1440, far inside §2.3's 24% budget.
 *
 * The h1 is the brand's own name and nothing else. No qualifier, no
 * superlative, and no claim that the store distributes, represents or
 * exclusively stocks the brand: the page says the store sells these products,
 * which is the only thing the catalogue supports (GOV-013, claims gate).
 *
 * The count comes from the API's `products_count` or is absent. It is never
 * the number of products that happen to be on the first page.
 */

export interface BrandBannerProps {
  brand: BrandWithCount;
  titleId?: string;
  /** The brand's own description, already stripped to text by the caller. */
  intro?: string;
}

export function BrandBanner({ brand, titleId, intro }: BrandBannerProps) {
  const { t } = useTranslation();
  const [first, rest] = splitMark(brand.name);
  const count = typeof brand.products_count === 'number' ? brand.products_count : null;

  return (
    <div className="ox-brandhero">
      <p className="ox-brandhero__eyebrow ox-small">{t('ox.nav.brands')}</p>
      {brand.logo ? (
        // The same logo field the tile draws, at banner size and on the same
        // asset-declared ground: a white-only mark sits on ink here too,
        // rather than being recoloured or quietly dropped.
        <span className={logoBoxClass('ox-brandhero__logobox', brand)}>
          <Image
            className="ox-brandhero__logo"
            src={brand.logo}
            alt={brand.name}
            width={160}
            height={107}
            objectFit="contain"
            noWrapper
          />
        </span>
      ) : null}
      <h1 className="ox-brandhero__mark ox-h1" id={titleId}>
        <Bdi lang={null}>
          <span className="ox-brandhero__mark-first">{first}</span>
          {rest}
        </Bdi>
      </h1>
      {count !== null ? (
        <p className="ox-brandhero__count ox-small">
          {t('ox.brands.products_count', { count })}
        </p>
      ) : null}
      {intro ? <p className="ox-brandhero__intro ox-body">{intro}</p> : null}
    </div>
  );
}

export default BrandBanner;
