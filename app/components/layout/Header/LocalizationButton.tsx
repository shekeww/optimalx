import { Suspense, lazy } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

const SallaLocalizationModal = lazy(() =>
  import('@salla.sa/twilight-components-react/localization-modal').then((m) => ({
    default: m.SallaLocalizationModal,
  }))
);

/** The switch is offered only when there is something to switch. */
export function useLocalizationEnabled(): boolean {
  const { store } = useTwilight();
  return Boolean(store?.settings?.is_multilingual || store?.settings?.currencies_enabled);
}

export interface LocalizationButtonProps {
  className?: string;
}

/**
 * Language and currency control (DIRECTION 5.1 UtilityBar; engine behaviour in
 * engine-surface 8.6). There is no engine switcher component and no
 * `setLocale`: the button dispatches `localization::open` on the SDK bus and
 * the web component, mounted once by the layout, does the rest.
 */
export function LocalizationButton({ className }: LocalizationButtonProps) {
  const { salla, currency } = useTwilight();
  const { t, languageName } = useTranslation();
  const enabled = useLocalizationEnabled();
  if (!enabled) return null;

  const symbol = currency?.symbol ?? currency?.code ?? '';

  return (
    <button
      type="button"
      className={['ox-localize', className].filter(Boolean).join(' ')}
      aria-label={t('ox.header.localization')}
      data-testid="ox-localization-button"
      onClick={() => salla?.event?.dispatch('localization::open')}
    >
      <i className="sicon-globe" aria-hidden="true" />
      <span className="ox-localize__label">
        {languageName}
        {symbol ? <span className="ox-localize__sep"> · </span> : null}
        {symbol ? <span dir="auto">{symbol}</span> : null}
      </span>
    </button>
  );
}

/**
 * The modal itself, mounted once by `OptimalXLayout`. Two copies would both
 * answer the same `localization::open` event.
 */
export function LocalizationModal() {
  const { currency, locale } = useTwilight();
  const enabled = useLocalizationEnabled();
  if (!enabled) return null;

  return (
    <Suspense fallback={null}>
      <SallaLocalizationModal
        language={locale}
        currency={currency?.code || 'SAR'}
        suppressHydrationWarning
      />
    </Suspense>
  );
}
