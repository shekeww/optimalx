import { NotFoundError, RedirectError, UnauthorizedError } from '@salla.sa/twilight-theme-engine/providers';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { NotFound } from './NotFound';

/**
 * The engine's own error-to-status mapping, kept rather than replaced.
 *
 * `DefaultErrorComponent` (theme-engine chunk-QVPMWMPP.js:468-482, declared at
 * dist/tanstack/router.d.ts:45) maps a `NotFoundError` to 404, an
 * `UnauthorizedError` to 401, anything carrying a `response` to 400 and the
 * rest to 500, and renders nothing at all for a `RedirectError` because the
 * navigation is already on its way. The component itself is not re-exported
 * from `/tanstack`, so the mapping is reproduced here against the same error
 * classes, which ARE exported (dist/providers/index.d.ts:4). Reproducing it
 * is what keeps our themed page honest about the status the engine decided.
 */
export function statusCodeOf(error: unknown): number | null {
  if (error instanceof RedirectError) return null;
  if (error instanceof NotFoundError) return 404;
  if (error instanceof UnauthorizedError) return 401;
  if (error && typeof error === 'object' && 'response' in error && (error as { response?: unknown }).response) {
    return 400;
  }
  return 500;
}

export interface ErrorStateProps {
  error?: unknown;
  /** TanStack passes this on a route error boundary; it retries the match. */
  reset?: () => void;
}

/**
 * The themed error page (DIRECTION 5.6 ErrorState, 6.17, FINAL-content 6.6).
 *
 * Passed to the root route as `errorComponent`, so it renders inside
 * `OptimalXLayout` with the header and the footer intact. A 404 thrown by a
 * loader is not an error page at all: it is the 404 page, which is the one a
 * shopper can act on. Everything else gets the headline, one body line, a
 * retry when the boundary gave us one, and the way home. The status code is
 * printed small so a shopper can quote it to us.
 *
 * The 404 variant drops the latest-products rail: an error boundary may be
 * rendering because a data source is down, and a second data-driven block is
 * the last thing to add to that page.
 */
export function ErrorState({ error, reset }: ErrorStateProps) {
  const { t } = useTranslation();
  const code = statusCodeOf(error);
  if (code === null) return null;
  if (code === 404) return <NotFound showLatest={false} />;

  return (
    <div className="ox-page ox-page--error" data-testid="ox-error-state">
      <section className="ox-state">
        <Icon name="headset" size={32} className="ox-state__mark" />
        <h1 className="ox-state__title ox-h1">{t('ox.error.generic_title')}</h1>
        <p className="ox-state__body ox-lead">{t('ox.error.generic_body')}</p>
        <div className="ox-state__actions">
          {reset ? (
            <Button size={48} variant="primary" onClick={reset}>
              {t('ox.common.retry')}
            </Button>
          ) : null}
          <Button to="/" size={48} variant={reset ? 'secondary' : 'primary'}>
            {t('ox.error.home')}
          </Button>
        </div>
        <p className="ox-state__code ox-small" data-testid="ox-error-code">
          {t('ox.error.code', { code })}
        </p>
      </section>
    </div>
  );
}
