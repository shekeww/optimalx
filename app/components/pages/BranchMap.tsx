import { Suspense, lazy } from 'react';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { safeExternalUrl } from '../blocks/href';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { BRANCH_GEO } from '../../content/branch';
import { settingText } from '../product/lib/claims';

// The map is a Stencil web component (twilight-components-react/map); it is
// lazy so the storefront never ships the Google Maps wrapper to a store that
// has no maps key, which is every store until the owner adds one (Q10).
const SallaMap = lazy(() =>
  import('@salla.sa/twilight-components-react/map').then((m) => ({ default: m.SallaMap }))
);

export interface BranchMapProps {
  /** Overrides the store's maps key (kitchen sink, tests). */
  apiKey?: string;
  className?: string;
}

/**
 * The branch map (DIRECTION 6.12 block 3).
 *
 * Three states, in order:
 *  1. the store carries a maps key (`settings.keys.maps`,
 *     theme-engine types/index.d.ts:140-144): the native `SallaMap` at the
 *     public coordinates, read-only, with `name` as its accessible label
 *     (engine-surface 9.2 salla-map);
 *  2. no key but a `branch_map_url` setting: a plate panel with the directions
 *     line and the "open in maps" link, which is what the owner can give us
 *     today;
 *  3. neither: nothing at all. A map placeholder that leads nowhere is worse
 *     than no map.
 *
 * The coordinates are the branch's published ones (content/branch.ts, from the
 * claims source), never a guess from the address string.
 */
export function BranchMap({ apiKey, className }: BranchMapProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();

  const themeSettings = settings as Record<string, unknown> | undefined;
  const key = apiKey ?? store?.settings?.keys?.maps ?? '';
  // Merchant-typed URL: http and https only, never a javascript: or data: href (G1).
  const mapUrl = safeExternalUrl(settingText(themeSettings, 'branch_map_url') ?? '');
  const landmark = settingText(themeSettings, 'branch_landmark');

  if (!key && !mapUrl) return null;

  return (
    <section
      className={['ox-branch-map', className].filter(Boolean).join(' ')}
      aria-label={t('ox.content.branch.map_alt')}
      data-testid="ox-branch-map"
    >
      {key ? (
        <div className="ox-branch-map__frame">
          <Suspense fallback={<div className="ox-skel ox-branch-map__skeleton" />}>
            <SallaMap
              apiKey={key}
              lat={BRANCH_GEO.latitude}
              lng={BRANCH_GEO.longitude}
              zoom={15}
              readonly
              name={t('ox.branch.address')}
            />
          </Suspense>
        </div>
      ) : (
        <div className="ox-branch-map__plate">
          <Icon name="branch-visit" size={32} className="ox-branch-map__icon" />
          <p className="ox-branch-map__address ox-body">{t('ox.branch.address')}</p>
          {landmark ? <p className="ox-branch-map__landmark ox-small">{landmark}</p> : null}
        </div>
      )}
      {mapUrl ? (
        <Button
          href={mapUrl}
          size={44}
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
          className="ox-branch-map__link"
        >
          {t('ox.branch.directions')}
        </Button>
      ) : null}
    </section>
  );
}
