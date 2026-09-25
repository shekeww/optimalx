import { Suspense } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';

/**
 * The bottom strip: the copyright at the inline-start, the Latin line at the
 * inline-end, and the accent wedge bleeding off the end edge.
 *
 * The copyright stays the engine's `copyright` hook slot, the contract a
 * storefront app overrides. Its fallback is the theme's own line
 * (`ox.footer.copyright`, the year interpolated) rather than the engine's
 * `Copyright`, which printed the English "Copyright | 2026 Optimal X" on the
 * Arabic store (phase B, HC-16: the Shopify port's Arabic line is the named
 * improvement, so the reference now prints the same one).
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
  const year = new Date().getFullYear();

  return (
    <div className="ox-footer__strip" data-testid="ox-footer-strip">
      <span className="ox-footer__wedge" aria-hidden="true" />
      <div className="ox-footer__strip-inner ox-container">
        <p className="ox-footer__copyright ox-small copyright-text">
          <Suspense fallback={null}>
            <HookSlot
              name="copyright"
              context={{ storeName: store?.name }}
              fallback={<span data-testid="ox-footer-copyright">{t('ox.footer.copyright', { year })}</span>}

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
