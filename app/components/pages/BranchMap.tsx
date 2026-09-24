import { Suspense, lazy, useState } from 'react';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { safeExternalUrl } from '../blocks/href';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { BRANCH, BRANCH_GEO, BRANCH_LISTING } from '../../content/branch';
import { STORE_PHOTOS, storePhotoSrcSet } from '../../content/store-photos';
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
 * The branch map (DIRECTION 6.12 block 3; VISIT-2026-09-24 §4.4 item 3).
 *
 * Two states now, because the listing (`BRANCH_LISTING`,
 * `docs/build/VISIT-2026-09-24.md` §1) is a fact this codebase already
 * audited from Google's own public profile, not a setting the merchant has to
 * fill before the section means anything:
 *
 *  1. the store carries a maps key (`settings.keys.maps`,
 *     theme-engine types/index.d.ts:140-144): the native `SallaMap` at the
 *     public coordinates, read-only, with `name` as its accessible label
 *     (engine-surface 9.2 salla-map);
 *  2. no key: a click-to-load facade, the `storefront` photograph at its own
 *     size (never upscaled past 415px), the address and the landmark, and one
 *     button that swaps the plate for the keyless embed iframe on tap, so
 *     nothing from Google loads before the shopper asks for it.
 *
 * Under either state, two links always render: "الاتجاهات"
 * (`BRANCH_LISTING.directionsUrl`, turn-by-turn navigation) and the listing
 * itself, preferring the merchant's own `google_place_url`/`branch_map_url`
 * settings when set and falling back to the audited listing URL, the exact
 * fallback chain `registerHeadHooks.tsx#branchFromSettings` already uses for
 * the structured-data `hasMap`. `branch_landmark` is the one fact here still
 * gated on a setting: it is the merchant's own words, which nothing stands in
 * for.
 *
 * The coordinates for the native map are the branch's published ones
 * (content/branch.ts, from the claims source); the embed and the two link
 * buttons use the listing's own pin, 30m away, because that is where Google
 * actually sends a tap (VISIT §1).
 */
export function BranchMap({ apiKey, className }: BranchMapProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();
  const [embedOpen, setEmbedOpen] = useState(false);

  const themeSettings = settings as Record<string, unknown> | undefined;
  const key = apiKey ?? store?.settings?.keys?.maps ?? '';
  const landmark = settingText(themeSettings, 'branch_landmark');
  // Merchant-typed URLs: http and https only, never a javascript: or data: href (G1).
  const placeUrl = safeExternalUrl(settingText(themeSettings, 'google_place_url') ?? '');
  const legacyMapUrl = safeExternalUrl(settingText(themeSettings, 'branch_map_url') ?? '');
  const openUrl = placeUrl || legacyMapUrl || BRANCH_LISTING.listingUrl;
  const storefront = STORE_PHOTOS.storefront;

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

      ) : embedOpen ? (
        <div className="ox-branch-map__frame">
          {/* Tested inside sandbox="allow-scripts allow-same-origin
              allow-popups" over CDP (docs/build/progress/S9a-V2.md): the
              embed's own document carries no X-Frame-Options / frame-ancestors,
              and the sandbox renders the full interactive map. */}
          <iframe
            className="ox-branch-map__embed"
            src={BRANCH_LISTING.embedUrl}
            title={t('ox.content.branch.map_alt')}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            sandbox="allow-scripts allow-same-origin allow-popups"
            width="100%"
            data-testid="ox-branch-map-frame"
          />
        </div>

      ) : (
        <div className="ox-branch-map__plate">
          <img
            className="ox-branch-map__photo"
            src={storefront.photo}
            srcSet={storePhotoSrcSet(storefront)}
            sizes="415px"
            width={storefront.width}
            height={storefront.height}
            alt=""
            loading="lazy"
            decoding="async"
          />
          <div className="ox-branch-map__info">
            <Icon name="branch-visit" size={32} className="ox-branch-map__icon" />
            <p className="ox-branch-map__address ox-body">{t('ox.branch.address')}</p>

            {landmark ? <p className="ox-branch-map__landmark ox-small">{landmark}</p> : null}

            <Button
              type="button"
              size={44}
              variant="secondary"
              className="ox-branch-map__view"
              onClick={() => setEmbedOpen(true)}
              data-testid="ox-branch-map-view"
            >
              {t(BRANCH.map.viewKey)}
            </Button>

          </div>

        </div>

      )}
      <div className="ox-branch-map__actions">
        <Button
          href={BRANCH_LISTING.directionsUrl}
          size={44}
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
          iconStart={<Icon name="map-pin" size={20} />}

          className="ox-branch-map__link"
        >
          {t(BRANCH.map.directionsKey)}
        </Button>

        <Button
          href={openUrl}
          size={44}
          variant="secondary"
          target="_blank"
          rel="noopener noreferrer"
          className="ox-branch-map__link"
        >
          {t(BRANCH.map.openGoogleKey)}
        </Button>

      </div>

    </section>

  );
}
