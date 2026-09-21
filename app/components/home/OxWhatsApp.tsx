import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { digitsOnly } from '../blocks/href';
import { Icon } from '../common/Icon';

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * The floating WhatsApp button (homepage-spec section 10).
 *
 * Claims gate, the same one the utility bar's contact affordance uses: it
 * renders only when the store actually publishes a number, and the number is
 * never written into source. With no number configured there is no button,
 * which is the correct state for a store that has not set one rather than a
 * missing feature.
 *
 * It sits at the LTR corner in both locales, which is where the reference
 * draws it and where WhatsApp's own launcher sits on every Saudi storefront;
 * that makes it a learned position rather than a reading-order one. Above
 * 1024 it clears the page edge; below it, it clears the bottom tab bar by
 * `--ox-h-tabbar`, which already carries the safe-area inset.
 *
 * It is a link, not a dialog, so nothing about it can block the page, and it
 * is outside the main landmark so it is not read as page content.
 */
export function OxWhatsApp() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();

  const number = digitsOnly(
    settingValue(settings, 'whatsapp_number') || (store?.contacts?.whatsapp ?? '')
  );
  if (!number) return null;

  return (
    <a
      className="ox-wa"
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('ox.home.whatsapp_float')}
      data-testid="ox-whatsapp-float"
    >
      <Icon name="whatsapp" size={26} className="ox-wa__icon" />
    </a>
  );
}
