import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';
import { useLocalizationEnabled } from './LocalizationButton';

/**
 * The country's own name in the reading locale, from its ISO code.
 *
 * `Intl.DisplayNames` is the browser's own country table, so no list of
 * country names is written into the theme and nothing has to be translated by
 * hand. Where the runtime has no table, the bare code is shown `dir="ltr"`,
 * which is still true rather than a guess.
 */
export function countryName(code: string, locale: string): string {
  const iso = code.trim().toUpperCase();
  if (iso.length !== 2) return '';
  try {
    const names = new Intl.DisplayNames([locale || 'ar'], { type: 'region' });
    return names.of(iso) ?? iso;
  } catch {
    return iso;
  }
}

export interface CountryControlProps {
  className?: string;
}

/**
 * The country control at the utility bar's inline-end.
 *
 * It opens Salla's own localisation modal (the SDK owns the switch; there is
 * no engine `setLocale`), and it renders only when there is something to
 * switch and the store actually declares a country. The label is the store's
 * country, never a literal.
 */
export function CountryControl({ className }: CountryControlProps) {
  const { salla, store, locale } = useTwilight();
  const { t } = useTranslation();
  const enabled = useLocalizationEnabled();

  const code = store?.store_country || store?.country || '';
  const name = countryName(code, locale ?? 'ar');
  if (!enabled || !name) return null;

  const isCode = name.length === 2 && name === code.toUpperCase();

  return (
    <button
      type="button"
      className={['ox-util__country', className].filter(Boolean).join(' ')}
      aria-label={t('ox.header.country_change')}
      data-testid="ox-country-control"
      onClick={() => salla?.event?.dispatch('localization::open')}
    >
      <span {...(isCode ? { dir: 'ltr' as const } : {})}>{name}</span>
      <Icon name="chevron-down" size={10} />
    </button>
  );
}
