import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

export interface MegaPromoProps {
  onNavigate?: () => void;
}

/**
 * The mega panel's promoted tile (NAV-2026-09-23 §5.2 column C): one settings
 * driven `<a>`, rendered only when both `mega_promo_url` and
 * `mega_promo_image` are non-empty strings. Absent, `MegaPanel` falls back to
 * its two-column layout (§5.2 "when the promo is absent").
 *
 * The section carries its own visible `<h3>` (the eyebrow doubles as the
 * heading, both 13/600 `--ox-fg-3`), which is what keeps the panel at three
 * `<h3>` headings whenever the promo is configured (§5.5, §11 item 8).
 */
export function MegaPromo({ onNavigate }: MegaPromoProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const url = settingValue(settings, 'mega_promo_url');
  const image = settingValue(settings, 'mega_promo_image');
  if (!url || !image) return null;

  const title = settingValue(settings, 'mega_promo_title');
  const line = settingValue(settings, 'mega_promo_line') || t('ox.common.view_all');

  return (
    <section className="ox-mega__col ox-mega__col-c" aria-label={t('ox.nav.promo_label')}>
      <h3 className="ox-mega__heading">{t('ox.nav.promo_label')}</h3>
      <Link to={url} className="ox-mega__promo" onClick={onNavigate} data-testid="ox-mega-promo">
        <Image src={image} alt="" width={312} height={226} className="ox-mega__promo-image" />
        {title ? <span className="ox-mega__promo-title">{title}</span> : null}
        <span className="ox-mega__promo-link">
          {line}
          <i className="sicon-keyboard_arrow_right ox-mega__promo-chevron ox-mirror" aria-hidden="true" />
        </span>
      </Link>
    </section>
  );
}
