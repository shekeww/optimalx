import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

/**
 * First focusable element on every page. Visually hidden until it receives
 * keyboard focus, then floats above the header (z --ox-z-skip) and jumps past
 * the chrome to `#main-content` (the layout's <main>).
 */
export function SkipLink() {
  const { t } = useTranslation();

  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:fixed focus:start-2 focus:top-2 focus:z-[var(--ox-z-skip)] focus:rounded focus:bg-ox-card focus:px-4 focus:py-2 focus:font-semibold focus:text-ox-ink focus:shadow-md"
    >
      {t('ox.a11y.skip')}
    </a>
  );
}
