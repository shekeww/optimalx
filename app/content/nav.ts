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
   * Which of `NavBar`'s panels this item opens, if any: `mega` (the one
   * catalogue mega panel, NAV-2026-09-23 §5) or `more` (the shelf: the
   * utility-folded items plus `MORE_NAV`'s standing pages). An entry with no
   * `dropdown` is a plain link.
   */
  dropdown?: 'mega' | 'more';
  /**
   * Never folded into the automatic overflow as the row narrows
   * (NAV-2026-09-23 §1.4): `shop` and `services` are the store's two
   * shopping pillars, and letting either disappear first is the defect this
   * spec removes. `computeFold` skips a pinned item entirely.
   */
  pin?: true;
}

export interface FooterColumn {
  key: string;
  headingKey: string;
  links: NavEntry[];
}

/**
 * The header row, in order from the RTL start: shop, offers, the advisory,
 * about, contact, more (NAV-2026-09-23 §1 as revised by the owner's navigation
 * review: brands move inside تسوق as its third axis, guides move
 * inside المزيد, and about and contact come out of المزيد onto the bar).
 *
 * `تسوق` is the one mega panel trigger (types column, goals column with the
 * brand axis under it, the promoted tile) and keeps a real `to`
 * (`/categories`) so a keyboard or no-JS visitor still reaches the index.
 * `العروض` is gated on `settings.show_offers_nav !== false` by `NavBar`
 * itself (a header item that appears after hydration shifts the row, so the
 * gate has to run before this array is read, not inside it). `من نحن` and
 * `تواصل معنا` are never gated. `تسوق` and `اسأل قبل أن تشتري` are `pin`ned:
 * the row's own arithmetic (NavBar.tsx) folds `تواصل معنا` first, then
 * `من نحن`, then `العروض`, into `المزيد` as the viewport narrows, but the
 * two shopping pillars never fold.
 */
export const HEADER_NAV: NavEntry[] = [
  { key: 'shop', labelKey: 'ox.nav.shop', to: '/categories', dropdown: 'mega', pin: true },
  { key: 'offers', labelKey: 'ox.nav.offers', to: '/offers' },
  { key: 'services', labelKey: 'ox.nav.services', to: '/services', pin: true },
  { key: 'about', labelKey: 'ox.nav.about', to: '/about' },
  { key: 'contact', labelKey: 'ox.nav.contact', to: '/contact' },
  { key: 'more', labelKey: 'ox.nav.more', dropdown: 'more' },
];

/**
 * The standing pages the desktop `more` dropdown and the mobile drawer's own
 * `المزيد` accordion both list (NAV-2026-09-23 §6.1, the owner's navigation
 * review): the guides and the branch. About and contact left this list
 * for the bar itself. The branch also gets its own link in the utility strip
 * (`UtilityBar`), which is three taps closer on desktop; it stays here too
 * because the drawer has no utility strip of its own.
 */
export const MORE_NAV: NavEntry[] = [
  { key: 'guides', labelKey: 'ox.nav.guides', to: '/blog' },
  { key: 'branch', labelKey: 'ox.nav.branch', to: '/branch' },
];

/**
 * The catalogue's third axis beside حسب النوع and حسب الهدف (the owner's
 * navigation review: "العلامات التجارية to be part of التسوق ... as حسب العلامة").
 * One entry, the brands index, rendered by the mega panel, the shop sheet
 * and the drawer's shop groups so the three surfaces cannot drift apart.
 */
export const SHOP_BRAND_AXIS: NavEntry = { key: 'by-brand', labelKey: 'ox.nav.by_brand', to: '/brands' };

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
