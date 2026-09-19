import { Suspense, lazy } from 'react';
import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { Copyright } from '@salla.sa/twilight-theme-engine/layout';
import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Logo } from '../Header/Logo';
import { FooterColumns } from './FooterColumns';
import { TrustLine } from './TrustLine';

const SallaSocial = lazy(() =>
  import('@salla.sa/twilight-components-react/social').then((m) => ({ default: m.SallaSocial }))
);
const SallaAppsIcons = lazy(() =>
  import('@salla.sa/twilight-components-react/apps-icons').then((m) => ({ default: m.SallaAppsIcons }))
);
const SallaPayments = lazy(() =>
  import('@salla.sa/twilight-components-react/payments').then((m) => ({ default: m.SallaPayments }))
);
const SallaTrustBadges = lazy(() =>
  import('@salla.sa/twilight-components-react/trust-badges').then((m) => ({
    default: m.SallaTrustBadges,
  }))
);

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * The OptimalX footer (DIRECTION 5.2 Footer, 6.1: 640 mobile, 720 desktop).
 *
 * It keeps the engine's outer contract: the class `store-footer`, the
 * `footer:start` and `footer:end` hook slots, and the `copyright` slot with
 * the engine's own `Copyright` as the fallback (theme-engine
 * chunk-DTWFNS3F.js:835, :901-913, :924). Payment methods are never named in
 * text: `SallaPayments` renders the marks the store actually has
 * (claims gate, PLAN-final 5.1).
 */
export function Footer() {
  const { t } = useTranslation();
  const store = useStore();
  const { settings: themeSettings } = useTheme();

  const vatNumber = settingValue(themeSettings, 'vat_number') || store?.settings?.tax?.number || '';
  const certificate = store?.settings?.tax?.certificate ?? '';

  return (
    <footer className="store-footer ox-footer ox-band-dark" suppressHydrationWarning data-testid="ox-footer">
      <HookSlot name="footer:start" />

      <div className="ox-footer__inner ox-container">
        <Logo size={56} onDark className="ox-footer__logo" />

        <FooterColumns />

        <div className="ox-footer__social">
          <Suspense fallback={null}>
            <SallaSocial />
          </Suspense>
          <Suspense fallback={null}>
            <SallaAppsIcons apps={store?.apps} hideTitle />
          </Suspense>
        </div>

        <div className="ox-footer__marks">
          <Suspense fallback={null}>
            <SallaPayments />
          </Suspense>
        </div>

        <div className="ox-footer__badges">
          <Suspense fallback={null}>
            <SallaTrustBadges dark />
          </Suspense>
        </div>

        {vatNumber ? (
          <p className="ox-footer__vat" data-testid="ox-footer-vat">
            {certificate ? (
              <a href={certificate} target="_blank" rel="noopener noreferrer" className="ox-footer__link">
                <i className="sicon-file-text" aria-hidden="true" />
                <span>{t('ox.footer.vat_certificate')}</span>
              </a>
            ) : (
              <span>
                <i className="sicon-file-text" aria-hidden="true" />
                <span>{t('ox.footer.vat_certificate')}</span>
              </span>
            )}
            <span className="ox-footer__vat-number" dir="ltr">
              {vatNumber}
            </span>
          </p>
        ) : null}

        <TrustLine />

        <p className="ox-footer__copyright ox-small copyright-text">
          <Suspense fallback={null}>
            <HookSlot
              name="copyright"
              context={{ storeName: store?.name }}
              fallback={<Copyright storeName={store?.name} />}
            />
          </Suspense>
        </p>
      </div>

      <HookSlot name="footer:end" />
    </footer>
  );
}
