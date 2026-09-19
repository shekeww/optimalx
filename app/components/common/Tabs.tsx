import { useCallback, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';

/**
 * Tabs (DIRECTION 5.7 "Tabs", 9.4 keyboard, 10.1 scroller rule).
 *
 * The tab list is a horizontal scroller with `position: relative`, tabs are 48
 * tall 15/600, the active tab carries a 2px `--ox-ink` indicator that grows
 * with `--dur-base --ease-in-out`, and the panel sits below.
 *
 * Keyboard: roving tabindex, ArrowLeft and ArrowRight move by the document's
 * direction factor (in RTL, ArrowLeft is "next"), Home and End jump to the
 * ends, and selection follows focus, which is the WAI-ARIA automatic-activation
 * pattern for a panel whose content is already in the DOM.
 *
 * `_primitives.scss` section 11 styles both this markup and the engine's
 * `s-tabs-header-item` classes, so `SallaTabs` instances rendered by the engine
 * (the PDP's own tab strip) match without a second stylesheet.
 */

export interface TabItem {
  id: string;
  label: ReactNode;
  children: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  /** Selected id on first render; the first tab otherwise. */
  defaultTab?: string;
  /** Controlled selection. Pass with `onTabChange`. */
  activeTab?: string;
  onTabChange?: (id: string) => void;
  /** Accessible name of the tab list. */
  label?: string;
  className?: string;
}

export function Tabs({
  items,
  defaultTab,
  activeTab,
  onTabChange,
  label,
  className,
}: TabsProps) {
  const prefix = useId();
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());
  const [internal, setInternal] = useState(defaultTab ?? items[0]?.id ?? '');
  const current = activeTab ?? internal;

  const select = useCallback(
    (id: string) => {
      if (activeTab === undefined) setInternal(id);
      onTabChange?.(id);
    },
    [activeTab, onTabChange]
  );

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      const index = items.findIndex((item) => item.id === current);
      if (index < 0) return;
      // The visual "next" tab is the previous one in DOM order under RTL.
      const rtl =
        typeof document !== 'undefined' && document.documentElement.getAttribute('dir') === 'rtl';
      const forward = rtl ? 'ArrowLeft' : 'ArrowRight';
      let next = index;
      if (event.key === 'Home') next = 0;
      else if (event.key === 'End') next = items.length - 1;
      else if (event.key === forward) next = (index + 1) % items.length;
      else next = (index - 1 + items.length) % items.length;
      const target = items[next];
      if (!target) return;
      select(target.id);
      tabRefs.current.get(target.id)?.focus();
    },
    [current, items, select]
  );

  return (
    <div className={['ox-tabs', className].filter(Boolean).join(' ')}>
      <div
        className="ox-tabs__list"
        role="tablist"
        aria-label={label}
        onKeyDown={onKeyDown}
      >
        {items.map((item) => {
          const selected = item.id === current;
          return (
            <button
              key={item.id}
              type="button"
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              id={`${prefix}-${item.id}-tab`}
              className="ox-tabs__tab"
              role="tab"
              aria-selected={selected}
              aria-controls={`${prefix}-${item.id}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => select(item.id)}
            >
              {item.label}
            </button>
          );
        })}
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`${prefix}-${item.id}-panel`}
          className="ox-tabs__panel"
          role="tabpanel"
          aria-labelledby={`${prefix}-${item.id}-tab`}
          hidden={item.id !== current}
          tabIndex={0}
        >
          {item.children}
        </div>
      ))}
    </div>
  );
}
