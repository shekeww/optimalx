import { useMemo } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { ChannelCard } from '../blocks/ChannelCard';
import { HoursTable } from '../blocks/HoursTable';
import { digitsOnly, safeExternalUrl } from '../blocks/href';
import { Bdi } from '../common/Bdi';
import { Icon, type OxIconName } from '../common/Icon';
import { Panel } from '../common/Panel';
import { parseBranchHours } from '../../content/branch';
import { channelById } from '../../content/services';
import { isPendingCopy } from './copy';
import { settingText } from '../product/lib/claims';
import { OxBreadcrumb } from '../common/OxBreadcrumb';

interface ChannelRow {
  id: string;
  icon: OxIconName;
  labelKey: string;
  lineKey: string;
  value: string;
  href: string;
  external?: boolean;
}

/**
 * `/contact` (DIRECTION 6.16, FINAL-content 6.2).
 *
 * The page stays a short utility page: a header in the text measure, three
 * channel panels, the written-question card, the branch panel with its hours,
 * and the accounts row. It carries no dark band on purpose. The band is the
 * system's section break for a long page, and spending it here, one click from
 * the services hub and the FAQ which both open on one, would turn a signature
 * into a template.
 *
 * Every row is built from a real contact value and disappears with it: a store
 * with no WhatsApp number shows no WhatsApp row, and the page never prints a
 * channel it cannot honour.
 *
 * The values are Latin digits and Latin addresses inside Arabic text, so each
 * one is a `bdi` with `dir="ltr"` (DIRECTION 3.4 and the 9.8 RTL row). They
 * carry no `lang="en"`: amendment A5 is about Latin names, and a phone number
 * read in an Arabic voice is correct.
 *
 * There is no custom contact form. The written question is a product
 * (OX-044), so a shopper's question lands in the store's order flow and inbox
 * where the owner already works, instead of in a form with no backend
 * (DIRECTION 6.16 block 4).
 */
export function ContactPage() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();
  const themeSettings = settings as Record<string, unknown> | undefined;

  const whatsapp = digitsOnly(
    settingText(themeSettings, 'whatsapp_number') ?? store?.contacts?.whatsapp ?? ''
  );
  const phone = store?.contacts?.phone ?? store?.contacts?.mobile ?? '';
  const email = store?.contacts?.email ?? '';

  const rows: ChannelRow[] = [];
  if (whatsapp) {
    rows.push({
      id: 'whatsapp',
      icon: 'whatsapp',
      labelKey: 'ox.branch.whatsapp',
      lineKey: 'ox.pages.contact.whatsapp_line',
      value: whatsapp,
      href: `https://wa.me/${whatsapp}?text=${encodeURIComponent(t('ox.content.branch.whatsapp_prefill'))}`,
      external: true,
    });
  }
  if (phone) {
    rows.push({
      id: 'phone',
      icon: 'headset',
      labelKey: 'ox.form.phone',
      lineKey: 'ox.pages.contact.phone_line',
      value: phone,
      href: `tel:${phone}`,
    });
  }
  if (email) {
    rows.push({
      id: 'email',
      icon: 'written-question',
      labelKey: 'ox.form.email',
      lineKey: 'ox.pages.contact.email_line',
      value: email,
      href: `mailto:${email}`,
    });
  }

  const hoursSetting = settingText(themeSettings, 'branch_hours') ?? '';
  const hoursRows = useMemo(() => parseBranchHours(hoursSetting), [hoursSetting]);
  // Social URLs are merchant-typed too, so they go through the same http and
  // https gate as every other external href on this page (G1).
  const social = Object.entries(store?.social ?? {})
    .map(([name, url]) => [name, typeof url === 'string' ? safeExternalUrl(url) : ''] as const)
    .filter((entry): entry is readonly [string, string] => entry[1].length > 0);
  const written = channelById('written');
  const pdpl = t('ox.pages.contact.pdpl');
  const page: Page = { title: t('ox.pages.contact.h1'), slug: 'contact' };

  return (
    <div className="ox-page ox-page--contact">
      <OxBreadcrumb page={page} />

      <header className="ox-page-head">
        <h1 className="ox-page-head__title ox-h1">{t('ox.pages.contact.h1')}</h1>
        <p className="ox-page-head__lead ox-lead">{t('ox.pages.contact.intro')}</p>
      </header>

      {rows.length > 0 ? (
        <section className="ox-contact" aria-labelledby="ox-contact-title">
          <h2 id="ox-contact-title" className="ox-h2">
            {t('ox.pages.contact.channels_title')}
          </h2>
          <div className="ox-contact__grid">
            {rows.map((row) => (
              <Panel
                key={row.id}
                className="ox-contact__card"
                testId={`ox-contact-${row.id}`}
                title={
                  <>
                    <Icon name={row.icon} size={24} className="ox-contact__icon" />
                    <span>{t(row.labelKey)}</span>
                  </>
                }
              >
                <p className="ox-contact__value">
                  <Bdi ltr lang={null}>
                    <a
                      href={row.href}
                      {...(row.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    >
                      {row.value}
                    </a>
                  </Bdi>
                </p>
                <p className="ox-contact__line ox-small">{t(row.lineKey)}</p>
              </Panel>
            ))}
          </div>
          <p className="ox-contact__hours ox-small">{t('ox.pages.contact.hours_line')}</p>
        </section>
      ) : null}

      {written ? (
        <section className="ox-contact-ask" aria-labelledby="ox-contact-ask-title">
          <h2 id="ox-contact-ask-title" className="ox-h2">
            {t('ox.pages.contact.ask_title')}
          </h2>
          <div className="ox-channels ox-channels--one">
            <div className="ox-hub__channel">
              <ChannelCard channel={written} />
              <p className="ox-hub__card-note ox-small" data-testid="ox-medical-line">
                {t('ox.services.medical_line')}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="ox-contact-branch" aria-labelledby="ox-contact-branch-title">
        <h2 id="ox-contact-branch-title" className="ox-h2">
          {t('ox.pages.contact.branch_title')}
        </h2>
        <Panel className="ox-contact-branch__panel" tone="plate">
          <p className="ox-contact-branch__address ox-body">{t('ox.branch.address')}</p>
          <p className="ox-contact-branch__line ox-small">{t('ox.pages.contact.branch_line')}</p>
          <HoursTable rows={hoursRows} className="ox-contact-branch__hours" />
          <Link to="/branch" className="ox-contact-branch__link">
            {t('ox.nav.branch')}
          </Link>
        </Panel>
      </section>

      {social.length > 0 ? (
        <section className="ox-contact-social" aria-labelledby="ox-contact-social-title">
          <h2 id="ox-contact-social-title" className="ox-h3">
            {t('ox.pages.contact.social_title')}
          </h2>
          <ul className="ox-contact-social__list">
            {social.map(([name, url]) => (
              <li key={name}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  <Bdi lang="en">{name}</Bdi>
                </a>
              </li>
            ))}
          </ul>
          <p className="ox-contact-social__line ox-small">{t('ox.pages.contact.social_line')}</p>
        </section>
      ) : null}

      {isPendingCopy(pdpl) ? null : (
        <p className="ox-contact__pdpl ox-small" data-testid="ox-pdpl-line">
          {pdpl}
        </p>
      )}
    </div>
  );
}
