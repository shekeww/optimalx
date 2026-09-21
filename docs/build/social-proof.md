# Social proof: using the Google reviews

Written for: the store owner, plus whoever next touches the theme's claims gates.

## What changed

`FINAL-claims-source.md` line 49 says "No reviews, no order counts, no
certifications". That was true of **Salla's** review system and wrong about the
**business**. The Google Business Profile for the Al Khalidiyah branch carries a
real rating over a real review count, written by real customers, checkable by
anyone in one tap.

The claims source already anticipated this. `تقييم العملاء (real reviews)` sits
in the **conditional** column, permitted once real reviews exist. They exist.
The condition is met. Only the location of the evidence is unusual.

Salla's own `reviews_list` still returns zero, so every **product**-level gate
stays shut and `RatingRow` still renders nothing. This is a **store** rating and
is only ever presented as one.

## Two things we deliberately do not do

**No structured data.** `aggregateRating` is never emitted for this figure, on
any node. Google's review snippet guidelines say *"Don't aggregate reviews or
ratings from other websites"*, and separately that where *"the entity that's
being reviewed controls the reviews about itself, their pages that use
LocalBusiness or any other type of Organization structured data are ineligible
for star review feature"*. A Google-sourced rating marked up on our own `Store`
node breaks both at once. It looks like free stars in search results and it is a
manual action waiting to happen. `tests/content/social-proof.test.tsx` fails the
build if anything in `app/components/seo/` grows a rating field.

**No Places API.** Its terms forbid pre-fetching, caching or storing Places
content, which rules out rendering during SSR, and they require the Google Maps
logo plus every author's avatar, name and profile link wherever their words
appear. That is a licensed network call on the critical path of a store whose
whole pitch is speed, for a figure you can read off your own profile. Figures
and quotes come from **your own Business Profile** instead: your data about your
business, cited to its public source.

## What is built and live now

Fill these four in the theme settings and the rating appears. Leave any one of
them empty and nothing renders anywhere, which is the correct render for a store
with no reviews and the render the theme shipped with.

| Setting | Value to enter |
|---|---|
| `google_place_url` | the listing URL (must be a Google host, must be `https`) |
| `google_rating` | `5.0` — copy it exactly, never round up |
| `google_review_count` | `68` — whole number |
| `google_verified_at` | `2026-09-20`, and re-check monthly |

The date is shown next to the figure. It costs nothing and it is the difference
between a number a sceptic trusts and one they assume is decoration.

A figure that is stale in your favour is the only real risk here: if reviews
climb to 80 and the site still says 68, a visitor who clicks sees more than
promised, which is fine. Re-check monthly anyway.

### Where it goes, in conversion order

1. **Under the hero, first screen.** The store has no orders, no brand
   recognition and no Salla reviews. A 5.0 over 68 real reviews is the single
   strongest thing the business owns, and it belongs where a first-time visitor
   decides whether to keep scrolling.
2. **Header top bar**, the `inline` chip: persistent, costs one line.
3. **Product page buy column**, the `inline` chip, clearly labelled as the
   store's rating. This one has a trap: a bare five-star row beside an
   unreviewed product tells a shopper the *product* is rated. Every variant of
   the component names its subject for exactly this reason.
4. **Cart**, above the checkout button, the classic reassurance slot.
5. **About and branch pages**, the full `rail` with the date.

## What is blocked on you

**The review text.** The aggregate is one number you can type in. Quotes are
other people's words, and the right way to get them is:

> Google Business Profile → Reviews → export

not a scrape of the public page, which cannot reliably separate a customer's
upload from yours. The same applies to the 31 photos: export the ones you
uploaded, where ownership is unambiguous.

Send the export and the quotes wire straight into `CURATED_REVIEWS`. The
component and the filter are already built and tested.

### The curation filter, and why quotes get excluded

A customer may write whatever they like and it stays on Google untouched. A
quote **you reprint on your own storefront** is your marketing, and the claims
source binds it exactly as it binds copy we write ourselves.

So `isQuotable()` excludes any review mentioning:

- **professional or medical titles** — the listing has reviews praising an
  "instructor" and carrying "doctor" and "Professor" tags. Reprinting those
  asserts a credential the store has not documented, which the claims source
  forbids outright.
- **treatment, cure or prevention** language
- **outcome promises**, especially with a timeframe
- **absolutes and guarantees**, including `مضمون`

A review that trips a pattern is left out **whole**, never edited, and its stars
still count in the aggregate, because that arithmetic is Google's and not ours.

This is not only compliance. What survives the filter is service, authenticity,
selection and advice, which is precisely the pitch of a reseller, curator and
advisor, and it converts better than an outcome claim a sceptical shopper
discounts on sight.

### The component worth building once the export lands

Your listing shows you replying to reviews in both Arabic and English. A review
shown **with the owner's reply underneath** is a far stronger trust signal than
a star row, and almost no Saudi store does it. That is the anti-template,
"a community you belong to" component, and it is already modelled:
`CuratedReview.reply`, held to the same claims filter as the quote.

## Three corrections the listing surfaced

Unrelated to reviews, found while verifying the profile:

- **Hours are wrong in Salla.** Salla says 00:00–23:59 daily. Google says
  9 AM–12 AM Saturday to Thursday and **4 PM–12 AM Friday**. The theme renders
  hours from Salla, so it is publishing the wrong ones. The Friday gap matters:
  someone driving over after Jumu'ah finds you closed.
- **Two phone numbers.** Salla `+966 58 156 5351`, Google `+966 55 352 4524`.
- **A booking system already exists**, linked from the listing
  (`vc.besmartksa.com/Optimal-X`). The advisory work should link to it rather
  than reinvent it.

## Files

- `app/content/social-proof.ts` — settings, the gate, the curation filter
- `app/components/common/StoreRating.tsx` — `rail` and `inline` variants
- `app/styles/06-ox/_primitives.scss` §16
- `locales/{ar,en}.json` — `ox.proof.*`
- `twilight.json` — the four settings
- `tests/content/social-proof.test.tsx` — 32 tests, including the
  structured-data guard
