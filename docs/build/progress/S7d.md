# S7d — the P0 gate: the cart, the booking, the links, the mirror

Builder S7d, 2026-09-23. Brief: `docs/build/UX-2026-09-24.md` (designer S6c's
live audit), P0 items 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 16, 17, 18.
Not this batch: P0-3 (the card, S5b), P0-12's copy (S7c), P0-15 (an owner
override recorded on `app/styles/tokens.css:228-235`).

Everything below was measured on the running preview at `http://localhost:3210`
through the Chrome DevTools protocol at 390 x 844 (dpr 3, mobile emulation),
502 x 844 and 1440 x 900, before and after each change. The harness is a
throwaway CDP client in the session scratchpad (headless Chrome, its own
profile, closed after every run); `chrome-devtools-mcp` was not available in
this builder's tool set, so the same measurements were taken directly against
the protocol.

---

## 0. The root cause the brief asked me to find first, and what it actually is

The brief (and the audit, P0-1 and P0-17) read
`Warning: Error in route match: /{-$locale}/cart/ar/cart` as **a locale
segment concatenated twice**, and asked for one idempotent prefixing rule as
the fix for the cart 500 and the `/ar/about` 404.

**That string is not a URL.** TanStack builds a match id as

```js
const matchId = route.id + interpolatedPath + loaderDepsHash;
```

(`node_modules/.pnpm/@tanstack+router-core@1.171.30/node_modules/@tanstack/router-core/dist/esm/router.js:720`),
and `Match.js:58` prints `Warning: Error in route match: ${match.id}` whenever
a match's component throws. So `/{-$locale}/cart` + `/ar/cart` is the route id
plus the interpolated path: the normal id format, printed because **something
inside the cart component threw**. There was never a double prefix, and no
route in the tree produced one.

The real cart defect is in section 1. The real link defect (24 absolute
anchors per page) is in section 3, and it is a different bug with the same
symptom class, so the one resolution rule was still built and is still the
fix — it just is not what made the cart a 500.

`/ar/about` (P0-17) is in section 12.

---

## 1. P0-1 — the cart route crashed

**Root cause, three layers deep.**

1. `app/routes/cart.tsx` read `cart.items.length`. The cart detail payload
   answers with `items` **undefined**, not empty, before it is filled, and in
   the offline preview it never fills at all: that is the measured
   `TypeError: Cannot read properties of undefined (reading 'length')` inside
   `<CartComponent>` (our own function, not the engine's `CartPageContent`).
2. `useCartData` conflated three different states in one `null`: "still
   asking the SDK", "this visitor has no cart" and "the request failed". Its
   `loading` was `cartId === null || !data`, so a cart id that never arrived,
   or a detail request that errored, both read as *loading for ever* — which
   is what put the engine cart skeleton on `/ar/cart` at 1440 and would put it
   in front of a shopper whose cart request fails.
3. The route's head passed the engine's platform key straight through, so the
   tab read `common.titles.cart`.

**Fix.**

- `app/routes/cart.tsx`: `const items = cart?.items ?? []`, the empty state on
  `!cart || items.length === 0`, `errorComponent: ErrorState` on the route
  (DIRECTION 5.6, so a failure is the OptimalX error page and never
  `common.errors.500` + `common.elements.back_home`), and
  `commerceHeadExtend({ noindex: true, titleKey: 'ox.titles.cart' })`.
- `app/components/commerce/useCartData.ts`: `cartId` is now
  `number | null | undefined` — undefined is "still asking", null is "no cart"
  — every SDK hop is optional (`window.salla?.cart?.api?.getCurrentCartId?.()`,
  and a missing or non-thenable return resolves to "no cart" instead of
  throwing `Cannot read properties of undefined (reading 'then')`), and
  loading is react-query's own `isPending`, so an **errored** request resolves
  to the empty state rather than to a permanent skeleton.

**Verified live.** `/ar/cart` at 390 and at 1440: `document.title` `السلة`,
`h1` `سلتك فارغة`, the three routes out, zero lookup keys in the page text, no
`ox-error-state`, `scrollWidth` 390 / 1425. Console at both sizes:

```
[log] [offline-api] browser: api.salla.dev + cdn.salla.network -> http://127.0.0.1:5178
[debug] [vite] connecting... / connected.
[info] Download the React DevTools ...
[warning] [Twilight] Could not hydrate twilight context: no root match in router state
[error] The result of getServerSnapshot should be cached to avoid an infinite loop
```

The last two are pre-existing and print on every route of this build,
including routes this batch never touched (`/ar/offers`, `/ar/services`). The
`Warning: Error in route match` line is gone.

One cold run (the first, uncached SSR of the session, 11.7 s) additionally
logged React's generic hydration-mismatch error on this route; it did not
reproduce on any warm run. Recorded rather than chased: it is not a state this
batch introduced a branch for (server and client both render the skeleton on
the first pass).

---

## 2. P0-2 — the booking product had no way to book

**Root cause.** `ProductPage` mounted the engine `AddToCartForm` for
`service` and `booking` products. That form renders shipping fields — the
English `Weight 0.1` and `Quantity` rows and a `0` total — and its quantity
input and add button stayed as `s-skeleton` pulses, while the only words that
looked like a control were a `<p class="ox-service__slot-note">`.

**Fix.**

- `app/components/product/ProductPage.tsx`: the form is not mounted at all for
  the service composition.
- `app/components/product/variants/ServicePdp.tsx`: Salla's own
  `SallaAddProductButtonCore` inside `.ox-service__buy`, wearing the page's
  primary face. The cart path is unchanged and still Salla's.
- `app/styles/06-ox/_b3-product.scss`: `.ox-service__buy` / `.ox-service__add`
  at 48 tall with `ox-primary-face` and `ox-angled(48px)`, the host carrying
  the same face for the pre-upgrade state.
- The label is **the catalogue's own verb**, `channel.doorCtaKey ?? channel.ctaKey`
  (`احجز زيارتك`, `احجز موعدك`, `أرسل سؤالك مجانا`), falling back to the new
  `ox.pdp.book_now` for a `booking`-typed product the catalogue does not know
  and to `ox.booking.order_service` otherwise. The slot note renders only for a
  real `booking` type, so it can never repeat the button's own words and the
  C14/Q12 claims gate on "you pick your time at checkout" is untouched.

**Verified live** on `/ar/x/p1051830221`: the control is a
`salla-add-product-button` 358 x 48 at 390 and 578 x 48 at 1440, label
`احجز زيارتك`, background `rgb(245, 73, 21)`, label `rgb(255,255,255)` at
17.1 px, clip `polygon(32.4px 0, 100% 0, calc(100% - 32.4px) 100%, 0 100%)`;
`s-skeleton` count **0**; no `Weight` and no `Quantity` anywhere in the page
text.

### The InBody line (coordinator addendum, P0-12's third leg)

The booking page now carries the theme's **one** InBody sentence, read through
`t(SERVICES_HUB.inbodyKey)` from `app/content/services.ts` — never a second
wording — gated on `inbodyIncluded(settings)` from `product/lib/claims.ts`, and
placed under the booking control as a fact line. Measured on the page:
`قياس تكوين الجسم (InBody) مجانا في الفرع.` (whatever S7c's key now says, this
page says the same thing, because it is the same key).

---

## 3. P0-14 — twenty four links per page left the build

**Root cause.** The live category API, the dashboard menu, `product.url`,
`brand.url` and `article.url` all publish **absolute** URLs
(`https://optimalx.com.sa/...`). The engine's `Link` adapter localizes a
destination only when it starts with `/` (`localizeDestination`, engine
`chunk-NCGZMLBS.js`), so an absolute href passes through untouched: a full
page load out of the preview build, and an English visitor thrown back into
Arabic.

**The one rule**, in `app/components/layout/navLinks.ts`:

- `toInternalPath(url)` — origin dropped, query and hash kept (`toPath` drops
  the query, which is right for matching a menu URL against a route set and
  wrong for a destination: the taxonomy's own fallback IS `/search?q=…`);
- `withLocale(path, locale)` — now idempotent for **any** locale segment, not
  only the active one, so `/en/about` never becomes `/ar/en/about`;
- `toHref(url, locale)` — both halves, for a raw `<a href>`;
- `localeSegmentOf(pathname)` — the served page's own locale segment, for a
  destination built at click time.

Applied **at the source** where one edit fixes many surfaces:
`useTaxonomyLinks.resolveNode` (the mega panel, the shop sheet, the drawer, the
footer goals, the goal cards, the type tiles, the sub-need cards, the child
chips and `/categories` all read it), and then at each remaining leaf:
`OxProductCard` (title link), `PosterCard`, `BrandTile`, `BrandsGrid`,
`FeaturedRail`, `ChildChips`, `GuideCard`, `PdpTitleBlock`, `Bundle`,
`BundleMembers`, `FrequentlyBought`.

**Test.** `tests/layout/linkResolution.test.ts` runs every resolver over
`/cart`, `/ar/cart`, `https://optimalx.com.sa/cart`,
`https://optimalx.com.sa/ar/cart` and `https://optimalx.com.sa/ar/about` and
asserts `/ar/cart` and `/ar/about`, idempotency on a second pass, query
survival, and that no resolved href carries an origin.
`tests/product/OxProductCard.test.tsx` asserts no card anchor carries
`optimalx.com.sa`.

**Verified live**, after scrolling the whole page so every lazy block mounts:
`/ar` at 390 — 62 anchors, **0** absolute, **0** internal hrefs without a
locale segment (was 24 of 58); `/ar/brands` — 62 anchors, 0 absolute;
`/ar/blog` — 31 anchors, 0 absolute.

---

## 4. P0-10 — "buy now" did not buy

**Root cause.** `can_quick_buy` is false on all 47 products, so the card's
accent CTA fell back to an `<a>` to the product page — an orange button
reading "buy now" that navigated.

**Fix.** The owner's decision (label stays `اشتري الآن`, control stays the
angled primary) is kept and the control now does what it says. New
`app/components/product/lib/buyNow.ts`:

- `proxyAddToCart({ button, onSuccess, onSettled, timeoutMs })` clicks the
  card's own `salla-add-product-button` and calls `onSuccess` only when that
  component reports its own `success`. On `failed`, or on a component that
  reports neither inside 60 s, the shopper is not moved and Salla's own error
  surface is what they see. Nothing here calls `salla.cart` or a checkout
  endpoint; the add, the validation and the toast stay Salla's.
- `currentCartPath()` builds `/ar/cart` from the served page's own locale
  segment, so a store that serves no prefix is not sent through a redirect.

`OxProductCard.BuyNow` uses it; `BuyZone/BuyActions` (the PDP's buy-now, which
already proxied the form's button) now shares the same implementation and
stopped hard-coding `/cart`. A product with `has_options` keeps a link to the
PDP — the one case where a link is the honest control, because the card cannot
make the variant choice for the shopper.

**Verified.** `tests/product/buyNow.test.ts` drives the three paths (success →
navigate, failed → never navigate and no stranded listener, timeout → settle
silently) and the locale arithmetic. Live on `/ar` at 390 the card buy control
is a `<button>` on ordinary products and an `<a>` only on the one product with
options.

---

## 5. P0-4 — `/ar/services` rendered zoomed out

**Reproduced, then bisected in the running page** (CSS injected at document
start, one declaration per run, `window.innerWidth` and
`document.documentElement.scrollWidth` read after settling):

| injected | 390 viewport | 502 viewport |
| --- | --- | --- |
| nothing (baseline) | **720 / 720** | **720 / 720** |
| `.ox-tabbar { display: none }` | 720 / 720 | — |
| `.ox-services__motif { display: none }` | 720 / 720 | — |
| `* { max-inline-size: 320px }` | 720 / 720 | — |
| `.ox-compare__scroller { min-inline-size: 0 }` | 720 / 720 | — |
| `.ox-compare__scroller { contain: inline-size }` | 720 / 720 | — |
| `.ox-compare { display: none }` | **390 / 390** | — |
| `.ox-compare__table { min-inline-size: 0 }` | **390 / 390** | — |
| `.ox-compare__scroller { position: relative }` | **390 / 390** | — |

So the audit's diagnosis holds: the comparison table's 640 px minimum escapes
its own scroller, because a **static** scroller with a sticky column hands
that column's containing block to the initial containing block. The document's
minimum width then lands at 720 whatever the viewport is (720 at 390 and at
502, which is why the number never moved), and Chrome widens the layout
viewport to it — the page at about 54 %.

**Fix.** `position: relative` on `.ox-compare__scroller`
(`app/styles/06-ox/_b5-pages.scss`), with the derivation in the comment.

**Before / after, measured:** 390 viewport `scrollWidth` 720 → **390**,
`innerWidth` 720 → **390**, unclipped overflowing elements 5 → **0**;
502 viewport 720 → **502**. The masthead band S7b just landed is not involved:
the offender is below it, and with this one declaration the whole document
fits at both tiers.

**Test.** `tests/common/scrollers.test.ts` reads every `app/styles/**/*.scss`
rule and fails any block that declares `overflow-x: auto|scroll` without a
`position`, plus a named assertion for `.ox-compare__scroller`. Eight
pre-existing scrollers whose subtrees hold no positioned descendant are
listed in the test with that reason, so a NEW scroller has to be positioned or
be argued for there.

---

## 6. P0-5 — lookup keys visible to shoppers

**Root cause.** Two different mechanisms, and only one of them is ours.

- A route head passes the engine's **platform** bundle key through as the
  document title. `commerceHeadExtend` now repairs it: a title that still
  looks like a key is resolved against the theme's own dictionary
  (`headString`), and then against the `titleKey` the route names.
  `/ar/cart` → `ox.titles.cart`, `/ar/blog` → `ox.titles.blog`.
- `OxBreadcrumb`'s fallback trail pushed `page.title` **unresolved**, which is
  how `common.titles.brands` reached the `/brands` crumb and the BreadcrumbList
  microdata. Every crumb now goes through `resolvedLabel`, which resolves a
  key through `t` and then through the theme's own `ox.titles.*` when `t` hands
  the key back (the platform bundle is served from Salla's CDN and is simply
  absent in the offline preview).

**Verified live.** `/ar/cart` title `السلة`; `/ar/blog` title `الأدلة`;
`/ar/brands` crumb `الرئيسية › العلامات التجارية` and **zero** `(common|blocks|pages).*`
strings in the page text.

**Recorded, not fixed:** the engine's own blog page prints `blocks.footer.blog`
as its `h1` and `common.titles.home` in its own breadcrumb by calling `t()`
itself against the platform bundle — it does not read `page.title`, and it does
not read this theme's dictionary (measured: `common.titles.home` renders as a
key there while the same key resolves everywhere the theme renders it). Those
resolve from Salla's CDN in production and cannot resolve in the offline
preview at all. Fixing them means replacing the engine blog page, which is not
this batch.

---

## 7. P0-6 — the product breadcrumb named a page the visitor never chose

**Root cause.** `OxBreadcrumb` built its fallback second crumb from
`page.parent`, which the engine fills with **the last page the visitor
visited** — measured as `الطاقة` at 1440 and the branch page's own title at
390, for the same shaker, both linking to the shaker itself.

**Fix.** `ProductPage` passes an explicit `trail`: home, the product's own
category (`toInternalPath(product.category.url)`) or `ox.nav.all_types` →
`/categories` when it has none, then the product. `OxBreadcrumb` gained a
`trail` prop and **drops any crumb whose URL resolves to the current page**, so
a self link cannot ship again from any route.

**Verified live** on `/ar/x/p1673105563` at 1440:
`الرئيسية → /ar`, `كل الأنواع → /ar/categories`, then the product name as
text. No self link, and the trail no longer changes with where the visitor
came from.

---

## 8. P0-9 — the spec table printed twice, once as a run-on

**Root cause, and it is a data fact.** 46 of the 47 catalogue descriptions
carry the details table as a real `<table>`, which `splitDescription` already
reads and drops. On the shaker, **Salla stripped the markup when the product
was created and kept the cells**: the store itself serves
`<p>تفاصيل المنتجالقيمةالسعة820 مل (28 أونصة)المادة…</p>`. It was never a
second render of our table; it was the merchant payload.

**Fix.** `product/lib/nutritionTable.ts` drops a paragraph whose text begins
with the details table's own two heading cells welded together — two headings
with nothing between them is not a sentence anyone typed, and it is what a
stripped `<th><th>` pair always leaves behind. Everything the paragraph holds
is already in the details panel.

**Verified live:** the `الفوائد` region on `/ar/x/p1673105563` is gone
entirely (nothing else was left in that product's prose), and the details
panel is unchanged. `tests/product/nutritionTable.test.ts` covers both the
flattened table and an ordinary paragraph that merely contains the word
`القيمة`.

---

## 9. P0-13 — the supply calculator ran on a bottle

**Root cause.** The gate was `hasSupplyCalculator(product.type)` plus
"`servings` is a number". A reusable shaker (`الشكل: عبوة`, `الحصص: 1`)
satisfied both, so the page said it lasts one day and runs out tomorrow.

**Fix.** `product/lib/supply.ts` gains `CONSUMABLE_FORMS` (the catalogue's own
vocabulary: بودرة، كبسولات، أقراص، سوفت جيل، بار، سائل) and
`isConsumablePack(spec)`, which requires **both** `servings >= 2` and a
consumable form. `ProductPage` gates the calculator and the price block's
servings line on it. `DetailsPanel` drops the servings row when the label says
exactly one serving, which is the same nonsense in table form.

**Verified live** on the shaker: no `.ox-supply` anywhere, details rows are
`النوع / الحجم / رقم المنتج` (the `عدد الحصص: 1` row is gone). Tests in
`tests/product/supply.test.ts`.

Consequence, recorded: the peanut butter and the protein chips (`عبوة`, 33 and
8 servings) also lose the calculator under this rule. That is the audit's rule
as written; if the owner wants it back, `عبوة` joins `CONSUMABLE_FORMS` and
nothing else changes.

---

## 10. P0-11 — two adjacent sections under one heading

`ox.home.posters_title` is now `ابدأ من هنا` / `Start here` with the descriptor
`ox.home.posters_lead` under it, and `ox.home.offers_title` is `العروض` /
`Offers` (the value changed in its owning partial, `b2`, because one key with
one meaning beats a second key with the same name). The offers grid's
`عرض الكل` points at `/offers` instead of `/latest-products`, and the whole
block now renders only while `settings.show_offers_nav !== false`, which is the
gate NAV 1.3 already defines for the header item.

**Verified live** on `/ar` at 390, after scrolling every block into view: the
h2 order is `تسوق حسب هدفك`, `أحدث المنتجات`, `ابدأ من هنا`, `العروض` —
zero duplicate headings on the page; the offers view-all resolves to
`/ar/offers`.

---

## 11. P0-8 — the `/en` hero was not mirrored

**Root cause.** The photo pane, the scrim, the accent strap and both corner
wedges were all placed **logically** (`inset-inline-end`) and then pinned back
to the physical left by `[dir='ltr']` overrides, while the copy column stayed
logical. In English that put both the photograph and the copy on the same
side: headline and body copy printed over the athlete, and a black third left
empty.

**Fix.** `app/styles/06-ox/_b2-home.scss`: the `[dir='ltr']` blocks now restate
**only the polygon** (which is physical, because `clip-path` takes no logical
values). The five side overrides are gone.

**Measured, 1440, band 1425 wide:**

| | `/ar` (before and after) | `/en` before | `/en` after |
| --- | --- | --- | --- |
| `.ox-hero__photo` | x 0 w 928 | x 0 w 929 | **x 497 w 928** |
| `.ox-hero__text` | x 846 w 514 | x 66 w 596 (inside the photo) | **x 65 w 601** |
| `.ox-hero__edge` (skewed box) | x 521 w 488 | — | **x 416 w 488** |
| `.ox-hero__wedge` pair | x -50, x 4 | x -50, x 4 | **x 1367, x 1326** |

Mirroring `/ar` about the band centre gives exactly the `/en` numbers: the
English hero is now the Arabic one reflected, not a second composition.

**Not changed, deliberately:** the strap's 20 px weight and its `inset-block:
-12%` are the owner's 2026-09-23 review item 2, recorded in the file. The audit
asks for a 12 px strap at `-2.14%` (X-IDENTITY 2.5); that is an owner decision
to re-open, not a builder's.

---

## 12. P0-17 — `/ar/about` returning the 404 page

**Not reproducible as a route defect, and the hypothesis is disproved**
(section 0: the match-id warning is not a double prefix).

- Client navigation, the exact path the audit walked: loaded `/ar/branch` at
  1440, clicked the footer's `من نحن` (`a[href="/ar/about"]`), and the page
  that mounted was the story — `location.href` `/ar/about`, title
  `من نحن: متجر مكملات من المدينة المنورة | اوبتيمال اكس`, `h1` `من نحن`, no
  404 markup.
- Cold full loads: `/ar/about` answered 200 on every attempt.
- What *did* reproduce, once, is a **dev-server** failure: one run of the
  booking PDP returned `000` to curl and a `404` resource error in the browser,
  then 200 on the next two attempts, while the offline API proxy
  (`127.0.0.1:5178`) was under load from this session's own probing. That is
  the shape of the audit's "sometimes lands on page not found": an intermittent
  preview-infrastructure failure, not the `{-$locale}` route tree.

Nothing was changed for this item beyond the cart fix (which removes the one
error boundary this route family actually hit) and the link rule.

---

## 13. P0-7 — the branch promised hours it did not have

Two code changes and two settings.

- `BranchPage` splits the intro's closing promise: with `branch_hours` parsed
  to rows it says `ox.branch.intro_with_hours`, without them
  `ox.branch.intro_no_hours` ("the address is here; message us on WhatsApp for
  times"). The promise is now the same gate as the table. The sentence was
  removed from `ox.content.branch.intro` itself (its owning partial, `p1a`) so
  the paragraph is not stating it twice.
- The `احجز وقتا لزيارتك` card carries a real 44 secondary to the branch-visit
  product, resolved through `channelById('visit').to` (the catalogue's SKU
  map), never a typed id.
- `OxBranch` gained `showPageLink`; the home block passes it, so the bare
  card now has `صفحة الفرع → /branch` beside the WhatsApp button. The branch
  page itself does not pass it, because it is that page.
- `twilight.json`: `branch_address` and `branch_map_url` filled. **Only those
  two**: the address is already asserted by the theme's own copy, and the map
  URL is derived from `BRANCH_GEO` (24.46276125, 39.653138015), which the
  theme already publishes in its LocalBusiness node. `branch_hours`,
  `branch_landmark`, `pickup_ready_hours`, `pickup_hold_days`,
  `reply_sla_hours` and `delivery_promise_line` are left null: the audit asks
  for "the owner's real weekly table" and I do not have it, and inventing
  opening hours or a pickup-ready time is exactly the claim FINAL-claims-source
  section 2 forbids. **Owner input needed.**

**Verified live** on `/ar/branch` at 1440: the lead ends
`… المتجر جديد والفرع صغير. والعنوان هنا، وللمواعيد راسلنا على واتساب.`, the
booking card's control resolves to `/ar/p1051830221`, the address renders. On
`/ar` at 390 the home block's actions are WhatsApp and `صفحة الفرع → /ar/branch`.

Note: the map still does not render in the preview, because theme settings
there come from the offline store fixture and not from `twilight.json`
defaults. The default ships with the theme and takes effect on install.

---

## 14. P0-16 — the mobile hero was a poster with its own text cropped

**Root cause, and it is not a crop.** `hero-creatine-mobile.webp` is
**byte-identical** to the desktop file (both md5
`16481fa4f4a1510b86668d7035c31df6`, both 1376 x 768). There never was a phone
crop: the phone was being handed the pre-composed marketing banner, whose
Arabic headline and four English/Arabic benefit rows occupy its right third.
The desktop split hides that third outside the photo pane; a 390 x 300 band
cannot.

**Fix.** `DEFAULT_HERO_MOBILE` is now `/assets/images/hero-home-mobile.jpg` —
the file DIRECTION 8.1 names for this slot, 780 x 1040 at 3:4, the store's own
shakers, no captions and no signage in frame — and the phone band anchors it
with `object-position: center top`, so `cover` keeps the subject rather than
the floor.

**Verified live** on `/ar` at 390: `src` `/assets/images/hero-home-mobile.jpg`,
`naturalWidth x naturalHeight` 780 x 1040, box 390 x 300, `object-fit: cover`,
`object-position: 50% 0%`.

---

## 15. P0-18 — the contact page promised email and had none

Measured first: `/ar/contact` renders exactly two channel rows, WhatsApp and
phone, and there is no `@` anywhere in `main`, because the email row is
already gated on `store.contacts.email`.

**Fix.** The promise was in the head, not the page:
`ox.pages.contact.meta_title` is now
`تواصل معنا: واتساب وهاتف وفرع | اوبتيمال اكس` /
`Contact OptimalX: WhatsApp, Phone and Branch | OptimalX`, and the meta
description drops the same clause.

**Deliberately not changed:** `ox.content.services.written_output`
("رد مكتوب على بريدك الإلكتروني"). That line names **the shopper's own** email,
which the store has from their order, not a store inbox we publish. Removing it
would weaken a statement that is true; the audit's own "or" branch is
satisfied by the head fix. If the coordinator disagrees, the replacement is one
value in `p1a`.

---

## Deviations

1. **The brief's root-cause premise (A) was wrong** and is documented in
   section 0. The one resolution rule was built anyway, because P0-14 is real
   and needs exactly that rule; it is simply not what broke the cart.
2. **P0-2's label** is the catalogue's own channel CTA rather than a new
   `ox.pdp.order_service` key. One new key ships (`ox.pdp.book_now`) instead of
   two, the button and the note under it can never read the same words, and
   the C14/Q12 slot-promise gate is untouched.
3. **Three cross-batch partial values changed** (a key belongs to one partial,
   so changing a value means editing its owner): `b2` `ox.home.offers_title`
   → `العروض`, `b5` `ox.pages.contact.meta_title` and `meta_description` (the
   email clause), `p1a` `ox.content.branch.intro` (the hours promise moved into
   the gated tail). Everything else ships in `locales/partials/s7d.{ar,en}.json`
   (9 keys) and was merged with `pnpm i18n:merge`.
4. **`twilight.json` carries two of the six settings the audit lists** —
   see section 13. The rest is owner data and a claims risk.
5. **The scroller test carries an eight-entry allowlist** of pre-existing
   static scrollers whose subtrees hold no positioned descendant. Making all
   eight positioned would be eight drive-by edits in files other builders hold
   today; the gate still fails any new one.
6. **Two held files still render a raw URL** and were left for their owner:
   `app/components/brands/BrandExplore.tsx` (`to={item.url}`, brand chips) and
   `app/components/layout/Header/MegaPromo.tsx` (`to={url}` from the
   `mega_promo_url` setting). Both are in the icon-swap batch's hands; each is
   a one-line `toInternalPath()` when that batch lands.
7. **P0-15 skipped** (owner override, recorded on the token line) and **P0-3
   not touched** (S5b's card).

---

## Verification

- `pnpm typecheck` → clean.
- `pnpm vitest run` → **1303 passed, 1 failed** on the run taken when this
  batch's work was complete. The failure is
  `tests/scripts/gen-icon-mask.test.ts > the committed app/styles/tokens.css
  token equals the generator output`: the generated `--ox-cart-glyph` block in
  `tokens.css` no longer matches `app/assets/ox-sprite.svg`. Both files belong
  to the icon batch (committed in `7753223`); this batch touched neither. It
  needs `pnpm gen:icon-mask` from whoever owns the sprite.

  A later run, taken while other builders were editing the tree, reported two
  more failures. Both are theirs and neither reproduces against this batch's
  files: `tests/home/OxPosters.test.tsx` fails because
  `app/content/posters.ts` (in flight, +131/-88 uncommitted) no longer gives
  its entries an `id`, so `POSTER_CARDS.map(c => c.id)` is six `undefined`
  against six real `data-poster` values; `tests/home/OxGoals.test.tsx` passed
  again on re-run, so it raced a mid-run edit. Every test that covers a file
  this batch changed passes.
- `pnpm check:all` → all eight checks, **0 problems**
  (copy 38 files, jsonld 11, rtl 328, motion 328, strings 328, claims 38 with
  the 4 standing allowlisted entries, tokens 123 defined / 322 scanned,
  identity 328).
- Live, through the DevTools protocol, at 390 and 1440 (and 502 for the
  services page): every measurement quoted in sections 1 to 15 above.
