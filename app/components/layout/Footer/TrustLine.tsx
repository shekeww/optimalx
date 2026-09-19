import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

/** The Maroof identifier is the trailing path segment of the profile URL. */
export function maroofId(url: string): string {
  const parts = url.split('?')[0].split('#')[0].split('/').filter(Boolean);
  return parts.length ? parts[parts.length - 1] : '';
}

/**
 * The registration line (FINAL-content 1.6, claims gate PLAN-final 5.1).
 *
 * It renders only when the commercial registration, the VAT number and the
 * Maroof URL are all set: a footer with an empty registration number is worse
 * than a footer without the line. The second line, which names neither a
 * payment method nor a carrier, is not gated.
 */
export function TrustLine() {
  const { t } = useTranslation();
  const { settings } = useTheme();

  const cr = settingValue(settings, 'cr_number');
  const vat = settingValue(settings, 'vat_number');
  const maroofUrl = settingValue(settings, 'maroof_url');
  const complete = Boolean(cr && vat && maroofUrl);

  return (
    <div className="ox-footer__trust">
      {complete ? (
        <p className="ox-footer__trust-line ox-small" data-testid="ox-trust-line">
          {t('ox.footer.trust_line', { cr, vat, maroof: maroofId(maroofUrl) })}
        </p>
      ) : null}
      <p className="ox-footer__payment-line ox-small" data-testid="ox-payment-line">
        {t('ox.footer.payment_line')}
      </p>
    </div>
  );
}
