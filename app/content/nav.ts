/**
 * The chrome's navigation map: the header items and the three footer link
 * columns the approved design shows.
 *
 * Structure and locale keys only, no copy. Nothing here is a URL the store has
 * not got. Every entry names one of three kinds of destination:
 *
 * - `to`      a standing theme route that always exists (`/about`, `/contact`)
 * - `slug`    a live category, resolved against `menu.queries.header()`; when
 *             the merchant has not created it the link falls back to a search
 *             for the item's own label, which is the fallback this codebase
 *             already uses for the goal collections (PLAN-final C15)
 * - `tokens`  a dashboard page, resolved against `menu.footer()`. There is no
 *             fallback: a policy link that does not resolve is not rendered,
 *             because an invented policy URL is a dead link on a legal page
 * - `kind`    a store contact channel, gated on the contact actually being set
 */

export interface NavEntry {
  key: string;
  /** `ox.nav.*` or `ox.footer.*`. */
  labelKey: string;
  /** Live category slug to resolve against the header menu. */
  slug?: string;
  /** A theme route that is always present. */
  to?: string;
  /** Path or title fragments that identify a dashboard page. */
  tokens?: string[];
  /** A store contact channel rather than a page. */
  kind?: 'whatsapp';
  /**
   * Which of `NavBar`'s taxonomy dropdowns this item opens, if any:
   * `products` (goals column + types column + "كل المنتجات"), `types` (the
   * ten type roots, protein expandable), `protein` (protein's five
   * children) or `more` (the four utility categories plus the standing
   * pages). An entry with no `dropdown` is a plain link.
   */
  dropdown?: 'products' | 'types' | 'protein' | 'more';
}

export interface FooterColumn {
  key: string;
  headingKey: string;
  links: NavEntry[];
}

/**
 * The header row, in order from the RTL start: products, supplements,
 * protein, the advisory, more. Five items, taxonomy-built (PLAN-ship §1 item
 * 5, Batch S1 step 3), replacing the fixed `supplements`/`meal-plans` slugs
 * that pointed at categories the taxonomy never named.
 *
 * `المنتجات` opens the mega panel (goals column + types column + "كل
 * المنتجات") and falls back to its own `to` when `show_goal_nav` is off, so
 * the merchant's opt-in still governs whether a full panel or a plain link
 * sits first (PLAN-ship keeps this gating; only what it toggles changed).
 * `المكملات` opens a dropdown of the ten type roots, protein expandable to
 * its five children. `البروتين` is a live link with its own five-child
 * dropdown. `اسأل قبل أن تشتري` is the advisory, unchanged in position and
 * wording (PLAN-final: keeping it fourth, beside the shopping pillars, is
 * what makes it visible at the commonest desktop width; see NavBar.tsx for
 * the measured widths this row is sized against). `المزيد` opens the four
 * utility categories plus the standing pages this row has no room for
 * (guides, the branch, about, contact): it replaces `meal-plans` (removed,
 * conductor §5 decision: the label contradicted the services disclaimer)
 * and the old trailing `about-brand` link.
 */
export const HEADER_NAV: NavEntry[] = [
  { key: 'products', labelKey: 'ox.nav.products', to: '/latest-products', dropdown: 'products' },
  { key: 'supplements', labelKey: 'ox.nav.supplements', to: '/categories', dropdown: 'types' },
  { key: 'protein', labelKey: 'ox.nav.protein', slug: 'protein', dropdown: 'protein' },
  { key: 'services', labelKey: 'ox.nav.services', to: '/services' },
  { key: 'more', labelKey: 'ox.nav.more', dropdown: 'more' },
];

/**
 * The standing pages the desktop `more` dropdown and the mobile drawer both
 * list, guides before the utility categories reach them their own row. About
 * moved here from the old trailing `about-brand` header item; the two
 * surfaces publish one site map, so an entry added here reaches both.
 */
export const SECONDARY_NAV: NavEntry[] = [
  { key: 'guides', labelKey: 'ox.nav.guides', to: '/blog' },
  { key: 'about-brand', labelKey: 'ox.nav.about_brand', to: '/about' },
  { key: 'branch', labelKey: 'ox.nav.branch', to: '/branch' },
  { key: 'contact', labelKey: 'ox.nav.contact', to: '/contact' },
];

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    key: 'about',
    headingKey: 'ox.footer.about',
    links: [
      { key: 'about', labelKey: 'ox.nav.about', to: '/about' },
      { key: 'terms', labelKey: 'ox.footer.terms', tokens: ['terms', 'conditions', 'الشروط'] }, // ox-allow: arabic-literal
      { key: 'privacy', labelKey: 'ox.footer.privacy_policy', tokens: ['privacy', 'الخصوصية'] }, // ox-allow: arabic-literal
    ],
  },
  {
    key: 'service',
    headingKey: 'ox.footer.customer_service',
    links: [
      { key: 'contact', labelKey: 'ox.footer.contact', to: '/contact' },
      { key: 'whatsapp', labelKey: 'ox.footer.whatsapp', kind: 'whatsapp' },
      { key: 'faq', labelKey: 'ox.footer.faq', to: '/services' },
      {
        key: 'returns',
        labelKey: 'ox.footer.returns',
        tokens: ['return', 'refund', 'الاسترجاع', 'الاستبدال'], // ox-allow: arabic-literal
      },
    ],
  },
  {
    // `MENU.types` top four (app/content/taxonomy.ts): protein, creatine,
    // pre-workout, amino-acids, in catalogue order. Replaces the old
    // `supplements`/`meal-plans` slugs, neither of which named a taxonomy
    // node (PLAN-ship Batch S1 step 3).
    key: 'products',
    headingKey: 'ox.footer.products',
    links: [
      { key: 'protein', labelKey: 'ox.footer.protein', slug: 'protein' },
      { key: 'creatine', labelKey: 'ox.footer.creatine', slug: 'creatine' },
      { key: 'pre-workout', labelKey: 'ox.footer.pre_workout', slug: 'pre-workout' },
      { key: 'amino-acids', labelKey: 'ox.footer.amino_acids', slug: 'amino-acids' },
    ],
  },
];

/** Path segments of a menu URL, origin, query and hash removed. */
export function menuSegments(url: string): string[] {
  let path = url;
  const hash = path.indexOf('#');
  if (hash >= 0) path = path.slice(0, hash);
  const query = path.indexOf('?');
  if (query >= 0) path = path.slice(0, query);
  const scheme = path.indexOf('//');
  if (scheme >= 0) {
    const afterHost = path.indexOf('/', scheme + 2);
    path = afterHost >= 0 ? path.slice(afterHost) : '';
  }
  return path.split('/').filter(Boolean);
}

export interface MenuLike {
  id?: string | number;
  title?: string;
  url?: string;
}

/**
 * The first menu item whose URL or title carries one of `tokens`.
 *
 * Returns `undefined` rather than a guess: the caller drops the row. Matching
 * is case-insensitive on the Latin side and exact on the Arabic side, which is
 * all that is needed to recognise a policy page the merchant has published
 * under either language.
 */
export function findMenuLink(
  items: readonly MenuLike[] | undefined,
  tokens: readonly string[]
): MenuLike | undefined {
  if (!items?.length) return undefined;
  const wanted = tokens.map((token) => token.toLowerCase());
  return items.find((item) => {
    const url = (item.url ?? '').toLowerCase();
    const title = (item.title ?? '').toLowerCase();
    return wanted.some((token) => url.includes(token) || title.includes(token));
  });
}
