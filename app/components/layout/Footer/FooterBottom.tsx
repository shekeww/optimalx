import { Suspense } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Copyright } from '@salla.sa/twilight-theme-engine/layout';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';

/**
 * The bottom strip: the copyright at the inline-start, the Latin line at the
 * inline-end, and the accent wedge bleeding off the end edge.
 *
 * The copyright stays the engine's `copyright` hook slot with the engine's own
 * `Copyright` as the fallback (theme-engine chunk-DTWFNS3F.js:901-913), which
 * is both the contract a storefront app overrides and the only place the year
 * is computed rather than typed.
 *
 * The Latin line is behind `show_en_tagline`, off by default: it is not one of
 * the brand's approved taglines, so nothing unapproved reaches the storefront
 * until the owner turns it on.
 */
export function FooterBottom() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();

  const showTagline = (settings as Record<string, unknown> | undefined)?.show_en_tagline === true;

  return (
    <div className="ox-footer__strip" data-testid="ox-footer-strip">
      <span className="ox-footer__wedge" aria-hidden="true" />
      <div className="ox-footer__strip-inner ox-container">
        <p className="ox-footer__copyright ox-small copyright-text">
          <Suspense fallback={null}>
            <HookSlot
              name="copyright"
              context={{ storeName: store?.name }}
              fallback={<Copyright storeName={store?.name} />}

            />
          </Suspense>

        </p>


        {showTagline ? (
          <p className="ox-footer__en" lang="en" dir="ltr" data-testid="ox-footer-en-tagline">
            <span className="ox-latin-track">{t('ox.footer.en_tagline')}</span>

            {/* This line is always `dir="ltr"` (an English tagline), so the
                chevron always points at its own reading end, right, and never
                mirrors under the page's `[dir="rtl"]`, even though
                `chevron-end` is one of Icon.tsx's five auto-mirrored names.
                The inline `transform: none` outranks `.ox-mirror`'s
                `[dir='rtl']` rule (that rule carries no `!important`), which
                is the only way to keep this one LTR-pinned tagline row
                un-mirrored while every other `chevron-end` in the theme still
                flips normally under RTL. `.ox-footer__en .ox-icon`
                (_b1-layout.scss, owned elsewhere) already paints this accent
                through the class the Icon component carries. */}
            <Icon name="chevron-end" size={14} style={{ transform: 'none' }} />

          </p>

        ) : null}
      </div>

    </div>

  );
}
