import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { Button } from '../common/Button';
import { settingText } from '../product/lib/claims';

const WHY = [1, 2, 3, 4] as const;
const STORY = [1, 2, 3, 4] as const;

/**
 * `/about` (DIRECTION 6.15, FINAL-content 6.1).
 *
 * What the page may say is decided by the claims source, not by the designer:
 * no founding year, no customer count, no years of training, no titles and no
 * portraits. The team is "two partners" in one sentence inside the story and
 * nowhere else, and the fourth paragraph says outright that there are no
 * reviews and no sales numbers yet.
 *
 * The registration panel is a single gate: it renders only when the commercial
 * registration, the VAT number and the Maroof link are ALL filled (open
 * question Q4 leaves them empty today). FINAL-content 1.6: a footer, or a
 * panel, with an empty registration number is worse than one without the line.
 *
 * DIRECTION 6.15 block 4 is a storefront photograph; the asset brief item 8.4
 * has not been delivered, so the block is absent rather than a placeholder
 * frame.
 */
export function AboutPage() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const themeSettings = settings as Record<string, unknown> | undefined;

  const cr = settingText(themeSettings, 'cr_number');
  const vat = settingText(themeSettings, 'vat_number');
  const maroof = settingText(themeSettings, 'maroof_url');
  const showsRegistration = Boolean(cr && vat && maroof);

  const page: Page = { title: t('ox.pages.about.h1'), slug: 'about' };

  return (
    <div className="ox-page ox-page--about">
      <Breadcrumb page={page} />

      <header className="ox-page-head">
        <h1 className="ox-page-head__title ox-h1">{t('ox.pages.about.h1')}</h1>
        <p className="ox-page-head__lead ox-lead">{t('ox.pages.about.lead')}</p>
      </header>

      <section className="ox-about-why" aria-labelledby="ox-about-why-title">
        <h2 id="ox-about-why-title" className="ox-h2">
          {t('ox.pages.about.why_title')}
        </h2>
        <ul className="ox-about-why__grid">
          {WHY.map((n) => (
            <li key={n} className="ox-about-why__item">
              <h3 className="ox-about-why__item-title">{t(`ox.pages.about.why_${n}_title`)}</h3>
              <p className="ox-about-why__body ox-small">{t(`ox.pages.about.why_${n}_body`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="ox-about-story">
        {STORY.map((n) => (
          <p key={n} className="ox-about-story__p ox-body">
            {t(`ox.pages.about.story_${n}`)}
          </p>
        ))}
        <p className="ox-about-story__p ox-body" data-testid="ox-medical-line">
          {t('ox.services.medical_line')}
        </p>
      </section>

      {showsRegistration ? (
        <section className="ox-about-reg" data-testid="ox-registration-panel">
          <h2 className="ox-about-reg__title ox-h3">{t('ox.pages.about.registration_title')}</h2>
          <p className="ox-about-reg__line ox-small">
            {t('ox.footer.trust_line', { cr, vat, maroof })}
          </p>
        </section>
      ) : null}

      <div className="ox-about-out">
        <Button to="/services" size={48} variant="primary">
          {t('ox.services.title')}
        </Button>
        <Button to="/branch" size={48} variant="secondary">
          {t('ox.nav.branch')}
        </Button>
      </div>
    </div>
  );
}
