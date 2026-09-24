# S8g: three owner items on the product card, 2026-09-24

Batch: the servings count removed from the card's facts line and replaced by
a universal free-consultation cue; the facts line grows a subcategory next
to the root type; a real Salla bundle presents as a bundle, not a product.
Read first: `docs/build/progress/S8a.md` §5, `S3e.md`, `S5b.md`,
`app/components/product/{OxProductCard.tsx,lib/cardSpec.ts,lib/productType.ts}`,
`app/content/{taxonomy.ts,taxonomy.json,categories.ts,salla-ids.ts}`,
`BelowFold/{Bundle,BundleMembers}.tsx`, `fixtures/store/products.json`,
`FINAL-claims-source.md` §3, `voice-ksa.md` §6, the product tests. Written
item by item, appended after each one; items 2 and 3 both reshape
`productTypeOf`'s own return type, so their code landed together in one
pass through `productType.ts`/`cardSpec.ts`/`OxProductCard.tsx`, each
item's own section below covers the part of that pass it owns.

---

## 1. The servings count removed; the free-consultation cue added

**What changed.** `cardSpecLine` never reads `spec.servings` again, anywhere
on the card. The facts line's ONE universal, conversion-oriented,
never-invented replacement is a new small text link under the price row,
`ox.card.free_consult` = "استشارة مجانية قبل الشراء" / "Free consultation
before you buy", the `written-question` icon (16) plus the text, to
`/services`, the written-question channel, which really is free in the
catalogue (`OX-044`, price 0; `FINAL-claims-source.md` row 6: "only once the
written-question service is staffed" gates a REPLY-TIME promise, not the
existence or the price of the free channel itself; `services.ts`'s own doc
comment: "it is free, it needs no appointment... commits nobody to a
purchase"). Claims-clean: `check-claims.mjs` 0 problems, no reply-time verb,
no invented number.

**Gate.** `variantOf(product.type)` (the existing PDP-composition function,
`lib/variant.ts`) is `'physical'` or `'bundle'`, never on a service,
booking, digital or gift product, matching the brief's own negative list
exactly (`variantOf` already collapses `service`/`booking` to one variant and
`codes` to `giftCard`).

**Where the pack size/form fact still lives.** `cardSpecLine` keeps ONE
fallback fact, the pack size, else the dosage form, but ONLY when no
source can type the product at all (root AND bundle both silent), so the
row is never empty. Servings is not part of that fallback either: a product
whose only fact is its servings count now renders an EMPTY facts line
rather than the number, on the theory that the PDP's own servings row and
supply calculator (`SpecChips.tsx`, unread by this batch, confirmed it is
the only other reader of `ox.card.servings`, so the key stays in the
locales) are where that number belongs now. `ox.card.servings` is left in
place per the constraint ("retire from the card path if nothing else reads
it, else leave it"): it is still read.

**Files.** `app/components/product/lib/cardSpec.ts` (`cardSpecLine` rewritten,
below), `app/components/product/OxProductCard.tsx` (`showsFreeConsult`, the
`<Link>` under the price row), `locales/partials/s8g.{ar,en}.json` (new,
`ox.card.free_consult`), `locales/{ar,en}.json` (merged),
`tests/product/OxProductCard.test.tsx`.

**Tests** (`tests/product/OxProductCard.test.tsx`): the old "prints ONE fact
after the type" test rewritten to "never prints a servings count again" -
servings alone now renders an empty row; pack size still wins over the form
when both are present; pack alone; form alone. Two new tests: the
consultation link renders on a boxed product, points at `/services`, and
carries the `written-question` icon and label; it is absent on `service`,
`booking`, `digital` and `codes` product types.

```
$ pnpm vitest run tests/product/OxProductCard.test.tsx
 Test Files  1 passed (1)
      Tests  49 passed (49)
```

**Deviations.** None from the item itself. One scope note: the brief's file
list and constraints do not include `_b3-product.scss`/`_b4-listing.scss`
(unlike S3e/S5b, which were explicitly handed "card rules only" scope in
those files), so `.ox-card-product__consult` ships with NO new CSS rule -
it inherits the theme's base link styling and is not yet positioned/sized to
the CARD-2026-09-23 spec's own row rhythm. Flagged for whichever batch owns
that section next; the markup, the gate and the copy are done and tested.

---

## 2. The subcategory next to the root type

**What changed.** `productTypeOf` no longer returns a bare root key. It now
returns `{ kind: 'type', root, child } | { kind: 'bundle' } | null`
(`ProductTypeResult`, new). The CHILD is resolved by the SAME four sources
the root already uses, API category, the listing context, SKU membership,
an unambiguous name keyword, each rewritten as a child-scoped twin
(`childTypeFromCategory`/`childTypeFromListing`/`childTypeFromMembership`/
`childTypeFromName`), generic over every "one level under a root" node in
`taxonomy.json` (`CHILD_TYPE_NODES`), not hardcoded to the five protein
children, so a future child added to the taxonomy data needs no code change
to be resolved by category/listing/membership (only its own name keywords,
if any, need adding to `CHILD_KEYWORDS`).

**The child never pairs with the wrong root.** A resolved child is kept only
when `childBelongsToRoot(child, root)`, its own taxonomy parent maps back to
the SAME root the four root-sources already settled on. Found and fixed
red, in the batch's own rewritten "prefers the API category" test: a real
whey product (`OX-001`) with its category OVERRIDDEN to creatine (a test
fixture, proving the category outranks membership for the ROOT) was, before
this check existed, ALSO printing "كرياتين · واي بروتين", a category that
says creatine paired with a child from the product's OWN, un-overridden SKU
membership under protein. `childBelongsToRoot` rejects that mismatch; the
line is "كرياتين" alone. This is the same "never guess wrong" principle
S8a's root resolution was built on, extended one level down.

**The five card labels**, `ox.card.type.<child_key>`, MSA, ≤16 Arabic
characters (tested): whey_protein "واي بروتين"/"Whey protein", whey_isolate
"واي ايزوليت"/"Whey isolate", casein "كازين"/"Casein", plant_protein "بروتين
نباتي"/"Plant protein", mass_gainer "ماس جينر"/"Mass gainer".

**The child keyword table** (`CHILD_KEYWORDS`), the brief's own list
verbatim: واي/whey → whey_protein, ايزوليت/isolate → whey_isolate,
كازين/casein → casein, نباتي/plant/vegan protein → plant_protein, ماس
جينر/gainer → mass_gainer. Deliberately NOT "بروتين" (which names only the
root, never a specific child) or "جينر" alone (root-level only; the child
keyword is the two-word "ماس جينر" phrase, so "بروتين" on its own never
votes a child). Run over the real 14-product protein shelf: every one
resolves to its true child, either by name alone (10 unambiguous names) or,
where the name is genuinely ambiguous ("واي" AND "ايزوليت" both present, 4
names), by the SKU membership the name step correctly declined to guess.

**The divider.** The brief's own punctuation, a middle dot (U+00B7), not the
old pipe: `DIVIDER` now builds `thin-space · thin-space` instead of
`thin-space | thin-space`, the same thin-space padding S8a chose (so a
digit either side never reads as one number), the brief's own glyph. The
export name (`DIVIDER`) is unchanged so the constant is one thing regardless
of which two segments it joins (root+child, or "باقة"+count, item 3).

**Files.** `app/components/product/lib/productType.ts` (`ProductTypeResult`,
`ChildTypeKey`, `CHILD_TYPE_NODES`, `childTypeOfSlug`,
`childType{From Category,FromListing,FromMembership,FromName}`,
`childBelongsToRoot`, `childTypeOf`, the keyword-matching machinery
generalised to `Phrase<T>`/`buildPhrases`/`uniqueKeywordType` so the root and
child tables share one implementation), `app/components/product/lib/cardSpec.ts`
(`cardSpecLine` rewritten, item 1+2+3 combined, below),
`app/components/product/OxProductCard.tsx` (`typeInfo` replaces the old
`typeKey`/`typeName`), `locales/partials/s8g.{ar,en}.json` (the five child
labels), `locales/{ar,en}.json` (merged), `tests/product/productType.test.ts`
(new describe blocks: the five children exist and are labelled; each child
resolver in isolation; `productTypeOf` returning root+child together, and
the root/child mismatch rejection), `tests/product/OxProductCard.test.tsx`.

**Tests.**
```
$ pnpm vitest run tests/product/productType.test.ts
 Test Files  1 passed (1)
      Tests  36 passed (36)
$ pnpm vitest run tests/product/OxProductCard.test.tsx
 Test Files  1 passed (1)
      Tests  49 passed (49)
```

**Live**, `/ar/protein/c9001` (curl, SSR), all 14 cards' facts lines, no two
alike: "بروتين ⋅ ماس جينر" (×2), "بروتين ⋅ بروتين نباتي" (×2), "بروتين ⋅
كازين" (×2), "بروتين ⋅ واي ايزوليت" (×4), "بروتين ⋅ واي بروتين" (×4), every
one root+child, none a servings count, none wrong.

**Deviations.**
1. `cardSpecLine`'s exported `DIVIDER` constant is reused for both the
   root/child join (this item) and the bundle/count join (item 3) rather
   than declaring two constants: same glyph, same reasoning, one name.
2. The child resolvers are new, small, mostly-parallel functions to the
   existing root ones rather than one generic "resolve at any taxonomy
   depth" function, kept as literal twins (four functions, not a
   depth-parameterised one) because the root functions' own return types
   (`ProductTypeKey`, a closed union) and the child's (`ChildTypeKey`, an
   open string) are genuinely different contracts, and forcing them through
   one generic signature would have cost more clarity than the duplication.

---

## 3. The bundle presents as a bundle

**What changed.** `productTypeOf` checks for a bundle FIRST, before any of
the four type-resolution sources, and returns `{ kind: 'bundle' }` (no root,
no child) rather than ever typing a bundle's members' own type. A product is
a bundle when `product.type === 'group_products'` (Salla's own bundle type,
checked directly, nothing inferred) OR its name's very FIRST word,
normalised, is حزمة/باقة/bundle (`isBundleProduct`, `BUNDLE_NAME_WORDS`) -
the exact three words S8a's own keyword table vetoed into silence
(`docs/build/progress/S8a.md` §5's veto-word row), now a positive kind
instead. Found and fixed red: `normalise()` folds taa marbuta (ة) to ه
before matching, and the literal veto/bundle-word lists were the RAW
Arabic spelling, "حزمة" (ة) never matched "حزمه" (ه after normalisation).
`BUNDLE_NAME_WORDS` is now built through `normalise()` itself, the same way
every keyword phrase already is; the red test (`is a bundle for a name that
starts with حزمة، باقة or bundle`) is what caught it.

**The card.** `OxProductCard.tsx` computes `isBundle = typeInfo?.kind ===
'bundle'` once and threads it three places:

- **The badge**, `ox.card.bundle` = "باقة"/"Bundle", `tone="neutral"` (the
  existing tone, reused, the same one the PDP's own informational
  "official distributors" badge carries; no new `BadgeTone` was needed).
  Highest priority in the badge-candidate list, above saving/new/tag/expiry
  (still capped at two, still fully suppressed by a real out-of-stock flag):
  a bundle badge is a fact about what the product IS, not a promotion, and
  a shopper should never see a starter kit's saving pill without also
  seeing that it is a bundle.
- **The facts line**, via `cardSpecLine`'s bundle branch: "باقة" alone, or
  "باقة ⋅ N منتجات" (`ox.card.bundle_count`, new) ONLY when the bundle's own
  real member list (`bundleMembers(product)`, the exact field
  `BundleMembers.tsx` on the PDP already reads, `consisted_products`, read
  defensively the same way) carries a real, positive count. On the one real
  bundle in this catalogue (`حزمة البداية`, OX-041) that field is empty in
  every fixture, so the live line is "باقة" alone today, a data-availability
  fact, not a defect, the same category S5b §4.1 recorded for
  `product.category`.
- **The action row.** `BuyControls` gets a new `bundle` prop. A real bundle
  with no `can_add === true` (read defensively, the field is not declared
  on the engine's `Product` type and is not present anywhere in this
  catalogue's fixtures, so this is the honest state today, not a stub) skips
  the stepper and the add button entirely and renders ONE control: a `<Link>`
  to the bundle's own page, reusing the exact classes and the `ox.card.buy_now`
  label the `has_options` case already uses for the same "the card cannot
  compose this, the page can" reason. `can_add === true` (hypothetically, the
  day the platform starts sending it) falls straight through to the normal
  stepper/add/buy-now rendering, unit-tested.

**The PDP.** `variant.ts`'s `variantOf('group_products')` already resolves to
`'bundle'` and `ProductPage.tsx` already conditions its "bundle" composition
(the `Bundle`/`BundleMembers` blocks, `isService` gating, the supply
calculator's own `hasSupplyCalculator` exclusion) off `product.type`, none
of that needed a code change once the fixture's own `type` field is correct
(next paragraph). `BundleMembers` renders nothing on THIS product today
because `consisted_products` is empty in both fixture files (the same field
the card's own count reads), which is the same data-availability fact as the
card's facts line above, not a wiring gap, confirmed live, `/ar/p1141798217`
(followed through its locale/slug redirect) returns 200, title "حزمة البداية
- اوبتيمال اكس", and the compiled page carries `ox-bundle`-family markup.

**The fixtures, read back and compare, nothing to write.**
`fixtures/store/products.json` and `fixtures/store/product-details.json`
BOTH already carry `"type": "group_products"` for id `1141798217`
(`git diff HEAD` on both files: empty, before this batch touched anything).
Traced further: `fixtures/store/raw/products.page1.json`, the RAW API
snapshot `scripts/snapshot-store.mjs` pulls straight from the live store,
untouched by any theme code, carries the same `"type":"group_products"` for
this product. That is the live store's own field, not a value this or any
prior session invented in a fixture. So either the owner has already set
"نوع المنتج: مجموعة منتجات" in the dashboard, or the product was created that
way originally; either way, no fixture edit was needed or made. Flagged
rather than silently assumed: **the conductor/owner should confirm the live
dashboard still reads "مجموعة منتجات" for `حزمة البداية` before relying on
this**, a raw snapshot is a point-in-time read, not a live guarantee.

**The exact dashboard step, written per the brief's own instruction (in case
the live value above is ever found to have drifted):** Products (المنتجات) →
حزمة البداية - اوبتيمال اكس → نوع المنتج (Product type) → مجموعة منتجات
(Bundle / "Group products") → Save. `consisted_products` (the bundle's real
member list, OX-001/OX-015/OX-028 per `content/bundles.ts`'s own sample
entry) is set on the SAME screen, under "منتجات الحزمة", filling it is what
turns the card's facts line from "باقة" into "باقة ⋅ 3 منتجات" and populates
the PDP's own `BundleMembers` block; not done here, since this batch may not
request an MCP write and the owner's own §0 reconciliation gate applies.

**Files.** `app/components/product/lib/productType.ts` (`isBundleProduct`,
`BUNDLE_NAME_WORDS`; `VETO_WORDS` narrowed to `['انرجي', 'energy']`, since
حزمة/باقة/bundle are no longer a silencing veto, they are checked, and
answered, before `typeFromName` ever runs), `app/components/product/lib/cardSpec.ts`
(the bundle branch of `cardSpecLine`), `app/components/product/OxProductCard.tsx`
(`bundleMemberCount`, the badge, `BuyControls`'s new `bundle` prop and its
link-only branch), `locales/partials/s8g.{ar,en}.json` (`ox.card.bundle`,
`ox.card.bundle_count`), `locales/{ar,en}.json` (merged),
`tests/product/productType.test.ts` (a new "bundle kind" describe block),
`tests/product/OxProductCard.test.tsx` (a new "the bundle card" describe
block: badge + facts line with no count, facts line with a real count, no
add-to-cart from the card, normal controls once `can_add` is true).
`fixtures/store/products.json`/`product-details.json` read, not written (see
above).

**Tests.**
```
$ pnpm vitest run tests/product/productType.test.ts tests/product/OxProductCard.test.tsx
 Test Files  2 passed (2)
      Tests  85 passed (85)
```

**Live**, a listing that carries the bundle (`/ar/goal-performance/c9022`,
curl, SSR, `/ar` itself renders its "أحدث المنتجات" grid client-side only,
S5b §8.2's own recorded, pre-existing fact, unrelated to this batch, so it
was not used for this check): the bundle's own card, byte for byte -
```html
<div class="ox-badge-stack ox-card-product__badges">
  <span class="ox-badge ox-badge--neutral">باقة</span>
</div>
...
<p class="ox-card-product__chips"><bdi ...>باقة</bdi></p>
...
<a class="ox-card-product__consult" href="/ar/services">...استشارة مجانية قبل الشراء</a>
<div class="ox-card-product__action">
  <a class="ox-btn ox-btn--primary ox-btn--block ox-card-product__buy" href="/ar/.../p1141798217">اشتري الآن</a>
</div>
```
No stepper, no add-slot, no servings, badge, facts line, consult link and
the link-only action row all exactly as designed, on a page this batch never
started or stopped a server to reach.

**Deviations.**
1. `can_add` is read defensively (`(product as unknown as { can_add?:
   unknown }).can_add === true`) because the field is declared on neither
   the engine's `Product` type nor present anywhere in this catalogue's raw
   or processed fixtures, the same category of defensive read
   `bundleMembers()` already uses for `consisted_products`. In practice this
   means every bundle in today's catalogue takes the link-only branch; the
   `can_add === true` branch is code-complete and unit-tested but not
   observably live, a data-availability fact recorded here rather than
   silently assumed exercised.
2. `VETO_WORDS` narrowed (حزمة/باقة/bundle removed) is a direct, intended
   consequence of "the veto becomes a kind", recorded because it changes
   `typeFromName`'s own standalone behaviour (still null on those names, but
   now because no keyword matches rather than because of an explicit veto),
   in case a future reader greps for the old list.

---

## Files (all items)

| file | item |
|---|---|
| `app/components/product/lib/productType.ts` | 2, 3 (and read for 1) |
| `app/components/product/lib/cardSpec.ts` | 1, 2, 3 |
| `app/components/product/OxProductCard.tsx` | 1, 2, 3 |
| `locales/partials/s8g.ar.json` (new) | 1, 2, 3 |
| `locales/partials/s8g.en.json` (new) | 1, 2, 3 |
| `locales/ar.json`, `locales/en.json` (merged, `pnpm i18n:merge` → 8 added per locale) | 1, 2, 3 |
| `tests/product/productType.test.ts` | 2, 3 (rewritten/extended) |
| `tests/product/OxProductCard.test.tsx` | 1, 2, 3 (rewritten/extended) |
| `docs/build/progress/S8g.md` | this file |

Not edited: `app/components/common/Badge.tsx` (the existing `neutral` tone
already fit); `app/styles/06-ox/_b3-product.scss`/`_b4-listing.scss` (out of
this batch's file/constraint list, flagged in item 1); `fixtures/store/
products.json`/`product-details.json` (already correct, read back and
compared, not written); `app/content/{taxonomy.ts,taxonomy.json,categories.ts,
salla-ids.ts}` (read only); `app/components/product/BelowFold/{Bundle,
BundleMembers}.tsx` (read only, already correctly wired off `product.type`).
No git stash/checkout/reset/clean/add/commit/push. No server started or
stopped; the preview answered every request on the first try.

## Cross-batch note

`locales/ar.json`/`en.json` are shared. Running `pnpm i18n:merge` (needed to
fold in `s8g.*`) also merged one pending, uncommitted key from a concurrent
builder's own new partial (`locales/partials/s8d.{ar,en}.json`,
`ox.newsletter.line`) that was already sitting in the working tree before
this batch started (per the session's own initial `git status`). This is the
same category of cross-batch sweep `docs/build/progress/S8a.md`'s own
"Cross-batch notes" §1 recorded for the conductor's S8c commit: the merge
tool is global by construction, not scoped to one partial, and reverting it
would destroy another builder's uncommitted work, which this batch's own
constraints forbid. Recorded here rather than silently absorbed.

## Verification tails

```
$ pnpm typecheck
$ tsc --noEmit
(clean)

$ pnpm vitest run tests/product tests/listing tests/home tests/common
 Test Files  54 passed (54)
      Tests  730 passed (730)

$ pnpm check:rtl
check-rtl: 331 file(s), 0 problem(s)
$ pnpm check:motion
check-motion: 331 file(s), 0 problem(s)
$ pnpm check:strings
check-strings: 339 file(s), 0 problem(s)
$ node scripts/check-copy.mjs locales/ar.json locales/en.json
check-copy: 2 file(s), 0 problem(s)
$ node scripts/check-claims.mjs
check-claims: 48 file(s), 0 problem(s), 4 allowlisted
$ node scripts/check-tokens.mjs
check-tokens: 123 token(s) defined, 325 file(s) scanned, 0 problem(s)
$ node scripts/check-identity.mjs
check-identity: 331 file(s), 0 problem(s)
```

Live preview, `http://localhost:3210` (already running; answered every
request on the first try, no 20-second retry needed): `/ar/protein/c9001`
(14 cards, root ⋅ child on every one, no servings, the consult link on
every one), `/ar/goal-performance/c9022` (the starter bundle's own card:
badge, "باقة" facts line, link-only action row, consult link), `/ar/p1141798217`
→ redirects to the bundle's own slug, 200, bundle PDP markup present.
