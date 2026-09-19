import { useEffect, useState, type RefObject } from 'react';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useMediaQuery } from '../../common/hooks/useMediaQuery';

export interface AnnouncementBarProps {
  /**
   * The engine's `.advertisement-slot` (theme-engine chunk-65Z2ZDKZ.js:29).
   * When the dashboard advertisement feature fills it, this bar steps aside so
   * two dark lines never stack (DIRECTION 5.1 AnnouncementBar).
   */
  adSlotRef?: RefObject<HTMLElement | null>;
}

function settingValue(settings: unknown, key: string): string {
  if (!settings || typeof settings !== 'object') return '';
  const value = (settings as Record<string, unknown>)[key];
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : '';
}

/** True once the advertisement slot has rendered anything. Client only. */
function useSlotFilled(ref?: RefObject<HTMLElement | null>): boolean {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const node = ref?.current;
    if (!node || typeof MutationObserver === 'undefined') return;
    const read = () => setFilled(node.childElementCount > 0 && node.textContent !== '');
    read();
    const observer = new MutationObserver(read);
    observer.observe(node, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [ref]);
  return filled;
}

/**
 * The store's standing shipping line (DIRECTION 5.1, FINAL-content 1.2).
 *
 * No dismiss control: the line is the shipping promise, not a campaign. The
 * threshold is never a literal in copy; it is interpolated from the
 * `free_shipping_threshold` theme setting, and with no threshold and no
 * merchant text the bar does not render at all (claims gate, PLAN-final 5.1).
 */
export function AnnouncementBar({ adSlotRef }: AnnouncementBarProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const wide = useMediaQuery('(min-width: 640px)');
  const adFilled = useSlotFilled(adSlotRef);

  const custom = settingValue(settings, 'announcement_text');
  const threshold = settingValue(settings, 'free_shipping_threshold');
  const text = custom || (threshold ? t(wide ? 'ox.header.announcement' : 'ox.header.announcement_short', { threshold }) : '');

  if (!text || adFilled) return null;

  return (
    <div className="ox-announce ox-band-dark" data-testid="ox-announcement">
      <p className="ox-announce__text">{text}</p>
    </div>
  );
}
