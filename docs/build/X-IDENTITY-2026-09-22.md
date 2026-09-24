# The X identity system

Creative director, 2026-09-22. Binding on every surface of the OptimalX theme.
It re-derives the angle system from the logo file itself, because the owner's
instruction is "matching the exact shape of the x shape logo" and the shipped
system does not match it: `app/styles/tokens.css` declares `--ox-angle: 22deg`
and `--ox-angle-tan: 0.4040`, and the mark measures **34 degrees from vertical,
tan 0.6745**. Every wedge, strap, chip, parallelogram and band edge in the build
is therefore drawn at the wrong angle today.

Where this document conflicts with BUILD.md 3.3 or DIRECTION.md 4.5 it wins and
says why. Where it conflicts with BUILD.md 3.1 (accent reserved for interactive),
3.4 (no hover lift) or 3.5 (square caps, miter joins, one accent element per
symbol), **BUILD.md wins**, none of those change.

Conventions: px unless stated. "start"/"end" are logical; Arabic is the default
direction and inline-start is the right edge. Probe widths: **320** (container
288), **390** (358) and **1440** (1296). No user-facing literal appears in
`app/`; new strings ship as keys in `locales/partials/xid.{ar,en}.json` and
identically in `locales/{ar,en}.json`.

---

## 1. The exact mark

### 1.1 Method

Source: `public/assets/brand/optimalx-mark-512.png`, 512 by 512, orange
`#CE3B10`, scanned every 4 rows into 109 row records of `[y, x0, x1, …]`.
Each of the mark's ten straight edges was extracted as a sample set and fitted
twice: once free (slope and intercept), once with the slope locked to
`tan 34° = 0.6745085` and only the intercept solved. The locked lines are what
the polygon below uses. Rasterising the reconstruction back against the 109
scanned rows gives **IoU 98.87 %** (207 source px outside the polygon, 49
polygon px outside the source). Nothing in the mark is curved.

### 1.2 The ten edges

Free fit versus the locked-34 fit. `x = m·y + c`; rms is the residual in px.

| Edge | free dx/dy | free angle from vertical | locked c | locked rms | n |
|---|---|---|---|---|---|
| NE arm, start edge | −0.6782 | 34.15° | 340.608 | 0.37 | 45 |
| NE arm, end edge | −0.6799 | 34.21° | 479.465 | 0.46 | 42 |
| SW arm, start edge | −0.6721 | 33.91° | 345.949 | 0.38 | 45 |
| SW arm, end edge | −0.6743 | 33.99° | 487.619 | 0.35 | 47 |
| NW arm, start edge | +0.6645 | 33.60° | −94.597 | 0.53 | 31 |
| NW arm, end edge | +0.6685 | 33.76° | 37.577 | 0.34 | 23 |
| SE arm, start edge | +0.6553 | 33.24° | 139.655 | 0.83 | 29 |
| SE arm, end edge | +0.6465 | 32.88° | 274.575 | 1.25 | 35 |
| NE chamfer | +0.5000 (3 samples) | 26.57° | 55.973 | 0.74 | 3 |
| SW chamfer | +0.5643 | 29.44° | 121.445 | 0.92 | 6 |

Mean of the eight long edges: **33.72°**, spread 32.88 to 34.21. The identity
angle is **34°**; the worst locked residual is 1.25 px, 0.24 % of the box. The
eight remaining edges are **horizontal**. There is no other angle in the mark.

### 1.3 The structure, corrected

The brief described "bar A continuous, bar B broken". The pixels say something
more interesting, and the correction matters because section 3 comes out of it.
The mark is **four parallelogram arms**, not two bars:

- **NE**, top-right, leaning down-start, from the top edge of the box (y 30) to
  a horizontal ledge at **y 222**.
- **SE**, bottom-right, leaning down-end, from a horizontal ledge at **y 198**
  to the bottom of its own arm at **y 338**.
- **NW**, top-left, leaning down-end, from a horizontal ledge at **y 154** to a
  horizontal ledge at **y 278**.
- **SW**, bottom-left, leaning down-start, from a horizontal ledge at **y 246**
  to the bottom edge of the box (y 466).

NE and SE overlap and fuse into one chevron `<`, apex at **(198.29, 210.99)**.
NW and SW overlap and fuse into the opposite chevron `>`, apex at **(304.53,
271.44)**. **The two chevrons never touch.** They are held apart by a channel of
constant width: **18.40 px horizontally / 15.25 px perpendicular** on the upper
run, **18.21 / 15.10** on the lower run, two parallel 34° lines, not a taper.

The channel does not run straight through. It **jogs 83.78 px along a horizontal
ledge 24 px tall** at the crossing (y 222 → y 246). That jog, 3.49 times the
ledge height, is the mark's signature and the whole of section 3.

Two further measured facts, both small and both real:

- The SW arm sits **5.34 px** (4.43 perpendicular, 3.9 % of a bar thickness)
  toward the inline-end of the line the NE arm would continue on. The long bar
  is very slightly offset across the crossing, in the same direction as the jog.
- The NW and SE arms are **234.25 px apart horizontally (194.20 perpendicular)**
  - **1.71** bar thicknesses (194.20 / 113.50 = 1.7115, not 1.75, the divisor
  is the corrected 113.50 mean perpendicular thickness, §1.5). They are
  parallel, not collinear. Reading them as one broken bar is wrong; they are
  the two halves of the counter-chevron.

### 1.4 Vertices

512 box, from the locked lines. Vertex order is the drawing order of the path.

| Arm | v1 | v2 | v3 | v4 | v5 |
|---|---|---|---|---|---|
| NE | 320.37, 30 | 459.23, 30 | 329.72, 222 | 205.71, 222 | 198.29, 210.99 |
| SW | 180.02, 246 | 287.37, 246 | 304.53, 271.44 | 173.30, 466 | 31.63, 466 |
| NW | 9.28, 154 | 141.45, 154 | 225.09, 278 | 92.92, 278 |, |
| SE | 273.21, 198 | 408.13, 198 | 502.56, 338 | 367.64, 338 |, |

Bounding box **9.28 → 502.56 by 30 → 466 = 493.28 by 436.00, aspect 1.1314**.
(The scan's raw bbox is 11 → 500 by 30 → 466; the 2.6 px spill on the end side
is the cost of locking the SE end edge from 32.88° to 34°. Accepted.)

Normalised to a 24 grid, uniform scale **0.0486539**, mark flush to x 0 and
x 24, vertically centred with **1.393** of pad top and bottom:

| Arm | v1 | v2 | v3 | v4 | v5 |
|---|---|---|---|---|---|
| NE | 15.136, 1.393 | 21.892, 1.393 | 15.591, 10.735 | 9.557, 10.735 | 9.196, 10.199 |
| SW | 8.307, 11.903 | 13.530, 11.903 | 14.365, 13.140 | 7.980, 22.607 | 1.087, 22.607 |
| NW | 0, 7.427 | 6.431, 7.427 | 10.500, 13.460 | 4.069, 13.460 |, |
| SE | 12.841, 9.567 | 19.406, 9.567 | 24, 16.379 | 17.436, 16.379 |, |

Normalised to 100 wide (same uniform scale, 88.39 tall, centred in 100):

| Arm | v1 | v2 | v3 | v4 | v5 |
|---|---|---|---|---|---|
| NE | 63.07, 5.81 | 91.22, 5.81 | 64.96, 44.73 | 39.82, 44.73 | 38.32, 42.50 |
| SW | 34.61, 49.59 | 56.38, 49.59 | 59.85, 54.75 | 33.25, 94.19 | 4.53, 94.19 |
| NW | 0, 30.94 | 26.79, 30.94 | 43.75, 56.08 | 16.96, 56.08 |, |
| SE | 53.51, 39.86 | 80.86, 39.86 | 100, 68.25 | 72.65, 68.25 |, |

All 18 edges, measured on the 24-grid path: 8 exactly horizontal, 10 at
**34.00 ± 0.04°** from vertical. That is the assertion section 7 tests.

### 1.5 Dimensions

| Quantity | 512 box | 24 grid | % of box |
|---|---|---|---|
| NE arm horizontal width / perpendicular thickness | 138.86 / 115.12 | 6.76 / 5.60 | 28.1 / 23.3 of width |
| SW arm | 141.67 / 117.45 | 6.89 / 5.71 | 28.7 / 23.8 |
| NW arm | 132.17 / 109.58 | 6.43 / 5.33 | 26.8 / 22.2 |
| SE arm | 134.92 / 111.85 | 6.56 / 5.53 | 27.4 / 22.7 |
| Channel width, upper / lower | 18.40 / 18.21 horiz | 0.90 / 0.89 | 3.7 of width |
| Crossing ledge height (the slot) | 24.00 | 1.17 | 5.50 of height |
| Channel jog along the ledge | 83.78 | 4.08 | 19.2 of height |
| Chevron apex separation | 106.24 x, 60.45 y (122.23) | 5.17, 2.94 |, |

The four ledge runs, end to end: NW foot **92.92 → 225.09** (132.2); SE head
**273.21 → 408.13** (134.9); NE foot **205.71 → 329.72** (124.0, the chamfer
takes 14.9 off the full width); SW head **180.02 → 287.37** (107.4). These are
two different quantities and the row above conflated them: 14.9 is how much
the NE ledge is shortened by its own chamfer (138.86 arm width − 124.0 ledge
run = 14.86); the SW chamfer's own horizontal extent is separately **34.32**
(141.67 SW arm width − 107.4 SW ledge run), not 14.9 and not interchangeable
with the NE figure. §3.1's chamfer row (`14.9 / 17.2 horiz`) mixes the same two
kinds of quantity across its two chamfers; read its `14.9` as the NE ledge
shortening and its `17.2` as a separate measurement, not as one ratio.

**Bar thickness for the system: 23.0 % of the mark's width** (mean
perpendicular thickness 113.50 of 493.28 wide / 436 tall: (115.12 + 117.45 +
109.58 + 111.85) / 4 = 113.50; 113.50 / 493.28 = 0.2301). When the mark is
drawn as a stroke rather than a filled shape, that is the stroke width.

### 1.6 The two SVG paths

`public/assets/brand/optimalx-mark.svg`, `viewBox="0 0 512 512"`, one path,
`fill="currentColor"`, `fill-rule="nonzero"`, no stroke, so the file and the PNG
are interchangeable at 1:1:

```
M320.37 30 L459.23 30 L329.72 222 L205.71 222 L198.29 210.99 Z M180.02 246 L287.37 246 L304.53 271.44 L173.3 466 L31.63 466 Z M9.28 154 L141.45 154 L225.09 278 L92.92 278 Z M273.21 198 L408.13 198 L502.56 338 L367.64 338 Z
```

Sprite symbol `ox-mark` in `app/assets/ox-sprite.svg`, `viewBox="0 0 24 24"`,
same geometry uniformly scaled, `fill="currentColor"`, no stroke (it inherits
nothing from the sprite root's stroke attributes because it declares a fill and
no stroke of its own). **This is the only symbol in that file this spec touches.**

```
M15.136 1.393 L21.892 1.393 L15.591 10.735 L9.557 10.735 L9.196 10.199 Z M8.307 11.903 L13.53 11.903 L14.365 13.14 L7.98 22.607 L1.087 22.607 Z M0 7.427 L6.431 7.427 L10.5 13.46 L4.069 13.46 Z M12.841 9.567 L19.406 9.567 L24 16.379 L17.436 16.379 Z
```

Both paths are single-colour. BUILD 3.5's "one orange accent element per sprite
symbol" governs the category and trust symbols; the brand mark takes one
colour, set by the caller.

---

## 2. The angle system

### 2.1 Tokens

Replace the block at `app/styles/tokens.css` ~372–392.

```css
--ox-angle: 34deg;          /* was 22deg */
--ox-angle-tan: 0.6745;     /* was 0.4040, tan 34° = 0.6745085 */
--ox-angle-cos: 0.8290;     /* perpendicular thickness = horizontal width × this */
--ox-angle-h: 56deg;        /* the same angle read from the horizontal */
--ox-skew: calc(var(--direction-factor) * var(--ox-angle));
--ox-lean: 0px;             /* set per surface: the height an edge leans over */
--ox-run: calc(var(--ox-lean) * var(--ox-angle-tan));
--ox-step-h: 0px;           /* the ledge height t, section 3 (clamp 4→24 applied per surface) */
--ox-step-H: 0px;           /* the block-size H that drives t and j, set per surface */
--ox-step-j: calc(var(--ox-step-H) * 0.1924);
--ox-bar-w: 0.230;          /* bar thickness as a fraction of the mark's width (493.28) */
```

`--ox-step-j` is driven off `--ox-step-H` directly (0.1924 = 0.055 × 3.49), not off
`--ox-step-h`'s own clamped value: the two formulas in 3.1 diverge exactly where
the `t = clamp(0.055·H, 4, 24)` clamp bites (H 44 → `3.49·t` gives 14.0 against
the table's 8.5; H 560 → `3.49·t` gives 83.8 against the table's 107.7), and
owner note 5 calls the 3.49 ratio non-negotiable. Driving `--ox-step-j` off the
unclamped `H` reproduces the 3.1 table exactly at every row (H 44 →
0.1924 × 44 = 8.5; H 560 → 0.1924 × 560 = 107.7); `--ox-step-h` keeps its own
clamp for the ledge's rendered height, which can legitimately differ from what
the jog's proportions imply at the extremes.

`$ox-angle-tan` in `app/styles/06-ox/_primitives.scss:15` changes from `0.404`
to `0.6745` in the same commit, and `ox-run()` rounds to **0.1 px** instead of
1 px (at 34° an integer round costs up to 0.35° on a 44 px control; 0.1 px costs
0.02°). `--ox-band-h` and `--ox-wedge-run` are retired in favour of `--ox-lean`
and `--ox-run`, because at 34° a band's edge no longer leans over the band's
whole height, see 2.3.

**Any diagonal anywhere in this theme is 34° from vertical or 56° from
horizontal. Never 45. Never 22.** Existing 45° and 135° and 220° rotations in
`app/styles/02-generic/tooltip.scss`, `04-components/home-blocks.scss` and
`04-components/menus.scss` are inherited Raed scaffolding on the check-rtl
allowlist and stay allowlisted; nothing in `06-ox` or `app/components` may add
one.

### 2.2 The run ladder

`run = lean × 0.6745085`. A 34° run is **1.6696×** a 22° run for the same
height, which is the whole reason this section exists.

| lean | run @34 | old run @22 | rounded | angle at the rounded value |
|---|---|---|---|---|
| 24 | 16.19 | 9.7 | 16.2 | 34.02° |
| 40 | 26.98 | 16.2 | 27.0 | 34.02° |
| 44 | 29.68 | 17.8 | 29.7 | 34.02° |
| 48 | 32.38 | 19.4 | 32.4 | 34.02° |
| 56 | 37.77 | 22.6 | 37.8 | 34.02° |
| 64 | 43.17 | 25.9 | 43.2 | 34.02° |
| 96 | 64.75 | 38.8 | 64.8 | 34.02° |
| 120 | 80.94 | 48.5 | 80.9 | 33.99° |
| 158 | 106.57 | 63.8 | 106.6 | 34.01° |
| 180 | 121.41 | 72.7 | 121.4 | 34.00° |
| 240 | 161.88 | 97.0 | 161.9 | 34.00° |
| 300 | 202.35 | 121.2 | 202.4 | 34.01° |
| 320 | 215.84 | 129.3 | 215.8 | 34.00° |

A selection of whole-pixel pairs within 0.05° of 34 (run : lean), exhaustive
enumeration for lean ≤ 400 returns roughly 220 pairs, so this is not the full
list: **27:40** (atan(27/40) = 34.019°, and the one this build actually ships,
at 320/390 for need cards and featured rail tiles, see the need-card and
featured-rail rows of 2.4/3.3), **29:43, 31:46, 54:80, 60:89, 81:120, 108:160,
120:178, 162:240, 180:267, 216:320, 240:356, 270:400**, and further small
pairs including 25:37, 33:49, 52:77, 56:83, 64:95, 68:101.

### 2.3 The clamp, and why the full-height diagonal dies

**Budget: a diagonal's run may never exceed 24 % of the angled element's
inline-size.** Past that the cut stops reading as an edge and starts reading as
a triangle, and on a photograph it eats the subject.

| element inline-size | max run | max lean |
|---|---|---|
| 288 (320 container) | 69.1 | 102.5 |
| 358 (390 container) | 85.9 | 127.4 |
| 864 (hero photo pane, 60 % of 1440) | 207.4 | 307.4 |
| 1296 (1440 container) | 311.0 | 461.1 |

The home hero's band is 560 tall. A full-height 34° diagonal runs **377.7 px**,
which is 43.7 % of the 864-wide photo pane, over budget by a factor of 1.8. No
band height that still works as a hero fixes it: 420 gives 283.3 (32.8 %), 360
gives 242.8 (28.1 %). **At 34° a full-height diagonal is impossible on a
hero-scale band.** So the edge stops being one diagonal and becomes what the
mark actually is: a 34° segment terminated by a horizontal ledge.

`--ox-lean` is therefore the height the edge leans over, and it is *less* than
the band height. The rest of the edge is vertical. The corner between the
vertical run and the lean is a hard miter, never a curve. This is not a
compromise; it is the mark's own construction (section 1.3: every arm ends on a
horizontal ledge, not on a point).

**Exemption.** The 24 % budget governs a cut *into* a filled panel, a
`clip-path` removing a wedge from a solid shape, where the run is measured
against that shape's own inline-size. A thin parallelogram **bar** (the hero
strap, `.ox-hero__edge`; the footer wedge bars, `.ox-footer__wedge`) is exempt:
its run is the distance the bar's fixed-width body *travels* across the band on
its lean, not a bite taken out of its own inline-size, and a bar's inline-size
(10–14 px) is unrelated to how far it travels. Measured: the hero strap's run
202.4 against its own 12 px inline-size is 1687 %; the footer wedge bars' run
80.9 (at 390) and 121.4 (at 1440) against 10 px and 14 px bars are 809 % and
867 %. All are correct as specified and none violates the budget, because the
budget was never about them.

### 2.4 Derived values, per primitive, at the three widths

| Primitive | 320 | 390 | 1440 |
|---|---|---|---|
| Hero band block-size | 460 | 500 | 560 |
| Hero lean / run | corner 96 / 64.8 (22.5 % of 288) | corner 120 / 80.9 (22.6 % of 358) | 300 / 202.4 (23.4 % of 864); edge vertical 0→260, leaning 260→560 |
| Hero strap (`.ox-hero__edge`) | none | none | 12 wide, parallelogram along the lean only, block-size 324 (300 + 12 overshoot each end), horizontal ends |
| Section band edge lean / run | 72 / 48.6 (16.9 %) | 96 / 64.8 (18.1 %) | 180 / 121.4 (9.4 % of 1296) |
| Need-card corner cut lean / run | 40 / 27.0 (19.6 % of a 138 card) | 40 / 27.0 (15.6 % of a 173 card) | 64 / 43.2 (14.1 % of a 306 card) |
| Plan-card corner cut lean / run | 48 / 32.4 | 56 / 37.8 | 96 / 64.8 |
| CTA parallelogram (`.ox-cta-wedge`) height / run / padding-inline | 44 / 29.7 / 45.7 | 44 / 29.7 / 45.7 | 48 / 32.4 / 48.4 |
| CTA minimum inline-size before the angle is dropped | 124 | 124 | 135 |
| Chip, badge, price tag | **no lean**, notch only (section 3) | same | same |
| Footer wedge bars (`.ox-footer__wedge`) | hidden | box 140 wide, bars 10 and 6, lean 120 / run 80.9 | box 220 wide, bars 14 and 8, lean 180 / run 121.4 |

`.ox-cta-wedge` at 320: the run eats 59.4 of the 288 container, leaving 196.6
for a label at 16 px/700. That fits a two-word Arabic label and nothing longer,
so **below 640 the hero's two buttons stack**; they are never side by side.
Any control narrower than `run / 0.24` loses the parallelogram and becomes
`.ox-cta-pill`. That is a hard rule, not a preference: it is what keeps the
angle at 34 instead of quietly flattening.

Old values that must change, with their files. Re-verified live against the
working tree on 2026-09-22 (the branch has moved since an earlier draft of
this table; two line references below were wrong and are corrected, not just
copied forward):

| Call site | today | becomes |
|---|---|---|
| `_b2-home.scss:135,144` `.ox-cta-wedge --ox-cta-run` (literal, not run-derived) | 18 / 19 | **29.7 / 32.4**, manual edit |
| `_b2-home.scss:244,250` hero photo polygon (literal percentages) | `96.7 % / 73.3 %` (run 226 over 560) | vertical to 46.4 %, then 34°, see 2.5, manual edit |
| `_b2-home.scss:434,440` hero scrim polygon (duplicate of :244,250, same box, literal percentages) | `96.7 % / 73.3 %` | same fix as the photo, see 2.5, manual edit |
| `_b2-home.scss:477,482` mobile hero floor cut (literal percentages) | `100 % 88 %` | replaced by the corner, 2.4, manual edit |
| `_b2-home.scss:2121` `ox-angled(44px)`, *re-verified live: the file's only `ox-angled(44px)` call. An earlier draft of this row cited `:1673,1890`; those lines are `.ox-plan__cta` and an accent gradient in the live tree, not this call, a session-drift error (concurrent batches shifted the file), corrected here* | run 18 | run 29.7, **automatic**, `ox-angled()` calls `ox-run()` |
| `_b6-commerce.scss:1894` `ox-angled(44px)` | run 18 | run 29.7, automatic |
| `_b3-product.scss:1291,1336,2859` `ox-angled(52px)` | run 21 | run 35.1, automatic |
| `_b3-product.scss:1426,2891` `ox-angled(56px)` | run 23 | run 37.8, automatic |
| `_b3-product.scss:2873` `ox-angled(48px)` | run 19 | run 32.4, automatic |
| `_b4-listing.scss:1407,1508` `ox-angled(40px)` | run 16 | run 27.0, automatic |
| `_b4-listing.scss:1592,1659` `ox-angled(36px)` | run 15 | run 24.3, automatic |
| `_primitives.scss:441,462` `ox-angled(40px)` (`.ox-btn--s40`) | run 16 | run 27.0, automatic; padding-inline 32 → **43.0** |
| `_primitives.scss:442,463` `ox-angled(44px)` (`.ox-btn--s44`) | run 18 | run 29.7, automatic; padding-inline 34 → **45.7** |
| `_primitives.scss:443,464` `ox-angled(48px)` (`.ox-btn--s48`) | run 19 | run 32.4, automatic; padding-inline 36 → **48.4** |
| `_b4-listing.scss:744` `ox-wedge-corner(64px,158px)` (literal `$w`, not run-derived) | `w` 64 (≈22° against the fixed 158 leg) | **`w` 106.6** (158 × 0.6745), manual edit |
| `_b4-listing.scss:795` `ox-wedge(420px)` | run 170 | run 283.3, automatic |
| `_b6-commerce.scss:560` `ox-wedge-corner(56px,138px)` | `w` 56 (≈22°) | **`w` 93.1** (138 × 0.6745), manual edit |
| `_blocks.scss:32` `ox-wedge-corner(64px,158px)` | `w` 64 | **`w` 106.6**, manual edit |
| `_blocks.scss:96` `ox-wedge(480px, start)` | run 194 | run 323.8, automatic |
| every `transform: skewX(var(--ox-skew))` (13 sites) | 22° | 34°, automatic via `--ox-angle`; each one re-measured against 2.3's budget before it ships |

Total `@include ox-angled` sites in `app/styles/`: **18**, re-counted live
(`_b2-home.scss` 1, `_b6-commerce.scss` 1, `_b3-product.scss` 6,
`_b4-listing.scss` 4, `_primitives.scss` 6), not the 11 an earlier draft
implied. Five further sites carry the angle through `ox-wedge`/`ox-wedge-corner`
rather than `ox-angled`, listed above. `ox-angled()` and `ox-wedge()` both call
`ox-run()` internally and recompute automatically once `$ox-angle-tan` changes;
`ox-wedge-corner()` takes an explicit pixel leg (`$w`) with no call to
`ox-run()`, so its three call sites need a manual edit to hit 34°, the "manual
edit" rows above.

### 2.5 The hero edge, exactly

RTL is the default declaration; `[dir='ltr']` mirrors it. Percentages are of the
photo pane's own box (60 % of the band, 864 at 1440). **This polygon is valid
only at pane 864×560.** A percentage pair's edge angle depends on the box
aspect (7.1's own `polygon-slope` rule concedes exactly this): holding the
width at 864 and dropping the band to 500 turns the same two percentages into
35.98°, not 34.00°. The polygon must be restated, not merely reused, if the
band height changes.

Pane 864 by 560. Vertical from the top to y 260 (46.43 %), then 34° to the foot,
displacing 202.4 (23.43 %). The block labelled RTL below removes a triangle at
the pane's bottom, on the side where `100% 100%`/`100% 46.43%` sit, the
inline-END edge in RTL (inline-start is the right edge per the Conventions
line above), matching `ox-wedge($side: start)` in
`app/styles/06-ox/_primitives.scss:22-24` and `app/styles/tokens.css`'s own
"the motif leans top-RIGHT to bottom-LEFT" note. An earlier draft of this
section had the two blocks swapped.

```
/* identity: 34deg, run 202.4 of 864 */
/* RTL, the pane sits at inline-end, its inline-start edge is cut */
clip-path: polygon(0 0, 100% 0, 100% 46.43%, 76.57% 100%, 0 100%);
/* LTR */
clip-path: polygon(0 0, 100% 0, 100% 100%, 23.43% 100%, 0 46.43%);
```

The strap is a separate 12 px parallelogram on the same line, `--ox-accent`,
horizontal ends, `inset-block: -2.14%` so its ends sit outside the band and are
clipped square by it. It never animates (check-motion rule `wedge-motion`).

---

## 3. The step motif

### 3.1 The primitive

**The step is a horizontal ledge that interrupts a 34° edge and jogs it
sideways.** It is the one gesture that is uniquely OptimalX: any brand can lean
a band; only this mark stops the lean on a flat ledge and restarts it further
along.

Proportions, locked to the mark (section 1.5) and expressed against `H`, the
block-size of the element the step is cut into:

| Quantity | mark | formula | why |
|---|---|---|---|
| ledge height `t` | 24 of 436 | `t = 0.055 · H`, clamped 4 → 24 | 5.50 % of the mark's height |
| ledge length (jog) `j` | 83.78 | `j = 3.49 · t = 0.1924 · H` | 3.49 ledge-heights, measured |
| channel width, when the step separates two shapes | 18.3 horiz / 15.2 perp | `0.037 · W` horizontal | constant, never tapered |
| chamfer leading into a ledge (optional) | 14.9 / 17.2 horiz | `0.12 · (arm width)` | the two the mark has |

| H | t | j | H | t | j |
|---|---|---|---|---|---|
| 44 | 4.0 (clamped) | 8.5 | 240 | 13.2 | 46.2 |
| 48 | 4.0 | 9.2 | 300 | 16.5 | 57.7 |
| 64 | 4.0 | 12.3 | 360 | 19.8 | 69.3 |
| 96 | 5.3 | 18.5 | 420 | 23.1 | 80.8 |
| 120 | 6.6 | 23.1 | 500 | 24.0 (clamped) | 96.2 |
| 158 | 8.7 | 30.4 | 560 | 24.0 | 107.7 |

Every row above already reads as `0.1924 · H` (H 44 → 8.47 ≈ 8.5; H 560 →
107.7 exactly), so this table does not change under the `--ox-step-j` fix in
2.1, it was the token that disagreed with the table, not the table with
itself. `t`'s own "(clamped)" markings stay: `t` is still `clamp(0.055·H, 4,
24)` for the ledge's *rendered height*, and only `j` is now read straight off
`H` rather than off the clamped `t`.

### 3.2 The 158 px law

BUILD 3.3 forbids angles on small elements; 3.5 requires 34° diagonals inside
sprite symbols, which are 24 px. Both are right; the rule that reconciles them
applies to a **band- or panel-scale** cut, not to every layout box regardless
of what it is:

> **Below 158 px of block-size, a band- or panel-scale angle may exist only
> inside a sprite symbol. It may never be a `clip-path`, `skew` or `rotate` on
> a band or panel layout box.** At those sizes the identity is carried by the
> **ledge alone**, a horizontal notch in a straight edge, depth `j`, height
> `t`. A notch is axis-aligned, so it costs nothing in rendering, nothing in
> RTL and nothing in reflow.
>
> **Named exceptions**, because the law as first written forbade primitives
> this document itself mandates, verified live: sized CTA buttons
> (`.ox-btn--s40/s44/s48`, `app/styles/06-ox/_primitives.scss:441-443`,
> block-size 40/44/48 with `@include ox-angled(...)` in the same rule), the
> footer wedge bars (`.ox-footer__wedge`, lean 120/180, 2.3's bar exemption
> covers their *run*, this exception covers their *block-size*), and the
> section divider's 34° segment (3.3, block-size 1 px). These are control- or
> line-scale marks, not a cut into a panel; the law exists to stop a 40 px
> card corner from carrying a full diagonal, not to reach a button's own
> corner. `ox-angled(40/48/52/56px)` at `_b3-product.scss`/`_b4-listing.scss`
> cut the block they sit in at band scale (the action row itself, not a
> sub-158 layout box) and were never inside the 158 px case to begin with.

158 is DIRECTION 4.5's existing floor and it is kept.

### 3.3 Where the step is used, one angled gesture per component

| Surface | Form | 320 | 390 | 1440 |
|---|---|---|---|---|
| Need card (pastel), top inline-end corner | corner cut at 34°, its foot closed by a ledge | lean 40 / run 27, ledge t 4 / j 14.0 | lean 40 / run 27, t 4 / j 14.0 | lean 64 / run 43.2, t 6.6 / j 23.0 |
| Plan card (dark, photographic) | same, top inline-start | lean 48 / run 32.4 | lean 56 / run 37.8 | lean 96 / run 64.8 |
| Section divider between two bands | full-width 1 px `--ox-line`, stepped once at 62 % of the container: 34° over `t`, then flat | t 4 / j 14.0 | t 4 / j 14.0 | t 6 / j 20.9 |
| Active tab indicator (`.ox-tab`, `.ox-tabbar`) | 4 px `--ox-accent` bar (raised from 3: `t 3` is below 2.1's clamp floor of 4 and is illegal), **notch only**: a `t 4 / j 14.0` bite out of its inline-end | j 14.0 | j 14.0 | j 14.0 |
| Booking slot, selected state | 2 px `--ox-ink` boundary, notch `t 4 / j 14.0` at the top inline-end corner | same | same | same |
| Price tag / saving badge | notch `t 4 / j 14.0` at the inline-end, no lean | same | same | same |
| Badge (`الأكثر طلبا`, `جديد`) | notch `t 4 / j 14.0` at the inline-end (raised from `t 3`, illegal) | same | same | same |
| Featured rail cover tile | corner cut, lean 40 / run 27 | lean 40 | lean 48 / run 32.4 | lean 64 / run 43.2 |

**Every notch now reads `j = 3.49 · t` exactly**, replacing the eight measured
ratios this table shipped with (tab indicator `t3/j10` = 3.33; badge `t3/j8` =
2.67; the Listing filter/sort chip in §6, `t3/j8` = 2.67; price tag `t4/j10` =
2.50; booking slot `t4/j12` = 3.00; need card `t4/j12.3` = 3.08; section
divider `t4/j14` = 3.50 at 320/390, already correct). `t3` is below 2.1's
clamp floor of 4 and is illegal on its own terms, not only on the ratio: every
`t3` above is raised to `t4`, which also raises the physical bar/boundary it
notches into from 3 px to 4 px where the notch is cut into that same bar (the
active tab indicator), a notch cannot be taller than the line it bites into.
`t4 → j 13.96 ≈ 14.0`; `t6 → j 20.94 ≈ 20.9`; `t6.6 → j 23.03 ≈ 23.0`. The
Listing row in §6 ("filter and sort chips: notch `t 3 / j 8`") carries the
same illegal ratio and is corrected there to `t 4 / j 14.0`.

**Which `H` drives the need card's `t`/`j`, exactly.** 3.1 defines `H` as the
block-size of the element the step is cut into, for a pastel need card
(≈180–220 tall) that is `clamp(0.055·H, 4, 24)` = **t 9.9–12.1**, giving
**j 34.6–42.3**, not the `t4/j14.0`(320/390)/`t6.6/j23.0`(1440) printed above.
Reverse-solving the printed values against 3.1's own `H`/`t`/`j` table shows
they were read off the wrong rows: `t4/j12.3` (pre-fix) is 3.1's `H=64` row
and `t6.6/j23.1` is 3.1's `H=120` row, both copied from the reference table
by matching the *lean* value of an unrelated primitive (this card's own 1440
lean is 64; 120 belongs to nothing on this card) rather than computed from the
card's own block-size. This is flagged, not silently corrected to the
180–220-derived values, because swapping to `t 9.9–12.1 / j 34.6–42.3` is a
visible design change to an already-shipped card and needs an owner call, not
an arithmetic one.

**One angled gesture per component block.** A card that takes the corner cut
does not also take a notch, a skewed price or an angled badge. A band that takes
a stepped edge does not also carry a wedge. This is enforced, not advised
(section 7, rule `one-angled-per-block`).

### 3.4 SCSS

```scss
// A 34° corner cut whose foot closes on a horizontal ledge, the mark's arm.
@mixin ox-lean-corner($lean, $side: end) { /* run = ox-run($lean) */ }
// A horizontal notch in a straight edge. No angle. Legal at any size.
@mixin ox-notch($t, $j, $corner: end-start) { /* clip-path, axis-aligned only */ }
// A 34° edge stepped once: lean $a, ledge $t/$j, lean the remainder.
@mixin ox-step-edge($h, $a, $t) { /* $j derived: 3.49 * $t */ }
```

All three emit a static `clip-path` with an `[dir='ltr']` mirror and **never** a
`transition` or `animation`.

**Focus visibility.** None of the three mixins may sit on the same selector as
`@include ox-focus` (or a bare `outline`): `clip-path` clips an element's
outline, so a clipped, focusable control needs its clip on a `::before`/
`::after` instead, with the outline left on the unclipped element, see 7.1's
`focus-clipped` rule for the exact mechanism and the live finding it catches.

---

## 4. The mark as a device

### 4.1 Watermark

One per section, maximum. Never two in a viewport.

| | 320 | 390 | 1440 |
|---|---|---|---|
| inline-size | 200 | 240 | 420 (32 % of 1296) |
| block-size | 176.8 | 212.1 | 371.2 |
| position | `inset-block-start: -8%`, `inset-inline-end: -10%` | same | `inset-block-start: -12%`, `inset-inline-end: -8%` |

Contrast ceiling **1.2 : 1 against its own ground**, measured, with the maximum
alpha for each pairing. **No row here uses `--ox-accent`.** BUILD.md 3.1
reserves `--ox-accent` for things people can click and this document's own
preamble does not amend 3.1 ("BUILD.md wins, none of those change"); a
decorative, `aria-hidden`, `pointer-events: none` watermark is exactly the
non-interactive case 3.1 is written against. An earlier draft of this table
priced the watermark in accent (0.10–0.12) and shipped it that way at
`app/styles/06-ox/_b2-home.scss` (`.ox-plan__watermark { color:
var(--ox-accent); opacity: 0.12 }`); that is a live BUILD 3.1 violation this
document caused and is corrected here to `--ox-ink` / `--ox-ink-on-dark` only:

| mark colour | ground | max alpha at 1.2:1 | ship at |
|---|---|---|---|
| `--ox-ink` #12171E | `--ox-paper` #FFFFFF | 0.088 | **0.06** |
| `--ox-ink` | `--ox-fill` #F4F4F3 | ≤ 0.088 (a near-white ground; the paper figure is the conservative floor, shipping at 0.06 clears it either way) | **0.06** |
| `--ox-ink` | `--ox-plate` #F1F1F0 | ≤ 0.088, same reasoning | **0.06** |
| `--ox-ink-on-dark` #F7F4EE | `--ox-band-util` #0E1014 | 0.081 | **0.06** |
| `--ox-ink-on-dark` | `--ox-pill-dark` #14181F | ≤ 0.081, a slightly lighter dark ground than band-util | **0.06** |

The watermark is `aria-hidden`, `pointer-events: none`, never animated, and
never sits under body copy, only under a heading block or an image. It counts
as neither the section's one accent element (BUILD 3.1, moot now, since it
never carries the accent) nor its one angled primitive: it is a picture of the
mark, not a cut in the layout.

**Render path.** The watermark and the 404/empty-state figure (4.3) are drawn
as `<svg><use href="#ox-mark"/></svg>` from the already-inlined sprite
(`app/assets/ox-sprite.svg`, the same pattern `app/components/home/
PlanCard.tsx:46` already uses) or as a CSS `mask-image` with an inline `data:`
SVG. **Never** a `url()` image request, never an `<img>`, and no new
render-blocking asset, no new font, stylesheet or sprite file. §8.6's
unassigned-owner note is resolved: this is the mechanism, not a decision left
open.

### 4.2 Loader and skeleton

Card and block skeletons keep DIRECTION 7.1's opacity pulse (1 → 0.6 → 1, 1.2 s,
`--ease-in-out`, static at 0.8 under reduced motion). **The route-level sweep
this section previously amended in is removed** (see §5's preamble fix): a
second, independently-moving wedge on top of the goal-grid settle is a second
signature moment DIRECTION 7.1/7.2 does not sanction and BUILD.md 3.4 rules
out ("Scroll reveals | Not used. Templated-build tell and an LCP cost"). The
route-level loader stays exactly DIRECTION 7.1's opacity pulse; it carries no
sweep.

### 4.3 404 and empty states

The mark as the figure, drawn in `--ox-plate-2` #E6E6E5 at full opacity -
**not** in accent, because these pages carry a primary button and the accent
belongs to it. Recomputed: L(#E6E6E5) = 0.79068, contrast on `--ox-paper`
#FFFFFF = 1.05 / 0.84068 = **1.2490 : 1**, rounded **1.25 : 1**, outside
§4.1's 1.2 : 1 ceiling, not the "1.15 : 1, inside the ceiling" an earlier
draft claimed. Written here as an explicit, named exemption from §4.1's
ceiling for the 404/empty-state figure only: it is the one place the mark is
drawn large (200/240/360 wide) and pale enough that holding it to 1.2 : 1
would make it disappear against the page ground, and unlike the watermark it
never sits over a heading or body copy that itself needs to clear a contrast
floor.

| | 320 | 390 | 1440 |
|---|---|---|---|
| 404 figure | 200 wide | 240 wide | 360 wide |
| Empty state (cart, wishlist, zero results, account) | 120 wide | 140 wide | 180 wide |

Empty states reserve their box at final size (`min-block-size` 320 / 320 / 360
in the grid column) so nothing shifts when the figure paints.

### 4.4 List bullet

**Dropped.** A chevron drawn from the mark's own `<` half is a second icon
system for UI chrome, which BUILD.md 3.5 forbids by name ("Do not ship a
second icon system for UI chrome, search, account, wishlist, cart, filter,
sort, share, **chevrons** all come from `sallaicons`"; the custom sprite is
"for category and trust icons only"), and `app/components/common/Icon.tsx`'s
own standing note already resolved this question the same way: "Every
chevron/arrow the theme draws elsewhere is sallaicons (BUILD.md:221); do not
add a new caller for this one." This document does not amend BUILD 3.5 (its
preamble names only 3.3 and 4.5 as the rules it overrides), so a list bullet
uses a `sicon-*` chevron like every other chevron in the theme, at 10 px
(320/390) / 12 px (1440), `--ox-accent-dark` on a benefit list and `--ox-fg-3`
on a plain list. The S2a sprite handoff this section previously opened is
closed, not pending: no new symbol is added.

### 4.5 Faded photographic cards (advisory band, `/services`)

Photograph at low opacity under a 34° scrim, text over it at **≥ 4.5 : 1**.

The scrim's iso-lines run parallel to the mark's bars, so the gradient direction
is perpendicular to them: **`linear-gradient(236deg, …)` in RTL,
`linear-gradient(124deg, …)` in LTR.** Declared as two rules, never as a
`rotate`.

Stops, `--ox-band-util` #0E1014:

```
0%   rgba(14,16,20,0.94)
38%  rgba(14,16,20,0.78)
72%  rgba(14,16,20,0.60)
100% rgba(14,16,20,0.46)
```

Measured floor: for `--ox-ink-on-dark` #F7F4EE (luminance 0.9065) the ground may
not exceed luminance **0.1626**, a flat #707070. Over a worst-case pure-white
photograph pixel, #0E1014 needs **alpha ≥ 0.60** to reach it (composite #6E7072,
4.53 : 1). So **all text sits inside the 0 → 72 % zone** and the photo is
additionally held at `opacity: 0.55` under the scrim. Below 72 % the card
carries no text, only the watermark.

If the card uses pure white text the requirement is alpha ≥ 0.58 (composite
#737477, 4.67 : 1); the theme uses #F7F4EE, so 0.60 is the number.

### 4.6 The pastel need-cards and the dark plan cards

The owner's pastel cards keep their colour scheme exactly. They carry the
identity through **two things and no more**:

1. **One accent element**, the arrow, `--ox-accent-dark` #D03709. Measured on
   the candidate tints: 4.39 (#FDEEE8), 4.39 (#F1F1F0), 4.36 (#EAF2EF), 4.32
   (#F3EFE6), 4.31 (#ECEFF5), 4.33 (#F6EDF2). As a **graphical** object the
   floor is 3 : 1 (WCAG 1.4.11) and every tint clears it. **If any card ever
   renders accent *text*, it must use `--ox-accent-deep` #A82D07** (5.99 → 6.11
   on the same tints). This is the one place the pastel run can silently fail
   AA, so it is written down here.
2. **The corner cut** at the top inline-end (3.3), which is the mark's arm foot.

No watermark on a pastel card, the card is already coloured and a second
device makes it noisy. The dark plan cards take the opposite split: the
**watermark** (`--ox-ink-on-dark` at 0.06 on #0E1014, not accent, see 4.1's
BUILD 3.1 fix) and **no corner cut**, so the two rows read as a pair rather
than as the same card twice. `app/styles/06-ox/_b2-home.scss`'s live
`.ox-plan__watermark` still reads `color: var(--ox-accent); opacity: 0.12`;
that file's watermark rule is owned by S2c in this batch and is listed as a
required follow-up in `docs/build/progress/XID.md` rather than edited here.

---

## 5. Motion

Nothing here overrides DIRECTION 7 or BUILD.md 3.4; it adds the identity layer
and re-states the budget. Two things this section shipped with did override
them without saying so, and are removed rather than grandfathered in under a
new amendment clause: §5.1's advisory-band/posters-guides-brands reveals
(below) and §4.2's route-loader sweep (removed above). BUILD.md 3.4's motion
table
reads "Goal selection | The one signature moment... Homepage only", and
DIRECTION 7.1/7.2 sanction exactly one revealed block; adding a written
amendment for a second and third moving element is a bigger governance claim
than an arithmetic fix should make on the owner's behalf, so the safer
correction is to cut back to what was already sanctioned.

- **Only `transform` and `opacity`.** The accordion's `grid-template-rows` stays
  the single written exception. No `clip-path` is ever animated, a polygon
  animation is a paint per frame and `check-motion`'s `wedge-motion` rule
  already fails it.
- **Durations** are the existing tokens: `--dur-fast` 120 ms, `--dur-confirm`
  160 ms, `--dur-base` 180 ms, `--dur-slow` 280 ms. **Easings**: `--ease-out`
  `cubic-bezier(0.2,0,0,1)` for entrances, `--ease-in` `cubic-bezier(0.4,0,1,1)`
  for exits, `--ease-in-out` for cross-fades. Every entrance has a shorter exit.
  Colour never transitions.
- **Every horizontal translate** is `calc(var(--direction-factor) * Npx)`,
  keyframes included. Vertical translates are not multiplied.

### 5.1 Reveal choreography, per section

`useSectionReveal` is unchanged: one module-scope `IntersectionObserver`,
no React state, `rootMargin: 0px 0px -8% 0px`, armed only for elements below
`0.9 × innerHeight` at hydration. It never hides anything already on screen,
which is what keeps CLS at 0 and the SSR html identical to the first paint -
true without qualification now that no above-the-fold element (the hero strap
included; see the removed 5.2 below) is ever mounted at `opacity: 0`.

| Section | what moves | stagger | duration |
|---|---|---|---|
| Needs / goals grid | the cards, `opacity 0→1` + `translateY(8px)→0` | `--stagger-step` 40 ms × DOM index, 6 cards, last lands at 380 ms | `--dur-base` `--ease-out` |
| Advisory band | **nothing**, cut back, below |, |, |
| Product rails | **nothing**, a horizontal scroller never reveals |, |, |
| Posters, guides, brands | **nothing**, cut back, below |, |, |
| Newsletter, CTA band | nothing |, |, |
| Footer | nothing |, |, |

**Cut back to the one block DIRECTION 7.1/7.2 and BUILD.md 3.4 already
sanction.** An earlier draft of this table added the advisory band's stagger
and a plain fade on posters/guides/brands, a second and third revealed block
BUILD.md 3.4 rules out ("Goal selection | The one signature moment... Homepage
only") and DIRECTION 7.1/7.2 do not list. Removed rather than grandfathered in
under a new amendment, for the reason given in §5's preamble. `--stagger-step`
has exactly **one** consumer after this change: the needs/goals grid. Rails,
product grids, listings, tables, the advisory band and the posters/guides/
brands rows never stagger or reveal.

### 5.2 The hero entrance, removed

**This section is deleted, not amended.** It described the hero strap
(`.ox-hero__edge`) mounting at `opacity: 0` and animating in on first load,
which directly contradicted §2.5's own "It never animates (check-motion rule
`wedge-motion`)" two sections earlier, `scripts/check-motion.mjs:111`
implements that rule and fails exactly this. The live code
(`app/styles/06-ox/_b2-home.scss`'s `.ox-hero__edge` rule) already has no
`transition`/`animation` on the strap, so deleting this section brings the
document in line with what is actually built rather than requiring a new
animation to be added to match a spec that contradicted itself. §2.5's "never
animates" line is the one that stands.

### 5.3 Budgets

- **LCP ≤ 2.5 s**: the hero photograph is the LCP element on `/ar`. It is never
  inside a revealed element, never opacity-0 at first paint, and the strap
  entrance is a sibling, not a wrapper.
- **INP ≤ 200 ms**: a reveal costs one attribute write and no render. The tab
  indicator, the chips and the notches are static clips, a press changes a
  class, never a polygon.
- **CLS ≤ 0.1, target 0**: every block mounts at its final box
  (`min-block-size`, never `block-size`); the watermark, the corner cuts and
  the notches are clips on boxes that already exist and can shift nothing.
- **Hydration must not alter structure.** The reveal attribute is added in a
  layout effect *after* hydration, so the server tree and the first client tree
  are identical.

**Browser floor and reflow.** Every `clip-path` in this system ships with a
`-webkit-clip-path` twin and every `mask` with a `-webkit-mask` twin; an
`@supports not (clip-path: polygon(0 0, 1px 0, 0 1px))` block resets the
element to a square box, the notches and corner cuts degrade to straight
edges, **never** to a hidden control. Supported Safari floor: **Safari 14**
(`clip-path: polygon()` unprefixed since 13.1; the `-webkit-` twin covers 9.1
through 13). **200 % zoom / WCAG 1.4.10:** at 200 % on a 1280 viewport the
effective width is 640, exactly the breakpoint 2.4 uses for the hero button
stack. The corner cuts, notches and CTA slants must not clip or overlap text
at 200 % at 320, 390 and 640 effective width; a control that would lose its
label to a cut at any of the three instead drops to `.ox-cta-pill` (2.4's own
"any control narrower than `run / 0.24` loses the parallelogram" rule already
covers the mechanism, this is the same rule applied under zoom, not a new one).

### 5.4 Reduced motion, per effect

| Effect | `prefers-reduced-motion: reduce` |
|---|---|
| Section reveals | never armed, `useSectionReveal` returns before observing |
| Skeleton pulse | static at opacity 0.8 |
| Tab indicator | jumps |
| Notch, corner cut, stepped edge, watermark | never animated in any mode |

---

## 6. Surface matrix

Sizes are the angled primitive's `lean / run` unless marked. "-" means the
surface carries no angled primitive at all, by decision. Every `t 3` below is
raised to `t 4` and every notch reads `j = 3.49 · t` (3.3's fix): `t 3 / j 10`
becomes `t 4 / j 14.0` wherever it appears in this table.

| Route family | Primitive(s) and size at 320 / 390 / 1440 | Forbidden |
|---|---|---|
| **Header** (`.ox-header`, `.ox-mainbar`, `.ox-mobilebar`, `.ox-utility`) |, . The logo is the mark + wordmark at block-size 24 / 24 / 28. The active nav link takes a 4 px accent underline with a `t 4 / j 14.0` notch | any lean; a watermark; an angled search field |
| **Footer** (`.ox-footer__wedge`) | two accent bars, 34° parallelograms with horizontal ends, in a box 140 / 140 / 220 wide: hidden at 320, `120 / 80.9` at 390, `180 / 121.4` at 1440 | more than two bars; any skew on the columns; a watermark in the same band |
| **Mobile tab bar** (`.ox-tabbar`) |, . Active tab: 4 px accent bar with a `t 4 / j 14.0` notch | any lean (the bar is 56 tall, under the 158 law; 3.2's named exception list does not include the tab bar) |
| **Home hero** | corner `96 / 64.8` / corner `120 / 80.9` / split edge `300 / 202.4` + 12 px strap | a second wedge in the band; an animated polygon; the old `100% 88%` floor cut |
| **Home, needs section** (pastel cards) | card corner cut `40 / 27` / `40 / 27` / `64 / 43.2`; accent arrow per card | watermark; a lean on the pill toggle; a second angled element per card; accent *text* on a tint (use `--ox-accent-deep`) |
| **Home, advisory band** (faded photo cards) | band edge `72 / 48.6` / `96 / 64.8` / `180 / 121.4`; 236°/124° scrim; one watermark at 200 / 240 / 420 | a corner cut on the cards (the band edge is the section's one gesture); text below the 72 % scrim stop |
| **Home, brand band, CTA band** | one stepped band edge `72 / 48.6` / `96 / 64.8` / `180 / 121.4`; the CTA is `.ox-cta-wedge` `44 / 29.7` / `44 / 29.7` / `48 / 32.4` | two wedges; a watermark *and* a band edge in the same section |
| **Home, product rails, posters, guides, brands, newsletter** |, . Product cards are conventional (BUILD 3.3: browse vs buy) | any lean, any notch, any watermark on a product card |
| **Listing** (`/$slug/c$id`) | featured rail cover tiles: corner cut `40 / 27` / `48 / 32.4` / `64 / 43.2`; filter and sort chips: notch `t 4 / j 14.0` | angles on the grid, on the card, on the pagination; a watermark |
| **Listing, empty** | mark figure 120 / 140 / 180 in `--ox-plate-2` | accent on the figure |
| **PDP, physical** | `ox-angled` blocks at `44 / 29.7`, `48 / 32.4`, `52 / 35.1`, `56 / 37.8` (`_b3-product.scss` sites in 2.4), **one per block**; price notch `t 4 / j 14.0` | a wedge in the gallery; a lean on a variant chip; a watermark near the buy column |
| **PDP, booking / service** | slot grid: selected slot notch `t 4 / j 14.0`; the service hero takes one band edge `72 / 48.6` / `96 / 64.8` / `180 / 121.4` | an angled slot; animation on a slot; two gestures in the booking block |
| **Booking confirmation, thank-you** | one watermark 200 / 240 / 420 on the confirmation panel | any lean (the page is a receipt); accent on the watermark over the order summary |
| **Cart** |, . Conventional, per BUILD 3.3 | every angled primitive; the watermark; the mark figure except in the empty state |
| **Account** |, . List rows 72 tall; `EmptyState` per surface at 120 / 140 / 180 | every angled primitive |
| **Services hub** | hero band edge `72 / 48.6` / `96 / 64.8` / `180 / 121.4`; faded photo cards as 4.5 | a corner cut on the cards as well as the band edge |
| **About** | one band edge `72 / 48.6` / `96 / 64.8` / `180 / 121.4`; one watermark 200 / 240 / 420 in a *different* section | both in one section |
| **Contact** |, . Form surfaces are straight | every angled primitive; a watermark behind a form field |
| **Branch** | photo panel corner cut `96 / 64.8` / `120 / 80.9` / `180 / 121.4` | a second wedge; a lean on the map |
| **Blog index / article** | index: one band edge at the head, `72 / 48.6` / `96 / 64.8` / `180 / 121.4`. Article: the list bullet (4.4) and nothing else | any lean inside prose; an angled pull-quote; a watermark under body copy |
| **Brands** | brand plates are straight; one watermark on the page head | a corner cut on a brand plate |
| **Search / zero results** | suggestions panel straight; zero-results mark figure 120 / 140 / 180 | angled suggestion rows |
| **404** | mark figure 200 / 240 / 360 in `--ox-plate-2`; the CTA is `.ox-cta-wedge` | accent on the figure; motion on the figure |
| **Checkout, any Salla-native component** |, . Untouched | everything |

**Amendment to BUILD.md 3.3.** The PDP and Listing rows above put
`ox-angled` primitives and corner cuts on surfaces 3.3's HARD
browse-versus-buy rule reserves for "white cards, equal heights, square
corners, **no `clip-path`**". This document's preamble already claims
precedence over 3.3 and owner note 4 proposed a one-line fix; the actual line
is: **3.3's "no `clip-path`" clause does not apply to the specific, named
primitives this document lists for PDP and Listing**, the featured rail
corner cut, the PDP `ox-angled` action blocks and price notch, and the
booking slot notch, **and applies unchanged to everything else 3.3 already
covers**: the product grid, the card itself, pagination, and every surface
this section marks "Forbidden: angles on the grid, on the card, on the
pagination." Browse-versus-buy stays the rule; the identity system adds a
short, enumerated exception list to it rather than opening the surface wholesale.

---

## 7. Gates

### 7.1 `scripts/check-identity.mjs`

Same shape as `check-rtl.mjs` and `check-motion.mjs`: exports `ALLOWLIST` and
`RULES`, reuses `listFiles`, `isAllowed`, `stripComments`, `hasPragma` and the
SCSS selector resolver from `check-rtl.mjs` / `check-motion.mjs`, prints one
finding per line as `file:line [rule] text`, exits 1 on any finding. Default
scope `app`, allowlist = the inherited Raed stylesheets `app/styles/01-` through
`05-` only.

| Rule | Fails on |
|---|---|
| `angle-value` | any `rotate(…)`, `skew(…)`, `skewX(…)`, `skewY(…)` or `--ox-angle*` declaration whose degree value, taken modulo 180 and with `var(--direction-factor)` factored out, is not one of **0, 34, 56, 90** |
| `angle-tan` | any numeric literal used as an angle tangent that is not `0.6745` (catches a stale `0.404` and any hand-rolled ratio) |
| `polygon-slope` | any `polygon()` edge that is neither axis-aligned nor 34 ± 0.6° from vertical. Percentage pairs cannot be resolved statically, so a polygon whose points are percentages must carry a `/* identity: 34deg, run N of M */` pragma naming the computed run; missing pragma is a finding |
| `one-angled-per-block` | more than one selector inside the same top-level block family (`.ox-<block>…`) carrying an angled primitive, a non-axis `polygon`, a `skew`, or an `@include` of `ox-angled` / `ox-wedge*` / `ox-lean-corner` / `ox-step-edge` |
| `small-angle` | an angled primitive in a rule that also declares `block-size`, `min-block-size` or `height` below **158px** (the 3.2 law). A notch, an axis-aligned polygon, is never a finding |
| `section-identity` | a home section block (`app/components/home/*.tsx` + its `06-ox` block) with **no** accent declaration (`--ox-accent`, `--ox-accent-dark`, `--ox-accent-deep`), **no** angled primitive and **no** `.ox-watermark` |
| `unmirrored` | a `skew` not wrapped in `calc(var(--direction-factor) * …)`, or a `polygon` with no `[dir='ltr']` counterpart in the same file |
| `mark-drift` | the `d` of `#ox-mark` in `app/assets/ox-sprite.svg` not byte-equal to the string in section 1.6 |
| `watermark-contrast` | a `.ox-watermark` rule whose opacity exceeds the ceiling in 4.1 for the ground named in the same block |
| `focus-clipped` | a rule combining an angled primitive (a non-axis `polygon`, a `skew`, or an `@include` of `ox-angled` / `ox-wedge*` / `ox-lean-corner`) with `@include ox-focus` (or a bare `outline:`) **on the same selector**, with no `::before`/`::after` in the same block to carry the clip instead. This is a live finding today: `app/styles/06-ox/_primitives.scss:174-179`'s `ox-focus` mixin emits `outline` + `outline-offset`, and `clip-path` clips an element's outline, so `.ox-btn--s40/s44/s48` currently paint no visible focus ring at all |

Wire it into the same place `check-rtl` and `check-motion` run.

**Focus-visibility mechanism (3.4/`focus-clipped`).** A clipped element's
outline is itself clipped, WCAG 2.4.7/2.4.11 need a ring that survives the
cut. The fix: move the `clip-path` to a `::before` that paints the fill, and
keep `outline`/`outline-offset` on the **unclipped** button box (or,
equivalently, draw the ring as an `inset box-shadow` sized inside the clip).
Either mechanism is legal; a rule that clips the element carrying the outline
is not. **Residual hit area after a notch**, against DIRECTION 5's 44 × 44
project rule (not 24): a corner cut of run `R` removes a right triangle of
legs `R`/`lean` from one corner of the drawn box; the *hit area* is not
reduced to match, because `ox-hit-area`'s `::after` already draws a
rectangular 44 × 44 target independent of the visible clip, the drawn shape
may be smaller than 44 × 44 at its cut corner, the tappable box never is.

### 7.2 Unit tests for the mark geometry

`tests/brand/markGeometry.test.ts`, parsing both `d` strings from section 1.6
with no SVG library, the paths are `M x y L x y … Z` and nothing else.

1. **Shape**: 4 subpaths; vertex counts 5, 5, 4, 4; every command is `M`, `L`
   or `Z`; no `C`, `Q`, `A`, `H`, `V` or relative command.
2. **Angles**: all 18 edges classify as horizontal (`|Δy| < 0.01`) or 34°;
   exactly **8 horizontal and 10 angled**; every angled edge is
   `34.00 ± 0.05°` from vertical (measured worst case: 0.039 on the 24 path,
   0.023 on the 512 path). No edge is vertical, 22°, 45° or 56° from vertical.
3. **Box**: the 24 path's bbox is `x 0 → 24`, `y 1.393 → 22.607` (± 0.001); the
   512 path's is `x 9.28 → 502.56`, `y 30 → 466`.
4. **Ledges**: the eight horizontal edges sit at y **30, 154, 198, 222, 246,
   278, 338, 466** on the 512 path and nowhere else; the crossing slot is
   `246 − 222 = 24`.
5. **Channel**: the two chevrons do not intersect, and the perpendicular gap
   between them is `15.25` and `15.10` (± 0.1), measured as the distance
   between the NW end edge and the NE chamfer, and the SW chamfer and the SE
   start edge.
6. **Scale invariance**: mapping the 512 path with
   `x' = (x − 9.28)·0.0486539`, `y' = (y − 30)·0.0486539 + 1.393`
   reproduces the 24 path to ± 0.002 on every vertex.
7. **Contract**: `OX_ICON_NAMES` in `app/components/common/Icon.tsx` contains
   `mark`, and `#ox-mark` exists in the sprite. (Not `OX_BRAND_ICON_NAMES`: the
   mark is UI furniture drawn sparingly, not a category/trust symbol, so it
   lives in `OX_UI_ICON_NAMES`, verified live, `Icon.tsx`'s brand list does
   not contain it. An earlier draft of this test asserted the wrong list and
   would fail against current code.) While here: `Icon.tsx`'s own comment
   above `OX_UI_ICON_NAMES` calls the mark "29 straight-edged vertices"; 1.6's
   path has **18** (5 + 5 + 4 + 4 across the four subpaths, matching "All 18
   edges" in 1.4), that comment is corrected in the same edit.

---

## 8. Owner notes

1. **The PNG's orange is not the design accent, and it is the *dark* step.**
   `optimalx-mark-512.png` is `#CE3B10` (4.93 : 1 on white). `--ox-accent` is
   `#F54915` (3.59 : 1). `--ox-accent-dark` is `#D03709` (4.96 : 1), the PNG
   is within 0.6 % of the dark step and 37 % darker than the accent. The tokens
   are **not** changed (the brief says so, and the dashboard owns the storefront
   orange anyway). **Decision needed:** should the exported logo files be
   re-rendered at `#F54915` so the mark in the header matches the buttons
   beside it? Today they do not, and on a white header it is visible.

2. **The angle change is 25 call sites** (2.4): the hero, five `06-ox`
   stylesheets and every `.ox-cta-wedge`. It cannot be done half way, a 22°
   wedge beside a 34° strap looks broken in a way neither angle does alone.
   **Decision needed:** ship it in one batch, or revert to 22° and change the
   logo. There is no third option.

3. **The full-height diagonal is gone.** At 34° it cannot fit (2.3). Every
   hero-scale edge becomes a vertical run plus a 34° lean terminated by a
   ledge. This is closer to the mark than the current design is, but it is a
   visible change to the hero the owner has already approved at 22°.

4. **BUILD.md 3.3 says 22°; BUILD.md 3.5 says 34°.** The same document carries
   both. 3.5 is right and 3.3 needs a one-line amendment. DIRECTION.md 4.5's
   wedge table needs replacing wholesale with section 2.4 and 2.5 above.

5. **The mark is not two bars.** It is two chevrons that never touch, separated
   by a constant 18.3 px channel that jogs 83.8 px on a 24 px ledge. Anyone
   redrawing it, a favicon, an app icon, an OG image, an embroidered polo -
   must keep the channel constant and must keep the jog. Tapering the channel
   or closing the crossing destroys the only thing that makes it this mark.

6. **Handoff, surfaces this spec does not touch, because other builders hold
   them right now:** `app/components/home/{OxServices,PlanCard,OxBrands,
   OxNewsletterBlock,OxCtaBand,defaults}.tsx` (S2c), `app/components/listing/**`
   (S2d), `app/components/product/**`, `app/components/layout/Header/**`,
   `app/components/seo/**`, `app/routes/**`, and every sprite symbol except
   `ox-mark`. The list bullet symbol (4.4), the `ox-notch` / `ox-lean-corner` /
   `ox-step-edge` mixins (3.4), the token rewrite (2.1) and the 25 call sites
   (2.4) are all handoff items with owners to be assigned.

7. **Strings.** Nothing in this spec adds a user-facing string. If the 404 or an
   empty state needs new copy, the keys go in `locales/partials/xid.ar.json` and
   `xid.en.json` and identically in `locales/ar.json` and `locales/en.json`. No
   existing locale value is edited.

---

## 9. Judge changes applied (2026-09-22, session continuation)

One line per judge finding. Arithmetic is shown where a finding is corrected;
a reason is shown where a finding is refused or resolved by deletion instead
of by adding a number.

1. `--ox-bar-w` 0.225→**0.230** (113.50/493.28 = 0.2301); comment now says
   "fraction of the mark's width (493.28)"; §1.5's line changed to "23.0 % of
   the mark's width" (mean of §1.5's own %-column 23.3/23.8/22.2/22.7 = 23.0).
   Applied in §2.1 and §1.5, and mirrored into `app/styles/tokens.css`.
2. `--ox-step-j` now `calc(var(--ox-step-H) * 0.1924)`, driven off a new
   `--ox-step-H` rather than off the clamped `--ox-step-h`, reproduces §3.1's
   table exactly at every row (H44→8.5, H560→107.7), so the table was not
   rebuilt, only the token. Applied in §2.1, confirmed against §3.1.
3. §3.3's eight notches rewritten to `j = 3.49·t`; every `t3` raised to `t4`
   (illegal below the clamp floor). Also states which `H` actually drove the
   need card's pre-fix `t4/j12.3`/`t6.6/j23.1` (3.1's own `H=64`/`H=120` rows,
   not the card's own 180–220 block-size) and flags, without silently
   redesigning, that a spec-faithful read gives `t 9.9–12.1 / j 34.6–42.3`.
4. RTL/LTR hero polygons swapped to match `ox-wedge($side: start)`,
   `tokens.css:378-380` and DIRECTION 4.5. Applied in §2.5.
5. The "does not have to be restated" sentence deleted (false: 864×500 gives
   35.98°, not 34.00°, at the same two percentages); replaced with the
   `/* identity: 34deg, run 202.4 of 864 */` pragma §7.1 requires and a
   "valid only at pane 864×560" statement. Applied in §2.5.
6. §4.3's 404/empty-state figure recomputed: 1.05/0.84068 = **1.2490:1**,
   outside the 1.2 ceiling. Kept `#E6E6E5` and wrote an explicit, named
   exemption rather than swapping to `#EFEFEF`, because the figure is the one
   place the mark is drawn large and pale on purpose and a colour swap is a
   visual change an arithmetic fix should not make unilaterally.
7. §2.5 vs §5.2: deleted §5.2 entirely rather than making it animate.
   The live `.ox-hero__edge` rule carries no `transition`/`animation` today,
   so deletion matches the built code; §2.5's "never animates" stands.
8. Resolved as a consequence of 7: with §5.2 gone, no above-the-fold element
   mounts at `opacity: 0`, so §5.1's CLS/SSR claim in 5.1 no longer needs a
   strap-specific carve-out.
9. Added an explicit exemption to §2.3: a thin parallelogram **bar**'s run is
   its own travel, not a bite out of its own inline-size, so the hero strap
   (1687 %) and footer wedge bars (809 %/867 %) do not violate the 24 % budget.
10. §3.2 rewritten to apply the floor to band/panel-scale cuts only, with a
    named exception list (sized CTA buttons, footer wedge bars, the section
    divider) verified against the live `_primitives.scss:441-443` rule the
    original wording forbade. §7.1's rule table already matches (`small-angle`
    already read "an angled primitive... below 158px", unchanged in substance,
    now correctly scoped by 3.2's own text).
11. §2.4's "old values" table re-verified live: `_b2-home.scss:1673,1890` are
    `.ox-plan__cta` and an accent gradient, not `ox-angled(44px)`, which the
    session-drifted file now carries at `:2121`, corrected, not copied
    forward. Added the seven missing rows (`_primitives.scss` ×6,
    `_b4-listing.scss:744`, `_b6-commerce.scss:560`, `_blocks.scss:32,96`) and
    the live re-count of 18 `ox-angled` sites.
12. `.ox-btn--s40/s44/s48` padding-inline rows added to the same table:
    32→**43.0**, 34→**45.7**, 36→**48.4** (run + 16), `_primitives.scss:441-443`.
13. §2.2's pair list relabelled "a selection" and `27:40` added by name (the
    pair the build already ships, need cards and featured rail tiles at
    320/390) alongside 25:37, 33:49, 52:77, 56:83, 64:95, 68:101.
14. §1.2's NE/SW chamfer free-fit cells corrected to **+0.5000 (26.57°)** and
    **+0.5643 (29.44°)**, replacing the wrong +0.325/blank and +0.7054/35.20°.
15. §7.2 test 7 changed to assert `OX_ICON_NAMES` (the mark is in
    `OX_UI_ICON_NAMES`, verified live against `Icon.tsx`, not
    `OX_BRAND_ICON_NAMES`). `Icon.tsx:86`'s "29 straight-edged vertices"
    corrected to 18, matching §1.6.
16. §1.5's "1.75 bar thicknesses" corrected to **1.71** (194.20/113.50 =
    1.7115) in §1.3, where the sentence actually lives. §1.5's ledge-run row
    split into two distinct quantities (14.9 = NE ledge shortening; SW
    chamfer's own horizontal extent = 34.32, not interchangeable with 14.9).
17. §5's preamble, §5.1 and §4.2 trimmed back to the one reveal DIRECTION
    7.1/7.2 and BUILD.md 3.4 already sanction (needs/goals grid), rather than
    adding a new amendment clause claiming authority over both documents.
18. §4.1's contrast table rewritten to drop every `--ox-accent` row (BUILD 3.1,
    which this document's own preamble does not amend) in favour of
    `--ox-ink`/`--ox-ink-on-dark`; §4.6 corrected to match. The live
    `_b2-home.scss` `.ox-plan__watermark` violation this document caused is
    named and handed to S2c in `docs/build/progress/XID.md` rather than edited
    here (S2c's file, out of this batch's write scope).
19. Added a named, enumerated amendment to BUILD.md 3.3's "no `clip-path`"
    clause (the featured rail corner cut, the PDP `ox-angled` blocks and price
    notch, the booking slot notch only) rather than stripping the PDP/Listing
    rows, per owner note 4's own proposal.
20. §4.4 dropped: BUILD 3.5 names chevrons as a `sallaicons` case by name, and
    `Icon.tsx`'s own standing comment already closed this question the same
    way. No new sprite symbol; the S2a handoff is closed, not pending.
21. Added the render-path clause to §4.1 (`<use href="#ox-mark"/>` or a `mask-
    image` with an inline `data:` SVG; never `url()`, never `<img>`, no new
    render-blocking asset), resolving §8.6's unassigned-owner note.
22. Added the focus-visibility clause to §3.4 and the `focus-clipped` rule to
    §7.1, naming the live finding (`_primitives.scss:174-179`'s `ox-focus` on
    a clipped `.ox-btn--sNN`) and the fix (clip on `::before`, outline on the
    unclipped box, or an inset `box-shadow`), plus the residual-hit-area note
    (`ox-hit-area`'s 44×44 target is independent of the visible clip).
23. Added the browser-floor/reflow clause to §5.3: `-webkit-` twins plus an
    `@supports not (clip-path: …)` fallback to a square box, Safari 14 as the
    named floor, and a 200 % zoom / WCAG 1.4.10 statement at 320/390/640
    effective width.
