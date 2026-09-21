import { Suspense, lazy } from 'react';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';

const SallaSocial = lazy(() =>
  import('@salla.sa/twilight-components-react/social').then((m) => ({ default: m.SallaSocial }))
);

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  if (typeof value === 'string') return value.trim();
  return typeof value === 'number' ? String(value) : '';
}

/**
 * The social row and the registration numbers, at the footer's inline-start.
 *
 * Claims gates, both binding:
 *
 * - the commercial registration line ships only when a CR number is set
 * - the VAT line ships only when a VAT number is set
 *
 * They gate separately, so a store that has one and not the other shows the
 * one it has. With neither, the numbers block is absent entirely and the
 * social row is the column's only content: a footer carrying the words
 * "commercial registration" followed by nothing is worse than a footer
 * without the line.
 *
 * There is no "prices include VAT" line anywhere in this component. The store
 * holds no VAT registration, so that sentence would be a false tax position
 * (B8); it is why the old `TrustLine` was retired rather than restyled.
 */
export function RegistrationBlock() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();

  const cr = settingValue(settings, 'cr_number');
  const vat = settingValue(settings, 'vat_number') || (store?.settings?.tax?.number ?? '');
  const hasNumbers = Boolean(cr || vat);

  return (
    <div className="ox-footer__reg" data-testid="ox-footer-registration">
      <div className="ox-footer__social">
        <Suspense fallback={null}>
          <SallaSocial />
        </Suspense>
      </div>

      {hasNumbers ? (
        <ul className="ox-footer__numbers" data-testid="ox-footer-numbers">
          {/* The figures are Western digits, which the bidi algorithm already
              sets left to right inside an Arabic run; no wrapper needed. */}
          {cr ? (
            <li data-testid="ox-footer-cr">
              <Icon name="registry" size={16} className="ox-footer__emblem" />
              <span>{t('ox.footer.cr_line', { number: cr })}</span>
            </li>
          ) : null}
          {vat ? (
            <li data-testid="ox-footer-vat">
              <Icon name="registry" size={16} className="ox-footer__emblem" />
              <span>{t('ox.footer.vat_line', { number: vat })}</span>
            </li>
          ) : null}
        </ul>
      ) : null}
    </div>
  );
}
