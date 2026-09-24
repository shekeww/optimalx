# S8e, the owner's icon system, on the header and the navbar icons

Builder S8e, 2026-09-24. Owner item: "the newly applied icons are also to be
applied on the header icons and the navbar icons." Scope: the header
(announcement, utility strip, main bar, nav, mega panel, mega promo), the
mobile header, the mobile drawer, the shop sheet, the bottom tab bar and the
footer.

---

## 1. Finding, in one paragraph

S6b (`docs/build/progress/S6b.md`) already swapped every `sicon-*` glyph in
these surfaces for `<Icon name="…" />` from the theme's own sprite, and S8b
(`docs/build/progress/S8b.md`) repointed that sprite's symbols at the owner's
47 drawings without touching any component. Re-inventorying all fourteen
files named in the brief plus `BottomTabBar.tsx` and the four Footer files
found **thirty-three already-correct `<Icon>` call sites and exactly one
gap**: the desktop account control (`SallaUserMenu` in `MainBar.tsx`) never
had an icon passed into its slot at all, unlike the cart button beside it
three lines down, which already slots `<Icon name="cart" />`. This batch
closes that one gap and documents two owner-instructed items that this
codebase's own evidence says cannot be done as written (§4).

---

## 2. Inventory, before and after

| Surface | Control | Icon(s) | Rendered as (before) | After |
|---|---|---|---|---|
| Header / AnnouncementBar | (text only) |, | no icon | unchanged |
| Header / UtilityBar | branch link | `store` | `<Icon>` size 20 | unchanged |
| Header / UtilityBar → ContactAffordance | WhatsApp | `whatsapp` | `<Icon>` size 16 | unchanged |
| Header / UtilityBar → UtilityTrust (`bar` + `scroller`) | authentic / payment / shipping | `shield-check` / `secure-payment` / `truck` | `<Icon>` size 16 ×3 | unchanged |
| Header / UtilityBar → CountryControl | chevron | `chevron-down` | `<Icon>` size 10 | unchanged |
| Header / UtilityBar → LocalizationButton (+ drawer's own copy) | globe | `globe` | `<Icon>` size 20 | unchanged |
| Header / MainBar → SearchField | magnifier/submit |, | `salla-search` internal glyph, no slot | **unchanged, no slot exists (§4.1)** |
| Header / MainBar | wishlist link | `heart` | `<Icon>` size 20 → `#ox-heart` | unchanged |
| Header / MainBar | **account** (`salla-user-menu`) | `user` | **no icon slotted** | **fixed: `<Icon name="user" size={20}>` in `slot="icon"` (§3)** |
| Header / MainBar | cart (`salla-cart-summary`) | `cart` | `<Icon>` size 22 in `slot="icon"` → `#ox-cart` | unchanged |
| Header / NavBar | مزيد chevron, تسوق trigger chevron | `chevron-down` | `<Icon>` size 14 ×2 | unchanged |
| Header / NavBar → MegaPanel | goal tiles | taxonomy icon | `<Icon>` size 24 | unchanged (verified) |
| Header / NavBar → MegaPromo | "see all" chevron | `chevron-end` | `<Icon>` size 16 | unchanged |
| Header / NavBar top items (شop excluded) incl. العروض |, |, | text only, no icon anywhere in the row | **not applicable, brief scopes this to "where an icon is shown" (§4.2)** |
| MobileHeader | menu/close button | `menu` / `close` | `<Icon>` size 20 | unchanged |
| MobileHeader → SearchField (collapsed) | magnifier |, | `salla-search` internal glyph, no slot | **unchanged, same platform limit as desktop (§4.1)** |
| MobileHeader | cart (`salla-cart-summary`) | `cart` | `<Icon>` size 22 in `slot="icon"` → `#ox-cart` | unchanged |
| MobileDrawer | close button | `close` | `<Icon>` size 22 | unchanged |
| MobileDrawer | group disclosure chevrons (types/goals/more) | `chevron-down` | `<Icon>` size 16 | unchanged |
| MobileDrawer | goal rows | taxonomy icon | `<Icon>` size 24 | unchanged (verified) |
| MobileDrawer | account row | `user` | `<Icon>` size 24 | unchanged |
| MobileDrawer | wishlist row | `heart` | `<Icon>` size 24 | unchanged |
| MobileDrawer | العروض / برands / أسأل قبل أن تشتري / الأدلة primary rows |, | text only, no icon | not applicable (§4.2) |
| MobileDrawer | WhatsApp / phone contact rows | `whatsapp` / `phone` | `<Icon>` size 24 ×2 | unchanged |
| ShopSheet | close button | `close` | `<Icon>` size 22 | unchanged |
| ShopSheet | goal tiles | taxonomy icon | `<Icon>` size 24 | unchanged (verified) |
| ShopSheet → ShopTree (`grid` mode) | type tiles |, | text-only tile, no icon | not applicable |
| BottomTabBar | home / shop / search / cart / account | `home` / `grid` / `search` / `cart` / `user` | `<Icon>` size 20 ×5 | unchanged |
| Footer / FooterColumns | accordion chevrons | `chevron-down` | `<Icon>` size 16 | unchanged |
| Footer / FooterBottom | LTR tagline chevron | `chevron-end` | `<Icon>` size 14, un-mirrored by design | unchanged |
| Footer / RegistrationBlock | CR / VAT emblems | `registry` | `<Icon>` size 16 ×2 | unchanged |
| Footer / FooterBrand | (wordmark only) |, | no icon | unchanged |
| Footer / RegistrationBlock | social row |, | `salla-social` (third-party brand marks) | out of scope, not the owner's 47 |

`--ox-cart-glyph` (the CSS-mask cart glyph) is referenced nowhere in any of
these files (`grep -rn "ox-cart-glyph" app/components/layout`, zero hits):
it is the PDP sticky buy-bar's own token exactly as the brief says, untouched.
No `sicon-*` class survives in any file in scope; the only `sicon-` strings
left are three pre-existing prose comments (`MainBar.tsx`, `MobileHeader.tsx`,
`BottomTabBar.tsx`) explaining *why* `sicon-shopping-bag` was rejected -
carried over unedited from S6b, not literal class names.

---

## 3. The one fix: the account control's icon slot

`MainBar.tsx`'s `SallaUserMenu` sat between a wishlist link that already drew
`#ox-heart` and a cart button that already slotted `#ox-cart`, itself passing
nothing, Salla's own signed-out glyph rendered inside
`.s-user-menu-login-btn`, which `_b1-layout.scss` already sizes to 22px but
never replaces. Fixed the same way the cart button beside it already works,
per the owner's `optimal-x-icons/README.md` §"Salla (Twilight)" item 5
("Salla web components (`salla-*`) accept slotted icons, pass the include
inside the slot"):

```tsx
<SallaUserMenu avatarOnly showHeader className="ox-iconbtn">
  <span slot="icon" className="ox-iconbtn__icon">
    <Icon name="user" size={20} />
  </span>
</SallaUserMenu>
```

`.ox-iconbtn__icon` (new, `_b1-layout.scss`, beside `.ox-cartbtn__icon`) is a
plain centring rule, no count-pill positioning context, since the account
control carries none.

**What this fix could not confirm, and why (read before trusting the curl
line in §6).** Unlike `salla-cart-summary`, this codebase carries **no
documented evidence that `salla-user-menu` defines a matching named slot**:

- `docs/build/engine-surface.md` §"salla-user-menu" reverse-engineers the
  component's exact prop list (`avatarOnly, inline, relativeDropdown,
  showHeader, showTrigger`, "No events") in the same level of detail it uses
  for `salla-cart-summary`, where it explicitly names `<i slot="icon">`
  (`chunk-65Z2ZDKZ.js:112`, §"Header cart button" in the same file), the
  user-menu entry names no slot at all, positive or negative.
- The live fixture (`docs/live-theme/fixtures/fixture-home.html:176-179`)
  shows `<salla-user-menu ...></salla-user-menu>` self-closing with no light
  DOM, right beside `<salla-cart-summary>...<i slot="icon" class="... sicon-
  shopping-bag"></i>...</salla-cart-summary>`, which does carry one.
- `_b1-layout.scss`'s pre-existing `.ox-iconbtn .s-user-menu-login-btn svg`
  rule (untouched by this batch) sizes an `<svg>` **inside** Salla's own
  `.s-user-menu-login-btn`, which is the class Salla itself generates for the
  signed-out state, the theme's own prior work here styled the component's
  internal glyph rather than replacing it, which is what a component with no
  icon slot would require.

The change is added anyway because it is what the brief and the owner's
README instruct, and because it is safe either way: unassigned slotted
content is simply not rendered (Shadow DOM's own behaviour for a `slot`
attribute with no matching `<slot name>`), so if the component turns out not
to support it, nothing regresses, the existing sized internal glyph keeps
showing exactly as it does today. If it does support it, the owner's drawing
now replaces that glyph. Flagged rather than asserted as verified; see §5 for
why the SSR curl this task asks for cannot settle it.

---

## 4. Two items the brief asks for that this codebase's own evidence says are not buildable here

### 4.1 The search field's magnifier and submit

`docs/build/engine-surface.md` §"salla-search" reverse-engineers its full
prop surface, `inline, oval, height, maxWords, placeholder, showAction` -
and no slot. The live fixture confirms it: `<salla-search ...></salla-search>`,
self-closing, no children, both in the header row and in the modal instance
at the bottom of the page. `SearchField` (`MainBar.tsx`) and its collapsed
mobile twin already call it exactly that way, with no children, matching
every other place in this codebase and the engine's own usage. There is no
slot to pass `search` into, and per BUILD.md, "Checkout, cart logic and
search stay Salla's", reskinning the component's shadow internals to force
a drawn magnifier over Salla's own is out of scope regardless. Not changed.

### 4.2 العروض's nav item and the offers page heading

The brief's own wording gates this on "where an icon is shown." Neither
`النav item's row (`NavBar.tsx`, text-only `<NavLink>`, no icon on any of the
six top-level items except the two chevron-bearing triggers) nor the
drawer's matching `primary` row (`MobileDrawer.tsx`, also text-only) shows an
icon today, so there is nothing to re-point at `offers`. The offers page
heading itself lives in `app/routes/offers.tsx`, a route file outside this
batch's edit list (header, tab bar, drawer, sheet and footer components only)
- not touched. `Icon.tsx`'s own doc comment (S8b, unedited here) already
names both as a flagged, not-yet-assigned follow-up.

---

## 5. Why the curl verification the brief asks for could not be produced

Two independent facts, both pre-existing and neither caused by this batch:

1. **`salla-user-menu` and `salla-cart-summary` never render server-side, on
   this platform, regardless of what they are passed.**
   `@salla.sa/twilight-components-react/dist/hydration/withDeferredHydration.js`
   wraps both in `HydrationBoundary` (`clientOnlyComponents['SallaUserMenu']`,
   `['SallaCartSummary']`), whose server branch (`useState(forceHydrate)` -
   `forceHydrate` is never passed here, starts `false`) always returns the
   skeleton `fallback`, never `children`, until a client-side
   `IntersectionObserver` fires. `docs/build/progress/S3d.md` §6.3 already
   found and recorded this exact fact before this batch ("`SallaCartSummary`
   and `SallaUserMenu` render **nothing** server-side… by the existing,
   pre-batch design"). A curl of the raw SSR HTML was never going to show
   either component's slot content, the account slot this batch added is no
   more (and no less) provable that way than the cart slot S6b already shipped
   and which nothing since has been able to curl-verify either.
2. **The local dev server at `:3210` stopped answering any route during this
   batch's own verification window**, `/ar` included, independent of route:
   `curl` timed out (exit 28) on `/ar`, `/ar/kitchen-sink`, `/ar/about` and
   `/ar/offers` alike across five attempts (20s, 60s, 100s, 150s, 240s, 280s,
   300s caps), while `/` (a bare redirect, no SSR render) kept answering in
   under 50ms throughout. `tasklist` showed one `node.exe` (the long-running
   preview process, `.offline-preview.log` in the repo root confirms it is
   `scripts/preview-offline.mjs`) climbing from 597 MB → 639 MB → 1.7 GB
   across those attempts, actively working, not deadlocked, but not
   finishing either. Per this batch's constraints ("never start or stop a
   server"), it was left running and not touched. This could not be
   root-caused from inside this batch (no server log access beyond the stale
   `.offline-preview.log`, no permission to restart it), and it cannot be this
   batch's own code: the only executable-path change here (§3) sits inside a
   `HydrationBoundary` whose server branch, per point 1, never evaluates
   `children` at all, so the added JSX is inert on every server render,
   including the ones that hung.

**Substitute evidence used instead** (§6): the exact assertion the brief asks
the curl to make (`<svg class="ox-icon"><use href="#ox-user">` /
`#ox-cart"` inside the component host, no `sicon-` anywhere) is proven at the
React-tree level in `tests/layout/MainBar.test.tsx`, the same method the
file's own pre-existing cart test already relies on for this identical
platform limitation (its own header comment: "jsdom cannot render their
shadow DOM… this suite actually proves: our own React tree still passes the
right slot content and props"). A source grep (§2) stands in for the
requested page-wide `sicon-` grep.

---

## 6. Verification

```
$ pnpm typecheck
$ tsc --noEmit
(no output, 0 errors)

$ pnpm vitest run tests/layout tests/common
 Test Files  12 passed (12)
      Tests  151 passed (151)
```

`tests/layout/MainBar.test.tsx` (8 tests, 2 new):
```
✓ passes avatarOnly and showHeader to the account control
✓ slots the drawn user icon (not sicon-user) into the account control
✓ renders no sicon- class anywhere in the main bar
✓ slots the drawn cart icon (not sicon-shopping-bag) into the cart control
✓ renders the wishlist link with the drawn heart glyph (not sicon-heart)
```

```
$ pnpm check:rtl && pnpm check:motion && pnpm check:strings && node scripts/check-tokens.mjs && node scripts/check-identity.mjs
check-rtl: 331 file(s), 0 problem(s)
check-motion: 331 file(s), 0 problem(s)
check-strings: 335 file(s), 0 problem(s)
check-tokens: 123 token(s) defined, 325 file(s) scanned, 0 problem(s)
check-identity: 331 file(s), 0 problem(s)
```

```
$ pnpm exec sass --no-source-map app/styles/app.scss /tmp/ox_app_out.css
(exit 0, only pre-existing @import deprecation warnings)
$ grep -n "ox-iconbtn__icon" /tmp/ox_app_out.css
5575:.ox-iconbtn__icon {
```

```
$ grep -rn "ox-cart-glyph" app/components/layout
(no matches, the mask token is PDP-only, confirmed out of these files)

$ grep -rn "sicon-" app/components/layout/Header app/components/layout/Footer app/components/layout/BottomTabBar.tsx
app/components/layout/Header/MainBar.tsx:119        (prose comment only)
app/components/layout/Header/MobileHeader.tsx:64    (prose comment only)
app/components/layout/BottomTabBar.tsx:128           (prose comment only)
```

```
$ curl -s http://localhost:3210/ar
(exit 28, timeout, five retries, 20s to 300s caps; see §5 point 2. Not
reproducible from source: the changed code path is inert during SSR, per §5
point 1.)
```

---

## 7. Files touched

| file | why |
|---|---|
| `app/components/layout/Header/MainBar.tsx` | slots `<Icon name="user" size={20}>` into `SallaUserMenu`'s `icon` slot (§3) |
| `app/styles/06-ox/_b1-layout.scss` | new `.ox-iconbtn__icon` rule, surgical, beside `.ox-cartbtn__icon` |
| `tests/layout/MainBar.test.tsx` | `SallaUserMenu` mock now renders `children`; two new tests assert `#ox-user` in the slot and no `sicon-` residue in the main bar |
| `docs/build/progress/S8e.md` | this file |

Read, not edited (already correct, confirmed by §2's inventory):
`Header.tsx`, `MobileHeader.tsx`, `UtilityBar.tsx`, `UtilityTrust.tsx`,
`LocalizationButton.tsx`, `ContactAffordance.tsx`, `NavBar.tsx`,
`MegaPanel.tsx`, `MegaPromo.tsx`, `ShopTree.tsx`, `ShopSheet.tsx`,
`MobileDrawer.tsx`, `CountryControl.tsx`, `Logo.tsx`, `AnnouncementBar.tsx`,
`BottomTabBar.tsx`, `Footer/Footer.tsx`, `Footer/FooterBottom.tsx`,
`Footer/FooterBrand.tsx`, `Footer/FooterColumns.tsx`,
`Footer/RegistrationBlock.tsx`.

Not touched, per the brief's constraints: `app/assets/ox-sprite.svg`,
`app/components/common/Icon.tsx`, any home or product component,
`app/routes/offers.tsx` (§4.2).
