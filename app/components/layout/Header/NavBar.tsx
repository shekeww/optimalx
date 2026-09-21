import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { HEADER_NAV, SECONDARY_NAV, type NavEntry } from '../../../content/nav';
import { Icon } from '../../common/Icon';
import type { TaxonomyLink } from '../../listing/useTaxonomyLinks';
import { useTaxonomyLinks } from '../../listing/useTaxonomyLinks';
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
  dropdown?: NavEntry['dropdown'];
}

/**
 * How many items fit before the overflow control is needed.
 *
 * Pure so the arithmetic is testable without a layout engine: the component
 * feeds it measured widths. Returns `items.length` when everything fits, in
 * which case no overflow control is rendered at all.
 *
 * **`gap` is the row's own column gap and it is not optional in practice.**
 * The list is a 32px-gap flex row, so five items do not cost the sum of five
 * widths, they cost that plus four gaps, and leaving the gaps out of the sum
 * overstates what fits by 128px. Measured on the live store at 1440: the row
 * reported four items and a "المزيد" control as fitting a 510px nav, and the
 * control was laid out at x=552 against a nav starting at x=691, which is to
 * say underneath the search pill. Every gap is counted here now: the ones
 * between the items that stay, and the one before the overflow control.
 */
export function fitCount(
  itemWidths: number[],
  containerWidth: number,
  moreWidth: number,
  gap = 0
): number {
  let total = 0;
  for (const width of itemWidths) total += width;
  total += gap * Math.max(0, itemWidths.length - 1);
  if (total <= containerWidth) return itemWidths.length;

  const budget = containerWidth - moreWidth - gap;
  let used = 0;
  let count = 0;
  for (const width of itemWidths) {
    const next = used + width + (count > 0 ? gap : 0);
    if (next > budget) break;
    used = next;
    count += 1;
  }
  return count;
}

/** The row's column gap in pixels, or 0 where the engine reports none. */
function columnGapOf(node: HTMLElement): number {
  if (typeof getComputedStyle !== 'function') return 0;
  const value = parseFloat(getComputedStyle(node).columnGap);
  return Number.isFinite(value) ? value : 0;
}

/** "المكملات": the ten type roots, protein expandable to its five children. */
function TypesDropdown({ types, onClose }: { types: TaxonomyLink[]; onClose: () => void }) {
  return (
    <ul className="ox-nav__dropdown" data-testid="ox-nav-types-panel">
      {types.map((type) => (
        <li key={type.slug}>
          <Link to={type.to} className="ox-nav__droplink" onClick={onClose}>
            {type.label}
          </Link>
          {type.children.length > 0 ? (
            <ul className="ox-nav__subdropdown">
              {type.children.map((child) => (
                <li key={child.slug}>
                  <Link to={child.to} className="ox-nav__droplink ox-nav__droplink--sub" onClick={onClose}>
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
    </ul>
  );
}

/** "البروتين": protein's own five children, no live grandchildren to nest. */
function ProteinDropdown({ node, onClose }: { node: TaxonomyLink | undefined; onClose: () => void }) {
  if (!node || node.children.length === 0) return null;
  return (
    <ul className="ox-nav__dropdown" data-testid="ox-nav-protein-panel">
      {node.children.map((child) => (
        <li key={child.slug}>
          <Link to={child.to} className="ox-nav__droplink" onClick={onClose}>
            {child.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** "المزيد": the four utility categories, then the standing pages. */
function MoreDropdown({
  utility,
  pages,
  onClose,
}: {
  utility: TaxonomyLink[];
  pages: NavLinkItem[];
  onClose: () => void;
}) {
  return (
    <ul className="ox-nav__dropdown" data-testid="ox-nav-more-panel">
      {utility.map((node) => (
        <li key={node.slug}>
          <Link to={node.to} className="ox-nav__droplink" onClick={onClose}>
            {node.label}
          </Link>
        </li>
      ))}
      {pages.map((page) => (
        <li key={page.key}>
          <Link to={page.to} className="ox-nav__droplink" onClick={onClose}>
            {page.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}

/**
 * The desktop navigation, inside the main bar rather than in a row of its own.
 *
 * Five items, taxonomy-built (PLAN-ship Batch S1 step 3): المنتجات (mega
 * panel, `show_goal_nav` gated), المكملات (the ten type roots), البروتين
 * (its five children), اسأل قبل أن تشتري (the advisory, a plain link) and
 * المزيد (the four utility categories plus the standing pages). Every
 * dropdown's content comes from `useTaxonomyLinks` (Contract C): a slug
 * resolves to its live category once the merchant creates one, and to a
 * search for its own name otherwise (PLAN-final C15).
 *
 * **Three of the four dropdown items are real links, not buttons.** المنتجات,
 * المكملات and البروتين each have their own destination
 * (`/latest-products`, `/categories`, the protein category), so the item is
 * an anchor that navigates on click and opens its dropdown on hover or focus
 * - the dropdown is a shortcut, not the only way in. المزيد has no single
 * destination of its own (it is a shelf of four categories and four pages),
 * so it stays a toggle button, the same pattern the old goals item used.
 *
 * **`show_goal_nav` still gates المنتجات's panel, not its presence.** The
 * item is always on the bar; the setting decides whether hovering it opens
 * the mega panel (goals column + types column) or nothing, so a merchant who
 * has not opted into the goals axis still gets a working "products" link.
 *
 * Items that would overflow the bar move into the row's own overflow
 * control ("المزيد", the automatic one, distinct from the taxonomy "المزيد"
 * item above): recomputed with a ResizeObserver, which is what keeps the
 * row on one line between 1024 and 1280 without wrapping the search pill.
 */
export function NavBar() {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const { location } = useTwilight();
  const { items } = useHeaderMenu();
  const { types, goals, utility, bySlug } = useTaxonomyLinks();

  const showGoals = (settings as Record<string, unknown> | undefined)?.show_goal_nav === true;
  const panelId = useId();

  const [openKey, setOpenKey] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [visible, setVisible] = useState<number | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Intrinsic item widths, measured once while every item is rendered. A
  // hidden item measures 0, so without the cache the row could never grow back.
  const widths = useRef<number[]>([]);
  const countRef = useRef(0);
  const listRef = useRef<HTMLUListElement>(null);
  const moreRef = useRef<HTMLLIElement>(null);

  const links: NavLinkItem[] = [];
  for (const entry of HEADER_NAV) {
    const label = t(entry.labelKey);
    // المنتجات falls back to a plain link when the merchant has not opted
    // into the goals axis (see the module doc); every other item keeps its
    // dropdown.
    const dropdown = entry.dropdown === 'products' && !showGoals ? undefined : entry.dropdown;
    const to =
      entry.key === 'protein'
        ? (bySlug('protein')?.to ?? resolveNavHref(entry, label, items) ?? '/')
        : (resolveNavHref(entry, label, items) ?? '/');
    links.push({ key: entry.key, label, to, dropdown });
  }

  const pages: NavLinkItem[] = SECONDARY_NAV.map((entry) => ({
    key: entry.key,
    label: t(entry.labelKey),
    to: resolveNavHref(entry, t(entry.labelKey), items) ?? entry.to ?? '/',
  }));

  const measure = useCallback(() => {
    const list = listRef.current;
    if (!list) return;
    const host = list.parentElement ?? list;
    const row = host.getBoundingClientRect().width;
    if (!row) return;
    const gap = columnGapOf(list);
    const rendered = Array.from(list.querySelectorAll<HTMLElement>('[data-nav-item]'));
    if (rendered.length >= countRef.current) {
      widths.current = rendered.map((node) => node.getBoundingClientRect().width);
    }
    if (widths.current.length === 0) return;
    const moreWidth = moreRef.current?.getBoundingClientRect().width ?? 96;
    setVisible(fitCount(widths.current, row, moreWidth, gap));
  }, []);

  countRef.current = links.length;

  useEffect(() => {
    widths.current = [];
    setVisible(null);
  }, [links.length]);

  useEffect(() => {
    if (visible === null) measure();
  }, [visible, measure]);

  useEffect(() => {
    measure();
    const list = listRef.current;
    if (typeof ResizeObserver === 'undefined' || !list) return;
    const observer = new ResizeObserver(measure);
    const host = list.parentElement;
    if (host) observer.observe(host);
    observer.observe(list);
    return () => observer.disconnect();
  }, [measure, links.length]);

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

  const shown = visible === null ? links : links.slice(0, visible);
  const overflow = visible === null ? [] : links.slice(visible);
  const isActive = (to: string) =>
    to !== '/' && !to.startsWith('/search') && Boolean(location?.pathname?.startsWith(to));

  const panelContent = (link: NavLinkItem): ReactNode => {
    if (link.dropdown === 'types') return <TypesDropdown types={types} onClose={() => close(link.key)} />;
    if (link.dropdown === 'protein')
      return <ProteinDropdown node={bySlug('protein')} onClose={() => close(link.key)} />;
    if (link.dropdown === 'more')
      return <MoreDropdown utility={utility} pages={pages} onClose={() => close(link.key)} />;
    return null;
  };

  return (
    <nav className="ox-nav" aria-label={t('ox.nav.main_label')} data-testid="ox-navbar">
      <ul className="ox-nav__list" ref={listRef}>
        {shown.map((link) => {
          const open = openKey === link.key;

          if (link.dropdown === 'more') {
            return (
              <li className="ox-nav__item" key={link.key} data-nav-item="">
                <button
                  type="button"
                  className={`ox-nav__link${open ? ' is-open' : ''}`}
                  aria-expanded={open}
                  aria-controls={`${panelId}-${link.key}`}
                  data-testid={`ox-nav-${link.key}`}
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
                  <div
                    id={`${panelId}-${link.key}`}
                    role="group"
                    aria-label={link.label}
                    onPointerEnter={cancelClose}
                    onPointerLeave={() => schedule(null)}
                  >
                    {panelContent(link)}
                  </div>
                ) : null}
              </li>
            );
          }

          return (
            <li className="ox-nav__item" key={link.key} data-nav-item="">
              <Link
                to={link.to}
                id={link.dropdown ? `${panelId}-${link.key}-btn` : undefined}
                className={`ox-nav__link${isActive(link.to) ? ' is-active' : ''}${open ? ' is-open' : ''}`}
                aria-expanded={link.dropdown ? open : undefined}
                aria-controls={link.dropdown ? `${panelId}-${link.key}` : undefined}
                data-testid={`ox-nav-${link.key}`}
                onPointerEnter={link.dropdown ? () => schedule(link.key) : undefined}
                onPointerLeave={link.dropdown ? () => schedule(null) : undefined}
                onFocus={link.dropdown ? () => schedule(link.key) : undefined}
                onBlur={link.dropdown ? () => schedule(null) : undefined}
                {...(isActive(link.to) ? { 'aria-current': 'page' } : {})}
              >
                {link.label}
                {link.dropdown ? <Icon name="chevron-down" size={14} /> : null}
              </Link>
              {link.dropdown && open ? (
                link.dropdown === 'products' ? (
                  <MegaPanel
                    id={`${panelId}-${link.key}`}
                    labelledBy={`${panelId}-${link.key}-btn`}
                    goals={goals}
                    types={types}
                    onClose={() => close(link.key)}
                    onPointerEnter={cancelClose}
                    onPointerLeave={() => schedule(null)}
                  />
                ) : (
                  <div
                    id={`${panelId}-${link.key}`}
                    role="group"
                    aria-label={link.label}
                    onPointerEnter={cancelClose}
                    onPointerLeave={() => schedule(null)}
                  >
                    {panelContent(link)}
                  </div>
                )
              ) : null}
            </li>
          );
        })}

        {overflow.length > 0 ? (
          <li className="ox-nav__item ox-nav__item--more" ref={moreRef}>
            <button
              type="button"
              className="ox-nav__link"
              aria-expanded={moreOpen}
              data-testid="ox-nav-overflow-control"
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
