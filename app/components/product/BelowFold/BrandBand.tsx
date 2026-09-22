import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Product } from '@salla.sa/twilight-theme-engine/types';
import { Bdi } from '../../common/Bdi';
import { Wordmark } from '../../common/Wordmark';
import { Icon } from '../../common/Icon';
import { bandBadges } from '../lib/bandBadges';
import { bandCopyFor, type BandCopy } from '../../../content/band';

export interface BrandBandProps {
  product: Product;
  /** The category slug the copy is chosen by; unmapped falls to the default. */
  categorySlug?: string;
}

/** Decorative: the band says nothing the copy does not already say. */
const PHOTO = '/assets/images/athlete-band.jpg';

/**
 * The dark brand band under the buy zone (design regions 28 to 33).
 *
 * It is the section break the whole site shares: a photograph under two flat
 * overlays, the wedge at the brand's 22 degrees, a two line statement, the
 * fact badges and the lockup. Its copy changes per page; its proportions do
 * not.
 *
 * Claims gate B16: each badge maps to a real tag on this product. One, two or
 * three render and keep their spacing; with none the badge row is absent, the
 * band loses its lower tier and the statement centres itself, which is the
 * render every product in the store gets today.
 *
 * The statement itself is category copy from `app/content/band.ts`, never
 * generated per product, and it promises nothing: the approved image ends on
 * "real results", which is an outcome promise and is not built.
 */
export function BrandBand({ product, categorySlug }: BrandBandProps) {
  const { t } = useTranslation();
  const copy: BandCopy = bandCopyFor(categorySlug);
  const badges = bandBadges(product);

  return (
    <section
      className={'ox-bband' + (badges.length > 0 ? '' : ' ox-bband--short')}
      aria-labelledby="ox-bband-title"
    >
      <img className="ox-bband__photo" src={PHOTO} alt="" loading="lazy" decoding="async" />
      <span className="ox-bband__scrim" aria-hidden="true" />
      <span className="ox-bband__wash" aria-hidden="true" />
      <span className="ox-bband__wedge ox-bband__wedge--wide" aria-hidden="true" />
      <span className="ox-bband__wedge ox-bband__wedge--thin" aria-hidden="true" />

      <div className="ox-bband__inner">
        <h2 className="ox-bband__headline" id="ox-bband-title">
          <span className="ox-bband__line">{t(copy.line1Key)}</span>
          <span className="ox-bband__line">{t(copy.line2Key)}</span>
        </h2>
        <p className="ox-bband__sub">{t(copy.sublineKey)}</p>

        {badges.length > 0 ? (
          <ul className="ox-bband__badges">
            {badges.map((badge) => (
              <li className="ox-bband__badge" key={badge.id}>
                <span className="ox-bband__ring">
                  <Icon name={badge.glyph} size={16} />
                </span>
                <span className="ox-bband__badge-text">
                  <span className="ox-bband__badge-ar">{t(badge.labelKey)}</span>
                  <span className="ox-bband__badge-latin">
                    <Bdi>{t(badge.latinKey)}</Bdi>
                  </span>
                </span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {/* The owner's mark. The approved image drew a typeset OPTIMALX over
          PERFORMANCE NUTRITION; that was standing in for the real logo, which
          carries its own strapline, so the asset ships instead of the mock. */}
      <p className="ox-bband__lockup">
        <Wordmark width={156} variant="full" tone="dark" />
      </p>
    </section>
  );
}

export default BrandBand;
