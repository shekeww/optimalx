import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { Icon } from '../../common/Icon';
import { LocalizationButton, useLocalizationEnabled } from './LocalizationButton';

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : '';
}

/**
 * The desktop utility row (DIRECTION 5.1 UtilityBar, 6.1: 36 tall, desktop
 * only): the delivery promise at the start and the language and currency
 * button at the end, on the graphite band.
 *
 * The promise renders only when the merchant has written one
 * (`delivery_promise_line`); below 1024 the whole row is hidden by the
 * stylesheet and the promise lives in the drawer footer instead.
 */
export function UtilityBar() {
  const { settings } = useTheme();
  const localization = useLocalizationEnabled();
  const promise = settingValue(settings, 'delivery_promise_line');

  // An empty graphite strip is worse than no strip: with no promise written and
  // nothing to switch, the row does not render at all.
  if (!promise && !localization) return null;

  return (
    <div className="ox-utility ox-band-dark" data-testid="ox-utility-bar">
      <div className="ox-utility__inner ox-container">
        {promise ? (
          <p className="ox-utility__promise ox-small">
            <Icon name="shipping" size={16} />
            {promise}
          </p>
        ) : (
          <span />
        )}
        <LocalizationButton className="ox-utility__localize" />
      </div>
    </div>
  );
}
