import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import {
  CERT_DISCLAIMER_AR_KEY,
  CERT_DISCLAIMER_EN,
  type CertificationDefinition,
  type CertificationPhoto,
} from '../../content/certifications';

export interface CertificationBandProps {
  /**
   * The badges that resolved from real per-product evidence. An empty list
   * renders nothing: the band never appears with two of four and a gap, and
   * it never appears at all on a store that holds no evidence.
   */
  badges: readonly CertificationDefinition[];
  /**
   * The product still beneath the grid. **No default, deliberately.** A
   * photograph under four certification badges says that THAT product holds
   * them, so it renders only when the merchant supplies it, which is the
   * merchant naming the product the certificates belong to.
   */
  photo?: CertificationPhoto;
}

const TITLE_ID = 'ox-certs-title';

/**
 * The Arabic half of a bilingual pair, or nothing.
 *
 * The band prints one line in each language, and the Arabic one is Arabic
 * whatever locale the page is in: that is the whole point of the pattern. It
 * still resolves through `t`, because an Arabic literal may not live in
 * `app/**`, which means the /en dictionary has to carry the Arabic sentence
 * under the same key. Until it does, `t` hands back the English one and the
 * badge would print the same sentence twice.
 *
 * So a run that came back empty, that came back as its own key (a key the
 * dictionary does not carry), or that is word for word the English line, is
 * dropped. One line is honest; the same line twice is a defect a visitor can
 * see.
 */
function arabicRun(value: string, key: string, english: string): string {
  const text = value.trim();
  if (text === '' || text === key) return '';
  if (bare(text) === bare(english)) return '';
  return text;
}

/** The disclaimer opens on an asterisk; it is not part of the sentence. */
function bare(value: string): string {
  return value.trim().replace(/^\*+\s*/, '');
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
 * middle and one across it, the product still beneath when a merchant has
 * supplied one, and a quiet legal line at the foot. No cards, no borders, no
 * shadows. A section that is a row of bordered rectangles reads as a template
 * whatever is inside them. (Section 17.3 of _b2-home.scss still draws a
 * border around each cell; the hairlines are filed against that file.)
 *
 * Each badge is three lines: the proper noun, an English line, then the same
 * line in Arabic. It is the only place in the theme where the two languages
 * sit together by design, so both runs carry their own `lang` and `dir`: the
 * Latin lines are foreign matter in an Arabic page, and the Arabic line is
 * foreign matter on /en. Without them a screen reader reads one of the two in
 * the wrong voice and a trailing full stop lands on the wrong side.
 *
 * What the band does NOT carry, and none of it is an oversight:
 *
 * - No certifier artwork. The reference sets each certification's official
 *   mark, which is licensed trademark material the store has no right to
 *   reproduce, and drawing a lookalike shield would assert the certification
 *   twice over. The proper noun is the honest form of the same fact.
 * - No count, no "all our products", no store-level statement of any kind.
 *   The heading says these are the product's certifications.
 *
 * The disclaimer is gated on nothing, because it is always true, and it is
 * the positive form of the rule the claims source states negatively.
 */
export function CertificationBand({ badges, photo }: CertificationBandProps) {
  const { t } = useTranslation();
  if (badges.length === 0) return null;

  const legalArabic = arabicRun(
    t(CERT_DISCLAIMER_AR_KEY),
    CERT_DISCLAIMER_AR_KEY,
    CERT_DISCLAIMER_EN
  );

  return (
    <section className="ox-certs" aria-labelledby={TITLE_ID} data-testid="ox-certifications">
      <div className="ox-container ox-certs__inner">
        <header className="ox-certs__head">
          <p className="ox-certs__eyebrow">{t('ox.home.cert_eyebrow')}</p>
          <h2 className="ox-certs__title ox-h2" id={TITLE_ID}>
            {t('ox.home.cert_title')}
          </h2>
        </header>
        {/* Two by two. The grid is meant to be drawn by one hairline between
            the columns and one between the rows, never by a border around
            each cell, and the markup gives the stylesheet the cells to do it
            with: nothing here boxes anything. */}
        <ul className="ox-certs__grid">
          {badges.map((badge) => {
            const arabic = arabicRun(t(badge.arabicLineKey), badge.arabicLineKey, badge.englishLine);
            return (
              <li className="ox-certs__badge" key={badge.id} data-cert={badge.id}>
                {/* The proper noun and the English line are Latin runs on
                    their own lines inside an Arabic page: both are isolated so
                    the page direction cannot reorder them. */}
                <span className="ox-certs__name ox-latin" lang="en" dir="ltr">
                  {badge.name}
                </span>
                <span className="ox-certs__en ox-latin" lang="en" dir="ltr">
                  {badge.englishLine}
                </span>
                {arabic === '' ? null : (
                  <span className="ox-certs__ar" lang="ar" dir="rtl">
                    {arabic}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
        {/* The wrapper centres; the image carries the size cap. These two class
            names were the other way round, which put `display: flex` on the
            img and `max-block-size` on the div, so a merchant upload had no
            ceiling at all. */}
        {photo ? (
          <div className="ox-certs__product">
            <img
              className="ox-certs__still"
              src={photo.src}
              alt=""
              {...(photo.width !== undefined ? { width: photo.width } : {})}
              {...(photo.height !== undefined ? { height: photo.height } : {})}
              loading="lazy"
              decoding="async"
            />
          </div>
        ) : null}
        {/* Gated on nothing. It is true of every supplement the store will
            ever sell, so it renders whenever the band does. */}
        <p className="ox-certs__legal ox-small">
          <span className="ox-certs__legal-en ox-latin" lang="en" dir="ltr">
            {CERT_DISCLAIMER_EN}
          </span>
          {legalArabic === '' ? null : (
            <span className="ox-certs__legal-ar" lang="ar" dir="rtl">
              {legalArabic}
            </span>
          )}
        </p>
      </div>
    </section>
  );
}
