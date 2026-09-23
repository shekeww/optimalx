import { useId, useState, type FormEvent } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

export interface OxNewsletterProps {
  /**
   * Submits the address through a caller-supplied transport. No native Salla
   * primitive exists to wire it to (`docs/build/progress/S8d.md` §2.1: a full
   * grep of `node_modules/@salla.sa/twilight-theme-engine/dist` and the
   * scraped live-Raed fixture, both zero hits for "newsletter"). Since owner
   * brief S8h (this batch) the honest default path is the merchant's own
   * `newsletter_action_url` setting (`onSubmit` below); this prop stays for
   * tests and TAKES PRECEDENCE when supplied, both for rendering (item 3: a
   * caller that hands in its own transport does not need a saved URL to
   * render) and for submission (a real primitive, the day one exists, is a
   * one-line wire-up here instead of the fetch below).
   */
  subscribe?: (email: string) => Promise<void>;
  /** Overrides the `show_newsletter` theme setting (kitchen sink, tests). */
  enabled?: boolean;
  className?: string;
  /**
   * The merchant's own privacy-policy page, resolved by the caller against
   * the footer menu (`findMenuLink`, `content/nav.ts`) - never invented: a
   * policy link that does not resolve is not rendered. Renders as a link
   * appended to the privacy line when present; the sentence alone otherwise
   * (`ArticleExtras` passes none, so the blog placement is unchanged).
   */
  privacyUrl?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

/** A deliberately plain check: one "@" with something on each side and a dot after it. */
export function looksLikeEmail(value: string): boolean {
  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@')) return false;
  const domain = value.slice(at + 1);
  const dot = domain.indexOf('.');
  return dot > 0 && dot < domain.length - 1 && !value.includes(' ');
}

/**
 * True only for an `https://` URL with a real host - the gate `newsletter_
 * action_url` has to clear before the form ever ships (owner brief S8h item
 * 3: "a dead form must never ship"). A plain-text setting that is empty, not
 * a URL at all, or `http://` (the merchant's own credentials would leave this
 * origin unencrypted) all read as invalid.
 */
export function isValidActionUrl(value: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname.length > 0;
  } catch {
    return false;
  }
}

/** A trimmed string setting, or ''. Mirrors `claims.ts`'s `settingText` without importing a product-only module. */
function settingString(settings: Record<string, unknown> | undefined, key: string): string {
  const value = settings?.[key];
  return typeof value === 'string' ? value.trim() : '';
}

/** The hidden name every real visitor leaves empty; a script that fills every field does not. */
const HONEYPOT_FIELD = 'ox_newsletter_company';
/** Visually hidden, but present in the DOM for a scraper to find - `aria-hidden` and `tabIndex={-1}` below remove it from assistive tech and the tab order, so no visitor ever perceives it. No SCSS file is in this batch's scope, hence inline. */
const TRAP_STYLE = {
  position: 'absolute' as const,
  insetInlineStart: '-9999px',
  width: 1,
  height: 1,
  overflow: 'hidden' as const,
};

/**
 * The newsletter band (DIRECTION 5.2 OxNewsletter). Hidden unless
 * `show_newsletter` is on AND `newsletter_action_url` is a valid `https://`
 * URL (owner brief S8h item 3) - a saved but empty or malformed URL is the
 * same as the switch being off, because a submit with nowhere to go is a
 * dead form. `subscribe`, when supplied, replaces the URL requirement for
 * both the render gate and the submission itself (docblock above).
 *
 * SUBMISSION (item 2): a plain `<form method="post" action="…" target=
 * "_blank">` so a no-JS visitor's browser posts straight to the merchant's
 * email service and opens its own reply in a new tab, never navigating this
 * one away; once React has hydrated, `onSubmit` intercepts it and POSTs the
 * same address by `fetch(url, { mode: 'no-cors', body: FormData })` instead.
 * `no-cors` makes the response opaque - the merchant's email service almost
 * never sends this storefront's origin a CORS header back, so an opaque
 * resolve is the only success signal this call can ever read, and a network-
 * level rejection (offline, DNS, a hard block) the only failure. Never a
 * status code, because none is ever visible.
 *
 * A HONEYPOT (`HONEYPOT_FIELD`) guards both paths: a filled trap drops the
 * submit with no request sent and no status change - never a fabricated
 * success, the same rule this file has followed since S8d.
 */
export function OxNewsletter({ subscribe, enabled, className, privacyUrl }: OxNewsletterProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const settingsRecord = settings as Record<string, unknown> | undefined;
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const settingOn = Boolean(settingsRecord?.show_newsletter);
  const actionUrl = settingString(settingsRecord, 'newsletter_action_url');
  const emailField = settingString(settingsRecord, 'newsletter_email_field') || 'EMAIL';
  const hasValidUrl = isValidActionUrl(actionUrl);
  const settingsReady = settingOn && (Boolean(subscribe) || hasValidUrl);
  const visible = enabled ?? settingsReady;
  if (!visible) return null;

  const invalid = status === 'error';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (trap.trim().length > 0) return; // honeypot: dropped silently, see docblock
    if (!looksLikeEmail(email)) {
      setStatus('error');
      return;
    }
    if (subscribe) {
      setStatus('submitting');
      try {
        await subscribe(email);
        setStatus('success');
      } catch {
        setStatus('error');
      }
      return;
    }
    // No valid URL and no injected transport: never a silent success (owner
    // brief 2026-09-24, S8d item 2, carried forward by S8h item 3).
    if (!hasValidUrl) {
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      const body = new FormData();
      body.set(emailField, email);
      await fetch(actionUrl, { method: 'POST', mode: 'no-cors', body });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className={['ox-newsletter', className].filter(Boolean).join(' ')} data-testid="ox-newsletter">
      <div className="ox-newsletter__inner ox-container">
        <h2 className="ox-newsletter__title ox-h2">{t('ox.newsletter.title')}</h2>
        <p className="ox-newsletter__body ox-body">{t('ox.newsletter.line')}</p>

        <div className="ox-newsletter__slot">
          {status === 'success' ? (
            <p
              className="ox-newsletter__success"
              role="status"
              aria-live="polite"
              data-testid="ox-newsletter-success"
            >
              <Icon name="tick" size={20} />
              {t('ox.newsletter.success')}
            </p>
          ) : (
            <form
              className="ox-newsletter__form"
              onSubmit={onSubmit}
              method={hasValidUrl ? 'post' : undefined}
              action={hasValidUrl ? actionUrl : undefined}
              target={hasValidUrl ? '_blank' : undefined}
            >
              <label className="ox-sr-only" htmlFor={inputId}>
                {t('ox.newsletter.placeholder')}
              </label>
              <input
                id={inputId}
                className={`ox-input ox-newsletter__input${invalid ? ' is-invalid' : ''}`}
                type="email"
                name={emailField}
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                required
                placeholder={t('ox.newsletter.placeholder')}
                value={email}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errorId : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === 'error') setStatus('idle');
                }}
              />
              <input
                type="text"
                name={HONEYPOT_FIELD}
                value={trap}
                onChange={(event) => setTrap(event.target.value)}
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                style={TRAP_STYLE}
              />
              <Button type="submit" size={48} variant="primary" loading={status === 'submitting'}>
                {t('ox.newsletter.button')}
              </Button>
            </form>
          )}
        </div>

        {invalid ? (
          <p
            className="ox-newsletter__error"
            id={errorId}
            role="status"
            aria-live="polite"
            data-testid="ox-newsletter-error"
          >
            {looksLikeEmail(email) ? t('ox.newsletter.error') : t('ox.newsletter.invalid')}
          </p>
        ) : null}

        <p className="ox-newsletter__privacy ox-small">
          {t('ox.newsletter.privacy')}
          {privacyUrl ? (
            <>
              {' '}
              <Link to={privacyUrl} className="ox-newsletter__privacy-link">
                {t('ox.footer.privacy_policy')}
              </Link>
            </>
          ) : null}
        </p>
      </div>
    </section>
  );
}
