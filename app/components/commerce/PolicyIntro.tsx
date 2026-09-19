import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { policyKind } from './policyKind';

export { policyKind, type PolicyKind } from './policyKind';

export interface PolicyIntroProps {
  /** The route's `$slug` param. */
  slug?: string;
  /** The page title from the loader, as a second signal. */
  title?: string;
}

/**
 * The orientation line above a policy page (FINAL-content 6.3).
 *
 * The long policy text is the owner's, written in the dashboard and rendered
 * by the engine; this is the one line that tells the reader what the page
 * settles before they read it. It states nothing the store has not already
 * committed to elsewhere in the theme: no carrier, no cut-off, no day count,
 * no fee and no return window, because all five are still owner sign-off
 * items (the `{CARRIER}`, `{CUTOFF}`, `{SHIP_DAYS_*}`, `{SHIP_FEE}` and
 * `{RETURN_DAYS}` placeholders in FINAL-content 6.3) and a placeholder is not
 * a claim.
 */
export function PolicyIntro({ slug, title }: PolicyIntroProps) {
  const { t } = useTranslation();
  const kind = policyKind(slug, title);
  if (kind === null) return null;

  return (
    <div className="ox-policy__intro" data-testid="ox-policy-intro" data-policy={kind}>
      <p className="ox-lead">{t(`ox.policy.${kind}_intro`)}</p>
      <p className="ox-small ox-policy__tail">{t('ox.policy.tail')}</p>
    </div>
  );
}
