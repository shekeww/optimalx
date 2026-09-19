import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
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
 * The desktop category row (DIRECTION 5.1 NavBar, 6.1: 48 tall).
 *
 * Order: the goals item (which opens the mega panel, gated on the
 * `show_goal_nav` setting), the live categories from
 * `menu.queries.header()`, then the three standing pages. Items that would
 * overflow the container move into a "المزيد" dropdown, recomputed with a
 * ResizeObserver.
 *
 * Categories are never keyed by id: the dashboard categories do not exist yet
 * and the menu is the only source of a URL (PLAN-final C15).
 */
export function NavBar() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const { location } = useTwilight();
  const { items, goals } = useHeaderMenu();

  const showGoals = (settings as Record<string, unknown> | undefined)?.show_goal_nav !== false;
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

  const links: NavLinkItem[] = [
    ...items.map((item) => ({ key: String(item.id), label: item.title, to: item.url })),
    { key: 'services', label: t('ox.nav.services'), to: '/services' },
    { key: 'guides', label: t('ox.nav.guides'), to: '/blog' },
    { key: 'branch', label: t('ox.nav.branch'), to: '/branch' },
  ];

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
  const isActive = (to: string) => to !== '/' && Boolean(location?.pathname?.startsWith(to));

  return (
    <nav className="ox-nav" aria-label={t('ox.nav.main_label')} data-testid="ox-navbar">
      <div className="ox-nav__inner ox-container">
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
                <i className="sicon-keyboard_arrow_down ox-mirror" aria-hidden="true" />
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
      </div>
    </nav>
  );
}
