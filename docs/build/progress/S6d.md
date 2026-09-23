# S6d — the goal icons redrawn from the mark, and the system pass

Builder S6d, 2026-09-24. Two rounds of goal icons were rejected before this
one. The owner's verdict on the second was not about detail:

> "You are still using generic icon-library metaphors and then adding small
> orange details. That is NOT the Optimal X icon system. … Extract the DESIGN
> PRINCIPLES from the actual logo rather than copying the logo itself."

So this batch did not adjust the existing SVGs. It derived a construction
language off `public/assets/brand/optimalx-mark.svg` first, wrote it down as a
standalone spec, and then drew the six from the mark. The spec is
**`docs/build/ICONS-2026-09-24.md`** and it is the durable artefact — this file
is the working record of how it was arrived at and what shipped.

---

## 1. The construction language, in five rules with numbers

Every number below is measured off the mark's own path
(`docs/build/X-IDENTITY-2026-09-22.md` §1 has the derivation).

### R1 — Two inks, and a plane is 4.5 units

The mark is made of **filled planes**, not outlines. So the system has two inks:

- **line** — `stroke-width="2"`, square caps, miter joins, miterlimit 4;
- **plane** — a closed path with `fill="currentColor" stroke="none"`.

A plane's narrow dimension is **4.5 units = 22.5 % of the 20-unit optical box**,
which is the mark's bar thickness (mean perpendicular 113.50 of 493.28 wide =
23.0 %). It may run **3.0–3.5** where two planes sit side by side, **2.4–2.8**
for a needle or an arrowhead, and never below 2.4.

`stroke="none"` is load-bearing: the symbol carries `stroke-width="2"`, so a
plane without it is painted one unit fat on every edge and 4.5 becomes 6.5.

**Every symbol that carries mass carries at least one plane.** A family of pure
2-unit outlines is exactly what was rejected.

### R2 — Two diagonals: 34 and 56, and nothing else

`tan 34° = 0.675`. Read two ways:

- **34° from vertical** — `dx = 0.675 · dy` (the mark's arms);
- **56° from vertical** — `dy = 0.675 · dx` (its complement).

With horizontal and vertical that is the whole lattice: **0 / 34 / 56 / 90**,
tolerance ±0.06°, i.e. `dx/dy` inside `[0.6734, 0.6762]` — three decimals of
coordinate. **45° is banned by name** (X-IDENTITY §2.1) except in `ox-search`,
`ox-arrow` and `ox-external`, where it is the universal convention.

Curves are used **only where the object has one** — a heart lobe, a gauge dial,
a body contour, a skull, a hair sweep — and are always closed by a straight
lattice edge and a chamfer. A curve never softens a corner.

Authoring trick: pick `dy` on a 0.4 grid and `dx` falls on a 0.27 grid —
`2 → 1.35`, `4 → 2.70`, `6 → 4.05`, `8 → 5.40`, `10 → 6.75`, `12 → 8.10`.

### R3 — The chamfer is 2.6 by 1.75

The mark's NE arm cuts **14.86 of a 138.86-wide arm — 10.7 % of the plane's
width**. On the 20 box that is a cut of **2.6 along the long side by 1.75
across** (2.6 × 0.675 = 1.755).

- minimum **1.75 units** — a smaller cut is invisible at 24 px and is noise;
- **one per symbol, two at most**;
- it sits on the part that reads as the **foot or tip**.

### R4 — A direction change is a horizontal ledge, and the ledge ratio is 3.49

The mark's channel jogs **83.78 px along a ledge 24 px tall — 3.49** (X-IDENTITY
§1.5). So when a symbol steps sideways, the **run along the ledge is 3.49 × the
vertical separation of the two ledges**. `goal-energy` is the reference: ledges
at y 10.27 and 13.73 (separation 3.46), runs of 12.08 → 12.08 / 3.46 = **3.49**.

### R5 — One accent, part of the object, 10–15 % of the ink

Painted only through `ox-icon__accent` (a plane) or
`ox-icon__accent ox-icon__accent--stroke` (a line), so the theme token drives it
and no literal colour ever enters the sprite.

One element. **10–15 % of ink** (ink = plane area + line length × 2). It is the
part that **moves, measures, pulses, targets, is active, or is the brand cut** —
never a floating diamond, a corner triangle or a decorative slash. Cover the
accent: if the metaphor dies, the symbol is wrong.

---

## 2. The six: metaphor, silhouette, accent, why a shopper reads it

### `goal-energy` — الطاقة

**Metaphor** a lightning bolt, but drawn as the mark's own topology rather than
as a zig-zag.
**Silhouette** one solid plane: a 34° arm falls from a tip at the top, breaks on
a horizontal ledge, and a second 34° arm falls to the bottom tip; the two inner
edges are vertical, so the bolt tapers at both ends. Both ledges run 12.08 over
a separation of 3.46 — the mark's 3.49 jog.
**Accent** the strike tip: the bottom wedge below a 56° cut. 10.6 %.
**Why it reads** it is the universal bolt silhouette, filled, touching all four
sides of the box; at 16 px it is still a bolt because it is mass, not line.

### `goal-performance` — الأداء

**Metaphor** a speed gauge with a rising needle. The sock/tube/arm is gone.
**Silhouette** a 292° dial **plane** (outer 9.9, inner 6.0, open at the bottom,
both radial caps on the 34° lattice), a wedge needle rising at 34° off a
chamfered hub plate.
**Accent** the redline — the last 56° of the scale, at the end of the sweep
where a speedometer's red zone sits. 15.7 %.
**Why it reads** a dial plus a needle is the single most legible "performance"
mark there is, and as a plane it survives 16 px where an arc + hairline would
not.

### `goal-general-health` — الصحة العامة

**Metaphor** heart and pulse, kept, but reconstructed.
**Silhouette** a **solid heart plane**: two lobes as arcs, both sides straight
at 34°, and the foot cut by a **56° chamfer** — the one deliberate brand cut.
Solid is the point: an outlined heart with an ECG through it is the pharmacy
icon the owner rejected.
**Accent** the pulse: three segments, all at 34°, small dip, tall spike, return.
14.2 %.
**Why it reads** a filled heart is read before it is looked at; the orange pulse
says health rather than love.

### `goal-recovery` — التعافي

**Metaphor** the recovery cycle plus a restoration cue.
**Silhouette** two **wide band planes** (outer 9.2, inner 6.0) sweeping 124°
each with 56° gaps between them, each ending in a tangential arrowhead that
flares past the band — a vertical back edge and two 56° edges to the apex, so
there is no 45° anywhere in it.
**Accent** a four-segment pulse at the centre, at the mark's angles. 15.7 %.
**Why it reads** two thick arrows chasing each other is "cycle"; the pulse in
the middle is "restore". The previous version failed because a 2-unit ring with
a dot reads as neither.

### `goal-hair-skin` — الشعر والبشرة

**Metaphor** hair and skin, stated literally.
**Silhouette** a **face profile plane** at the reading end — forehead, brow
step, angular 56°/34° nose, lip, chin, jaw — with **three hair strands** as wide
planes sweeping back from the crown, each with a **56° chamfered tip**.
**Accent** the front strand. A lattice sparkle sits above the brow in mono.
14.7 %.
**Why it reads** a nose and a jaw make a face; three strands make hair. It took
five attempts (§3) precisely because every abstraction of "hair" reads as a
flame.

### `goal-ideal-weight` — الوزن المثالي

**Metaphor** waist and body measurement.
**Silhouette** two **wide contour planes** that flare at the shoulders and hips
and pinch to a 4.7-unit waist; the shoulders are cut by a **56° chamfer**.
**Accent** a centred measuring band across the waist with a **target notch** cut
into its lower edge. 14.2 %.
**Why it reads** the hourglass is the waist; the band across it is the tape. The
previous version was the same idea drawn as two thin curves, which is why it
read as weak.

---

## 3. The rounds

Each round was rendered to a standalone sheet at 96/36/24/20/16 on both grounds
and read back with the Read tool before the next change.

| round | what changed | verdict off the render |
|---|---|---|
| 1 | first draw of all six from the rules | energy and ideal-weight held. performance read as a ring with a blob. recovery's arrowheads fused into the ring. hair-skin was a blob. |
| 2 | performance → half dial + tapered needle; recovery → 56° gaps and lattice arrowheads; heart lobes made fuller; hair-skin → silhouette with a face notch | performance and recovery now read. hair-skin still a blob: a face notch on a black mass does not register. |
| 3 | hair-skin → hair band + separate profile line; needle merged onto a hub | the hair band read as a band, the face as a squiggle inside it. Still wrong. |
| 4 | hair-skin → large head outline + hair cap on the crown; brow step added | a head with hair read at 120 px, mush at 16. |
| 5 (coordinator review) | performance → **plane** dial + wedge needle; recovery → **plane** band arrows; ideal-weight → flared shoulders and hips; hair-skin → **profile plane + three strand planes + accent front strand + sparkle** | hair-skin read for the first time. recovery still read as a closed ring: the lattice heads filled the gaps. |
| 6 | recovery → gaps opened to 56°, heads rebuilt as tangential flared triangles at 270° and 90° | all six read at 24 and hold at 16. Shipped. |

The single biggest lesson: **the difference between the rejected icons and these
is not the angles, it is the ink.** Rounds 1–4 kept failing on symbols that were
still outlines. Every symbol that became a plane started reading immediately.

---

## 4. The renders

| file | what |
|---|---|
| `docs/build/progress/icons/goal-contact-sheet.png` | the six at 16/20/24/32/36 on `#F7F8F6` and `#0B0D0F`, the twins engaging at 16 and 20 exactly as `Icon.tsx` engages them |
| `docs/build/progress/icons/goal-cards-1440.png` | the live goal-card row on `/ar` at 1440 |
| `docs/build/progress/icons/goal-cards-390.png` | the same at 390 |
| `docs/build/progress/icons/system-contact-sheet-light.png` | all 91 standard symbols at five sizes on `#F7F8F6` |
| `docs/build/progress/icons/system-contact-sheet-dark.png` | the same on `#0B0D0F` |
| `docs/build/progress/icons/home-header-1440.png` | the home header |
| `docs/build/progress/icons/product-card-1440.png` | the product rail |
| `docs/build/progress/icons/services-band-1440.png` | the services band |

The accent renders as the reference sheets' **#F15C22** in the contact sheets
and as the live token **#EE4D22** in the route screenshots. Nothing in the
sprite hardcodes either (ICONS §8).

---

## 5. The system pass (coordinator addendum)

> "this system of icons is to apply across the whole website as one design
> system."

Two things landed.

**(a) The spec.** `docs/build/ICONS-2026-09-24.md` — grid, optical box, stroke,
planes, the two diagonals, the chamfer, direction changes, the accent rule and
share, the twin rule, RTL, the reviewer's checklist and a single list of what is
forbidden. It is written so another builder can redraw any symbol to it without
seeing this file.

**(b) A lattice pass over the rest of the sprite.** Rather than redraw eighty
recognisable objects — which would repeat the mistake the owner already paid for
twice — every straight edge within **8° of the lattice** was moved exactly onto
it. That is the edge a builder *meant* to draw on the system and drew by eye: a
chevron at 50.57° becomes 56°, a plan corner at 39.35° becomes 34°, a heart at
54.78° becomes 56°, a play triangle at 57.65° becomes 56°. Metaphors are
untouched; only slopes moved.

```
straight edges seen 223 (in the non-exempt symbols), moved onto the lattice 105
whole file: straight edges 809, on the 0/34/56/90 lattice 671 = 82.9%
                                                   (was 64% before this batch)
```

Six symbols were **reverted** to their pre-pass geometry because snapping broke
something the tests guard: `ox-truck`, `ox-shipping`, `ox-truck-s` and
`ox-badge` (a neighbouring edge drifted to 44.59°, which is the banned 45),
`ox-low-sugar` and `ox-warning` (points pushed outside the `[2, 22]` live area).
They keep their old slopes and are named here as the follow-up.

Exempt from the pass, by rule:

- the **ten product-category originals** — `protein`, `creatine`, `pre-workout`,
  `amino-acids`, `omega-3`, `vitamins-minerals`, `collagen-beauty`,
  `daily-health`, `snacks-bars`, `accessories`. The owner ruled them fine; they
  stay byte-identical, carry no `stroke-width` and no `class="ox-sym"` (the
  width was *inherited*, and it was 1 on the tiles and 1.25 on the categories
  index), and they may not grow a twin. Noted in the spec, §5.1;
- **`ox-mark`**, pinned by `scripts/check-identity.mjs`;
- **`ox-search`, `ox-arrow`, `ox-external`** and their twins, whose 45° is the
  universal convention;
- the six goal symbols and their twins, already authored on the lattice.

---

## 6. Verification

```
$ pnpm vitest run tests/common
 ✓ tests/common/xmark.test.ts (6 tests)
 ✓ tests/common/scrollers.test.ts (3 tests)
 ✓ tests/common/primitives.test.tsx (14 tests)
 ✓ tests/common/sprite.test.ts (19 tests)
 Test Files  4 passed (4)
      Tests  42 passed (42)

$ node scripts/check-identity.mjs
check-identity: 328 file(s), 0 problem(s)
```

The geometry audit (bounding box against the 2–22 live area, ink, accent share,
the set of diagonals used, and the stroke attributes), for the six and their
twins:

```
ox-goal-energy             bb 2.00 2.00 22.00 22.00   touch 4  ink 120.0  accent 10.6%  ang 0/34/56/90  sw=2 cap=square join=miter
ox-goal-performance        bb 2.11 2.10 21.90 20.21   touch 3  ink 192.8  accent 15.7%  ang 34/56/90    sw=2 cap=square join=miter
ox-goal-general-health     bb 3.10 4.53 19.17 21.41   touch 2  ink 197.0  accent 14.2%  ang 34/56       sw=2 cap=square join=miter
ox-goal-recovery           bb 2.80 2.04 21.20 21.96   touch 4  ink 144.4  accent 15.7%  ang 0/34/56     sw=2 cap=square join=miter
ox-goal-hair-skin          bb 2.80 2.20 22.00 21.63   touch 4  ink 154.3  accent 14.7%  ang 0/34/56     sw=2 cap=square join=miter
ox-goal-ideal-weight       bb 2.40 2.90 21.60 21.20   touch 4  ink 150.0  accent 14.2%  ang 34/56/90    sw=2 cap=square join=miter
ox-goal-energy-s           bb 2.00 2.00 22.00 22.00   touch 4  ink 122.9  accent 12.7%  ang 0/34/56/90  sw=2 cap=square join=miter
ox-goal-performance-s      bb 2.11 2.10 21.90 20.21   touch 3  ink 200.2  accent 15.1%  ang 34/56/90    sw=2 cap=square join=miter
ox-goal-general-health-s   bb 3.10 4.53 19.17 21.41   touch 2  ink 196.1  accent 13.8%  ang 34/56       sw=2 cap=square join=miter
ox-goal-recovery-s         bb 2.80 2.04 21.20 21.96   touch 4  ink 155.4  accent 15.2%  ang 0/34/56     sw=2 cap=square join=miter
ox-goal-hair-skin-s        bb 2.80 2.20 22.00 21.58   touch 4  ink 143.2  accent 15.9%  ang 0/34/56     sw=2 cap=square join=miter
ox-goal-ideal-weight-s     bb 2.40 2.90 21.60 21.20   touch 4  ink 150.7  accent 14.6%  ang 34/56/90    sw=2 cap=square join=miter

symbols 108   bytes 41588   problems 0
```

Every diagonal used by the six is **34.01° or 55.99° ± 0.01**. Every point is
inside `[2, 22]`. Every accent sits between **10.6 % and 15.9 %**. Every symbol
reaches the 1.25 inset on **two to four sides**.

### The one test change

`tests/common/sprite.test.ts` gained **one** assertion and nothing else — the
other eighteen passed unchanged, including the lattice share, the no-45 rule,
the live area and the fill-the-box rule, because the planes ride on paths rather
than on the symbol:

```ts
it('gives every mono plane an explicit stroke="none"', …)
```

That codifies R1. A mono plane without `stroke="none"` is painted one unit fat
on every edge, so the mark's 4.5-unit bar thickness silently becomes 6.5. The
accent classes are fill-only in `_primitives.scss` already and are exempt.

---

## 7. Deviations, and why

1. **`goal-general-health` reaches the inset on only two sides** (min x 3.10,
   max y 21.41) and sits 1.1 units start-of-centre. That is the cost of the 56°
   chamfer on the foot: the chamfer moves the bottom point, which moves both
   lobe bases, and a heart with equal lobes and a chamfer cannot also be
   centred. It is the "controlled asymmetry" the brief asks for; it passes the
   ≥ 2 sides rule.
2. **`goal-performance` reaches on three sides** and its ink (192.8) is the
   family's heaviest because a 292° dial plane is a lot of ink. Comparable
   optical weight was read off the render rather than forced to a number.
3. **`goal-recovery`'s arrowheads are tangential triangles, not radial ones.**
   A radially-flared head has no lattice solution: with the base along the
   radius, neither side can be put on 34 or 56 (the algebra has no positive
   root). The tangential head — vertical back edge, two 56° edges — is fully on
   the lattice and reads as an arrow.
4. **`goal-hair-skin` carries an accent strand and a mono sparkle**, not an
   accent sparkle. The coordinator asked for both the front strand in accent and
   a sparkle; R5 allows one accent element, so the sparkle ships mono. It still
   gives the beauty cue and the accent share stays at 14.7 %.
5. **Six symbols were reverted from the lattice pass** — `truck`, `shipping`,
   `truck-s`, `badge`, `low-sugar`, `warning` (§5). Follow-up, not silent.
6. **`ox-star` and `ox-points` were not snapped.** Their ten edges sit at
   26/81/45/10/62° — a five-point star's geometry is not on this lattice and
   forcing it would destroy the star. They fall outside the 8° window, so the
   pass left them alone by construction.
7. **Accent shares outside 10–15 % survive in the older families** —
   `gluten-free` 36 %, `low-sugar` 30 %, `points` 29 %, `form` 25 %, `tick`
   100 % (it is a bare accent check by design). Bringing them into band is a
   redraw, not a snap, and is the next batch.
8. **`stroke-width` is 2, not 2.25.** The 16 px step takes 2.25 through the
   size-ladder custom property, in the sprite's own `<style>` and in
   `_primitives.scss`.
9. **The sprite is 41.6 KB raw**, up from 39.1. The test ceiling is 52 KB.
10. **No component, stylesheet, `Icon.tsx` or `KitchenSink.tsx` was touched.**
    Six other builders hold those files. The changed set is exactly
    `app/assets/ox-sprite.svg`, `tests/common/sprite.test.ts`,
    `docs/build/ICONS-2026-09-24.md`, `docs/build/progress/S6d.md` and
    `docs/build/progress/icons/*.png`.

---

## 8. What is still open for the owner

- **`goal-hair-skin` at 16 px.** It reads as beauty at 20 and above. At 16 the
  three strands and the profile compress into a mass with an orange streak. The
  twin already drops one strand; going further would cost the profile, which is
  the recognition. Flagged rather than claimed.
- **The orange.** The reference sheets are `#F15C22`; the live token is
  `#EE4D22` from the Salla dashboard. The sprite hardcodes neither. If `#F15C22`
  is the brand colour, that is a dashboard + `tokens.css` change, never a sprite
  change.
- **The eight symbols in §7.5 and §7.7** — a redraw batch, scoped and named.
