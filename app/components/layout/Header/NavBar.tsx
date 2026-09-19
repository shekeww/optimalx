import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HEADER_NAV } from '../../../content/nav';
import { Icon } from '../../common/Icon';
import { resolveNavHref } from '../navLinks';
import { MegaPanel } from './MegaPanel';
import { useHeaderMenu } from './useHeaderMenu';

/** Hover intent, DIRECTION 7.1 "mega panel": 120ms to open, 200ms to close. */
const OPEN_DELAY = 120;
const CLOSE_DELAY = 200;

interface NavLinkItem {
  key: string;
  label: string;
  to: string;
}

/**
 * How many items fit before the overflow control is needed.
 *
 * Pure so the arithmetic is testable without a layout engine: the component
 * feeds it measured widths. Returns `items.length` when everything fits, in
 * which case no overflow control is rendered at all.
 */
export function fitCount(itemWidths: number[], containerWidth: number, moreWidth: number): number {
  let total = 0;
  for (const width of itemWidths) total += width;
  if (total <= containerWidth) return itemWidths.length;

  const budget = containerWidth - moreWidth;
  let used = 0;
  let count = 0;
  for (const width of itemWidths) {
    if (used + width > budget) break;
    used += width;
    count += 1;
  }
  return count;
}

/**
 * The desktop navigation, inside the main bar rather than in a row of its own.
 *
 * The approved design carries five items on one 88px bar: the nav row the
 * theme used to render below it is gone, which is why `--ox-h-nav` no longer
 * exists. The item set is the fixed map in `content/nav.ts`, not the dashboard
 * menu: the merchant's categories still supply the destinations wherever one
 * matches by slug, but the labels and their order are the brand's.
 *
 * The goals mega panel is off unless the merchant switches `show_goal_nav` on.
 * It was on by default while the nav had a row to itself; on the design's
 * five-item bar a sixth item is one more than the design carries, so the
 * merchant opts in.
 *
 * Items that would overflow the bar move into a "المزيد" dropdown, recomputed
 * with a ResizeObserver, which is what keeps the five items on one line
 * between 1024 and 1280 without wrapping the search pill.
 */
export function NavBar() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const { location } = useTwilight();
  const { items, goals } = useHeaderMenu();

  const showGoals = (settings as Record<string, unknown> | undefined)?.show_goal_nav === true;
  const panelId = useId();
  const goalsItemId = `${panelId}-goals`;

  const [open, setOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [visible, setVisible] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Intrinsic item widths, measured once while every item is rendered. A
  // hidden item measures 0, so without the cache the row could never grow back.
  const widths = useRef<number[]>([]);
  const countRef = useRef(0);
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);
  const goalsRef = useRef<HTMLButtonElement>(null);

  // A nav item with no destination is not rendered: a dead label in the
  // header is worse than a shorter header.
  const links: NavLinkItem[] = [];
  for (const entry of HEADER_NAV) {
    const label = t(entry.labelKey);
    const to = resolveNavHref(entry, label, items);
    if (to) links.push({ key: entry.key, label, to });
  }

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const row = list.getBoundingClientRect().width;
    if (!row) return;
    // The goals item never moves into the overflow, so its width comes off the
    // budget before anything is measured against it.
    const fixed = list.querySelector<HTMLElement>('[data-nav-fixed]');
    const container = row - (fixed?.getBoundingClientRect().width ?? 0);
    const rendered = Array.from(list.querySelectorAll<HTMLElement>('[data-nav-item]'));
    if (rendered.length >= countRef.current) {
      widths.current = rendered.map((node) => node.getBoundingClientRect().width);
    }
    if (widths.current.length === 0) return;
    const moreWidth = moreRef.current?.getBoundingClientRect().width ?? 96;
    setVisible(fitCount(widths.current, container, moreWidth));
  }, []);

  countRef.current = links.length;

  // A changed item set invalidates the cached widths: render them all again,
  // then re-measure on the next pass.
  useEffect(() => {
    widths.current = [];
    setVisible(null);
  }, [links.length]);

  useEffect(() => {
    if (visible === null) measure();
  }, [visible, measure]);

  useEffect(() => {
    measure();
    if (typeof ResizeObserver === 'undefined' || !listRef.current) return;
    const observer = new ResizeObserver(measure);
    observer.observe(listRef.current);
    return () => observer.disconnect();
  }, [measure, links.length]);

  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const schedule = (next: boolean) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(next), next ? OPEN_DELAY : CLOSE_DELAY);
  };

  const closePanel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(false);
    goalsRef.current?.focus();
  }, []);

  const shown = visible === null ? links : links.slice(0, visible);
  const overflow = visible === null ? [] : links.slice(visible);
  const isActive = (to: string) =>
    to !== '/' && !to.startsWith('/search') && Boolean(location?.pathname?.startsWith(to));

  return (
    <nav className="ox-nav" aria-label={t('ox.nav.main_label')} data-testid="ox-navbar">
      <ul className="ox-nav__list" ref={listRef}>
        {showGoals ? (
          <li className="ox-nav__item ox-nav__item--goals" data-nav-fixed="">
            <button
              type="button"
              id={goalsItemId}
              ref={goalsRef}
              className={`ox-nav__link${open ? ' is-open' : ''}`}
              aria-expanded={open}
              aria-controls={panelId}
              data-testid="ox-nav-goals"
              onClick={() => {
                if (timer.current) clearTimeout(timer.current);
                setOpen((current) => !current);
              }}
              onPointerEnter={() => schedule(true)}
              onPointerLeave={() => schedule(false)}
            >
              {t('ox.nav.goals')}
            </button>
            {open ? (
              <MegaPanel
                id={panelId}
                labelledBy={goalsItemId}
                goals={goals}
                categories={items}
                onClose={closePanel}
                onPointerEnter={() => {
                  if (timer.current) clearTimeout(timer.current);
                }}
                onPointerLeave={() => schedule(false)}
              />
            ) : null}
          </li>
        ) : null}

        {shown.map((link) => (
          <li className="ox-nav__item" key={link.key} data-nav-item="">
            <Link
              to={link.to}
              className={`ox-nav__link${isActive(link.to) ? ' is-active' : ''}`}
              {...(isActive(link.to) ? { 'aria-current': 'page' } : {})}
            >
              {link.label}
            </Link>
          </li>
        ))}

        {overflow.length > 0 ? (
          <li className="ox-nav__item ox-nav__item--more" ref={moreRef}>
            <button
              type="button"
              className="ox-nav__link"
              aria-expanded={moreOpen}
              data-testid="ox-nav-more"
              onClick={() => setMoreOpen((current) => !current)}
            >
              {t('ox.nav.more')}
              <Icon name="chevron-down" size={14} />
            </button>
            {moreOpen ? (
              <ul className="ox-nav__dropdown" data-testid="ox-nav-overflow">
                {overflow.map((link) => (
                  <li key={link.key}>
                    <Link to={link.to} className="ox-nav__droplink" onClick={() => setMoreOpen(false)}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </li>
        ) : null}
      </ul>
    </nav>
  );
}
