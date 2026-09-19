import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { OxBranch } from '../blocks/OxBranch';
import { Accordion } from '../common/Accordion';
import { Icon } from '../common/Icon';
import { Panel } from '../common/Panel';
import { BRANCH } from '../../content/branch';
import { BranchMap } from './BranchMap';
import { ContactRow } from './ContactRow';
import { resolveFaq, type FaqRowKeys } from './faq';
import { PickupSteps } from './PickupSteps';

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
 * The page carries no dark band: `OxBranch` already puts a photograph at the
 * top of it, and a second full-width dark block would be the screen's second
 * hero. The wedge is spent on the block's own photo edge.
 *
 * LocalBusiness structured data is NOT declared here: the site-wide graph in
 * `components/seo/registerHeadHooks.tsx` emits the one `#localbusiness` node,
 * with this branch's geo and opening hours, on every route (PLAN-final B5).
 *
 * Every fact below is gated on a theme setting: the hours table hides itself
 * when `branch_hours` parses to nothing, the pickup steps hide until both
 * pickup numbers are set, the map falls back to a link and then to nothing,
 * and a FAQ answer whose placeholder is unresolved is dropped rather than
 * printed.
 */
export function BranchPage({ now }: BranchPageProps) {
  const { t } = useTranslation();
  const faqRows = resolveFaq(t, BRANCH_FAQ);
  const page: Page = { title: t(BRANCH.h1Key), slug: BRANCH.slug };

  return (
    <div className="ox-page ox-page--branch">
      <Breadcrumb page={page} />

      <header className="ox-page-head">
        <h1 className="ox-page-head__title ox-h1">{t(BRANCH.h1Key)}</h1>
        <p className="ox-page-head__lead ox-lead">{t(BRANCH.introKey)}</p>
      </header>

      <OxBranch headingLevel="h2" showEyebrow={false} now={now} className="ox-page--branch__block" />

      <BranchMap className="ox-page--branch__map" />

      <section className="ox-branch-do" aria-labelledby="ox-branch-do-title">
        <h2 id="ox-branch-do-title" className="ox-h2">
          {t(BRANCH.doTitleKey)}
        </h2>
        <div className="ox-branch-do__grid">
          {BRANCH.doList.map((item) => (
            <Panel key={item.titleKey} className="ox-branch-do__item">
              <h3 className="ox-branch-do__item-title">
                <Icon name="tick" size={20} className="ox-branch-do__tick" />
                <span>{t(item.titleKey)}</span>
              </h3>
              <p className="ox-branch-do__line ox-small">{t(item.lineKey)}</p>
            </Panel>
          ))}
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
    </div>
  );
}
