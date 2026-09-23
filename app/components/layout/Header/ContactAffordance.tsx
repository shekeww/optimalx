import { useStore } from '@salla.sa/twilight-theme-engine/hooks/useStore';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { digitsOnly } from '../../blocks/href';
import { Icon } from '../../common/Icon';

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

export interface ContactAffordanceProps {
  className?: string;
}

/**
 * The contact affordance at the utility bar's inline-start.
 *
 * Claims gate: it renders only when the store actually publishes a WhatsApp
 * number, and the number is never written into source. With no number the
 * affordance is absent and the trust row keeps its centred position, because
 * the bar's three zones are a grid, not a flex row that collapses.
 */
export function ContactAffordance({ className }: ContactAffordanceProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const store = useStore();

  const number = digitsOnly(
    settingValue(settings, 'whatsapp_number') || (store?.contacts?.whatsapp ?? '')
  );
  if (!number) return null;

  return (
    <a
      className={['ox-util__contact', className].filter(Boolean).join(' ')}
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="ox-utility-contact"
    >
      <Icon name="whatsapp" size={16} />
      {/* واتساب, not تواصل معنا (NAV-2026-09-23 §4.2, §9): the footer's own
          تواصل معنا already points at `/contact`, and two anchors on one
          route sharing that exact text while pointing at two different URLs
          (this one goes to wa.me) is the duplicate-link-text defect §9
          names. */}
      <span>{t('ox.footer.whatsapp')}</span>
    </a>
  );
}
