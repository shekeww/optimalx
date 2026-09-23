import { useId, useState, type FormEvent } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';

export interface OxNewsletterProps {
  /**
   * Submits the address through Salla's own mechanism. No native primitive
   * exists to wire it to (owner brief 2026-09-24, item 2 asks for one;
   * re-verified this batch on top of `docs/build/progress/S2c.md`'s own
   * `grep -rliE "newsletter|subscribe" node_modules/@salla.sa/
   * twilight-theme-engine` across every `.js` under `dist/`, which returns
   * nothing, and the live Raed theme's own scraped fixture,
   * `docs/live-theme/fixtures/fixture-home.html`, which has zero
   * "newsletter" occurrences) - so the transport stays an injectable prop
   * (PLAN-final open question Q1), a one-line wire-up the day a real one is
   * found. Until then a submission with none wired is never a silent
   * success: see `onSubmit` below.
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
 * The newsletter band (DIRECTION 5.2 OxNewsletter). Hidden unless the
 * `show_newsletter` theme setting is on (PLAN-final C7; defaults to true on
 * the home band since owner brief 2026-09-24, item 2). On success the form
 * is replaced by one line of the same height, announced politely
 * (DIRECTION 9.5). The band sits on the plate, not on graphite, because the
 * footer below it is graphite.
 */
export function OxNewsletter({ subscribe, enabled, className, privacyUrl }: OxNewsletterProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const inputId = useId();
  const errorId = `${inputId}-error`;

  const settingOn = Boolean((settings as Record<string, unknown> | undefined)?.show_newsletter);
  const visible = enabled ?? settingOn;
  if (!visible) return null;

  const invalid = status === 'error';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!looksLikeEmail(email)) {
      setStatus('error');
      return;
    }
    // No transport wired is never a silent success (owner brief 2026-09-24,
    // item 2: "a submit with no SDK shows the error state, never a crash") -
    // the address is never accepted without a real subscribe function to
    // hand it to.
    if (!subscribe) {
      setStatus('error');
      return;
    }
    setStatus('submitting');
    try {
      await subscribe(email);
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
            <p className="ox-newsletter__success" role="status" data-testid="ox-newsletter-success">
              <Icon name="tick" size={20} />
              {t('ox.newsletter.success')}
            </p>
          ) : (
            <form className="ox-newsletter__form" onSubmit={onSubmit} noValidate>
              <label className="ox-sr-only" htmlFor={inputId}>
                {t('ox.newsletter.placeholder')}
              </label>
              <input
                id={inputId}
                className={`ox-input ox-newsletter__input${invalid ? ' is-invalid' : ''}`}
                type="email"
                name="email"
                dir="ltr"
                inputMode="email"
                autoComplete="email"
                placeholder={t('ox.newsletter.placeholder')}
                value={email}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? errorId : undefined}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (status === 'error') setStatus('idle');
                }}
              />
              <Button type="submit" size={48} variant="primary" loading={status === 'submitting'}>
                {t('ox.newsletter.button')}
              </Button>
            </form>
          )}
        </div>

        {invalid ? (
          <p className="ox-newsletter__error" id={errorId} role="alert">
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
