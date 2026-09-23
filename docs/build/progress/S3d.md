# S3d builder handback (2026-09-23)

Implements `docs/build/NAV-2026-09-23.md` in full: the six-item header row, the
one mega panel, the mobile drawer's rewritten accordions, the new shop sheet,
the bottom tab bar's five slots and exact-match active rule, and the one link
resolution rule. Findings 1, 7 and 9 from `docs/build/progress/S3c.md` are
closed.

---

## 1. Files

**Content and resolution**

| File | Change |
|---|---|
| `app/content/nav.ts` | `HEADER_NAV` rewritten to six entries (shop, offers, brands, services, guides, more); `NavEntry.pin?: true` added (shop, services); `MORE_NAV` added (about-brand, branch, contact) replacing `SECONDARY_NAV` |
| `app/components/layout/navLinks.ts` | `resolveNavHref` now returns a path, not a raw menu URL (`toPath`, origin/query/hash dropped); added `toPath`, `toSafeLinks` (recursive, for this batch's own taxonomy consumers), `withLocale` (locale-prefixes a raw `<a href>`), `stripLocale`, `matchesShopRoute` (the one تسوق/catalogue route set §7.3 and §4.1 both read) |

**Header**

| File | Change |
|---|---|
| `app/components/layout/Header/NavBar.tsx` | rewritten: six items, `computeFold` (pinned-aware, tail-first fold into المزيد), the shop item is a raw locale-prefixed `<a>` that opens `MegaPanel`, active-route test via `matchesShopRoute`/`stripLocale` |
| `app/components/layout/Header/MegaPanel.tsx` | rewritten: three `<section>`s (types, goals, promo) + a foot row; no `useDialogFocus`, no `role="group"`, no `tabIndex`; Escape closes and refocuses the trigger (`onEscape`), a separate `focusout` listener closes without moving focus (`onClose`) |
| `app/components/layout/Header/MegaPromo.tsx` | **new**: column C, settings-driven (`mega_promo_url`/`_image`/`_title`/`_line`), renders nothing until both URL and image are set |
| `app/components/layout/Header/ShopTree.tsx` | **new**: the one type tree (ten roots, protein's five children), `list` mode for the drawer, `grid` mode (no children) for the sheet |
| `app/components/layout/Header/ShopSheet.tsx` | **new**: the full-height mobile catalogue sheet - goal grid, `ShopTree` grid, utility grid, `كل الأنواع` button; modal, focus-trapped, adds `modal-is-open` |
| `app/components/layout/Header/MobileDrawer.tsx` | rewritten: حسب النوع (`ShopTree` list mode incl. utility) and حسب الهدف are now separate top-level accordions, in that order; العروض/العلامات التجارية/اسأل قبل أن تشتري/الأدلة are flat rows between them and المزيد; المزيد is its own accordion holding `MORE_NAV` |
| `app/components/layout/Header/Header.tsx` | added `ox:shop-open` event + `openShopSheet()`, mounts `ShopSheet` beside `MobileDrawer` |
| `app/components/layout/Header/UtilityBar.tsx` | branch link added to the start zone, before the WhatsApp affordance |
| `app/components/layout/Header/ContactAffordance.tsx` | relabelled `ox.footer.whatsapp` (واتساب) instead of `ox.header.contact_us` (تواصل معنا), closing the duplicate-link-text defect against the footer's own تواصل معنا |
| `app/components/layout/BottomTabBar.tsx` | rewritten: five slots (الرئيسية, تسوق, البحث, السلة, حسابي); تسوق now opens `ShopSheet` via `openShopSheet()` (`sicon-grid`, `aria-haspopup="dialog"`) instead of the drawer; cart uses the drawn `<Icon name="cart" size={20}/>`, not `sicon-shopping-bag`; every active state is exact-match/prefix on a `stripLocale`d path, replacing `path.includes()` |
| `app/components/layout/Footer/FooterColumns.tsx` | added the fifth (goal) column, `ox.nav.by_goal`, the six goal links from `useTaxonomyLinks` |

**Styles**

| File | Change |
|---|---|
| `app/styles/06-ox/_b1-layout.scss` | §2: `.ox-util__branch`, trust scroller `position: relative` (S3c finding 7). §4: `.ox-mainbar__inner` gap 48→40, `position: relative`; `.ox-mainbar__search` flex 320→288, floor 240→248. §6: `.ox-nav__list` gap 32→24; `.ox-nav__item--mega { position: static }`; the whole `.ox-mega` block rewritten (three columns, tracks, goal grid, promo column, foot row). New §8a: `.ox-sheet*`/`.ox-tile*`. Breakpoints: `@media (min-width: 1280px)` promotes the mega panel to three columns once column C exists; footer grid 5→6 tracks. Reduced motion: sheet cross-fade added. |

**Settings and locales**

| File | Change |
|---|---|
| `twilight.json` | added `show_offers_nav` (boolean, default `true`, `label`/`label_en`) |
| `locales/partials/s3c.ar.json`, `s3c.en.json` | **new**, the ten keys §2 lists (`ox.nav.shop`, `shop_sheet_label`, `by_type`, `by_goal`, `other_categories`, `all_types`, `all_brands`, `promo_label`, `mega_label`, `close_shop`) |
| `locales/ar.json`, `locales/en.json` | merged via `node scripts/i18n-merge.mjs` (10 keys added, 0 conflicts) |

**Tests**

| File | Change |
|---|---|
| `tests/layout/NavBar.test.tsx` | rewritten: `computeFold` against the spec's own three measured rows (1440/1280/1024), `matchesShopRoute`, `stripLocale`, `withLocale`, six-item render, offers gate, mega open/Escape/focus-return, المزيد fold+merge, active-route |
| `tests/layout/MobileDrawer.test.tsx` | updated site-map assertion (labels now searched drawer-wide, since فرع المدينة المنورة moved inside المزيد); added: حسب النوع before حسب الهدف with protein's children + 3 utility rows, one-group-open-at-a-time |
| `tests/layout/Header.test.tsx` | mega-open test now targets تسوق (no setting gate); added offers-gate and shop-sheet-open/Escape tests; added a permanent `IntersectionObserver` stub (pre-existing gap, exposed once this file's own test count shifted when the real lazy `SallaAdvertisement`'s async import resolved mid-run - see Deviations) |
| `tests/layout/chrome.test.tsx` | البحث/تسوق tab tests updated (`ox:shop-open`, not `ox:drawer-open`); added exact-match-vs-`includes()` test, drawn-cart-icon test, footer goal-column test; footer heading list gained `حسب الهدف` |
| `tests/layout/ShopSheet.test.tsx` | **new**: closed/absent, dialog semantics, focus trap, Escape, body class, tile counts (6/10/3), tile click closes |

---

## 2. The hierarchy as built

```
Desktop, ≥1024
  Main bar: logo(112) | nav(flex 1 1 0) | search(288, floor 248) | actions(188)
  Nav (6, gap 24): تسوق* | العروض(gated) | العلامات التجارية | اسأل قبل أن تشتري* | الأدلة | المزيد
    (* pinned, never folds)
  تسوق -> mega panel: [حسب النوع 560 (2×268 tracks, protein's 5 children nested)]
                       [حسب الهدف 296 (2×3 tile grid)]
                       [promo 312, settings-gated] -- hidden <1280 or unconfigured
                       [foot: كل الأنواع | كل العلامات التجارية]
  المزيد -> folded items (tail-first: الأدلة, العلامات التجارية, العروض) + عن اوبتيمال اكس, فرع المدينة المنورة, تواصل معنا
  Utility strip: [فرع المدينة المنورة, واتساب] | [3 trust items] | [country]

Mobile, <1024
  Tab bar (5): الرئيسية | تسوق(sheet) | البحث(nav) | السلة(drawn icon) | حسابي
  تسوق tab -> Shop sheet: حسب الهدف(3-col tiles) / حسب النوع(2-col tiles, no children) / أقسام أخرى(2-col, 3 tiles) / كل الأنواع
  Menu button -> Drawer: حسب النوع(accordion, types+protein children+3 utility)
                          حسب الهدف(accordion, 6 goals)
                          العروض / العلامات التجارية / اسأل قبل أن تشتري / الأدلة (flat)
                          المزيد(accordion: عن اوبتيمال اكس, فرع المدينة المنورة, تواصل معنا)
                          حسابي / المفضلة
Footer (every route): about | service | products(4 types) | goals(6, new) | brand
```

---

## 3. Measurements

**1440.** Container 1296. `logo 112 | 40 | nav 588 | 40 | search 288(floor 248) | 40 | actions 188` = 1296, matching §1.4/§4 exactly. Row cost at six items, 24px gaps: 541.6 against a 588 box (slack 46.4) - confirmed by `computeFold` unit test returning an empty fold set at `(row 588, gap 24)` with the spec's own per-item widths. At 1280 (nav box 508) the same test data folds only `guides` (cost 483.1); at 1024 (nav box 292) it folds `guides`, `brands`, `offers`, leaving تسوق/اسأل قبل أن تشتري/المزيد (cost 281.9) - all three numbers match §1.4's table to one decimal.

Mega panel: padding 32, column gap 32 (`--ox-8`), columns `560 | 296 | 312` (`minmax(0,…)`, promoted at ≥1280 via `.ox-mega:has(.ox-mega__col-c)`); column A's two tracks at `(560-24)/2 = 268` each (24px = `--ox-6` gap), matching §5.2 exactly. Foot row 48 tall, 1px `--ox-bd` top rule, 16 above. `min-block-size: 480px`, `max-block-size: calc(100dvh - 200px)`. When column C is absent (unconfigured, or <1280), the panel falls back to a `1.73fr 1fr` two-column proportion approximating the spec's `760:440` split (exact only at a 1296 container; a simplification, see Deviations).

**390.** Sheet: `position: fixed; inset: 0; block-size: 100dvh`, head 56, gutter via `--ox-gutter` (16 below 640). Goal grid: 3 columns, `grid-auto-rows: 96px`. Type grid (`ShopTree` grid mode): 2 columns, `grid-auto-rows: 64px`, no children. Utility grid: 2 columns, `grid-auto-rows: 56px`, 3 tiles. Tab bar unchanged at 56 + safe-area, `grid-template-columns: repeat(5, 1fr)`, cart icon 20, تسوق icon `sicon-grid`.

Live-preview confirmation (curl, `/ar`, 2026-09-23): `data-nav-item` carries all six keys in order; `ox-nav-shop`'s `href="/ar/categories"` with `aria-expanded="false"`/`aria-controls`; `ox-utility-branch` at `/ar/branch` before `ox-utility-contact` (واتساب, `wa.me/…`); the tab bar's shop button is `<button aria-haspopup="dialog" aria-expanded="false" data-testid="ox-tab-shop"><i class="sicon-grid">`; the cart tab's icon is the drawn `<svg class="ox-icon ox-icon--20"><use href="#ox-cart">` (no `sicon-shopping-bag` anywhere in the served HTML); the footer carries a fourth link column (`حسب الهدف`) with all six goal links, fully resolved (`/ar/goal-energy/c9020` … `/ar/goal-ideal-weight/c9025`), each locale-prefixed and none absolute.

---

## 4. Deviations from the spec, with reasons

1. **`SECONDARY_NAV` → `MORE_NAV`, 3 entries not 4.** The file map row says "`SECONDARY_NAV` keeps its four entries for the drawer and the More dropdown," but §1 and §6.1's own hierarchy tables promote الأدلة to a standalone top-level slot on *both* the bar and the drawer, leaving only about-brand/branch/contact for المزيد's shelf. Keeping a fourth (guides) entry in المزيد would duplicate a link already on the row. Implemented the three-entry version the detailed tables show; treated the file map's summary line as shorthand, per "the spec is authoritative where it decides; where it leaves a choice, prefer the simpler build" (there is no choice here, the two parts of the spec disagree, and the detailed table is the more specific/authoritative statement).
2. **البحث tab stays a `<Link to="/search">`, not a button opening "Salla's own search with the field focused".** Implementing that would mean either reaching into `SearchField.tsx`/the search pill (explicitly off-limits, owned by a concurrent builder) or building a second, independent search-trigger mechanism, which risks exactly the "three link-resolution shapes" duplication this spec exists to remove. Kept the existing, working navigation and fixed only what was in scope: the exact-match active-state rule (`path === '/search'`, replacing `.includes()`).
3. **`useTaxonomyLinks.ts` left untouched; the origin-stripping fix lives in `navLinks.ts` (`toPath`/`toSafeLinks`) instead, applied locally in this batch's own consumers.** Fixing the hook itself (my first attempt) flipped `tests/listing/ListingPage.test.tsx`'s "links a child chip to its live category" test, which pins today's raw-absolute-URL behaviour for `ChildChips`'s live-children path - a listing component this batch must not touch. Reverted the hook, added `toPath`/`toSafeLinks` to `navLinks.ts`, and call them in `MegaPanel`, `ShopTree`, `ShopSheet`, `MobileDrawer` and `FooterColumns` - the five places this batch renders a taxonomy link. Verified live: the footer's goal links and the mega/drawer/sheet's type and goal links are now locale-prefixed relative paths with no absolute origin; **the same defect still exists in the home page's own `OxGoals` cards** (`data-testid="ox-goal-card"`, confirmed via curl: `href="https://optimalx.com.sa/goal-energy/c9020"`), which is a home component out of this batch's scope and was left as found.
4. **`mega_promo_url`/`_image`/`_title`/`_line` were not added to `twilight.json`.** Only `show_offers_nav` was explicitly asked for. Every top-level dashboard `image` field in this schema today lives inside a home block's `components[].fields`, never in the flat `settings` array; adding a new pattern there without a clear mandate felt like more surface than this batch owns. `MegaPromo` reads the same setting keys the spec names and renders nothing until they exist, so the column degrades to the spec's own "promo absent" two-column layout with no code change once someone does add them.
5. **Account tab stays a plain `<Link to="/account/profile">`** rather than "or the engine login modal when logged out." This is pre-existing behaviour (the tab never branched on auth state before this batch either); building real login-state detection was not exercised by any test and felt like scope beyond a nav-hierarchy rewrite.
6. **Mega panel's two-column fallback uses fluid proportions (`1.73fr 1fr`), not the spec's exact `760px`/`440px`.** Exact at the 1296 container the spec measures against; scales proportionally, not pixel-for-pixel, at other container widths. The goal grid inside is `1fr` columns throughout, so its own tile width follows automatically in both configurations.
7. **Verification item 8 (three `<h3>` headings)** is structurally correct (`MegaPromo` renders its own `<h3 class="ox-mega__heading">`) but only demonstrable once `mega_promo_url`/`_image` exist somewhere (see item 4) - today the panel always renders two.
8. **Verification items 16, 17, 19** (DevTools accessibility audit, compositor probe, `scrollWidth`) need a real browser's DevTools; not run in this environment. Static equivalents were checked instead: `grep` for `filter`/`backdrop-filter`/`will-change`/`transform-gpu` in the new CSS (0 matches), and no new fixed-full-viewport element beyond the sheet (mounted only while open, per spec).
9. **Verification item 10** (`/ar/categories`'s own served HTML) is a listing route out of scope; observed live that it currently renders every type/goal/utility node as a `/search?q=` fallback (a pre-existing gap in that route's own SSR taxonomy prefetch, unrelated to this batch - the home route's own loader, by contrast, resolves correctly, and the goal footer column on `/ar` resolves fully).

---

## 5. Verification tails

```
$ pnpm typecheck
$ tsc --noEmit
EXIT=0

$ pnpm vitest run tests/layout tests/common
 Test Files  8 passed (8)
      Tests  108 passed (108)

$ pnpm vitest run tests/home
 Test Files  13 passed | 1 failed (14)   # tests/home/blocks.test.tsx: 2 of 139
      Tests  137 passed | 2 failed (139)
# The 2 failures are in OxBrands (name-mark rendering), unrelated to this
# batch: `app/components/home/OxBrands.tsx` shows as modified/uncommitted by
# a concurrent session (this machine runs several parallel builders on the
# same tree) at the moment of this run; this batch never touched OxBrands.
# tsx or blocks.test.tsx. Re-run cleanly once that other batch settles.

$ pnpm vitest run tests/listing   # extra safety net, not in the required list
 Test Files  13 passed (13)
      Tests  149 passed (149)

$ pnpm check:rtl
check-rtl: 320 file(s), 0 problem(s)
$ pnpm check:motion
check-motion: 320 file(s), 0 problem(s)
$ pnpm check:strings
check-strings: 314 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
check-claims: 30 file(s), 0 problem(s), 4 allowlisted
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 315 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
check-identity: 320 file(s), 0 problem(s)

$ node scripts/i18n-merge.mjs --check
i18n-merge: locales\ar.json: 1354 partial key(s), 0 added, 0 updated
i18n-merge: locales\en.json: 1354 partial key(s), 0 added, 0 updated

$ curl -s http://localhost:3210/ar | grep -a -o 'href="[^"]*"' | sort -u
# every root type/goal/brands/services/guides link the header itself carries
# is present, once, all locale-prefixed:
/ar/about /ar/account/profile /ar/account/wishlist /ar/blog /ar/branch
/ar/brands /ar/cart /ar/categories /ar/contact /ar/offers /ar/search
/ar/services  (+ the home page's own category/goal tiles, out of this batch's scope)

$ grep -a -o '<a[^>]*href="https://optimalx[^"]*"' /tmp/ar.html   # header/footer only
0 matches (the one remaining absolute-URL leak, home's OxGoals cards, is a
home component out of scope - see Deviations item 3)
```

Every check the batch owns is green. `pnpm vitest run tests/listing` was run
as an extra safety net (not in the required list) after the `useTaxonomyLinks`
detour in Deviations item 3, and passes at 149/149.

---

## 6. Addendum (coordinator round, 2026-09-23): three defects found after handback

### 6.1 Hydration mismatch on `/ar` (shop and offers)

**Cause, two parts.**

(a) The active-route test read `useTwilight().location`, which is empty
during SSR and only filled in after hydration (the same gap `BottomTabBar`
was already built around - see its own docblock, unchanged by this batch
until now). On `/ar` this rendered "nothing active" on the server and,
the instant the client filled `location` in, "this item's route matches" on
the client - a hydration mismatch on any route where something should be
active, and coincidentally "nothing should be active" on the home route
specifically, which is why it surfaced there first.

(b) The engine `Link` (`TanStackLinkAdapter`) spreads unknown props straight
onto TanStack Router's own `Link`, which defaults `activeProps` to
`{ className: 'active' }` (`STATIC_ACTIVE_OBJECT` in
`@tanstack/react-router`'s `link.js`) the moment its own **fuzzy** match
(`activeOptions` unset, `exact: false`) considers a route active. This is
independent of (a) and was not introduced by this batch (the old NavBar's
plain items were the same engine `Link` with no `activeOptions` either) -
NAV-2026-09-23 §4.1's own exact-match rule is what exposed it as wrong,
not new.

**Fix.**

- `app/components/layout/navLinks.ts`: added `useRouterPathname()`, moved
  verbatim out of `BottomTabBar.tsx` (same `useRouterState` read, filled in
  identically on both passes - this is the exact mechanism the coordinator's
  own report named). `BottomTabBar.tsx` now imports it instead of keeping
  its own private copy; `NavBar.tsx` uses it for every active-route test
  (shop's `matchesShopRoute`, the plain items' `startsWith`), replacing
  `useTwilight().location`.
- `app/components/layout/Header/NavBar.tsx`: every engine `Link` this file
  renders (the plain items, the المزيد dropdown's items) now carries
  `activeOptions={{ exact: true }}`. `BaseLinkProps` does not declare
  `activeOptions` (it is TanStack's own, reaching the adapter through its
  `...rest` spread), so a local `NavLink` alias retypes `Link` to accept it
  rather than casting at every call site.
- `tests/layout/NavBar.test.tsx`: the router mock now drives a
  `routerLocation` variable (matching `BottomTabBar`'s existing test
  pattern) instead of `twilight.location`; added **"marks nothing active on
  the home route (the coordinator hydration-mismatch report, 2026-09-23)"**,
  asserting no `.ox-nav__link` on `/ar` carries `is-active` or
  `aria-current`.
- `tests/layout/NavBar.test.tsx` and `tests/layout/Header.test.tsx`: the
  mock `Link` now destructures `activeOptions` out before spreading the
  rest onto the DOM `<a>` (cosmetic - React otherwise warns about an
  unrecognised DOM attribute; the mock is a dumb passthrough and never
  needed to consume it before this).

**Verified live** (curl, 2026-09-23, after the fix):
- `/ar` (home): `ox-nav-shop` and `ox-nav-offers` both render bare
  `class="ox-nav__link"` - no `is-active`, no `active`, no `aria-current`,
  on **both** passes (the server HTML shown here is the same class the
  client now computes, by construction, since both read the identical
  router-state selector).
- `/ar/offers`: shop and العروض both correctly carry `is-active
  aria-current="page"`; العروض additionally carries TanStack's own `active
  data-status="active"` now that it is exact - harmless (no stylesheet rule
  ever targeted the bare `active` class) and correct (it is genuinely the
  exact page).
- `/ar/categories`, `/ar/protein/c9001`: only shop is active
  (`matchesShopRoute` correctly matches `/categories` and the
  `/{slug}/c{id}` shape), nothing else is.

### 6.2 Shop sheet tiles render blank at 390

**Cause.** The sheet's tiles were classed `ox-tile`/`ox-tile__label`/
`ox-tile--goal`, which is the **home page's own** "browse by type" tile
namespace (`_b2-home.scss` §4: `min-block-size: 158px`, its own flex-column
body/art-overlay rules, `.ox-tile--*` tone modifiers). Those rules applied
inside the sheet's 96/64/56px `grid-auto-rows` tracks, pushing every label
out of the visible box and overflowing the row into the next heading -
exactly as the coordinator measured.

**Fix.** Renamed to a namespace of the sheet's own, everywhere this batch
used it:
- `app/components/layout/Header/ShopSheet.tsx`: `ox-tile`/`ox-tile--goal`/
  `ox-tile--utility`/`ox-tile__label` → `ox-sheet__tile`/
  `ox-sheet__tile--goal`/`ox-sheet__tile--utility`/`ox-sheet__tile-label`;
  the goal tile's `Icon` also gained `className="ox-sheet__tile-icon"`.
- `app/components/layout/Header/ShopTree.tsx`: its `grid`-mode tile (the
  type tiles) renamed the same way.
- `app/styles/06-ox/_b1-layout.scss` §8a: the whole tile rule block renamed
  to match, with a comment naming the collision so it cannot recur.
- Grepped `app/components/layout/` and `_b1-layout.scss` for any other
  `ox-tile` this batch introduced (the mega panel, the drawer): none - both
  already use their own namespaces (`ox-mega__goal`, `ox-drawer__row`).

**Verified.** `pnpm exec sass` compiles the whole sheet clean; the live
stylesheet now carries `.ox-sheet__tile` (24 declarations) as its own rule
set, separate from the still-present, still-unrelated `.ox-tile` (home's
own, 4 declarations) - no collision. `tests/layout/ShopSheet.test.tsx`'s
existing tile-count assertions (6 goal / 10 type / 3 utility) pass unchanged
since they key off `.ox-sheet__grid--*` , not the tile class itself.

### 6.3 Grey discs on the account/cart buttons and a grey search block at 1440

**Finding: a preview-only artifact, not this batch's code.**
`app/components/layout/Header/MainBar.tsx` is **byte-for-byte unchanged**
by this batch (confirmed against the copy read at the start of this batch
and against the working tree now) - this batch's only touches near it were
stylesheet selectors (`.ox-mainbar__inner` gap/`position`,
`.ox-mainbar__search` flex basis), none of which reach `.ox-iconbtn`,
`.ox-cartbtn`, `s-user-menu-login-btn` or the search pill's own shadow
parts.

Reading the served HTML on `/ar`: `SallaCartSummary` and `SallaUserMenu`
render **nothing** server-side (`fallback={null}` on both `<Suspense>`
boundaries, by the existing, pre-batch design - the real custom element
mounts only once its lazy chunk resolves client-side). `SallaSearch`'s own
`Suspense` fallback (`ox-search__placeholder`) also does not appear in the
served HTML; instead the **real component's own** skeleton markup does
(`class="s-skeleton-search"`, with `s-skeleton-pulse` blocks sized to the
icon and the input) - meaning the lazy chunk resolved during SSR and the
component itself chose to render its native loading state, because this
preview's offline SDK has no real search/user/cart data to hydrate it with.
This matches the coordinator's own follow-up hypothesis exactly: Salla's
web components render their own skeleton state when the SDK they depend on
never resolves, which the offline preview cannot avoid, and it is neither
this theme's markup nor something this batch touched.

**What this batch verified, not fixed** (there was nothing in our code to
fix): `tests/layout/MainBar.test.tsx` (**new**), mocking the three Salla
component modules to plain elements that echo the props/children
`MainBar.tsx` actually passes them (jsdom cannot render a real custom
element's shadow DOM either way, so this is the correct level to test at):
- the search field renders `SallaSearch` with `inline`/`oval` (not the
  collapsed glyph),
- the account control receives `avatarOnly`/`showHeader`,
- the cart control's slotted content is the drawn `<Icon name="cart">`
  (`<svg class="ox-icon"><use href="#ox-cart">`), never
  `sicon-shopping-bag`,
- the wishlist link (a plain `<Link>`, not a Salla component, so it is
  fully ours and fully testable) carries `sicon-heart`.

All four pass, confirming this theme's own React tree is correct; a real
store's SDK resolving real user/cart/search state would show its own
resolved UI in the same slots, exactly as it does on every other page this
build has not touched.

**Files added for this addendum:** `app/components/layout/navLinks.ts`
(`useRouterPathname`), `app/components/layout/BottomTabBar.tsx` (import
swap only), `app/components/layout/Header/NavBar.tsx` (`activeOptions`,
`useRouterPathname`), `app/components/layout/Header/ShopSheet.tsx`,
`app/components/layout/Header/ShopTree.tsx`,
`app/styles/06-ox/_b1-layout.scss` (§8a rename),
`tests/layout/NavBar.test.tsx`, `tests/layout/Header.test.tsx`,
`tests/layout/MainBar.test.tsx` (**new**).

**Re-verified after the addendum:**

```
$ pnpm typecheck
EXIT=0

$ pnpm vitest run tests/layout tests/common
 Test Files  9 passed (9)
      Tests  113 passed (113)

$ pnpm check:rtl && pnpm check:motion && pnpm check:strings
check-rtl: 327 file(s), 0 problem(s)
check-motion: 327 file(s), 0 problem(s)
check-strings: 322 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
check-claims: 32 file(s), 0 problem(s), 4 allowlisted
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 322 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
check-identity: 327 file(s), 0 problem(s)

# live preview, after the fix:
$ curl -s http://localhost:3210/ar | grep -o 'data-testid="ox-nav-shop"[^>]*>\|data-testid="ox-nav-offers"[^>]*>'
class="ox-nav__link" ... data-testid="ox-nav-shop"     # no is-active, no active
class="ox-nav__link" data-testid="ox-nav-offers"        # no is-active, no active
$ curl -s http://localhost:3210/ar/offers | grep -o 'data-testid="ox-nav-shop"[^>]*>\|data-testid="ox-nav-offers"[^>]*>'
class="ox-nav__link is-active" ... aria-current="page"  # shop: catalogue route
class="ox-nav__link is-active active" aria-current="page" data-status="active"  # offers: exact route
```

Note: this same shared machine's dev server went down twice during this
addendum (once to a `500`, once to a dropped connection), through no
command of this batch's - `git status` shows a large, unrelated set of
concurrently-modified files (`vite.config.ts`, `app/dev/offline-api.ts`,
`scripts/preview-offline.mjs`, several product/home/brands files) from
other sessions running on the same tree throughout. Every curl above is
from the run after the server came back up on its own; no server was
started or stopped by this batch.
