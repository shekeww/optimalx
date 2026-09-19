import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

/**
 * The first focusable element on every page (DIRECTION 5.1 SkipLink,
 * 9.2 "skip link").
 *
 * Visually hidden with the clip pattern until it takes keyboard focus, then it
 * shows as a control on the graphite band at the start edge, above everything
 * (--ox-z-skip), and jumps past the chrome to `#main-content`.
 *
 * The target is `#main-content`, not `#main`: the engine, the Salla SDK and
 * the storefront apps all key off that id (PLAN-final correction C8).
 */
export function SkipLink() {
  const { t } = useTranslation();

  return (
    <a href="#main-content" className="ox-skip">
      {t('ox.a11y.skip')}
    </a>
  );
}
