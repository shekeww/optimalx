import { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { brand } from '@salla.sa/twilight-theme-engine/api/brands';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { SectionHeader } from '../common/SectionHeader';
import { useRailProgress } from '../common/hooks/useRailProgress';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { BrandTile, isBrand, type BrandWithCount } from '../brands/BrandTile';
import { fieldList, fieldText, type OxBlockProps } from './defaults';
import { useSectionReveal } from './useSectionReveal';

/**
 * The brand strip (DIRECTION 6.2 row 6), rebuilt as a scroll-snap CAROUSEL
 * (owner brief 2026-09-23 late: "complete the design of shop by brand
 * section, carousel and page").
 *
 * What it is now: an h2 (no eyebrow, owner brief 2026-09-24, item 1(a): the
 * section carries the same heading weight as "تصفح حسب النوع", which a
 * second, smaller label row above it would undercut), a "عرض الكل" link to
 * `/brands`, and a horizontal snap carousel of brand tiles, 2.4 visible at
 * 390 so the next tile peeks, 4 from 768, 6 from 1280, gap `--ox-4`. Each
 * tile is `BrandTile`: a plate carrying the mark's own arm-foot corner cut
 * and the brand's artwork or its NAME MARK, no count on the tile (item
 * 1(c); `products_count` still drives the sort below).
 *
 * HIERARCHY (owner brief 2026-09-24 item 2, screenshots, superseding S8d
 * item 1(d)'s position): this section is conversion-critical and is
 * registered directly after `ox-hero` and before `ox-goals` in
 * `DEFAULT_HOME_COMPONENTS` (`defaults.ts`) and in `twilight.json`'s own
 * component order, which the two files keep in lockstep
 * (`tests/home/defaults.test.ts`). Nothing in this component decides its own
 * position; it renders wherever the home composition places the `ox-brands`
 * path.
 *
 * Shown from ONE brand up (owner call, 2026-09-22): the store carries real
 * supplier brands and a single tile still reads as a real strip. Sorted by
 * product count DESC and capped at `MAX_BRANDS` (owner review 2026-09-23,
 * item 4) so the carousel stays browsable once the catalogue carries its
 * twenty-one derived brands (`fixtures/store/overlay/brands.json`).
 *
 * The manifest's `image` field (S2c) is the owner's generated background,
 * exposed as `--ox-band-image` and painted at low opacity behind the header
 * and the row: the tiles stay opaque, so legibility never depends on what
 * the merchant drops in, and the section looks finished with no image at all.
 *
 * Carousel mechanics are `FeaturedRail`'s, deliberately: `startIndex` is the
 * slide aligned to the row's inline-start edge, and `goTo()` scrolls the
 * target slide with `scrollIntoView({ inline: 'start' })` rather than a
 * hand-computed `scrollLeft` delta, so the step is correct in both reading
 * directions with no manual RTL sign flip. The prev/next pair rides
 * `SectionHeader`'s own `actions` slot, which is `display: none` below 1024,
 * so the arrows exist at 1024 and up exactly as the brief asks and touch
 * scroll-snap is the only mechanism below it.
 *
 * Motion: the one kinetic touch is the STRAP SWEEP, the section eyebrow's
 * accent rule opens from its inline-start edge once, on reveal, transform
 * only (`_b2-home.scss`). `useSectionReveal` never arms an element that is
 * already on screen at hydration and returns before observing under
 * `prefers-reduced-motion`, so the SSR html and the first client paint are
 * identical and the strap is simply drawn at full width when motion is off.
 * There is no hover lift anywhere in this section (BUILD 3.4).
 */

export const MIN_BRANDS = 1;
/** The carousel never grows past this many tiles (owner review 2026-09-23, item 4). */
export const MAX_BRANDS = 24;
/**
 * How many tiles the arrows step by, and the row's own overscroll allowance.
 * Four is the number of tiles visible at 1024, the width the arrows first
 * appear at, so one press always moves a full screen of tiles at the tier
 * that has arrows at all.
 */
const STEP_AT_DESKTOP = 4;

export function OxBrands({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion();
  // One reveal for the whole block: the eyebrow's accent rule sweeps open and
  // the rail's chevron cue pulses off the same `data-reveal` attribute, so the
  // section has one kinetic moment rather than two unrelated ones.
  const revealRef = useSectionReveal<HTMLDivElement>();
  const trackRef = useRef<HTMLUListElement>(null);
  const railRef = useRailProgress(trackRef);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [startIndex, setStartIndex] = useState(0);

  const selected = fieldList(data, 'brands').filter(isBrand);
  const { data: group } = useQuery({ ...brand.queries.list(), enabled: selected.length === 0 });

  const source: BrandWithCount[] =
    selected.length > 0 ? selected : (Object.values(group ?? {}).flat() as unknown[]).filter(isBrand);
  const brands = [...source]
    .sort((a, b) => (b.products_count ?? 0) - (a.products_count ?? 0))
    .slice(0, MAX_BRANDS);
  if (brands.length < MIN_BRANDS) return null;

  const image = fieldText(data, 'image');
  const maxStart = Math.max(0, brands.length - STEP_AT_DESKTOP);
  const showNav = brands.length > STEP_AT_DESKTOP;

  const goTo = (target: number) => {
    const clamped = Math.min(Math.max(target, 0), maxStart);
    setStartIndex(clamped);
    itemRefs.current[clamped]?.scrollIntoView({
      inline: 'start',
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section
      className="ox-brands"
      aria-labelledby="ox-brands-title"
      data-testid="ox-brands"
      style={image ? { ['--ox-band-image' as string]: `url("${image}")` } : undefined}
    >
      <div className="ox-container" ref={revealRef}>
        <div className="ox-brands__head">
          <SectionHeader
            title={t('ox.home.brands_title')}
            titleId="ox-brands-title"
            as="h2"
            viewAll={{ to: '/brands' }}
            actions={
              showNav ? (
                <div className="ox-brands__nav">
                  {/* The 44px target is the button; the ANGLED, unfilled face
                      is the `.ox-iconbtn--angled` span inside it, so the clip
                      never sits on the element carrying the focus ring
                      (X-IDENTITY §7.1 `focus-clipped`). The glyph is chosen as
                      it reads in LTR and `.ox-mirror` flips it in RTL, which is
                      this theme's one direction-icon convention. */}
                  <button
                    type="button"
                    className="ox-brands__arrow"
                    onClick={() => goTo(startIndex - STEP_AT_DESKTOP)}
                    disabled={startIndex === 0}
                    aria-label={t('ox.home.brands_prev')}
                  >
                    <span className="ox-brands__arrow-face ox-iconbtn--angled" aria-hidden="true">
                      <Icon name="chevron-start" size={16} />

                    </span>

                  </button>

                  <button
                    type="button"
                    className="ox-brands__arrow ox-brands__arrow--next"
                    onClick={() => goTo(startIndex + STEP_AT_DESKTOP)}
                    disabled={startIndex >= maxStart}
                    aria-label={t('ox.home.brands_next')}
                  >
                    <span className="ox-brands__arrow-face ox-iconbtn--angled" aria-hidden="true">
                      <Icon name="chevron-end" size={16} />

                    </span>

                  </button>

                </div>

              ) : undefined
            }
          />

        </div>

        {/* The shared rail primitive (`_rail.scss`): no native scrollbar, the
            accent chevron cue at the reading end, and the progress strap under
            the row. `useRailProgress` writes the position straight onto the
            wrapper, so a swipe costs no React render. */}
        <div className="ox-rail ox-brands__rail" ref={railRef}>
          <ul
            className="ox-rail__track ox-brands__row"
            ref={trackRef}
            role="list"
            aria-roledescription={t('ox.home.brands_carousel_role')}
          >
            {brands.map((item, index) => (
              <li
                className="ox-brands__item"
                key={item.id ?? item.name}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                aria-roledescription={t('ox.home.brands_slide_role')}
                aria-label={t('ox.home.brands_slide_label', {
                  index: index + 1,
                  total: brands.length,
                })}
              >
                <BrandTile
                  brand={item}
                  sizes="(min-width: 1280px) 203px, (min-width: 768px) 168px, 140px"
                />
              </li>

            ))}
          </ul>

          <button
            type="button"
            className="ox-rail__cue"
            onClick={() => goTo(startIndex + STEP_AT_DESKTOP)}
            aria-label={t('ox.home.brands_next')}
          >
            <span className="ox-rail__cue-arm" aria-hidden="true" />
            <span className="ox-rail__cue-arm ox-rail__cue-arm--down" aria-hidden="true" />
          </button>

          <div className="ox-rail__progress" />
        </div>

      </div>

    </section>

  );
}
