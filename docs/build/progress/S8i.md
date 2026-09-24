# S8i, the poster rail: no strap, one cut for every card

Conductor, 2026-09-24. Owner ruling on the "اكتشف أكثر" rail: "remove the
orange strap on the cards and all cards to share the same cuts, offers cards
do not have cuts".

## What changed

- `app/components/home/PosterCard.tsx`: the `.ox-pcard__slash` span is gone
  from both `PosterCard` (offer) and `ContentPosterCard`; doc comments
  rewritten to the ruling.
- `app/styles/06-ox/_b2-home.scss` §17.2: the diagonal cuts (top-right and
  bottom-left, lean 40 / run 27.0, one tier) moved from `.ox-pcard--content`
  onto the base `.ox-pcard` rule, so the offer posters are cut the same way;
  the `.ox-pcard__slash` rule and its LTR mirror deleted; the S4a strap
  functions (`ox-strap-inset`, `ox-strap-width`) and their three constants
  deleted since nothing called them any more (the derivation comment above
  `.ox-goal__body` stays as history).
- `tests/home/OxPosters.test.tsx`: the strap test now asserts no strap on
  any card and one shared base class across the whole rail.

## Residual risk (owner-owned)

S7a left the offer posters uncut because a clip cannot see where the owner's
logo (physical top-left) or vertical tagline (physical top-right) will land in
files not yet on disk. With the cuts on every card, the top-right corner loses
a 40px-tall, 27px-wide triangle and the bottom-left the mirror of it. The six
poster files (`public/assets/posters/`, `scripts/posters-import.mjs`) must
keep those two corners clear; noted in docs/build/owner-checklist.md.

## Shopify

Mirror in `sections/ox-posters.liquid` and `assets/ox-theme.css` (the W6
completeness pass carries this delta).
