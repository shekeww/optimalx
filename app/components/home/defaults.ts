import type { HomeComponentData } from '@salla.sa/twilight-theme-engine/types';
import { HOME_TYPE_SLUGS } from '../../content/categories';

/**
 * The twelve home blocks: their order, their reserved heights and the field
 * values a fresh install renders with.
 *
 * Why this file exists (PLAN-final C2): `virtual:twilight/schema` is the empty
 * module in every production build (theme-engine dist/vite/index.js:341), so
 * `twilight.json` defaults never reach the browser. A merchant who has
 * configured nothing gets an empty `components[]` from the loader, and the
 * route renders `DEFAULT_HOME_COMPONENTS` instead. `tests/home/defaults.test.ts`
 * parses `twilight.json` and asserts that every field value here is the value
 * declared there, so the two can never drift.
 *
 * Every field value is null or empty on purpose. Copy lives in `locales/` and
 * reaches the block as a `t('ox.home.*')` fallback, which keeps one Arabic
 * sentence in one place, keeps `/en` working, and keeps Arabic literals out of
 * `app/` (check:strings). A merchant who types into the dashboard overrides the
 * fallback; a merchant who does not gets the launch copy.
 */

/**
 * Registry paths, in DIRECTION 6.2 order. The `home.` prefix is stripped by
 * the loader.
 *
 * One departure from 6.2, and it is measured rather than felt: the category
 * tiles used to sit between the goals and the products, which put the first
 * price on the page 2,152px down a phone on the heights this file recorded
 * before the homepage rebuild, and still several hundred pixels below the
 * fold after it. A visitor decided whether to stay without ever seeing what
 * the store charges for anything. The goals block stays high, because goal is
 * the axis this store is organised around; the category row is the block that
 * moves, to directly under the products it leads into. `twilight.json`
 * carries the same order and `tests/home/defaults.test.ts` asserts the two
 * agree.
 */
export const HOME_BLOCK_PATHS = [
  'ox-hero',
  'ox-goals',
  'ox-products',
  // The four blocks below were written, committed and never registered, so
  // they had never rendered once, and the page they were written for never
  // existed. They go in here at the rhythm homepage-scale-spec asks for:
  // dense grid, then a full stop, then the connective tissue, then a second
  // grid. The spec also lists the category row third, and that is the one
  // instruction NOT followed: the departure recorded above is measured, the
  // first price is currently 1,662px down (1.85 viewports), and lifting a
  // 246px category block above the products would push it past two screens
  // and undo the fix. Order serves the price, not the numbering.
  'ox-poster',
  'ox-posters',
  'ox-products-secondary',
  'ox-categories',
  // MOVED (S2c, 2026-09-22): directly after the type grid, ahead of the
  // brand strip - the grid asks "which one", this band answers "ask us", and
  // the two belong next to each other more than either belongs next to the
  // brand strip.
  // One rail per type root with products (S2e, 2026-09-22): sits right after
  // the type grid it answers, one registered path drawn up to eight times in
  // `DEFAULT_HOME_COMPONENTS` below.
  'ox-category-rail',
  'ox-services',
  'ox-brands',
  'ox-guides',
  'ox-branch',
  'ox-certifications',
  'ox-faq',
  'ox-newsletter',
  'ox-banner',
] as const;

export type HomeBlockPath = (typeof HOME_BLOCK_PATHS)[number];

/**
 * Reserved heights, at 390 and at 1440.
 *
 * Both columns are MEASURED off the rendered page, desktop at a 1425 viewport
 * and mobile at a 375 one. The reserved box is only a pre-mount `min-height`
 * that the lazy shell releases once the block mounts, so a number that does
 * not match the built block is a one-off jump at exactly the moment the
 * shopper is reading.
 *
 * The homepage rebuild moved five of them, and each is worth writing down:
 *
 * - `ox-trust-strip` shrank: the cells are a glyph beside two lines now, not
 *   a glyph above them, and on a phone the row is one line of a sideways
 *   scroller rather than a two by two grid.
 * - `ox-categories` shrank a long way at the time: the tile was a glyph over
 *   a name, with no 4:3 image plate under it, eight across on a desktop and
 *   two rows of four on a phone. Restyled again since (owner reverts the
 *   "shop by need" merge, 2026-09-22): a tinted tile with an image slot
 *   below the glyph, see the entry's own comment below for the current
 *   number.
 * - `ox-goals` grew: the cards are dark photographic cards with a title, a
 *   line and an action, not 128px icon tiles.
 * - `ox-services` (re-measured again, S2c 2026-09-22): back on a dark band,
 *   but a single tier now — an eyebrow, a title, a subline, the three
 *   photographic doors and one CTA under the row, not the two-tier band that
 *   also carried the three channel cards (those moved to `/services`).
 * - `ox-faq` grew: the block carries the secondary rail beside the accordion,
 *   which is a column of its own on a desktop and a second stack on a phone.
 *   The number reserves for the rail HAVING products, because the live store
 *   has 47 of them; a catalogue with none collapses the rail instead, which
 *   is the smaller and rarer jump.
 *
 * Re-measure these whenever a block's composition changes. A guess here is
 * indistinguishable from a bug to the person reading the page.
 */
export const HOME_BLOCK_HEIGHTS: Record<HomeBlockPath, { mobile: number; desktop: number }> = {
  'ox-hero': { mobile: 480, desktop: 560 },
  // Desktop numbers re-measured on 2026-09-20 off the running page (see
  // scratchpad/measured-2026-09-20.md). The old table reserved 4990px against
  // 4287px of real content, so the page SHRANK by 703px as it loaded, which is
  // a layout shift in the least forgivable direction: everything a shopper was
  // reading jumps upward under them.
  // RESTORED (owner reverts the "shop by need" merge, 2026-09-22): `OxGoals`'
  // own dark-card row again, not `OxNeeds`' goals pane - token arithmetic
  // against `_b2-home.scss`'s "5. GoalCard" section (the restored
  // `.ox-goals__grid`/`.ox-goal` rules), not a live browser measurement.
  //
  // Mobile (358 container, 2-up grid before the 640 breakpoint): SectionHeader
  // stack 54 (h2 ~30 + margin-end 24, no subline on this block) + grid 624
  // (3 rows of a 200 card + two 12 gaps). Total 678.
  //
  // Desktop (1440 viewport, 6-up grid from 1280, card min-block-size 400):
  // header stack 64 (h2 ~40 + margin-end 24) + grid 400 (one row, six goals
  // over six columns). Total 464.
  'ox-goals': { mobile: 678, desktop: 464 },
  // The largest single error in the old table, and in the opposite direction.
  // The rail became an eight-card grid and the reservation never followed, so
  // this block UNDER-reserved by 410px and jumped down on mount.
  'ox-products': { mobile: 1759, desktop: 1040 },
  // RESTORED AND RESTYLED (owner reverts the "shop by need" merge, 2026-09-22):
  // `OxCategories`' own eight-tile grid again, restyled to the owner's
  // reference (icon above the image, every tile tinted) - token arithmetic
  // against `_b2-home.scss`'s "4. OxCategories and CategoryTile" section, not
  // a live browser measurement.
  //
  // Mobile (358 container, 2-up grid): SectionHeader stack 84 (h2 ~30 + row-gap
  // 8 + the view-all link row ~22 + margin-end 24) + grid 668 (4 rows of a
  // 158 tile + three 12 gaps). Total 752.
  //
  // Desktop (1440 viewport, 4-up grid from 1280, tile min-block-size 220):
  // header stack 96 (h2 ~40 + row-gap 8 + view-all ~24 + margin-end 24) + grid
  // 464 (2 rows of a 220 tile + one 24 gap). Total 560.
  'ox-categories': { mobile: 752, desktop: 560 },
  // The campaign poster is gated on a real campaign and renders null until
  // the merchant writes a headline, so it reserves nothing by default. A store
  // running one takes the shift on that block instead, which is the smaller
  // cost and affects nobody today.
  'ox-poster': { mobile: 0, desktop: 0 },
  'ox-posters': { mobile: 362, desktop: 380 },
  'ox-products-secondary': { mobile: 924, desktop: 1040 },
  // A product rail has no honest placeholder for a category that has not
  // resolved to a real Salla id yet (`OxCategoryRail.tsx`), so it renders
  // null, and the live store has zero categories today
  // (`fixtures/store/categories.json`), so every one of the eight default
  // instances is in that state right now. Same reasoning as `ox-brands`/
  // `ox-guides` below.
  'ox-category-rail': { mobile: 0, desktop: 0 },
  // Both of these render nothing today and reserving for them was pure shift:
  // the store has zero brands, and the guides block has no entries. Same
  // reasoning as the newsletter and banner rows below.
  'ox-brands': { mobile: 0, desktop: 0 },
  // Re-measured for the TWO-ROW band (owner review 2026-09-23 (late), item 3;
  // token arithmetic, not a live browser measurement — see
  // docs/build/progress/S4a.md). The row grew from three cards to six (the
  // three channels rejoin the three plan doors), and mobile is no longer a
  // horizontal scroller — it is ONE column of six stacked cards.
  // Mobile (358 container, --ox-12 padding): 48 pad-top + head stack 141
  // (eyebrow row 20 + gap 8 + h2 30 + gap 8 + 2-line subline 51, margin-end
  // 24) + grid 1472 (six 232px cards + five 16px row gaps) + 24 gap + 44 CTA
  // + 16 gap + 20 note + 48 pad-bottom = 1813.
  // Desktop (--ox-16 padding, 1296 container, three-up from 1024 — two rows
  // of three for six cards): 64 pad-top + head stack 135 (eyebrow 20 + gap 8
  // + h2 40 + gap 8 + 1-line subline 27, margin-end 32) + grid 544 (two
  // 260px card rows + one 24px row gap) + 24 gap + 44 CTA + 16 gap + 20 note
  // + 64 pad-bottom = 911.
  'ox-services': { mobile: 1813, desktop: 911 },
  'ox-guides': { mobile: 0, desktop: 0 },
  'ox-branch': { mobile: 268, desktop: 184 },
  // No certification holds the per-product evidence a badge needs, so the
  // resolver returns an empty list and the band renders null.
  'ox-certifications': { mobile: 0, desktop: 0 },
  'ox-faq': { mobile: 371, desktop: 439 },
  // Both of these are off until the merchant turns them on: the newsletter
  // behind the `show_newsletter` setting, the banner behind an uploaded image.
  // Until then each renders null, so reserving their old 320 and 268 put 588px
  // of grey placeholder above the footer on a phone and then collapsed it on
  // scroll, which is the largest layout jump on the page. DIRECTION 6.2 already
  // says the banner's row reserves 0 on both viewports; the map simply did not
  // agree with it. A store that does turn one on takes a shift on that block
  // instead, which is the smaller of the two costs and affects nobody today.
  // `ox-newsletter` is the CTA band's slot too now (OxCtaBand, S2c 2026-09-22):
  // the headline, line and CTA ship behind the same `show_newsletter` gate as
  // the form, so this block is still fully off or fully on, never a headline
  // with no reserved room for the form beneath it. See OxCtaBand's docblock.
  'ox-newsletter': { mobile: 0, desktop: 0 },
  'ox-banner': { mobile: 0, desktop: 0 },
};

/** The two viewports the DIRECTION 6.2 heights are measured at. */
export const HEIGHT_MIN_VW = 390;
export const HEIGHT_MAX_VW = 1440;

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * `clamp(mobile, intercept + slope vw, desktop)`: the block's box grows (or
 * shrinks) linearly between 390 and 1440 and is flat outside that range, so the
 * lazy shell reserves the final height at every width and nothing shifts when
 * the block mounts. `clamp()` needs its smaller bound first, which is the
 * desktop value on the blocks that get shorter as the screen widens.
 */
export function clampHeight(mobile: number, desktop: number): string {
  if (mobile === desktop) return `${mobile}px`;
  const slopePerPx = (desktop - mobile) / (HEIGHT_MAX_VW - HEIGHT_MIN_VW);
  const intercept = round(mobile - slopePerPx * HEIGHT_MIN_VW);
  const slope = round(slopePerPx * 100);
  const middle =
    slope < 0 ? `${intercept}px - ${Math.abs(slope)}vw` : `${intercept}px + ${slope}vw`;
  const low = Math.min(mobile, desktop);
  const high = Math.max(mobile, desktop);
  return `clamp(${low}px, calc(${middle}), ${high}px)`;
}

/** The reserved height string `registerHomeComponentConfig` receives per block. */
export const HOME_BLOCK_HEIGHT_CSS: Record<HomeBlockPath, string> = Object.fromEntries(
  HOME_BLOCK_PATHS.map((path) => [
    path,
    clampHeight(HOME_BLOCK_HEIGHTS[path].mobile, HOME_BLOCK_HEIGHTS[path].desktop),
  ])
) as Record<HomeBlockPath, string>;

export type BlockFields = Record<string, unknown>;

/**
 * Every merchant field of every block, with the value `twilight.json` declares.
 * Field ids and values are asserted against the manifest by the parity test.
 */
export const HOME_BLOCK_FIELDS: Record<HomeBlockPath, BlockFields> = {
  'ox-hero': {
    image: null,
    mobile_image: null,
    video_url: null,
    eyebrow: null,
    headline: null,
    subline: null,
    primary_label: null,
    primary_url: null,
    secondary_label: null,
    secondary_url: null,
  },
  'ox-goals': {},
  'ox-categories': { categories: [] },
  // A single category picker (S2e, 2026-09-22), the same `source: categories`
  // shape `ox-categories`' own field carries, clamped to one row instead of a
  // multichoice - a merchant adding their own rail past the eight defaults
  // picks exactly one category for it. `title` overrides the SectionHeader
  // text; empty falls back to the resolved category's own name.
  'ox-category-rail': { category: [], title: null },
  'ox-products': { title: null, products: [] },
  // The campaign poster's whole gate: no headline, no band.
  'ox-poster': { headline: null, eyebrow: null, line: null, image: null, cta_label: null, cta_url: null },
  // The carousel builds its cards from the catalogue and the goal menu, so it
  // takes no merchant field.
  'ox-posters': {},
  'ox-products-secondary': { title: null },
  // Each row is a badge id and the certificate reference that proves it. A row
  // with no reference is not evidence and the resolver drops it, so an empty
  // reference cannot turn a badge on.
  'ox-certifications': { certifications: [], photo: null },
  // `image` (S2c, 2026-09-22): the owner's generated background, exposed as
  // `--ox-band-image`. Optional; the strip looks finished without it.
  'ox-brands': { brands: [], image: null },
  'ox-services': { image: null, title: null },
  'ox-guides': { title: null },
  'ox-branch': {},
  'ox-faq': { items: [] },
  // Rebuilt as the CTA band (S2c, 2026-09-22): an image slot plus a headline
  // and line that fall back to `ox.home.cta_*`, still behind the one
  // `show_newsletter` gate the bare form used alone (OxCtaBand's docblock).
  'ox-newsletter': { image: null, headline: null, line: null },
  'ox-banner': { image: null, url: null, line: null },
};

/**
 * The default composition: the DIRECTION 6.2 blocks in order, each carrying
 * its manifest defaults. `ox-banner` is present and renders nothing until the
 * merchant uploads an image, which is what "off in the default composition"
 * means in the 6.2 table (its row reserves 0 on both viewports).
 *
 * `ox-category-rail` is the one path this builds MORE than once (S2e,
 * 2026-09-22, "create all categories sections needed in homepage"): one
 * registered block, drawn once per `HOME_TYPE_SLUGS` root, each instance
 * carrying its own `rootSlug` - not a manifest field (`HOME_BLOCK_FIELDS`
 * above declares none), so it never shows up in the dashboard or the parity
 * test, just this file's own signal for which category `OxCategoryRail`
 * resolves through `useTaxonomyLinks` when the merchant's own `category`
 * field is empty. A merchant who does pick one overrides it exactly the way
 * `ox-categories`' own `categories` field already overrides its default row.
 */
function buildDefaultComponents(): HomeComponentData[] {
  const out: HomeComponentData[] = [];
  for (const path of HOME_BLOCK_PATHS) {
    if (path === 'ox-category-rail') {
      for (const slug of HOME_TYPE_SLUGS) {
        out.push({
          path,
          key: `default-${path}-${slug}`,
          rootSlug: slug,
          ...HOME_BLOCK_FIELDS[path],
        } as HomeComponentData);
      }
      continue;
    }
    out.push({ path, key: `default-${path}`, ...HOME_BLOCK_FIELDS[path] } as HomeComponentData);
  }
  return out;
}

export const DEFAULT_HOME_COMPONENTS: HomeComponentData[] = buildDefaultComponents();

/** `ox-hero` from a loader's component list: the C19 sr-only h1 depends on it. */
export const HERO_PATH: HomeBlockPath = 'ox-hero';

/** The loader strips the `home.` prefix, but a dev override may not have. */
export function blockPath(component: { path?: string }): string {
  const path = component.path ?? '';
  return path.startsWith('home.') ? path.slice('home.'.length) : path;
}

export function hasHeroBlock(components: readonly { path?: string }[]): boolean {
  return components.some((component) => blockPath(component) === HERO_PATH);
}

/**
 * True when the merchant's saved composition belongs to this theme.
 *
 * A store that has run another theme keeps that theme's home blocks in the
 * dashboard, and the engine hands them to us on the first load: a list that is
 * not empty but contains none of ours. Rendering it would show the previous
 * theme's composition under our chrome, so the theme treats "no ox block" the
 * same way it treats an empty list and renders its own default home instead
 * (D5: a fresh install must still render a full home). The merchant's own
 * composition wins the moment they place one OptimalX block.
 */
export function hasOxBlock(components: readonly { path?: string }[]): boolean {
  return components.some((component) =>
    (HOME_BLOCK_PATHS as readonly string[]).includes(blockPath(component))
  );
}

/**
 * What a home block actually receives. The renderer passes ONE prop,
 * `data`, with the merchant fields spread flat on it plus `position`
 * (1-based) and `priority` (true for the first three blocks) INSIDE it, not
 * beside it (theme-engine chunk-WITIL2MK.js:672-678). The declared top-level
 * `priority` of `AnyHomeComponent` is never set, so nothing reads it.
 */
export type OxBlockData = HomeComponentData & {
  position?: number;
  priority?: boolean;
  [field: string]: unknown;
};

export interface OxBlockProps {
  data: OxBlockData;
}

/** A merchant text field: trimmed, or '' when unset, null or not a string. */
export function fieldText(data: OxBlockData, id: string): string {
  const value = data[id];
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}

/** A merchant collection or multichoice field, always an array. */
export function fieldList(data: OxBlockData, id: string): unknown[] {
  const value = data[id];
  return Array.isArray(value) ? value : [];
}

/**
 * One value out of a collection row. A collection sends its sub-fields under
 * their FULL manifest id (`items.title`, the shape Raed's testimonials block
 * receives), while a `source: categories` multichoice sends whole API objects
 * with plain keys, so both spellings are accepted.
 */
export function rowText(row: unknown, id: string): string {
  if (!row || typeof row !== 'object') return '';
  const record = row as Record<string, unknown>;
  let value = record[id];
  if (value === undefined) {
    const suffix = `.${id}`;
    for (const key of Object.keys(record)) {
      if (key.endsWith(suffix)) {
        value = record[key];
        break;
      }
    }
  }
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value);
  return '';
}
