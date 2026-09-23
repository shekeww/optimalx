import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { Accordion } from '../common/Accordion';
import { Band } from '../common/Band';
import { Button } from '../common/Button';
import { pathForSku } from '../../content/salla-ids';
import {
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
import { OxServices } from '../home/OxServices';

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
 * Composition, top to bottom: breadcrumb, the dark cover band (contained in
 * the page gutter, its plate cut like the primary CTA — owner item
 * 2026-09-24, S7b) carrying the page's only h1 and its one primary action,
 * the intro in the text measure,
 * the advisory band (`OxServices`, the same section the home page draws,
 * carrying BOTH of its rows: the three ways to ask, then the three programmes
 * the asking leads to), the five services side by side in one comparison
 * grid, the scope panel, the anchor strip, the five service sections, the
 * three steps, the FAQ and a contact row.
 *
 * ## Three structural decisions worth the reader's time
 *
 * **The three channels are the band's own row one, not a section of their
 * own** (owner review 2026-09-23, late night). This page used to draw a
 * dedicated channel section here, in the fuller `ChannelCard`, with the band
 * below it carrying the plan doors alone; the same three services therefore
 * introduced themselves twice within one screenful and a third time in the
 * comparison grid, in three different card shapes. One composition replaces
 * the two, which is also what lets the band's two row titles do their work:
 * the reader sees one offer in two steps on this page and on the home page
 * alike. Nothing was lost with the section: every channel's description,
 * scope, preparation, output and change policy is the `ServiceSection` for
 * that channel further down, and `ChannelCard` itself still ships where it is
 * not a repeat (`/contact`, the kitchen sink). The page's page-level
 * reply-time line went with it for the same reason: the band states that fact
 * once, under the row where the written question actually sits.
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
 *  - the medical line renders verbatim once directly under the advisory band
 *    (covering both of its rows) and again under the scope panel;
 *  - the consultation credit renders on the video door, from the
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
  const store = useStore();
  const faqRows = resolveFaq(t, SERVICES_FAQ);

  const page: Page = { title: t('ox.services.title'), slug: 'services' };
  const heroTo = pathForSku('OX-044') ?? '/services';

  return (
    <div className="ox-page ox-page--bleed ox-page--services">
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
      </section>

      {/* THE OFFER, both rows of it: the three ways to ask and the three
          programmes the asking leads to, in the same band `OxServices` draws
          on the home page (owner review 2026-09-23, late night). This page
          used to open on its own fuller channel section, with the band below
          it carrying the plan doors alone; the three channels therefore
          appeared twice on the page in two card shapes, and a third time in
          the comparison grid below. One composition replaces the two: the
          band's own row one is the channel row now, the row titles say which
          question each row answers, and the fuller card survives where it is
          not a repeat (`/contact`, the kitchen sink).

          NOT full bleed here (owner review 2026-09-23, item 3): the home page
          opens on nothing else dark, while this page already opened on the
          dark hero band above (contained in the page gutter since S7b,
          2026-09-24 — it was never meant to be full bleed either), and a
          second full-width near-black band directly under it read as one
          long band rather than two sections.
          `.ox-hub__advisory` (`_b5-pages.scss`) sits it inside the page's own
          container instead, with its own radius. `routeOut={false}`: the band
          routes nobody out to the page they are standing on, so its primary
          action is the written-question door itself. */}
      <OxServices className="ox-hub__advisory" routeOut={false} />

      <p className="ox-hub__medical ox-small" data-testid="ox-medical-line">
        {t('ox.services.medical_line')}
      </p>

      {/* Between the advisory section and the five full sections: the visitor
          has just seen the three ways in and the three programmes, and the
          next question is which of the five services answers theirs.
          Answering it after the five sections would be answering it too
          late. */}
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
