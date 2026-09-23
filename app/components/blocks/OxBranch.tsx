import { useMemo } from 'react';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useOpeningHours } from '@salla.sa/twilight-theme-engine/hooks';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { StoreRating } from '../common/StoreRating';
import { BRANCH_LISTING, parseBranchHours } from '../../content/branch';
import { STORE_PHOTOS, storePhotoSrcSet } from '../../content/store-photos';
import { channelById, SERVICES_HUB } from '../../content/services';
import { inbodyIncluded, type Settings } from '../product/lib/claims';
import { HoursTable } from './HoursTable';
import { digitsOnly } from './href';

/**
 * The digit-stripper used to live here. `app/components/pages/ContactRow.tsx`
 * imports it under this name, so the alias stays until that batch points at
 * `./href` directly; the implementation is shared, not duplicated.
 */
export { digitsOnly as whatsappDigits } from './href';

/**
 * The one real photograph this block has ever carried (VISIT-2026-09-24
 * §4.1): the long shelf wall, from the store-photo manifest so the panel's
 * `srcset` and intrinsic size always trace back to a rendition that exists on
 * disk. Matched against whatever `photo` prop the caller passes, so a test
 * fixture URL (which matches nothing here) still falls back to the previous
 * static numbers rather than breaking.
 */
const BRANCH_PHOTO = STORE_PHOTOS['store-wide'];

export interface OxBranchProps {
  /** h2 inside the home page, h1 on /branch (DIRECTION 6.12). */
  headingLevel?: 'h1' | 'h2';
  /**
   * The eyebrow is a fact the heading lacks, so it renders on the home block
   * (where the heading is the section title) and not on the branch page, whose
   * h1 already names the district (amendment A4).
   */
  showEyebrow?: boolean;
  /**
   * A secondary link to `/branch` beside the WhatsApp button. The home block
   * passes it; the branch page does not, because it is that page
   * (UX-2026-09-24 P0-7).
   */
  showPageLink?: boolean;
  /**
   * The visit-offer sentence under the title, reusing
   * `ox.content.services.visit_inbody` while `inbody_included` is on. The
   * home block passes it; the branch page states its own intro instead
   * (VISIT-2026-09-24 §4.1).
   */
  showOfferLine?: boolean;
  /** The branch photo (`STORE_PHOTOS['store-wide'].photo`); the plate shows through without one. */
  photo?: string;
  /** The intro line under the address; the branch page passes its own. */
  intro?: string;
  className?: string;
  /** Test seam for the "today" row and the open/closed chip. */
  now?: Date;
}

/** A settings bag read defensively: keys are absent on the mock store. */
function readSetting(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

/**
 * The branch block (DIRECTION 5.2 OxBranch, 4.5 branch polygon, 6.12;
 * VISIT-2026-09-24 §4.1 turns it into the visit offer). Shared by the home
 * page and `/branch`: a photo panel whose inner edge carries the 34deg cut,
 * `StoreRating` under the title, and an address card with the hours table,
 * the booking and directions actions and the pickup note. Every string is a
 * locale key and every fact (address, hours, number, pickup hours) comes from
 * theme settings, so an unset setting removes its row instead of printing a
 * promise.
 *
 * The photograph is gated on the `photo` prop, and the theme ships no default
 * for it here: a shopfront captioned as this branch at Al Khalidiyah is a
 * statement about a specific real place, and the only picture that may carry
 * it is a photograph of that place, so an unset `photo` renders flat rather
 * than an invented one. The caller passes `STORE_PHOTOS['store-wide'].photo`
 * once a real photograph exists (it does, since VISIT-2026-09-24); the flat
 * card takes the whole row and lays its content out in two columns, which is
 * a finished composition rather than an empty plate waiting for an upload.
 *
 * The booking ("احجز زيارتك") and directions actions are unconditional: the
 * visit channel always resolves and `BRANCH_LISTING.directionsUrl` is a fixed
 * constant, so the card's second column always has content and the old
 * `branch_map_url`-gated map button is retired in its favour.
 */
export function OxBranch({
  headingLevel: Heading = 'h2',
  showEyebrow = true,
  showPageLink = false,
  showOfferLine = false,
  photo,
  intro,
  className,
  now,
}: OxBranchProps) {
  const { t } = useTranslation();
  const { settings: themeSettings } = useTheme();
  const store = useStore();

  const hoursSetting = readSetting(themeSettings, 'branch_hours');
  const rows = useMemo(() => parseBranchHours(hoursSetting), [hoursSetting]);

  // The engine hook only answers when the dashboard carries an opening-hours
  // record (hooks/useOpeningHours.d.ts:5); otherwise the parsed table decides.
  const engineHours = useOpeningHours(store?.settings?.opening_hours);
  const status = engineHours.isEnabled
    ? { isOpen: engineHours.isOpen, nextOpen: engineHours.nextOpenFormatted || undefined }
    : undefined;

  const address = readSetting(themeSettings, 'branch_address') || t('ox.blocks.branch.address');
  const pickupHours = readSetting(themeSettings, 'pickup_ready_hours');
  const number = digitsOnly(
    readSetting(themeSettings, 'whatsapp_number') || (store?.contacts?.whatsapp ?? '')
  );
  const whatsappHref = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(t('ox.blocks.branch.whatsapp_prefill'))}`
    : undefined;
  const visit = channelById('visit');
  const showsOffer = showOfferLine && inbodyIncluded(themeSettings as Settings);
  // The manifest entry `photo` belongs to, so the panel's srcset and intrinsic
  // size come from disk; a photo this batch does not recognise (a test
  // fixture URL) falls back to the previous static numbers rather than
  // rendering with none at all.
  const photoEntry = photo === BRANCH_PHOTO.photo ? BRANCH_PHOTO : undefined;

  const classes = ['ox-branch', photo ? '' : 'ox-branch--flat', className]
    .filter(Boolean)
    .join(' ');

  // The booking and directions actions are unconditional now (VISIT-2026-09-24
  // §4.1: primary and secondary both always render), so the flat card always
  // carries a second column's worth of content.
  const meta = 'full';

  return (
    <section className={classes} data-testid="ox-branch">
      {photo ? (
        <div className="ox-branch__photo">
          <Image
            src={photo}
            alt={t('ox.blocks.branch.photo_wide_alt')}
            width={photoEntry?.width ?? 760}
            height={photoEntry?.height ?? 480}
            srcSet={photoEntry ? storePhotoSrcSet(photoEntry) : undefined}
            srcSetWidths={photoEntry ? undefined : [380, 760, 1160]}
            sizes="(min-width: 1024px) 58vw, 100vw"
            objectFit="cover"
            noWrapper
          />
          <span className="ox-branch__corner" aria-hidden="true" />
        </div>
      ) : null}

      <div className="ox-branch__card" data-meta={meta}>
        <div className="ox-branch__head">
          {showEyebrow ? (
            <p className="ox-branch__eyebrow ox-small">{t('ox.blocks.branch.eyebrow')}</p>
          ) : null}
          <Heading className={Heading === 'h1' ? 'ox-h1' : 'ox-h2'}>
            {t('ox.blocks.branch.title')}
          </Heading>
          <StoreRating variant="rail" />
          {showsOffer ? (
            <p className="ox-branch__offer ox-body">{t(SERVICES_HUB.inbodyKey)}</p>
          ) : null}
          <p className="ox-branch__address ox-body">{intro ?? address}</p>
        </div>

        <div className="ox-branch__meta">
          <HoursTable rows={rows} now={now} status={status} />

          <div className="ox-branch__actions">
            <Button to={visit?.to ?? '/services'} size={48} variant="primary">
              {t('ox.content.services.visit_cta_short')}
            </Button>
            <Button
              href={BRANCH_LISTING.directionsUrl}
              size={48}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
              iconStart={<Icon name="map-pin" size={20} />}
            >
              {t('ox.blocks.branch.directions')}
            </Button>
            {whatsappHref ? (
              <Button
                href={whatsappHref}
                variant="link"
                target="_blank"
                rel="noopener noreferrer"
                iconStart={<Icon name="whatsapp" size={20} />}
              >
                {t('ox.blocks.branch.whatsapp')}
              </Button>
            ) : null}
            {/* The home block was a 184px card whose only control was
                WhatsApp, with no route to the branch page at all
                (UX-2026-09-24 P0-7): the store's one named proof was one
                message away and no clicks away from being read about. The
                branch page itself never renders this, because it is the
                page. */}
            {showPageLink ? (
              <Button to="/branch" size={48} variant="secondary">
                {t('ox.branch.view_page')}
              </Button>
            ) : null}
          </div>

          <p className="ox-branch__pickup ox-small">
            {pickupHours
              ? t('ox.blocks.branch.pickup_note_timed', { hours: pickupHours })
              : t('ox.blocks.branch.pickup_note')}
          </p>
        </div>
      </div>
    </section>
  );
}
