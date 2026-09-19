import type { HomeComponentData } from '@salla.sa/twilight-theme-engine/types';

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

/** Registry paths, in DIRECTION 6.2 order. The `home.` prefix is stripped by the loader. */
export const HOME_BLOCK_PATHS = [
  'ox-hero',
  'ox-trust-strip',
  'ox-goals',
  'ox-categories',
  'ox-products',
  'ox-brands',
  'ox-services',
  'ox-guides',
  'ox-branch',
  'ox-faq',
  'ox-newsletter',
  'ox-banner',
] as const;

export type HomeBlockPath = (typeof HOME_BLOCK_PATHS)[number];

/**
 * Reserved heights, at 390 and at 1440.
 *
 * DIRECTION 6.2 sketched these before the blocks existed. Both columns are
 * now MEASURED off the rendered page, desktop at a 1425 viewport and mobile at
 * a 375 one, with the mobile figure adjusted for the slightly wider 390 column
 * the table is defined at. The reserved box is only a pre-mount `min-height` that the
 * lazy shell releases once the block mounts, so a number that does not match
 * the built block is a one-off jump at exactly the moment the shopper is
 * reading. Five rows moved, and each for a reason worth writing down:
 *
 * - `ox-trust-strip` grew: the cells are the shared statistic strip now, so
 *   the caption sits under a centred glyph instead of beside it, and on a
 *   phone both caption lines wrap inside a 179px cell.
 * - `ox-services` grew a lot: 6.2 assumed a 220px channel card, and a real one
 *   with its meta line, its three-line description, its price and its button
 *   is half as tall again. The band also carries the lockup now.
 * - `ox-branch` shrank a lot: the storefront photograph is gated and the theme
 *   ships none, so the block renders the flat card. The 810 / 480 that the
 *   table reserved for a photo panel was mostly empty box.
 * - `ox-categories` and `ox-faq` moved by a few pixels, to what they measure.
 *
 * Re-measure these whenever a block's composition changes. A guess here is
 * indistinguishable from a bug to the person reading the page.
 */
export const HOME_BLOCK_HEIGHTS: Record<HomeBlockPath, { mobile: number; desktop: number }> = {
  'ox-hero': { mobile: 500, desktop: 560 },
  'ox-trust-strip': { mobile: 208, desktop: 88 },
  'ox-goals': { mobile: 512, desktop: 280 },
  'ox-categories': { mobile: 932, desktop: 668 },
  'ox-products': { mobile: 508, desktop: 630 },
  'ox-brands': { mobile: 64, desktop: 80 },
  'ox-services': { mobile: 1416, desktop: 704 },
  'ox-guides': { mobile: 485, desktop: 556 },
  'ox-branch': { mobile: 212, desktop: 240 },
  'ox-faq': { mobile: 392, desktop: 424 },
  'ox-newsletter': { mobile: 320, desktop: 300 },
  'ox-banner': { mobile: 268, desktop: 240 },
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
  'ox-trust-strip': { items: [] },
  'ox-goals': {},
  'ox-categories': { categories: [] },
  'ox-products': { title: null, products: [] },
  'ox-brands': { brands: [] },
  'ox-services': { image: null, title: null, intro: null },
  'ox-guides': { title: null },
  'ox-branch': {},
  'ox-faq': { items: [] },
  // No fields: the shared newsletter block renders `ox.newsletter.*` and takes
  // no title or body prop, so a dashboard field could not reach the markup.
  'ox-newsletter': {},
  'ox-banner': { image: null, url: null, line: null },
};

/**
 * The default composition: the twelve blocks in DIRECTION 6.2 order, each
 * carrying its manifest defaults. `ox-banner` is present and renders nothing
 * until the merchant uploads an image, which is what "off in the default
 * composition" means in the 6.2 table (its row reserves 0 on both viewports).
 */
export const DEFAULT_HOME_COMPONENTS: HomeComponentData[] = HOME_BLOCK_PATHS.map((path) => ({
  path,
  key: `default-${path}`,
  ...HOME_BLOCK_FIELDS[path],
})) as HomeComponentData[];

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
