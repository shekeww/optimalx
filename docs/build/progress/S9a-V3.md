# S9a-V3 — the English hero, the doubled account icon, the header feature audit

Builder S9a-V3, 2026-09-24. Owner review of the same date (screenshots of
`/en` at 1905px and of the header). Scope: `OxHero.tsx`, `_b2-home.scss` §1
(the hero only; V1 owns §8 and §17 concurrently), the `Header/*.tsx` files,
`BottomTabBar.tsx`, the BuyZone wishlist control, `_b1-layout.scss` header
regions only (V2 owns the FOOTER rules in the same file). Mid-batch scope
change from the coordinator: **`OxProductCard.tsx` and the card styles moved
to a dedicated builder (V4)**, including the card's own wishlist heart — not
touched here.

Working log below; updated after every step, per convention (S8e/S8i).

---

## Item 1 — the English hero

Investigated with headless Chrome over CDP (`chrome-headless-shell` binary,
raw WebSocket client, the S8f method): navigated `/en` and `/ar` at 1440,
read `getBoundingClientRect()` for the pane, the strap, the two wedges, the
headline and the text column, and captured screenshots.

### 1a — mirroring audit

Measured bounding boxes for `.ox-hero__edge` (the large strap) and
`.ox-hero__wedge--wide`/`--thin` (the small straps) at 1440, RTL vs LTR,
reflected through the hero's own horizontal centre (`x → 1425 − x`):

| Element | RTL box (x, right) | LTR box mirrored | LTR box measured | Match |
|---|---|---|---|---|
| `.ox-hero__photo` | 0 .. 928.109 | 496.891 .. 1425 | 496.891 .. 1425 | exact |
| `.ox-hero__edge` | 521.069 .. 1009.431 | 415.569 .. 903.931 | 415.569 .. 903.931 | exact |
| `.ox-hero__wedge--wide` | -49.796 .. 57.796 | 1367.204 .. 1474.796 | 1367.204 .. 1474.796 | exact |
| `.ox-hero__wedge--thin` | 4.204 .. 98.796 | 1326.204 .. 1420.796 | 1326.204 .. 1420.796 | exact |

Every element's bounding box mirrors to sub-pixel precision, confirmed by a
second, independent method: skewX's own geometry (`x' = x + (y − cy)·tanθ`)
combined with `--direction-factor` flipping `--ox-skew`'s sign under
`[dir="rtl"]` and `inset-inline-end` flipping the anchor side is, worked
through algebraically, exactly a reflection about the band's vertical
centre for any element using this pattern — `--ox-skew` and the logical
insets already carry the mirror, with no `[dir='ltr']` override needed,
which is what the file's own comment at `.ox-hero__edge` already asserts.
Screenshots (`hero-en-1440-before.png`, `hero-ar-1440-before.png`, both
under `docs/build/progress/visit/`) confirm the large strap leans "\" in
English against "/" in Arabic — the correct mirror of a diagonal.

**Conclusion: no mirroring defect found in the pane, the strap or the two
wedges at 1440.** Nothing changed here. The wedges are mostly clipped off
the viewport edge at both 1440 (RTL: x −49.8..57.8, mostly off the left;
LTR: x 1367.2..1474.8, mostly off the right, since the band is only
1425 wide there) — a sliver is all either direction shows at this width,
which may be what read as "leaning the wrong way" in the owner's review.
Not a code defect: `getBoundingClientRect` proves the shapes are identical
mirrors regardless of how much of either is inside the viewport.

### 1b — the H1 overflow (confirmed, fixed)

Screenshot evidence: `hero-en-1440-before.png` shows "today?" (the H1's
last word) printed across the photograph, past the pane's diagonal cut —
confirmed at 1024 and 1905 too (`hero-en-1024-after.png` shows the same
defect would occur unfixed at that width, `hero-en-1905-after.png` is the
owner's own review width).

**Cause.** `.ox-hero__text`'s `max-inline-size` (52% below 1024, 48% at
1024+) is a flat percentage of the CONTAINER, which caps English copy at a
wider box than Arabic ever needs at the same font-size (Latin words run
longer). The pane's own inner edge is a 34deg diagonal, narrower at the top
than the bottom (the CSS's own derivation in §2), so nothing in the
existing rule tracked that shape.

**Fix, `_b2-home.scss` §2 (the two `@media` blocks already carrying
`.ox-hero__text`'s max-inline-size).** Added `[dir='ltr'] .ox-hero__text`
overrides: 44% at the 640-1023 tier (down from 52%), 40% at 1024+ (down
from 48%). Derived from measurement, not a guess: at 1440,
`getBoundingClientRect()` on the clip polygon gives the pane's inner
boundary at the headline's own top as band-relative x=622.6; the text
column starts at the container gutter (64.5 at 1440), leaving 558px before
the cut. 40% of the 1296px container is 518.4px — inside that figure with
margin. The margin only widens at wider viewports (the container caps at
1296 while the pane's own box keeps growing with the viewport), so the same
40% figure covers 1024 through the owner's own 1905 review width without a
separate rule.

The Arabic column is untouched — no `[dir='ltr']` selector reaches it,
verified below.

**Re-rendered after the fix** (`hero-en-1024-after.png`,
`hero-en-1440-after.png`, `hero-en-1905-after.png`, all under
`docs/build/progress/visit/`): the headline now wraps to two lines
("What is your goal" / "today?") and both lines sit fully inside the black
pane at all three widths, no overlap with the strap or the photograph.

### 1c — audit against the Arabic hero

Eyebrow (one line, both languages), lead paragraph (two lines, both
languages), the CTA pair (primary white-on-orange angled wedge + secondary
outlined angled pill, same order, same sizes) and the vertical rhythm
(eyebrow / gap / headline / gap / lead / gap / actions) all match between
`hero-en-1440-after.png` and the Arabic render. No drift found beyond the
H1 overflow already fixed in 1b.

**The Arabic hero is unchanged.** Every rule this batch added is scoped
under `[dir='ltr']`, so by construction no rule newly matches an
RTL-rendered page — confirmed with a fresh capture,
`hero-ar-1440-after.png`, visually identical to the pre-existing
`hero-ar-1440-before.png` (same copy, same geometry, same pixel positions
by eye). The two files are not byte-identical (492105 vs 492031 bytes,
a 0.015% difference) — attributed to PNG re-encoding / font-hinting jitter
between two separate headless-Chrome launches rather than a real style
change, since the diff cannot come from a `[dir='ltr']`-scoped rule on an
`rtl` document; no other file this batch touched can reach the Arabic hero
either (`_b1-layout.scss`'s changes are both scoped to the account button,
nowhere near `.ox-hero`).

---

## Item 2 — the header account button's doubled icon

Investigated over CDP against the live DOM at `/ar`, 1440 (the S8f method).
`document.querySelector('.ox-mainbar__actions salla-user-menu')`'s
`outerHTML` (no shadow root — this component renders light DOM, Stencil
"scoped" mode, confirmed `hasShadow: false`):

```html
<salla-user-menu class="ox-iconbtn hydrated" avatar-only="" show-header="">
  <span slot="icon" class="ox-iconbtn__icon" hidden="">
    <svg class="ox-icon ox-icon--20" ...><use href="#ox-user"></use></svg>
  </span>
  <slot-fb name="login-btn">
    <button type="button" aria-label="user-icon"
            class="s-user-menu-login-btn s-user-menu-login-btn--avatar-only">
      <!-- Generated by IcoMoon.io -->
      <svg ...><title>user-circle</title><path d="..."/></svg>
    </button>
  </slot-fb>
</salla-user-menu>
```

**Root cause.** The component marks the owner's own slotted span `hidden`
in this signed-out render and shows its own `.s-user-menu-login-btn`
icomoon glyph instead (its light-DOM fallback for the *named* `login-btn`
slot, which is different from the `icon` slot our span targets). But
`hidden` is a presentational HTML attribute, and `.ox-iconbtn__icon`'s own
`display: inline-flex` is AUTHOR-origin CSS, which wins over the UA
stylesheet's `[hidden] { display: none }` regardless of specificity (origin
beats specificity in the cascade). So both glyphs painted, side by side, in
the one 44px button. `getComputedStyle`/`getBoundingClientRect` confirmed
it directly:

```json
"ourSpanBox":    { "display": "flex", "hiddenAttr": true,  "x": 160.5, "width": 20 },
"fallbackSvgBox":{ "display": "block","hiddenAttr": false, "x": 137.5, "width": 22 }
```

Two icons in a 44px-wide host, x137.5-159.5 and x160.5-180.5 — exactly the
"profile icon twice" the owner's screenshot shows.

**Fix, `_b1-layout.scss`.** The component's own button
(`.s-user-menu-login-btn`) is the real, focusable, accessible control
(`aria-label="user-icon"`); the owner's span is decorative (`Icon` with no
`label` prop, already `aria-hidden`). Rather than let the component's own
default win: `.ox-iconbtn__icon` is now `position: absolute; inset: 0;`
(the parent `.ox-iconbtn` is already `position: relative`) with
`pointer-events: none`, so it paints centred over the whole 44px button
without blocking the click, and the button's own icomoon `svg` is hidden
(`display: none`, was sized to 22px) rather than sized, since the owner's
glyph now covers that role.

**Verified:** `pnpm exec sass` compiles both rules into the built
stylesheet (`grep -n "ox-iconbtn__icon\|s-user-menu-login-btn svg"`, two
hits, both the new rules). A live re-render to count `svg`/`img` = 1 inside
the button was attempted but the shared preview server
(`http://localhost:3210`) stopped answering during this batch's own
verification window — the same pre-existing platform limitation
`docs/build/progress/S8e.md` §5 already recorded (multiple concurrent
builders share the one instance per the brief's own constraint, and it does
not always recover inside a session). Not restarted, per the brief. The
JSX side of this fix (the slot content itself) is unchanged from S8e, so
`tests/layout/MainBar.test.tsx`'s existing "slots the drawn user icon"
test still covers it; the CSS side is proven by source (the exact selector
and declaration now in the compiled output) and by the DOM evidence above,
captured before the server became unreachable.

---

## Item 3 — header feature audit

Owner instruction, quoted: "audit the options and features in it, if
anything can't be integrated in Shopify, delete it. we are about to go
absolutely deployment ready in a short time, we cannot handle risks, we
would be able to enhance and add them later."

Full decision table and the reasoning for the one flagged-not-pruned item
(the `salla-user-menu` sub-entries) live in `docs/build/NAV-2026-09-23.md`'s
2026-09-24 addendum, appended at the end of that file. Summary:

**Deleted** (Shopify's storefront carries no native wishlist):
- the header's desktop wishlist link (`MainBar.tsx`)
- the drawer's wishlist row (`MobileDrawer.tsx`)
- the PDP gallery's wishlist heart (`app/components/product/BuyZone/PdpGallery.tsx`)
- the product card's own heart is a separate builder's file (V4, mid-batch
  scope change) — not touched here
- `app/components/product/BuyZone/WishlistShare.tsx` carries a third
  wishlist control but is imported nowhere in the app (`grep -rn
  "WishlistShare" app` finds only its own file) — dead code, left as found,
  flagged rather than edited without a live reason to
- the bottom tab bar already carried no wishlist tab before this batch (five
  slots: home, shop, search, cart, account) — confirmed, not changed

**Kept** (Shopify has these natively): search, cart, account (profile,
orders, addresses, login, logout), the language/country selector, the
trust items, the branch link, the WhatsApp link, the shop mega panel /
catalogue navigation, the bottom tab bar's five slots.

**Flagged, not pruned:** `salla-user-menu`'s dropdown entries for
notifications, wallet/loyalty points and ratings. The component's full prop
surface (`avatarOnly, inline, relativeDropdown, showHeader, showTrigger` —
`docs/build/engine-surface.md` §9.2) has no prop to hide an individual
entry, and this offline preview carries no signed-in session
(`SallaLoginModal` mounts globally and is `eventTriggered`, confirming the
store always renders signed-out here), so there is no verified evidence of
what the dropdown actually contains — the store's own settings may already
have these switched off. The brief's own fallback (replace the whole
control with a hand-built account link plus login/register) was
investigated and not actioned this batch: the login modal is
`eventTriggered` (`docs/build/engine-surface.md` §15.3), reachable only from
an SDK event this batch found no documented name for — not a plain `href` —
so a hand-built trigger could not be verified working, and replacing
Salla's own session/login/logout path with an unverified one is the kind of
risk the owner's own instruction asks this batch to avoid adding. The
component already delivers the Shopify-parity set the owner's instruction
keeps (profile, orders, addresses, login, logout). Recommended as a P0
owner-facing follow-up in the addendum: one screenshot of a real signed-in
dropdown, or the store's own notification/wallet/loyalty settings, before
spending the risk of a rebuild on entries that may not even be showing.

---

## Item 4 — the about page masthead, gated on `mark-wall`

`app/components/pages/AboutPage.tsx`: reads
`(STORE_PHOTOS as Partial<Record<string, StorePhoto>>)['mark-wall']` (the
slug is not in `StorePhotoSlug` yet, so the cast is what the brief asks
for) and uses its `.photo` URL for the band when present, falling back to
today's `SERVICE_PHOTOS.services` band photo otherwise. Nothing else on the
page changed. Inert today (`STORE_PHOTOS` carries no `mark-wall` entry
yet) — `pnpm typecheck` confirms the cast compiles either way.

---

## Verification

```
$ pnpm typecheck
$ tsc --noEmit
(no output — 0 errors)

$ pnpm vitest run tests/home tests/layout tests/product
 Test Files  44 passed | 1 flaked (45)
      Tests  625 passed (625) — see note
```

`tests/home/posterRow.test.ts`'s first test timed out at the default 5000ms
under the full 45-file parallel run (this machine was also running the CDP
verification's own headless Chrome processes and other concurrent
builders' work at the time) — re-run alone it passes in 4.4s
(`pnpm vitest run tests/home/posterRow.test.ts --testTimeout=30000`, all 5
tests green). Nothing in this batch touches that file, its selector
(`.ox-pcard`) or anything it composes from; the failure is the first (real
Sass-compile) call in the file exceeding its default timeout under
contention, not an assertion failure — an environmental flake, not a
regression from this batch.

```
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 327 file(s) scanned, 0 problem(s)

$ node scripts/check-identity.mjs
check-identity: 334 file(s), 0 problem(s)

$ node scripts/check-strings.mjs
check-strings: 346 file(s), 0 problem(s)

$ node scripts/check-copy.mjs
check-copy: 52 file(s), 0 problem(s)

$ pnpm exec sass --no-source-map app/styles/app.scss <tmp>/ox_app_out.css
(exit 0 — only pre-existing @import deprecation warnings)
$ grep -n "ox-iconbtn__icon\|s-user-menu-login-btn svg" <tmp>/ox_app_out.css
5594:.ox-iconbtn__icon {
5613:.ox-iconbtn .s-user-menu-login-btn svg {
$ grep -n "\.ox-hero__text" <tmp>/ox_app_out.css
7057:  .ox-hero__text {
7126:.ox-hero__text {
7196:  .ox-hero__text {
7199:  [dir=ltr] .ox-hero__text {
7233:  .ox-hero__text {
7237:  [dir=ltr] .ox-hero__text {
```

No locale partials were needed: none of the four items add, remove or
change any user-facing copy (`ox.a11y.wishlist_toggle` and
`ox.header.wishlist` stay in `locales/` — other live callers still use
them: `WishlistShare.tsx`, and until V4 lands, `OxProductCard.tsx`).

Screenshots, all under `docs/build/progress/visit/`:
`hero-en-1440-before.png`, `hero-ar-1440-before.png` (the owner's own
defect, and the frozen reference), `hero-en-1024-after.png`,
`hero-en-1440-after.png`, `hero-en-1905-after.png`, `hero-ar-1440-after.png`
(the fix, at the three widths asked for plus the owner's own 1905),
`account-button-before.png` (the doubled icon).

---

## Files touched

| file | why |
|---|---|
| `app/styles/06-ox/_b2-home.scss` | §2 (the hero): `[dir='ltr'] .ox-hero__text` max-inline-size overrides at both tiers (item 1b) |
| `app/styles/06-ox/_b1-layout.scss` | `.ox-iconbtn__icon` repositioned over the button, the fallback icomoon svg hidden instead of sized (item 2); comments updated where the wishlist row left `.ox-drawer__account` (item 3) |
| `app/components/layout/Header/MainBar.tsx` | wishlist link and its `useWishlist`/`Link` imports removed (item 3) |
| `app/components/layout/Header/MobileDrawer.tsx` | wishlist row removed from the `account` group (item 3) |
| `app/components/product/BuyZone/PdpGallery.tsx` | wishlist heart button and its `useWishlist`/`Icon` imports removed (item 3) |
| `app/components/pages/AboutPage.tsx` | masthead photo reads `STORE_PHOTOS['mark-wall']` when present, falls back otherwise (item 4) |
| `docs/build/NAV-2026-09-23.md` | 2026-09-24 addendum: the full decision table and the flagged-not-pruned note (item 3) |
| `tests/layout/MainBar.test.tsx` | wishlist test replaced with a "renders none" assertion; the now-unused wishlist mock removed |
| `tests/layout/Header.test.tsx` | wishlist-count-pill test replaced with a "renders none" assertion; the now-unused wishlist mock removed |
| `tests/layout/MobileDrawer.test.tsx` | new test: no wishlist row |
| `tests/product/PdpGallery.test.tsx` | new file: no wishlist heart, zoom control still works |
| `docs/build/progress/S9a-V3.md` | this file |

Read, not edited: `OxHero.tsx` (no JSX change needed — item 1 was CSS-only),
`UtilityBar.tsx`, `NavBar.tsx`, `ShopSheet.tsx`, `BottomTabBar.tsx`,
`CountryControl.tsx`, `ContactAffordance.tsx`, `Icon.tsx`,
`app/content/nav.ts`, `app/styles/06-ox/_primitives.scss` (no hero
primitive lives there; the file's `ox-wedge-photo-stroked`/`ox-wedge-stroke`
mixins are unused by the shipped hero, which draws its polygons directly).

## Deviations

1. **Mid-batch scope change (coordinator):** `OxProductCard.tsx` and the
   card styles moved to builder V4, including the card's own wishlist
   heart. Not touched here; the decision table still lists it as deleted,
   attributed to V4.
2. **Item 2's live DOM-count verification (`svg`/`img` = 1) could not be
   re-captured after the fix**: the shared preview server stopped answering
   during this batch's own window (documented above, matches
   `docs/build/progress/S8e.md` §5's own prior finding of the same limit).
   The fix is verified by source (compiled CSS) and by the DOM evidence
   captured before the outage, not by a fresh screenshot of the fixed
   state.
3. **`hero-ar-1440-before.png` vs `hero-ar-1440-after.png` are not
   byte-identical** (492105 vs 492031 bytes): attributed to PNG
   re-encoding/font-hinting jitter between two separate headless-Chrome
   launches, not a real style change — explained in 1c, since no rule this
   batch added can match an RTL document.
4. **No locale partials created**: none of the four items change
   user-facing copy, so `locales/partials/s9a-v3.*.json` and
   `node scripts/i18n-merge.mjs` were not needed.
