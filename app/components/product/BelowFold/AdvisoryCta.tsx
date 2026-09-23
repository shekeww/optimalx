import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../../common/Button';
import { Icon } from '../../common/Icon';
import { StoreRating } from '../../common/StoreRating';
import { digitsOnly } from '../../blocks/href';
import { BRANCH_LISTING } from '../../../content/branch';
import { channelById, SERVICES_HUB } from '../../../content/services';
import { readStoreRating } from '../../../content/social-proof';
import { inbodyIncluded, settingText, type Settings } from '../lib/claims';

export interface AdvisoryCtaProps {
  /** Interpolated into the WhatsApp prefill text, so the merchant reads which
   *  product the shopper was looking at when they asked. */
  productName: string;
  settings?: Settings;
}

/**
 * The free advisory + InBody CTA at the foot of every boxed product page
 * (owner brief 2026-09-24: "can't decide what you need? contact us, book a
 * free advisory with a free InBody test ... linking to the services page or
 * with direct WhatsApp contact; what we offer is highly conversional").
 *
 * NOT mounted on a service or booking product: `ProductPage.tsx` gates it on
 * the same `isService` flag `ServicePdp` already renders under, because that
 * page IS one of the three advisory channels, and a booking page selling the
 * reader a consultation to decide whether to book a consultation sells the
 * page to itself.
 *
 * THE SAME IDENTITY PLATE the services offer strip carries (S7c:
 * `--ox-graphite-3`, the mark's own corner cut, full-width 48px buttons), but
 * built fresh here in `_b7-advisory.scss` rather than importing
 * `OxServices.tsx`'s `OfferStrip`: that component's heading is the band's own
 * h2, OUTSIDE the plate, it lists two facts rather than this block's one
 * line, its closing note sits outside the whole band rather than inside the
 * plate, and its two buttons switch to a row at 640px where this block's own
 * composition (a heading and a closing line inside the plate) switches at
 * 768. Reusing its exact class names would have coupled this file to
 * `_b2-home.scss`, which this batch may not edit, for a different layout
 * wearing the same selector at two different widths. The visual identity
 * (the plate, the cut, the ground colour) is reproduced instead of imported.
 *
 * Claims gates (docs/build/research/FINAL-claims-source.md §3,
 * docs/brand/voice-ksa.md §6): the InBody clause renders only while
 * `inbodyIncluded(settings)` is true, and the line ends after "free
 * consultation" without it — a measurement at the branch, never a diagnosis
 * or an outcome. The WhatsApp button renders only once the owner has written
 * `whatsapp_number`; with none set the secondary action is a text link to
 * `/services` instead of a channel the store has not configured.
 *
 * VISIT-2026-09-24 §4.3 adds two more things to the plate, both from
 * `settings` rather than a hook, matching the rest of this file: the store's
 * `StoreRating` chip beside the closing note, gated the same way every other
 * rating surface is (`readStoreRating`), and a third quiet link, "الاتجاهات
 * إلى الفرع", to the fixed `BRANCH_LISTING.directionsUrl` after the two
 * buttons. Neither changes the plate's own compact shape.
 */
export function AdvisoryCta({ productName, settings }: AdvisoryCtaProps) {
  const { t } = useTranslation();
  const visit = channelById('visit');
  const showsInbody = inbodyIncluded(settings);
  const waNumber = digitsOnly(settingText(settings, 'whatsapp_number') ?? '');
  const waHref = waNumber
    ? `https://wa.me/${waNumber}?text=${encodeURIComponent(
        t('ox.pdp.advisory_whatsapp_text', { product: productName })
      )}`
    : null;
  const rating = readStoreRating(settings);

  return (
    <section
      className="ox-advisory"
      aria-labelledby="ox-advisory-title"
      data-testid="ox-pdp-advisory"
    >
      <div className="ox-advisory__plate ox-band-dark">
        <h2 className="ox-advisory__title ox-h3" id="ox-advisory-title">
          {t('ox.pdp.advisory_title')}
        </h2>
        <p className="ox-advisory__line ox-body">
          {t(showsInbody ? 'ox.pdp.advisory_line' : 'ox.pdp.advisory_line_base')}
        </p>
        <div className="ox-advisory__actions">
          <Button
            to={visit?.to ?? '/services'}
            size={48}
            variant="primary"
            className="ox-advisory__action"
          >
            {t('ox.pdp.advisory_cta')}
          </Button>
          {waHref ? (
            <Button
              href={waHref}
              size={48}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
              iconStart={<Icon name="whatsapp" size={20} />}
              className="ox-advisory__action"
            >
              {t('ox.pdp.advisory_whatsapp_cta')}
            </Button>
          ) : (
            <Button to="/services" variant="link" className="ox-advisory__action">
              {t('ox.services.view_all')}
            </Button>
          )}
          <Button
            href={BRANCH_LISTING.directionsUrl}
            variant="link"
            target="_blank"
            rel="noopener noreferrer"
            iconStart={<Icon name="map-pin" size={20} />}
            className="ox-advisory__action"
          >
            {t('ox.pdp.advisory_directions')}
          </Button>
        </div>
        <div className="ox-advisory__foot">
          {rating ? <StoreRating variant="inline" value={rating} /> : null}
          <p className="ox-advisory__note ox-small">{t(SERVICES_HUB.cardFooterKey)}</p>
        </div>
      </div>
    </section>
  );
}

export default AdvisoryCta;
