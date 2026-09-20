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
}

export interface FooterColumn {
  key: string;
  headingKey: string;
  links: NavEntry[];
}

/**
 * The header row, in order from the RTL start: products, supplements,
 * protein, the advisory, meal plans, the brand page.
 *
 * `المنتجات` points at the store's own full listing rather than a category,
 * so it is the one item that is always live.
 *
 * **The advisory sits on the bar, not only in the drawer.** It was in the
 * mobile drawer's page list and nowhere on the desktop chrome, which gave the
 * store two different site maps with the thing that distinguishes it from a
 * supplement catalogue on the smaller of the two. A desktop visitor could
 * reach `/services` from one home block and one footer link.
 *
 * **Its position in this array is the whole fix, not its presence.** Six
 * items plus the goals panel do not fit the bar: measured on the live store
 * at 1440, the nav is given 500px, the goals item takes 128 of it and the
 * overflow control 58, which leaves 314 for six labels that measure 507
 * together. `NavBar` moves the TRAILING items into "المزيد", so an advisory
 * typed last would be the first thing hidden, at the commonest desktop
 * width, which is where it was invisible to begin with. Fourth keeps it on
 * the bar beside the three shopping pillars and sends meal plans and the
 * brand page into the dropdown instead; both of those are in the footer too,
 * and neither is what this store is for.
 */
export const HEADER_NAV: NavEntry[] = [
  { key: 'products', labelKey: 'ox.nav.products', slug: 'products', to: '/latest-products' },
  { key: 'supplements', labelKey: 'ox.nav.supplements', slug: 'supplements' },
  { key: 'protein', labelKey: 'ox.nav.protein', slug: 'protein' },
  { key: 'services', labelKey: 'ox.nav.services', to: '/services' },
  { key: 'meal-plans', labelKey: 'ox.nav.meal_plans', slug: 'meal-plans' },
  { key: 'about-brand', labelKey: 'ox.nav.about_brand', to: '/about' },
];

/**
 * The standing pages the mobile drawer lists under the header items.
 *
 * It is what is left of the drawer's own page list once the advisory moved on
 * to `HEADER_NAV`: the drawer renders `HEADER_NAV` first and this after it, so
 * the two surfaces now publish one site map rather than two. Nothing is in
 * both lists, and an item added to either one reaches both surfaces.
 */
export const SECONDARY_NAV: NavEntry[] = [
  { key: 'guides', labelKey: 'ox.nav.guides', to: '/blog' },
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
    key: 'products',
    headingKey: 'ox.footer.products',
    links: [
      { key: 'supplements', labelKey: 'ox.footer.supplements', slug: 'supplements' },
      { key: 'protein', labelKey: 'ox.footer.protein', slug: 'protein' },
      { key: 'nutrition', labelKey: 'ox.footer.nutrition', slug: 'daily-health' },
      { key: 'meal-plans', labelKey: 'ox.footer.meal_plans', slug: 'meal-plans' },
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
