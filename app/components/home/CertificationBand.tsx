import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  CERT_DISCLAIMER_AR_KEY,
  CERT_DISCLAIMER_EN,
  CERT_PRODUCT_PHOTO,
  CERT_PRODUCT_PHOTO_HEIGHT,
  CERT_PRODUCT_PHOTO_WIDTH,
  type CertificationDefinition,
} from '../../content/certifications';

export interface CertificationBandProps {
  /**
   * The badges that resolved from real per-product evidence. An empty list
   * renders nothing: the band never appears with two of four and a gap.
   */
  badges: readonly CertificationDefinition[];
  /** The product still beneath the grid. Defaults to the shipped frame. */
  photo?: string;
}

/**
 * The certification band (certification-band-spec.md).
 *
 * Built from the reference's structure and NOT from its colour. The reference
 * is a supplier's own product-page section in Optimum Nutrition's brand
 * green; putting a supplier's green across OptimalX's pages is a branding
 * error before it is a design one, and it would be a second accent against a
 * system that spends orange exactly four times a page. The band is built on
 * `--ox-verify`, the deep verification green the system already carries for
 * exactly this, with `--ox-verify-soft` for the detail.
 *
 * **Nothing in it is boxed**, and that is the lesson the owner asked for.
 * One flood of colour, four facts in a two by two grid, one hairline down the
 * middle and one across it, the product still beneath, and a quiet legal line
 * at the foot. No cards, no borders, no shadows. A section that is a row of
 * bordered rectangles reads as a template whatever is inside them.
 *
 * Each badge is three lines: the proper noun, an English line, then the same
 * line in Arabic. It is the only place in the theme where the two languages
 * sit together by design.
 *
 * The disclaimer is gated on nothing, because it is always true, and it is
 * the positive form of the rule the claims source states negatively.
 */
export function CertificationBand({ badges, photo = CERT_PRODUCT_PHOTO }: CertificationBandProps) {
  const { t } = useTranslation();
  if (badges.length === 0) return null;

  return (
    <section className="ox-certs ox-band-verify" data-testid="ox-certifications">
      <div className="ox-container ox-certs__inner">
        <header className="ox-certs__head">
          <p className="ox-certs__eyebrow">{t('ox.home.cert_eyebrow')}</p>
          <h2 className="ox-certs__title ox-h2">{t('ox.home.cert_title')}</h2>
        </header>
        {/* Two by two, with one hairline between the columns and one between
            the rows. The grid is drawn by the gap and the dividers, never by
            a border around each cell. */}
        <ul className="ox-certs__grid">
          {badges.map((badge) => (
            <li className="ox-certs__badge" key={badge.id} data-cert={badge.id}>
              <span className="ox-certs__name">{badge.name}</span>
              <span className="ox-certs__en ox-latin">{badge.englishLine}</span>
              <span className="ox-certs__ar">{t(badge.arabicLineKey)}</span>
            </li>
          ))}
        </ul>
        <div className="ox-certs__still">
          <img
            className="ox-certs__product"
            src={photo}
            alt=""
            width={CERT_PRODUCT_PHOTO_WIDTH}
            height={CERT_PRODUCT_PHOTO_HEIGHT}
            loading="lazy"
            decoding="async"
          />
        </div>
        <p className="ox-certs__legal ox-small">
          <span className="ox-certs__legal-en ox-latin">{CERT_DISCLAIMER_EN}</span>
          <span className="ox-certs__legal-ar">{t(CERT_DISCLAIMER_AR_KEY)}</span>
        </p>
      </div>
    </section>
  );
}
