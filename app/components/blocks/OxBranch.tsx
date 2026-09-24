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
 * The photograph this block carries (VISIT-2026-09-24 §4.1; S9h, owner
 * screenshots 2026-09-24, "with a premium cinematic integration with the
 * section": the lit storefront at night replaces the shelf wall so the
 * cover shows the branch itself, not its stock), from the store-photo
 * manifest so the panel's `srcset` and intrinsic size always trace back to a
 * rendition that exists on disk. Matched against whatever `photo` prop the
 * caller passes, so a test fixture URL (which matches nothing here) still
 * falls back to the previous static numbers rather than breaking.
 */
const BRANCH_PHOTO = STORE_PHOTOS.storefront;

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
  /** The branch photo (`STORE_PHOTOS.storefront.photo`); the plate shows through without one. */
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
 * VISIT-2026-09-24 §4.1 turns it into the visit offer; S9c, creative
 * director direction 2026-09-24, turns the split photo-panel-beside-a-card
 * into one integrated cover; S9h, owner screenshots 2026-09-24, swaps the
 * ground photograph for the lit storefront and re-tunes the gradient for it).
 * Shared by the home page and `/branch`: the storefront photograph is the
 * block itself, `ox-angled()`-cut and carrying a cinematic gradient
 * (`.ox-cover`/`.ox-cover__*`/`.ox-cover--storefront-block`, `_covers.scss`),
 * with the title, `StoreRating`, the offer line, the address, the hours
 * table (its own translucent ink plate), the booking and directions actions
 * and the pickup note all inside the frame on paper text, one composition
 * at every width, never a two-column split. Every string is a locale key
 * and every fact (address, hours, number, pickup hours) comes from theme
 * settings, so an unset setting removes its row instead of printing a promise.
 *
 * The photograph is gated on the `photo` prop, and the theme ships no default
 * for it here: a shopfront captioned as this branch at Al Khalidiyah is a
 * statement about a specific real place, and the only picture that may carry
 * it is a photograph of that place, so an unset `photo` renders the same
 * content stack on a plain card instead of an invented cover.
 *
 * The booking ("احجز زيارتك") and directions actions are unconditional: the
 * visit channel always resolves and `BRANCH_LISTING.directionsUrl` is a fixed
 * constant, so the content stack always carries a second group of controls
 * and the old `branch_map_url`-gated map button is retired in its favour.
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
  // The manifest entry `photo` belongs to, so the cover's srcset and
  // intrinsic size come from disk, and its slug-tuned gradient (S9h
  // `.ox-cover--storefront-block`) only applies to the real photograph; a
  // photo this batch does not recognise (a test fixture URL) falls back to
  // the previous static numbers and the generic scrim rather than rendering
  // with none at all.
  const photoEntry = photo === BRANCH_PHOTO.photo ? BRANCH_PHOTO : undefined;

  const content = (
    <>
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
        {rows.length > 0 ? (
          <div className="ox-branch__hours-plate">
            <HoursTable rows={rows} now={now} status={status} />

          </div>

        ) : null}

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

    </>

  );

  return (
    <section className={['ox-branch', className].filter(Boolean).join(' ')} data-testid="ox-branch">
      {photo ? (
        <div
          className={[
            'ox-cover',
            'ox-band-dark',
            photoEntry ? 'ox-cover--storefront-block' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          <Image
            className="ox-cover__photo"
            src={photo}
            alt={t('ox.blocks.branch.photo_wide_alt')}
            width={photoEntry?.width ?? 760}
            height={photoEntry?.height ?? 480}
            srcSet={photoEntry ? storePhotoSrcSet(photoEntry) : undefined}
            srcSetWidths={photoEntry ? undefined : [380, 760, 1160]}
            sizes="100vw"
            objectFit="cover"
            noWrapper
          />
          <span className="ox-cover__scrim" aria-hidden="true" />
          <span className="ox-cover__glow" aria-hidden="true" />
          <div className="ox-cover__body">{content}</div>

        </div>

      ) : (
        <div className="ox-branch__content--flat">{content}</div>

      )}
    </section>

  );
}
