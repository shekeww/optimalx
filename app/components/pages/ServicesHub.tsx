import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { ChannelCard } from '../blocks/ChannelCard';
import { Accordion } from '../common/Accordion';
import { Button } from '../common/Button';
import { replySlaHours } from '../product/lib/claims';
import { SERVICE_CHANNELS, SERVICE_STEPS, SERVICES_HUB } from '../../content/services';
import { resolveFaq, type FaqRowKeys } from './faq';
import { HowItWorks } from './HowItWorks';
import { ScopePanel } from './ScopePanel';
import { ContactRow } from './ContactRow';

/** The four hub rows (FINAL-content 4; the answers restate nothing new). */
export const SERVICES_FAQ: FaqRowKeys[] = [1, 2, 3, 4].map((n) => ({
  id: `services-faq-${n}`,
  qKey: `ox.services.faq_${n}_q`,
  aKey: `ox.services.faq_${n}_a`,
}));

/**
 * `/services`: the "ask before you buy" hub (DIRECTION 6.11).
 *
 * Composition, top to bottom: breadcrumb, the goal-landing hero construction
 * carrying the page's only h1, the three channel cards, the scope panel, the
 * three steps, the FAQ and a contact row.
 *
 * Claims gates on this page (PLAN-final 5.1):
 *  - the medical line renders verbatim under the scope panel and again under
 *    every channel card;
 *  - the consultation credit renders only through `ChannelCard`, from the
 *    `consultation_credit_note` setting, verbatim and only when it is set;
 *  - a reply-time promise renders only when `reply_sla_hours` is set, and
 *    interpolates it. With the setting empty nothing about reply time is said.
 *
 * The hero carries no eyebrow: amendment A4 allows one only when it states a
 * fact the heading lacks, and "الخدمات" states nothing the h1 does not.
 */
export function ServicesHub() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();
  const replyHours = replySlaHours(settings as Record<string, unknown> | undefined);
  const faqRows = resolveFaq(t, SERVICES_FAQ);

  const page: Page = { title: t('ox.services.title'), slug: 'services' };

  return (
    <div className="ox-page ox-page--services">
      <Breadcrumb page={page} />

      <header className="ox-page-hero">
        <div className="ox-page-hero__body">
          <h1 className="ox-page-hero__title ox-display">{t(SERVICES_HUB.h1Key)}</h1>
          <p className="ox-page-hero__sub ox-lead">{t(SERVICES_HUB.sublineKey)}</p>
          <p className="ox-page-hero__intro ox-body">{t(SERVICES_HUB.introKey)}</p>
          {replyHours ? (
            <p className="ox-page-hero__reply ox-small" data-testid="ox-reply-line">
              {t('ox.services.reply_within', { hours: replyHours })}
            </p>
          ) : null}
        </div>
        <div className="ox-page-hero__panel" aria-hidden="true" />
      </header>

      <section className="ox-hub__section" aria-labelledby="ox-hub-channels">
        <h2 id="ox-hub-channels" className="ox-h2">
          {t('ox.services.channels_title')}
        </h2>
        <div className="ox-channels">
          {SERVICE_CHANNELS.map((channel) => (
            <div key={channel.id} className="ox-hub__channel">
              <ChannelCard channel={channel} />
              <p className="ox-hub__card-note ox-small">{t(SERVICES_HUB.cardFooterKey)}</p>
              <p className="ox-hub__card-note ox-small" data-testid="ox-medical-line">
                {t('ox.services.medical_line')}
              </p>
            </div>
          ))}
        </div>
      </section>

      <ScopePanel className="ox-hub__scope" />

      <HowItWorks
        className="ox-hub__how"
        steps={SERVICE_STEPS}
        titleKey="ox.services.how_title"
      />

      {faqRows.length > 0 ? (
        <section className="ox-hub__faq" aria-labelledby="ox-hub-faq">
          <h2 id="ox-hub-faq" className="ox-h2">
            {t('ox.services.faq_title')}
          </h2>
          <Accordion
            items={faqRows.map((row) => ({
              id: row.id,
              title: row.question,
              children: <p className="ox-body">{row.answer}</p>,
            }))}
          />
        </section>
      ) : null}

      <ContactRow
        className="ox-hub__contact"
        titleKey="ox.services.contact_title"
        phone={store?.contacts?.phone ?? store?.contacts?.mobile}
      />

      <p className="ox-hub__foot ox-small">
        <Button to="/branch" variant="link">
          {t('ox.nav.branch')}
        </Button>
      </p>
    </div>
  );
}
