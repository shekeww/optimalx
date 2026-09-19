import { useMemo } from 'react';
import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useOpeningHours } from '@salla.sa/twilight-theme-engine/hooks';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { parseBranchHours } from '../../content/branch';
import { HoursTable } from './HoursTable';
import { digitsOnly, safeExternalUrl } from './href';

/**
 * The digit-stripper used to live here. `app/components/pages/ContactRow.tsx`
 * imports it under this name, so the alias stays until that batch points at
 * `./href` directly; the implementation is shared, not duplicated.
 */
export { digitsOnly as whatsappDigits } from './href';

export interface OxBranchProps {
  /** h2 inside the home page, h1 on /branch (DIRECTION 6.12). */
  headingLevel?: 'h1' | 'h2';
  /**
   * The eyebrow is a fact the heading lacks, so it renders on the home block
   * (where the heading is the section title) and not on the branch page, whose
   * h1 already names the district (amendment A4).
   */
  showEyebrow?: boolean;
  /** Storefront photo (asset brief 8.5); the plate shows through without one. */
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
 * The branch block (DIRECTION 5.2 OxBranch, 4.5 branch polygon, 6.12).
 * Shared by the home page and `/branch`: a storefront photo panel whose inner
 * edge carries the 22deg cut, and an address card with the hours table, the
 * WhatsApp button, the map link and the pickup note. Every string is a locale
 * key and every fact (address, hours, number, map URL, pickup hours) comes
 * from theme settings, so an unset setting removes its row instead of
 * printing a promise.
 */
export function OxBranch({
  headingLevel: Heading = 'h2',
  showEyebrow = true,
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
  // The setting is merchant-typed and goes straight into an href: anything
  // that is not an absolute http or https URL renders no button at all (G1).
  const mapUrl = safeExternalUrl(readSetting(themeSettings, 'branch_map_url'));
  const pickupHours = readSetting(themeSettings, 'pickup_ready_hours');
  const number = digitsOnly(
    readSetting(themeSettings, 'whatsapp_number') || (store?.contacts?.whatsapp ?? '')
  );
  const whatsappHref = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(t('ox.blocks.branch.whatsapp_prefill'))}`
    : undefined;

  return (
    <section className={['ox-branch', className].filter(Boolean).join(' ')} data-testid="ox-branch">
      <div className="ox-branch__photo">
        {photo ? (
          <Image
            src={photo}
            alt={t('ox.blocks.branch.photo_alt')}
            width={760}
            height={480}
            srcSetWidths={[380, 760, 1160]}
            sizes="(min-width: 1024px) 58vw, 100vw"
            objectFit="cover"
            noWrapper
          />
        ) : null}
        <span className="ox-branch__corner" aria-hidden="true" />
      </div>

      <div className="ox-branch__card">
        {showEyebrow ? <p className="ox-branch__eyebrow ox-small">{t('ox.blocks.branch.eyebrow')}</p> : null}
        <Heading className={Heading === 'h1' ? 'ox-h1' : 'ox-h2'}>{t('ox.blocks.branch.title')}</Heading>
        <p className="ox-branch__address ox-body">{intro ?? address}</p>

        <HoursTable rows={rows} now={now} status={status} />

        <div className="ox-branch__actions">
          {whatsappHref ? (
            <Button
              href={whatsappHref}
              size={48}
              variant="primary"
              target="_blank"
              rel="noopener noreferrer"
              iconStart={<i className="sicon-whatsapp" aria-hidden="true" />}
            >
              {t('ox.blocks.branch.whatsapp')}
            </Button>
          ) : null}
          {mapUrl ? (
            <Button
              href={mapUrl}
              size={48}
              variant="secondary"
              target="_blank"
              rel="noopener noreferrer"
              iconStart={<Icon name="branch-visit" size={20} />}
            >
              {t('ox.blocks.branch.map')}
            </Button>
          ) : null}
        </div>

        <p className="ox-branch__pickup ox-small">
          {pickupHours
            ? t('ox.blocks.branch.pickup_note_timed', { hours: pickupHours })
            : t('ox.blocks.branch.pickup_note')}
        </p>
      </div>
    </section>
  );
}
