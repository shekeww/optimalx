
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { Band } from '../common/Band';
import { Bdi } from '../common/Bdi';
import { Button } from '../common/Button';
import { Panel, PanelRow } from '../common/Panel';
import { StatStrip, type StatCellData } from '../common/StatStrip';
import { settingText } from '../product/lib/claims';
import {
  ABOUT_FACTS,
  ABOUT_FACTS_ENABLED,
  ABOUT_HOW,
  ABOUT_HOW_LINES,
  ABOUT_OWN,
  ABOUT_REGISTRATION,
  ABOUT_STORY,
  ABOUT_WHY,
} from '../../content/about';
import { SERVICE_PHOTOS } from '../../content/services';
import { STORE_PHOTOS, type StorePhoto } from '../../content/store-photos';
import { OxBreadcrumb } from '../common/OxBreadcrumb';

/**
 * `/about` (DIRECTION 6.15, FINAL-content 6.1, voice-ksa.md section 7).
 *
 * The dark band carries the h1 and the factual lead, the statistic strip
 * carries the three facts the store can prove, then the founders' story
 * (voice-ksa.md 7.2/7.3, owner-authored and 7.4 claims-audited): the "قصة
 * اوبتيمال اكس" section, the "كيف نعمل؟" section, the "ما نملكه اليوم واضح:"
 * list and the closing tagline. After the story, the page returns to the
 * existing system: four panels carry the summary reasons, and a plate panel
 * carries the registration numbers once they exist, closing on the mandated
 * medical line.
 *
 * What the page may say is decided by the claims source, not by the designer:
 * no founding year, no customer count, no years of training, no titles and no
 * portraits. The team is "two partners" in one sentence inside the story and
 * in one statistic cell, and the story says outright that the store is at its
 * beginning and invents no ratings or numbers.
 *
 * The reference's "100+ Personalized Plans / 5+ Expert Specialists / 98%
 * Client Satisfaction" strip is three invented statistics and is not built;
 * `app/content/about.ts` records what replaced it and why.
 *
 * DIRECTION 6.15 block 4 is a storefront photograph. Asset brief item 8.4 has
 * not been delivered, so the block is absent rather than a placeholder frame,
 * and the band is where the page gets its imagery.
 */
export function AboutPage() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const themeSettings = settings as Record<string, unknown> | undefined;

  const registration = ABOUT_REGISTRATION.map((row) => ({
    ...row,
    value: settingText(themeSettings, row.setting),
  }));
  const showsRegistration = registration.every((row) => Boolean(row.value));

  const cells: StatCellData[] = ABOUT_FACTS_ENABLED
    ? ABOUT_FACTS.map((fact) => ({
        id: fact.id,
        ...(fact.valueKey ? { value: <Bdi>{t(fact.valueKey)}</Bdi> } : {}),

        ...(fact.glyph ? { glyph: fact.glyph } : {}),
        label: t(fact.labelKey),
        ...(fact.subKey ? { sub: t(fact.subKey) } : {}),
      }))
    : [];

  const page: Page = { title: t('ox.pages.about.h1'), slug: 'about' };

  // S9a-V3 item 4 (gated): the owner's 'mark-wall' photograph (the lit
  // orange X on the ribbed wall inside the store) is not in the manifest
  // yet, the conductor adds it to `STORE_PHOTOS` once the owner's file
  // lands. Read defensively so this line is inert until then and keeps
  // today's band photo otherwise.
  const markWall = (STORE_PHOTOS as Partial<Record<string, StorePhoto>>)['mark-wall'];
  const bandPhoto = markWall?.photo ?? SERVICE_PHOTOS.services;

  return (
    <div className="ox-page ox-page--about">
      <OxBreadcrumb page={page} />


      <Band
        id="ox-about-band"
        className="ox-page--about__band"
        photo={bandPhoto}
        headingLevel="h1"
        line1={t('ox.pages.about.h1')}
        subline={t('ox.pages.about.lead')}
      />


      <StatStrip cells={cells} className="ox-page--about__stats" />

      <section className="ox-about-story" aria-labelledby="ox-about-story-title">
        <h2 id="ox-about-story-title" className="ox-h2">
          {t('ox.pages.about.story_title')}
        </h2>

        {ABOUT_STORY.map((key) => (
          <p key={key} className="ox-about-story__p ox-body">
            {t(key)}
          </p>

        ))}
      </section>


      <section className="ox-about-story" aria-labelledby="ox-about-how-title">
        <h2 id="ox-about-how-title" className="ox-h2">
          {t('ox.pages.about.how_title')}
        </h2>

        {ABOUT_HOW.map((key) => (
          <p key={key} className="ox-about-story__p ox-body">
            {t(key)}
          </p>

        ))}
        {ABOUT_HOW_LINES.map((key) => (
          <p key={key} className="ox-about-story__p ox-small">
            {t(key)}
          </p>

        ))}
      </section>


      <div className="ox-about-own">
        <p className="ox-about-story__p ox-body">{t('ox.pages.about.own_title')}</p>

        <ul className="ox-about-own__list">
          {ABOUT_OWN.map((key) => (
            <li key={key} className="ox-body">
              {t(key)}
            </li>

          ))}
        </ul>

      </div>


      <p className="ox-about-closing ox-display" data-testid="ox-about-closing">
        {t('ox.pages.about.closing')}
      </p>


      <section className="ox-about-why" aria-labelledby="ox-about-why-title">
        <h2 id="ox-about-why-title" className="ox-h2">
          {t('ox.pages.about.why_title')}
        </h2>

        <div className="ox-about-why__grid">
          {ABOUT_WHY.map((item) => (
            <Panel key={item.id} title={t(item.titleKey)} className="ox-about-why__item">
              <p className="ox-about-why__body ox-body">{t(item.bodyKey)}</p>

            </Panel>

          ))}
        </div>

      </section>


      {showsRegistration ? (
        <Panel
          tone="plate"
          headingLevel="h2"
          title={t('ox.pages.about.registration_title')}
          className="ox-about-reg"
          testId="ox-registration-panel"
        >
          {registration.map((row) => (
            <PanelRow
              key={row.id}
              label={t(row.labelKey)}
              value={
                <Bdi ltr lang={null}>
                  {row.value}
                </Bdi>

              }
            />

          ))}
        </Panel>

      ) : null}

      <p className="ox-about-story__p ox-small" data-testid="ox-medical-line">
        {t('ox.services.medical_line')}
      </p>


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
