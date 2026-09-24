import { useMemo, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { Icon } from '../common/Icon';
import { SectionHeader } from '../common/SectionHeader';
import { nudgeRail } from '../common/nudgeRail';
import { useRailProgress } from '../common/hooks/useRailProgress';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { useTaxonomyLinks } from '../listing/useTaxonomyLinks';
import { ProductsGridWrapper } from '../blocks/ProductsGridWrapper';
import { POSTER_CARDS, posterHref } from '../../content/posters';
import { ProductsGridSkeleton } from './HomeSkeleton';
import { PosterCard } from './PosterCard';
import { resolveSource } from './OxProducts';
import { useSectionReveal } from './useSectionReveal';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The number of posters visible at 1024, where `SectionHeader`'s own
 * `actions` slot first shows the arrows, and the step every arrow press
 * moves: the same tiers and the same step as the "اكتشف أكثر" rail
 * (`OxPosters`). The rail's own cue steps one poster at a time instead
 * (`nudgeRail`), so it reaches the last poster on a phone too.
 */
const STEP_AT_DESKTOP = 3;

/**
 * The six offer posters with every destination and every string resolved:
 * the merchant field first (`image_N`/`link_N`/`alt_N`, N the poster's own
 * 1-6 number), the content map second. A poster with no file of its own and
 * no merchant image is an empty placeholder, and the home leaves it out: the
 * tinted plate with a caption belongs on `/offers`, not in a row a shopper
 * scrolls past.
 */
function useOfferPosters(fields: OxBlockData) {
  const { t } = useTranslation();
  const { bySlug } = useTaxonomyLinks();
  return useMemo(
    () =>
      POSTER_CARDS.map((card, index) => {
        const n = index + 1;
        const ownImage = fieldText(fields, `image_${n}`);
        return {
          card,
          photo: ownImage || card.photo,
          to: fieldText(fields, `link_${n}`) || posterHref(card, 'home', (slug) => bySlug(slug)),
          alt: fieldText(fields, `alt_${n}`) || t(card.altKey),
          // A merchant-uploaded image is available the moment the owner sets
          // the field, whether or not `scripts/posters-import.mjs` has ever
          // run: `card.available` only tracks the six default files this
          // repo ships, never a URL the dashboard supplies on top of them.
          available: Boolean(ownImage) || card.available,
        };
      }).filter((poster) => poster.available),
    [fields, bySlug, t]
  );
}

/**
 * "العروض" (homepage-scale-spec section 8; owner review 2026-09-25): ONE
 * section under ONE heading, first a carousel of the six offer posters,
 * then the grid of the products that carry a reduced price.
 *
 * **The posters.** The same six marketing posters the `/offers` page opens
 * on (`POSTER_CARDS`, `PosterCard`: the image with its own baked-in
 * headline, offer and CTA, the 4:5 box, the two diagonal cuts, the same
 * links), on the shared rail primitive: scroll-snap, no native scrollbar,
 * the chevron cue, 1.15 cards visible on a phone so the next one peeks, 2
 * at 768, 3 at 1024, 4 at 1440 (`_b2-home.scss` §17.2). They used to
 * alternate with the content cards in "اكتشف أكثر"; the owner moved them
 * here so every offer on the home sits under the heading that names them.
 * The row bleeds past the container like the other home rails; the arrows
 * ride the header's own `actions` slot from 1024. With no poster to show
 * (every slot an empty placeholder) the carousel is left out and the
 * section keeps its heading and its products.
 *
 * **The products.** Sourced differently from the first grid, so two grids
 * on one page are not the same eight products twice: `offers` first, the
 * products that genuinely carry a reduced price, falling back to `latest`
 * sorted price-ascending when there are none. A merchant who picks products
 * or a source in the dashboard overrides both, which is what picking one
 * means. The grid renders no heading of its own: the section's heading sits
 * above the posters and speaks for both.
 *
 * **The heading names the door, not a discount.** `العروض` names the
 * section the way the header's own `/offers` item names it, and it claims
 * nothing about a particular product: the badge on a card carries the
 * saving, this heading never does (UX-2026-09-24 P0-11). The whole section
 * follows the same gate the header does (`show_offers_nav !== false`, NAV
 * 1.3), so a store that switches offers off keeps no section called offers,
 * posters included.
 */
export function OxProductsSecondary({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const reducedMotion = useReducedMotion();
  const revealRef = useSectionReveal<HTMLUListElement>();
  const trackRef = useRef<HTMLUListElement>(null);
  const railRef = useRailProgress(trackRef);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [startIndex, setStartIndex] = useState(0);

  const fields: OxBlockData = data ?? { path: 'ox-products-secondary' };
  const posters = useOfferPosters(fields);
  const chosen = resolveSource(fields);
  const curated = chosen.source !== 'latest';
  const title = fieldText(fields, 'title') || t('ox.home.offers_title');
  const showsOffers = (settings as Record<string, unknown> | undefined)?.show_offers_nav !== false;

  if (!showsOffers) return null;

  const maxStart = Math.max(0, posters.length - STEP_AT_DESKTOP);
  const showNav = posters.length > STEP_AT_DESKTOP;

  const goTo = (nextStart: number) => {
    const clamped = Math.min(Math.max(nextStart, 0), maxStart);
    setStartIndex(clamped);
    itemRefs.current[clamped]?.scrollIntoView({
      inline: 'start',
      block: 'nearest',
      behavior: reducedMotion ? 'auto' : 'smooth',
    });
  };

  return (
    <section className="ox-products ox-products--secondary" data-testid="ox-products-secondary">
      <div className="ox-container">
        <SectionHeader
          title={title}
          viewAll={{ to: '/offers' }}
          actions={
            showNav ? (
              <div className="ox-offers-rail__nav">
                <button
                  type="button"
                  className="ox-offers-rail__arrow"
                  onClick={() => goTo(startIndex - STEP_AT_DESKTOP)}
                  disabled={startIndex === 0}
                  aria-label={t('ox.home.posters_prev')}
                >
                  <span className="ox-offers-rail__arrow-face ox-iconbtn--angled" aria-hidden="true">
                    <Icon name="chevron-start" size={16} />
                  </span>
                </button>
                <button
                  type="button"
                  className="ox-offers-rail__arrow ox-offers-rail__arrow--next"
                  onClick={() => goTo(startIndex + STEP_AT_DESKTOP)}
                  disabled={startIndex >= maxStart}
                  aria-label={t('ox.home.posters_next')}
                >
                  <span className="ox-offers-rail__arrow-face ox-iconbtn--angled" aria-hidden="true">
                    <Icon name="chevron-end" size={16} />
                  </span>
                </button>
              </div>
            ) : undefined
          }
        />
      </div>
      {posters.length > 0 ? (
        // Outside the container, so the row runs off the trailing screen
        // edge; the slide width (`_b2-home.scss` §17.2) is measured against
        // the same container the header uses.
        <div className="ox-rail ox-offers-rail" data-testid="ox-offers-rail" ref={railRef}>
          <ul
            className="ox-rail__track ox-offers-rail__track ox-reveal"
            ref={(node) => {
              revealRef.current = node;
              trackRef.current = node;
            }}
            role="list"
            aria-roledescription={t('ox.listing.featured_carousel_role')}
          >
            {posters.map((poster, index) => (
              <li
                className="ox-offers-rail__slide"
                key={poster.card.slug}
                style={{ ['--i' as string]: String(index) }}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                aria-roledescription={t('ox.listing.featured_slide_role')}
                aria-label={t('ox.home.posters_slide_label', {
                  index: index + 1,
                  total: posters.length,
                })}
              >
                <PosterCard
                  slug={poster.card.slug}
                  photo={poster.photo}
                  srcSet={poster.card.srcSet}
                  to={poster.to}
                  alt={poster.alt}
                  available
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="ox-rail__cue"
            onClick={() => nudgeRail(trackRef.current, reducedMotion)}
            aria-label={t('ox.home.posters_next')}
          >
            <span className="ox-rail__cue-arm" aria-hidden="true" />
            <span className="ox-rail__cue-arm ox-rail__cue-arm--down" aria-hidden="true" />
          </button>
          <div className="ox-rail__progress" />
        </div>
      ) : null}
      <div className="ox-container">
        <ProductsGridWrapper
          source={curated ? chosen.source : 'offers'}
          {...(curated && chosen.sourceValue !== undefined
            ? { sourceValue: chosen.sourceValue }
            : {})}
          {...(curated ? {} : { fallbacks: [{ source: 'latest' as const }] })}
          sort="priceFromLowToTop"
          count={8}
          gridId="ox-home-offers"
          skeleton={<ProductsGridSkeleton />}
        />
      </div>
    </section>
  );
}
