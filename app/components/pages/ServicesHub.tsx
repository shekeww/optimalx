
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { ChannelCard } from '../blocks/ChannelCard';
import { Accordion } from '../common/Accordion';
import { Band } from '../common/Band';
import { Button } from '../common/Button';
import { replySlaHours } from '../product/lib/claims';
import { pathForSku } from '../../content/salla-ids';
import {
  SERVICE_CHANNELS,
  SERVICE_PAGES,
  SERVICE_PHOTOS,
  SERVICE_STEPS,
  SERVICES_HUB,
} from '../../content/services';
import { resolveFaq, type FaqRowKeys } from './faq';
import { HowItWorks } from './HowItWorks';
import { PageAnchors } from './PageAnchors';
import { ScopePanel } from './ScopePanel';
import { ServiceCompare } from './ServiceCompare';
import { ServiceSection } from './ServiceSection';
import { ContactRow } from './ContactRow';
import { OxBreadcrumb } from '../common/OxBreadcrumb';

/** The four hub rows (FINAL-content 4; the answers restate nothing new). */
export const SERVICES_FAQ: FaqRowKeys[] = [1, 2, 3, 4].map((n) => ({
  id: `services-faq-${n}`,
  qKey: `ox.services.faq_${n}_q`,
  aKey: `ox.services.faq_${n}_a`,
}));

/**
 * `/services`: the "ask before you buy" hub, and the home of all five advisory
 * services (DIRECTION 6.11, PLAN-final 5.3).
 *
 * Composition, top to bottom: breadcrumb, the dark band carrying the page's
 * only h1 and its one primary action, the intro in the text measure, the three
 * channel cards as the quick chooser, the five services side by side in one
 * comparison grid, the scope panel, the anchor strip, the five service
 * sections, the three steps, the FAQ and a contact row.
 *
 * ## Two structural decisions worth the reader's time
 *
 * **The hero is the shared `Band`, not DIRECTION 6.11's light "goal
 * construction".** DIRECTION predates the approved image; the image
 * establishes the band as the page-level device, and every service reference
 * the owner supplied (`cover_advisory.png`, `nutrition.png`,
 * `personal-training.png`) is a dark band hero. The band is this screen's one
 * wedge, so nothing below it carries another.
 *
 * **The five services are sections of this page, not five routes.** They were
 * specified at `/services/$channel`; the engine's route-tree generator will
 * not add any new path to `app/routeTree.gen.ts` (see the note on
 * `ServiceSection`), so each service gets an `id`, a place in the anchor strip
 * and a `/services#slug` address instead. The strip is exactly what the design
 * system prescribes for a page longer than one screen.
 *
 * ## Claims gates (PLAN-final 5.1)
 *  - the medical line renders verbatim under the scope panel and again under
 *    every channel card;
 *  - the consultation credit renders only through `ChannelCard`, from the
 *    `consultation_credit_note` setting, verbatim and only when it is set;
 *  - a reply-time promise renders only when `reply_sla_hours` is set, and
 *    interpolates it. With the setting empty nothing about reply time is said;
 *  - no price is typed anywhere. Every card and every section reads its own
 *    live product.
 *
 * The band carries no eyebrow: amendment A4 allows one only when it states a
 * fact the heading lacks, and "الخدمات" states nothing the h1 does not.
 */
export function ServicesHub() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();
  const replyHours = replySlaHours(settings as Record<string, unknown> | undefined);
  const faqRows = resolveFaq(t, SERVICES_FAQ);

  const page: Page = { title: t('ox.services.title'), slug: 'services' };
  const heroTo = pathForSku('OX-044') ?? '/services';

  return (
    <div className="ox-page ox-page--services">
      <OxBreadcrumb page={page} />

      <Band
        id="ox-hub-band"
        className="ox-page--services__band"
        photo={SERVICE_PHOTOS.services}
        headingLevel="h1"
        line1={t(SERVICES_HUB.h1Key)}
        subline={t(SERVICES_HUB.sublineKey)}
        action={
          <Button to={heroTo} size={48} variant="primary">
            {t(SERVICES_HUB.ctaPrimaryKey)}
          </Button>
        }
      />

      <section className="ox-hub-intro" aria-labelledby="ox-hub-intro-title">
        <h2 id="ox-hub-intro-title" className="ox-sr-only">
          {t('ox.services.title')}
        </h2>
        <p className="ox-hub-intro__lead ox-lead">{t(SERVICES_HUB.introKey)}</p>
        {replyHours ? (
          <p className="ox-hub-intro__reply ox-small" data-testid="ox-reply-line">
            {t('ox.services.reply_within', { hours: replyHours })}
          </p>
        ) : null}
      </section>

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

      {/* Between the three channel cards and the five full sections: the
          visitor has just seen the three ways in, and the next question is
          which of the five services answers theirs. Answering it after the
          five sections would be answering it too late. */}
      <ServiceCompare className="ox-hub__compare" />

      <ScopePanel className="ox-hub__scope" />

      <PageAnchors
        items={SERVICE_PAGES.map((service) => ({
          id: service.slug,
          label: t(service.titleKey),
        }))}
      />

      <div className="ox-services-list">
        {SERVICE_PAGES.map((service) => (
          <ServiceSection key={service.slug} page={service} />
        ))}
      </div>

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
