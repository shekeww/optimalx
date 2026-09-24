import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { ProductsSliderWrapper } from '../blocks/ProductsSliderWrapper';
import { digitsOnly } from '../blocks/href';
import { Button } from '../common/Button';
import { SearchField } from '../layout/Header/MainBar';
import { XMark } from '../common/XMark';
import { settingText } from '../product/lib/claims';

export interface NotFoundProps {
  /** The latest-products rail is the 404's only extra block (DIRECTION 6.17). */
  showLatest?: boolean;
}

/**
 * The 404 page (DIRECTION 5.6 NotFound, 6.17, FINAL-content 6.6).
 *
 * It is passed to the root route as `notFoundComponent`, so it renders inside
 * `OptimalXLayout`: the header, the footer and the skip link are all still
 * there, which is the FINAL-content 6.6 rule that every error page keeps the
 * chrome and offers one primary way out.
 *
 * The mark at the top start is decoration and is hidden from assistive tech;
 * the headline is the page's only h1. The search field is the same instance
 * the header uses, so a shopper who landed on a dead link can search without
 * scrolling back up. No humour, no mascot.
 *
 * The figure is the brand mark itself (X-IDENTITY-2026-09-22.md §4.3/§6:
 * "404 | mark figure ... | accent on the figure [forbidden]"), in
 * `--ox-plate-2` rather than accent, BUILD 3.1 reserves the accent for
 * things people can click, and this document's own preamble says BUILD 3.1
 * wins over X-IDENTITY wherever the two disagree.
 */
export function NotFound({ showLatest = true }: NotFoundProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();

  const number = digitsOnly(
    settingText(settings as Record<string, unknown> | undefined, 'whatsapp_number') ??
      store?.contacts?.whatsapp ??
      ''
  );

  return (
    <div className="ox-page ox-page--404" data-testid="ox-notfound">
      <section className="ox-state">
        <XMark size={96} tone="plate-2" className="ox-state__mark ox-state__mark--lg" />
        <h1 className="ox-state__title ox-display">{t('ox.error.404_title')}</h1>

        <p className="ox-state__body ox-lead">{t('ox.error.404_body')}</p>


        <SearchField className="ox-state__search" />

        <div className="ox-state__actions">
          <Button to="/" size={48} variant="primary">
            {t('ox.error.home')}
          </Button>

          <Button to="/services" size={48} variant="secondary">
            {t('ox.services.title')}
          </Button>

          {number ? (
            <Button
              href={`https://wa.me/${number}`}
              size={48}
              variant="ghost"
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('ox.branch.whatsapp')}
            </Button>

          ) : null}
        </div>


        <p className="ox-state__report ox-small">{t('ox.error.report_link')}</p>

      </section>


      {showLatest ? (
        <ProductsSliderWrapper
          source="latest"
          perPage={8}
          sliderId="ox-404-latest"
          title={t('ox.error.latest_title')}
          className="ox-page--404__latest"
        />
      ) : null}
    </div>

  );
}
