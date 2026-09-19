import { useId, useMemo, useState } from 'react';
import { Breadcrumb } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { Accordion } from '../common/Accordion';
import { Band } from '../common/Band';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { Panel } from '../common/Panel';
import { PageAnchors } from './PageAnchors';
import { FAQ_PAGE_GROUPS } from '../../content/faq';
import { SERVICE_PHOTOS } from '../../content/services';
import { ContactRow } from './ContactRow';
import { resolveFaq, type ResolvedFaqRow } from './faq';

interface ResolvedGroup {
  id: string;
  title: string;
  rows: ResolvedFaqRow[];
}

/** Case-folded, so a shopper typing in either script matches either way. */
function matches(row: ResolvedFaqRow, needle: string): boolean {
  if (needle.length === 0) return true;
  const hay = `${row.question} ${row.answer}`.toLowerCase();
  return hay.includes(needle);
}

export interface FaqPageProps {
  /** The store page's own title, used for the breadcrumb only. */
  title?: string;
}

/**
 * The FAQ page (PLAN-final 5.3 "FAQ", reference `references/faq.png`).
 *
 * The reference is a dark band hero, a search field and accordion rows with a
 * thumbnail at the RTL start. Two departures, both deliberate: the thumbnails
 * are gone, because a stock photograph beside a question is decoration that
 * earns nothing and the store has no artwork for eleven of them; and the rows
 * are grouped into panels with an anchor strip, because the page runs well
 * past one screen and the strip is the system's in-page navigation.
 *
 * Every question and answer comes from `app/content/faq.ts`, which in turn
 * reuses the hub, home and branch answers rather than restating them. Nothing
 * on this page is new copy, so nothing on it is a new claim.
 *
 * The filter is client side and purely additive: with JavaScript off, or
 * before hydration, every row is present and readable, which is also what a
 * crawler sees.
 */
export function FaqPage({ title }: FaqPageProps) {
  const { t } = useTranslation();
  const store = useStore();
  const fieldId = useId();
  const [query, setQuery] = useState('');

  const groups: ResolvedGroup[] = useMemo(
    () =>
      FAQ_PAGE_GROUPS.map((group) => ({
        id: group.id,
        title: t(group.titleKey),
        rows: resolveFaq(t, group.items),
      })).filter((group) => group.rows.length > 0),
    [t]
  );

  const needle = query.trim().toLowerCase();
  const visible = groups
    .map((group) => ({ ...group, rows: group.rows.filter((row) => matches(row, needle)) }))
    .filter((group) => group.rows.length > 0);

  const page: Page = { title: title ?? t('ox.pages.faq.h1'), slug: 'faq' };

  return (
    <div className="ox-page ox-page--faq">
      <Breadcrumb page={page} />

      <Band
        id="ox-faq-band"
        className="ox-page--faq__band"
        photo={SERVICE_PHOTOS.services}
        headingLevel="h1"
        line1={t('ox.pages.faq.h1')}
        subline={t('ox.pages.faq.lead')}
      />

      <div className="ox-faq-filter ox-field">
        <label className="ox-field__label" htmlFor={fieldId}>
          {t('ox.pages.faq.search_label')}
        </label>
        <input
          id={fieldId}
          className="ox-input"
          type="search"
          value={query}
          placeholder={t('ox.pages.faq.search_placeholder')}
          onChange={(event) => setQuery(event.target.value)}
          data-testid="ox-faq-filter"
        />
      </div>

      {visible.length > 1 ? (
        <PageAnchors items={visible.map((group) => ({ id: group.id, label: group.title }))} />
      ) : null}

      {visible.length > 0 ? (
        <div className="ox-faq-groups">
          {visible.map((group) => (
            <Panel
              key={group.id}
              id={group.id}
              title={group.title}
              headingLevel="h2"
              className="ox-faq-group"
            >
              <Accordion
                items={group.rows.map((row) => ({
                  id: row.id,
                  title: row.question,
                  children: <p className="ox-body">{row.answer}</p>,
                }))}
              />
            </Panel>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="help"
          headingLevel="h2"
          title={t('ox.pages.faq.empty_title')}
          body={t('ox.pages.faq.empty_body')}
          primary={
            <Button to="/services" size={48} variant="primary">
              {t('ox.services.title')}
            </Button>
          }
        />
      )}

      <ContactRow
        className="ox-page--faq__contact"
        titleKey="ox.pages.faq.contact_title"
        phone={store?.contacts?.phone ?? store?.contacts?.mobile}
      />
    </div>
  );
}

export default FaqPage;
