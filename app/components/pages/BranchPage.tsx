
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { OxBranch } from '../blocks/OxBranch';
import { Accordion } from '../common/Accordion';
import { Band } from '../common/Band';
import { Icon } from '../common/Icon';
import { Panel } from '../common/Panel';
import { BRANCH, parseBranchHours } from '../../content/branch';
import { channelById } from '../../content/services';
import { STORE_PHOTOS, type StorePhoto } from '../../content/store-photos';
import { Button } from '../common/Button';
import { BranchGallery } from './BranchGallery';
import { BranchMap } from './BranchMap';
import { ContactRow } from './ContactRow';
import { resolveFaq, type FaqRowKeys } from './faq';
import { PickupSteps } from './PickupSteps';
import { VisitStickyBar } from './VisitStickyBar';
import { OxBreadcrumb } from '../common/OxBreadcrumb';

/** The anchor `VisitStickyBar` watches: `OxBranch`'s own root, the page's
 *  first visit-booking control (its actions row). */
const VISIT_STICKY_ANCHOR = '[data-testid="ox-branch"]';

/** The three branch rows (FINAL-content 5.7), by content key. */
export const BRANCH_FAQ: FaqRowKeys[] = BRANCH.faq.map((row, index) => ({
  id: `branch-faq-${index + 1}`,
  qKey: row.qKey,
  aKey: row.aKey,
}));

export interface BranchPageProps {
  /** Test seam for the "today" row and the open/closed chip. */
  now?: Date;
}

/**
 * `/branch`: the Al Khalidiyah branch (DIRECTION 6.12).
 *
 * The page carries the keyword h1 from FINAL-content 5 and the 59-word intro,
 * then reuses the shared `OxBranch` block one heading level down. DIRECTION
 * 6.12 describes the block as carrying the h1 itself, but the block's heading
 * is a fixed locale key that P1b owns ("our branch in Madinah") while the
 * page's h1 is mandated verbatim by the keyword research, so the h1 sits in
 * the page header and the block heading is the section's h2. One h1, and the
 * mandated wording is the one a shopper and a crawler see.
 *
 * The page carries no dark band by default: `OxBranch` already puts a
 * photograph at the top of it, and a second full-width dark block would be
 * the screen's second hero. Conductor addendum 2026-09-24 (mid-batch, the
 * owner's photo of the lit X mark on the branch's ribbed wall): once
 * `STORE_PHOTOS['mark-wall']` exists, the page opens instead on a contained
 * S7b-style `Band` (`docs/build/progress/S7b.md`) carrying that photograph, a
 * scrim, and the SAME h1/lead this page always printed, now inside the band
 * rather than a plain header, one h1 either way. Absent the photo (every
 * store today), the page falls back to the plain header exactly as before.
 *
 * `StoreRating` (VISIT-2026-09-24 §3, §4.4) is NOT declared a second time
 * here: `OxBranch` (V1) already carries it, unconditionally, under its own
 * title, immediately below the lead/band either way. A second rail directly
 * under the page's own lead would put the identical figure on screen twice
 * within one scroll, so this page relies on the shared block's copy rather
 * than repeating it.
 *
 * LocalBusiness structured data is NOT declared here: the site-wide graph in
 * `components/seo/registerHeadHooks.tsx` emits the one `#localbusiness` node,
 * with this branch's geo and opening hours, on every route (PLAN-final B5).
 *
 * Every fact below is gated on a theme setting: the hours table hides itself
 * when `branch_hours` parses to nothing, the pickup steps hide until both
 * pickup numbers are set, the map falls back to a click-to-load facade
 * (VISIT §4.4), and a FAQ answer whose placeholder is unresolved is dropped
 * rather than printed. `VisitStickyBar` (mobile only) shows once `OxBranch`'s
 * own actions scroll out of view, gated on the visit product's own catalogue
 * entry.
 *
 * `BranchGallery` is passed `showStorefront={false}` (S9h, owner screenshots
 * 2026-09-24): `OxBranch`'s own cover above now shows the storefront
 * photograph too, so this page's gallery drops its own storefront tile
 * rather than printing the identical photograph twice in one scroll,
 * leaving three tiles.
 */
export function BranchPage({ now }: BranchPageProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const faqRows = resolveFaq(t, BRANCH_FAQ);
  const page: Page = { title: t(BRANCH.h1Key), slug: BRANCH.slug };

  // THE INTRO PROMISED THE HOURS AND THE PAGE HAD NONE (UX-2026-09-24 P0-7).
  // `branch_hours` is null on this store, so `OxBranch` correctly hides its
  // table, and the paragraph above it still said the opening hours were here.
  // The closing sentence is now the same gate as the table: with hours it
  // says they are here, without them it says where to ask for them.
  const hoursSetting = (settings as Record<string, unknown> | undefined)?.branch_hours;
  const hasHours = parseBranchHours(typeof hoursSetting === 'string' ? hoursSetting : null).length > 0;
  // The booking product the "book a time for your visit" row describes. It is
  // the catalogue's own entry for the visit channel, never a typed id: an id
  // in a component is a dead link the day the store is rebuilt.
  const visitHref = channelById('visit')?.to;
  const lead = (
    <>
      {t(BRANCH.introKey)} {t(hasHours ? 'ox.branch.intro_with_hours' : 'ox.branch.intro_no_hours')}
    </>

  );
  // Conductor addendum 2026-09-24: absent until the owner's photograph lands
  // (`scripts/store-photos-import.mjs`); the cast matches the type the
  // manifest will carry the slug under the day it does.
  const markWallPhoto = (STORE_PHOTOS as Partial<Record<string, StorePhoto>>)['mark-wall'];

  return (
    <div className="ox-page ox-page--branch">
      <OxBreadcrumb page={page} />


      {markWallPhoto ? (
        <Band
          id="ox-branch-band"
          className="ox-page--branch__band"
          photo={markWallPhoto.photo}
          alt={t(BRANCH.markWallAltKey)}
          headingLevel="h1"
          line1={t(BRANCH.h1Key)}
          subline={lead}
        />

      ) : (
        <header className="ox-page-head">
          <h1 className="ox-page-head__title ox-h1">{t(BRANCH.h1Key)}</h1>

          <p className="ox-page-head__lead ox-lead">{lead}</p>

        </header>

      )}

      <OxBranch
        headingLevel="h2"
        showEyebrow={false}
        now={now}
        className="ox-page--branch__block"
        photo={STORE_PHOTOS.storefront.photo}
      />


      <BranchGallery className="ox-page--branch__gallery" showStorefront={false} />


      <BranchMap className="ox-page--branch__map" />

      <section className="ox-branch-do" aria-labelledby="ox-branch-do-title">
        <h2 id="ox-branch-do-title" className="ox-h2">
          {t(BRANCH.doTitleKey)}
        </h2>

        <div className="ox-branch-do__grid">
          {BRANCH.doList.map((item, index) => {
            // The last row is "book a time for your visit", and it described
            // a booking with nothing to press (P0-7). It carries the link to
            // the product that IS the booking now.
            const href = index === BRANCH.doList.length - 1 ? (visitHref ?? null) : null;
            return (
              <Panel key={item.titleKey} className="ox-branch-do__item">
                <h3 className="ox-branch-do__item-title">
                  <Icon name="tick" size={20} className="ox-branch-do__tick" />
                  <span>{t(item.titleKey)}</span>

                </h3>

                <p className="ox-branch-do__line ox-small">{t(item.lineKey)}</p>

                {href ? (
                  <Button to={href} variant="secondary" size={44} className="ox-branch-do__cta">
                    {t('ox.pdp.book_now')}
                  </Button>

                ) : null}
              </Panel>

            );
          })}
        </div>

      </section>


      <PickupSteps className="ox-page--branch__pickup" />

      {faqRows.length > 0 ? (
        <section className="ox-page--branch__faq" aria-labelledby="ox-branch-faq-title">
          <h2 id="ox-branch-faq-title" className="ox-h2">
            {t('ox.branch.faq_title')}
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

      <ContactRow className="ox-page--branch__contact" />

      <VisitStickyBar anchorSelector={VISIT_STICKY_ANCHOR} now={now} />

    </div>

  );
}
