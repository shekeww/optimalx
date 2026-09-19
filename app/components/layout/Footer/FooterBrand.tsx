import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Wordmark } from '../../common/Wordmark';

/**
 * The brand block at the footer's inline-end: the lockup, what the store
 * sells, and the line about where that gets the customer.
 *
 * The approved image's second line is dialect. It ships in Modern Standard
 * Arabic instead (`ox.footer.tagline_2` plus the emphasised closing word),
 * which is the house rule outranking the mock.
 */
export function FooterBrand() {
  const { t } = useTranslation();

  return (
    <div className="ox-footer__brand" data-testid="ox-footer-brand">
      {/* The footer has the vertical room the header does not, so it carries
          the full lockup including the NUTRITION & WELLNESS rule. */}
      <Wordmark width={172} variant="full" tone="dark" />
      <p className="ox-footer__tagline">
        {t('ox.footer.tagline')}
        <span className="ox-footer__tagline-2">
          {t('ox.footer.tagline_2')} <em>{t('ox.footer.tagline_2_goal')}</em>
        </span>
      </p>
    </div>
  );
}
