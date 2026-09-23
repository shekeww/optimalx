import { useCallback, useEffect, useId, useRef, useState, type ComponentProps, type ComponentType } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HEADER_NAV, MORE_NAV, type NavEntry } from '../../../content/nav';
import { Icon } from '../../common/Icon';
import {
  matchesShopRoute,
  resolveNavHref,
  stripLocale,
  useRouterPathname,
  withLocale,
} from '../navLinks';
import { MegaPanel } from './MegaPanel';

/**
 * `TanStackLinkAdapter` (the engine `Link`) spreads unknown props straight
 * onto TanStack's own `Link`, which defaults `activeProps` to
 * `{ className: 'active' }` the moment its own fuzzy match (`activeOptions`
 * unset, so prefix matching) considers a route active. Every plain item on
 * this bar carries its own exact-match `is-active` class already
 * (NAV-2026-09-23 §4.1); a second, fuzzily-matched "active" class from the
 * engine is not this spec's rule and is disabled here rather than styled.
 * `BaseLinkProps` does not declare `activeOptions` (it is TanStack's own,
 * passed through the adapter's `...rest`), so the engine `Link` is retyped
 * locally to accept it rather than widening every call site to `unknown`.
 */
const NavLink = Link as unknown as ComponentType<
  ComponentProps<typeof Link> & { activeOptions?: { exact?: boolean } }
>;
const EXACT_ACTIVE = { exact: true } as const;

/** Hover intent, NAV-2026-09-23 §5.5: 120ms to open, 200ms to close. */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

interface NavLinkItem {
  key: string;
  label: string;
  to: string;
  dropdown?: NavEntry['dropdown'];
  pin?: true;
}

export interface FoldableItem {
  key: string;
  width: number;
  pin?: boolean;
}

/**
 * Which items fold into "المزيد" as the nav row narrows (NAV-2026-09-23 §1.4).
 *
 * Pure so the arithmetic is testable without a layout engine. `المزيد` is
 * always the last item and never folds: its own cost is part of the fixed
 * budget, not something the row can shed. Pinned items (`تسوق`,
 * `اسأل قبل أن تشتري`) never fold either — the advisory or the mega trigger
 * disappearing first is exactly the defect this spec removes. Every other
 * item folds from the END of the foldable list backward as the row narrows
 * (`الأدلة` first, then `العلامات التجارية`, then `العروض`), which is what
 * §1.4's three measured rows (1440, 1280, 1024) show.
 */
export function computeFold(items: FoldableItem[], containerWidth: number, gap = 0): Set<string> {
  const folded = new Set<string>();
  const totalWidth = () => {
    const visible = items.filter((item) => !folded.has(item.key));
    const sum = visible.reduce((acc, item) => acc + item.width, 0);
    return sum + gap * Math.max(0, visible.length - 1);
  };
  if (items.length === 0 || totalWidth() <= containerWidth) return folded;

  const last = items[items.length - 1];
  const candidates = items.filter((item) => !item.pin && item !== last).reverse();
  for (const candidate of candidates) {
    if (totalWidth() <= containerWidth) break;
    folded.add(candidate.key);
  }
  return folded;
}

/** The row's column gap in pixels, or 0 where the engine reports none. */
function columnGapOf(node: HTMLElement): number {
  if (typeof getComputedStyle !== 'function') return 0;
  const value = parseFloat(getComputedStyle(node).columnGap);
  return Number.isFinite(value) ? value : 0;
}

/**
 * The desktop navigation, inside the main bar rather than in a row of its own
 * (NAV-2026-09-23 §1, §4).
 *
 * Six items, one axis of entry per slot: تسوق (the one mega panel, types
 * column + goals column + the promoted tile), العروض (gated on
 * `settings.show_offers_nav !== false`), العلامات التجارية,
 * اسأل قبل أن تشتري, الأدلة, المزيد (the shelf: whatever folded off the row
 * plus the three standing pages in `MORE_NAV`). تسوق and اسأل قبل أن تشتري
 * are pinned and never fold; المزيد never folds either because it is the
 * fold target itself.
 *
 * تسوق keeps a real `href` (a raw `<a>`, locale-prefixed by hand per
 * NAV-2026-09-23 §8 item 2, since the engine `Link` is what does that for
 * every other item here) so a keyboard or no-JS visitor still reaches
 * `/categories`. Opening the panel never moves focus; Escape closes it and
 * returns focus to this anchor.
 */
export function NavBar() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const { locale } = useTwilight();
  const pathname = useRouterPathname();
  const panelId = useId();

  const showOffers = (settings as Record<string, unknown> | undefined)?.show_offers_nav !== false;
  const entries = HEADER_NAV.filter((entry) => entry.key !== 'offers' || showOffers);

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [folded, setFolded] = useState<Set<string> | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Intrinsic item widths keyed by item, measured once while every item is
  // rendered. A folded item measures 0, so without the cache the row could
  // never grow back.
  const widths = useRef<Record<string, number>>({});
  const listRef = useRef<HTMLUListElement>(null);
  const shopTriggerRef = useRef<HTMLAnchorElement>(null);
  // `measure` needs the current links on every call but must keep a stable
  // identity across renders (a new function each render would re-fire the
  // effects below on every render, which set state, which renders again -
  // an infinite loop). A ref updated inline during render, read inside the
  // callback, is the same trick `countRef` used before this rewrite.
  const linksRef = useRef<NavLinkItem[]>([]);

  const links: NavLinkItem[] = entries.map((entry) => {
    const label = t(entry.labelKey);
    return {
      key: entry.key,
      label,
      to: resolveNavHref(entry, label, undefined) ?? '/',
      dropdown: entry.dropdown,
      pin: entry.pin,
    };
  });
  linksRef.current = links;

  const morePages: NavLinkItem[] = MORE_NAV.map((entry) => {
    const label = t(entry.labelKey);
    return { key: entry.key, label, to: resolveNavHref(entry, label, undefined) ?? '/' };
  });

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const host = list.parentElement ?? list;
    const row = host.getBoundingClientRect().width;
    if (!row) return;
    const gap = columnGapOf(list);
    const currentLinks = linksRef.current;
    const rendered = Array.from(list.querySelectorAll<HTMLElement>('[data-nav-item]'));
    if (rendered.length >= currentLinks.length) {
      for (const node of rendered) {
        const key = node.getAttribute('data-nav-item');
        if (key) widths.current[key] = node.getBoundingClientRect().width;
      }
    }
    if (Object.keys(widths.current).length === 0) return;
    const items: FoldableItem[] = currentLinks.map((link) => ({
      key: link.key,
      width: widths.current[link.key] ?? 0,
      pin: link.pin,
    }));
    setFolded(computeFold(items, row, gap));
  }, []);

  useEffect(() => {
    widths.current = {};
    setFolded(null);
  }, [entries.length]);

  useEffect(() => {
    if (folded === null) measure();
  }, [folded, measure]);

  useEffect(() => {
    measure();
    const list = listRef.current;
    if (typeof ResizeObserver === 'undefined' || !list) return;
    const observer = new ResizeObserver(measure);
    const host = list.parentElement;
    if (host) observer.observe(host);
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure, entries.length]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const schedule = (next: string | null) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpenKey(next), next ? OPEN_DELAY : CLOSE_DELAY);
  };
  const cancelClose = () => {
    if (timer.current) clearTimeout(timer.current);
  };
  const close = (key: string) => {
    cancelClose();
    setOpenKey((current) => (current === key ? null : current));
  };

  const foldedSet = folded ?? new Set<string>();
  const shown = links.filter((link) => !foldedSet.has(link.key));
  const overflow = links.filter((link) => foldedSet.has(link.key));
  const stripped = stripLocale(pathname || '/');

  const isActive = (link: NavLinkItem) => {
    if (link.key === 'shop') return matchesShopRoute(stripped);
    if (link.dropdown || !link.to || link.to === '/' || link.to.startsWith('/search')) return false;
    return stripped.startsWith(link.to);
  };

  return (
    <nav className="ox-nav" aria-label={t('ox.nav.main_label')} data-testid="ox-navbar">
      <ul className="ox-nav__list" ref={listRef}>
        {shown.map((link) => {
          const open = openKey === link.key;
          const active = isActive(link);

          if (link.key === 'more') {
            const moreItems = [...overflow, ...morePages];
            return (
              <li className="ox-nav__item" key={link.key} data-nav-item={link.key}>
                <button
                  type="button"
                  className={`ox-nav__link${open ? ' is-open' : ''}`}
                  aria-expanded={open}
                  aria-controls={`${panelId}-more`}
                  data-testid="ox-nav-more"
                  onClick={() => {
                    cancelClose();
                    setOpenKey((current) => (current === link.key ? null : link.key));
                  }}
                  onPointerEnter={() => schedule(link.key)}
                  onPointerLeave={() => schedule(null)}
                >
                  {link.label}
                  <Icon name="chevron-down" size={14} />
                </button>
                {open ? (
                  <ul
                    id={`${panelId}-more`}
                    className="ox-nav__dropdown"
                    data-testid="ox-nav-more-panel"
                    onPointerEnter={cancelClose}
                    onPointerLeave={() => schedule(null)}
                  >
                    {moreItems.map((item) => (
                      <li key={item.key}>
                        <NavLink
                          to={item.to}
                          className="ox-nav__droplink"
                          activeOptions={EXACT_ACTIVE}
                          onClick={() => close(link.key)}
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            );
          }

          if (link.key === 'shop') {
            const triggerId = `${panelId}-shop-btn`;
            const megaId = `${panelId}-shop`;
            return (
              <li className="ox-nav__item ox-nav__item--mega" key={link.key} data-nav-item={link.key}>
                {/* A raw `<a>`, not the engine `Link`: it carries the
                    disclosure props (aria-expanded, aria-controls) and it
                    keeps a real, hand-prefixed href so a no-JS or keyboard
                    visitor still reaches the index (NAV-2026-09-23 §5.5,
                    §8 item 2). Hover or focus opens the panel; click
                    navigates. */}
                <a
                  ref={shopTriggerRef}
                  href={withLocale(link.to, locale)}
                  id={triggerId}
                  className={`ox-nav__link${active ? ' is-active' : ''}${open ? ' is-open' : ''}`}
                  aria-expanded={open}
                  aria-controls={megaId}
                  data-testid="ox-nav-shop"
                  onPointerEnter={() => schedule(link.key)}
                  onPointerLeave={() => schedule(null)}
                  onFocus={() => schedule(link.key)}
                  onBlur={() => schedule(null)}
                  {...(active ? { 'aria-current': 'page' as const } : {})}
                >
                  {link.label}
                  <Icon name="chevron-down" size={14} />
                </a>
                {open ? (
                  <MegaPanel
                    id={megaId}
                    labelledBy={triggerId}
                    onClose={() => close(link.key)}
                    onEscape={() => {
                      close(link.key);
                      shopTriggerRef.current?.focus();
                    }}
                    onPointerEnter={cancelClose}
                    onPointerLeave={() => schedule(null)}
                  />
                ) : null}
              </li>
            );
          }

          return (
            <li className="ox-nav__item" key={link.key} data-nav-item={link.key}>
              <NavLink
                to={link.to}
                className={`ox-nav__link${active ? ' is-active' : ''}`}
                activeOptions={EXACT_ACTIVE}
                data-testid={`ox-nav-${link.key}`}
                {...(active ? { 'aria-current': 'page' } : {})}
              >
                {link.label}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
