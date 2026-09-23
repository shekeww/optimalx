import { useMemo, useRef, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { SectionHeader } from '../common/SectionHeader';
import { useRailProgress } from '../common/hooks/useRailProgress';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { useTaxonomyLinks } from '../listing/useTaxonomyLinks';
import { HOME_CAROUSEL, contentHref, posterHref } from '../../content/posters';
import { ContentPosterCard, PosterCard } from './PosterCard';
import { useSectionReveal } from './useSectionReveal';
import { fieldText, type OxBlockData, type OxBlockProps } from './defaults';

/**
 * The number of cards visible at 1024 (owner review 2026-09-23 late night,
 * item 2: "1.15 cards visible at 390 ... 2 at 768, 3 at 1024, 4 at 1440") —
 * where `SectionHeader`'s own `actions` slot first shows the arrows, and the
 * step every press moves, same convention `OxBrands`/`OxCategoryRail` use.
 */
const STEP_AT_DESKTOP = 3;

/**
 * The eleven slides with every destination and every string resolved: an
 * offer's merchant field first (`image_N`/`link_N`/`alt_N`, N its own 1-6
 * number), the content map second; a content card's literal route or its
 * taxonomy link.
 */
function useCarouselCards(fields: OxBlockData) {
  const { t } = useTranslation();
  const { bySlug } = useTaxonomyLinks();
  return useMemo(
    () =>
      HOME_CAROUSEL.map((entry) => {
        if (entry.kind === 'content') {
          const { card } = entry;
          return {
            kind: 'content' as const,
            card,
            to: contentHref(card, (slug) => bySlug(slug)),
            title: t(card.titleKey),
            line: t(card.lineKey),
          };
        }
        const { card, offerNumber: n } = entry;
        const ownImage = fieldText(fields, `image_${n}`);
        return {
          kind: 'offer' as const,
          card,
          photo: ownImage || card.photo,
          to: fieldText(fields, `link_${n}`) || posterHref(card, 'home', (slug) => bySlug(slug)),
          alt: fieldText(fields, `alt_${n}`) || t(card.altKey),
          // A merchant-uploaded image is available the moment the owner sets
          // the field, whether or not `scripts/posters-import.mjs` has ever
          // run: `card.available` only tracks the SIX DEFAULT files this repo
          // ships, never a URL the dashboard supplies on top of them.
          available: Boolean(ownImage) || card.available,
        };
      }),
    [fields, bySlug, t]
  );
}

/**
 * The "اكتشف أكثر" carousel (owner items 2026-09-24): ONE rail of two kinds
 * of card, alternating offer, content, offer, content from the InBody offer
 * (`HOME_CAROUSEL`, docs/build/progress/S8a.md). The six offers are
 * marketing posters, each an image the owner supplies with its own baked-in
 * headline, offer and CTA (docs/build/progress/S7a.md); the five content
 * cards are the theme's own photograph, title, line and angled arrow. Both
 * sit on the shared rail primitive (owner review
 * 2026-09-23 late night, item 2), sized so 1.15 of a card shows at 390 (a
 * peek of the next one), 2 at 768, 3 at 1024, 4 at 1440 — see the width
 * arithmetic in `_b2-home.scss` §17.2. A scroller that ends flush at the
 * container's edge looks finished when it is not, and every retail app this
 * market has learned shows the next card instead.
 *
 * **Native scroll, no JavaScript per frame.** `scroll-snap-type: x mandatory`
 * (`.ox-rail__track`, `_rail.scss`) on the track and `scroll-snap-align:
 * start` on each card. There is no autoplay: nothing on this page moves
 * under a thumb, and a carousel that advances itself is the one interaction
 * pattern the spec bans outright. The prev/next pair (1024 and up, through
 * `SectionHeader`'s own `actions` slot) and the rail's own chevron cue are a
 * desktop affordance over the same native scroll, so a pointer user is not
 * asked to drag. No native scrollbar draws under the row; the progress strap
 * takes its place.
 *
 * The row bleeds: the track starts at the container's inline start and runs
 * off the trailing edge of the screen, which is what makes the partial card
 * read as "there is more that way" rather than "this box is clipped". The
 * header (title and, from 1024, the arrow pair) stays inside `.ox-container`
 * above it, same split `OxBrands` uses for its own full-bleed background.
 *
 * **Destinations, merchant field first, content map second.** Each offer
 * poster's `image_N`/`link_N`/`alt_N` merchant field (`twilight.json`,
 * `home.ox-posters`, N = the offer's own 1-6 number, not its slide position)
 * overrides the content map's own `photo`/`to`/`altKey` when the owner has
 * filled it from the dashboard; with none, `posterHref()` resolves the
 * default (a live category for the one poster that needs it, `/offers`
 * elsewhere). A content card links its literal route or its taxonomy node
 * through the same `useTaxonomyLinks()` every goal and type link uses
 * (`contentHref()`). `label`/`label_en` override the section's own title,
 * per the active locale.
 */
export function OxPosters({ data }: OxBlockProps) {
  const { t, locale } = useTranslation();
  const reducedMotion = useReducedMotion();
  const revealRef = useSectionReveal<HTMLUListElement>();
  const trackRef = useRef<HTMLUListElement>(null);
  const railRef = useRailProgress(trackRef);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [startIndex, setStartIndex] = useState(0);

  const fields: OxBlockData = data ?? { path: 'ox-posters' };
  const cards = useCarouselCards(fields);

  const label =
    locale === 'en'
      ? fieldText(fields, 'label_en') || fieldText(fields, 'label') || t('ox.home.posters_title')
      : fieldText(fields, 'label') || t('ox.home.posters_title');

  const maxStart = Math.max(0, cards.length - STEP_AT_DESKTOP);
  const showNav = cards.length > STEP_AT_DESKTOP;

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
    <section className="ox-posters" data-testid="ox-posters">
      <div className="ox-container">
        <SectionHeader
          // "اكتشف أكثر" over a subline naming both kinds of tile: offers,
          // products and services (owner item 2026-09-24, S8a; the title
          // is distinct from the offers grid's own, UX-2026-09-24 P0-11).
          title={label}
          subline={t('ox.home.posters_lead')}
          actions={
            showNav ? (
              <div className="ox-posters__nav">
                <button
                  type="button"
                  className="ox-posters__arrow"
                  onClick={() => goTo(startIndex - STEP_AT_DESKTOP)}
                  disabled={startIndex === 0}
                  aria-label={t('ox.home.posters_prev')}
                >
                  <span className="ox-posters__arrow-face ox-iconbtn--angled" aria-hidden="true">
                    <Icon name="chevron-start" size={16} />
                  </span>
                </button>
                <button
                  type="button"
                  className="ox-posters__arrow ox-posters__arrow--next"
                  onClick={() => goTo(startIndex + STEP_AT_DESKTOP)}
                  disabled={startIndex >= maxStart}
                  aria-label={t('ox.home.posters_next')}
                >
                  <span className="ox-posters__arrow-face ox-iconbtn--angled" aria-hidden="true">
                    <Icon name="chevron-end" size={16} />
                  </span>
                </button>
              </div>
            ) : undefined
          }
        />
      </div>
      {/* The track sits outside the container so it can run off the trailing
          screen edge; the width formula (`_b2-home.scss` §17.2) measures
          against the same container the header above uses, so the first
          card still lines up with it. `.ox-rail` (`_rail.scss`) supplies the
          no-scrollbar track, the chevron cue and the progress strap; the
          reveal stagger keeps targeting the track itself (`revealRef`), so
          its own `--i`-staggered children are unaffected by the new wrapper. */}
      <div className="ox-rail ox-posters__rail" ref={railRef}>
        <ul
          className="ox-rail__track ox-posters__track ox-reveal"
          ref={(node) => {
            revealRef.current = node;
            trackRef.current = node;
          }}
          role="list"
          aria-roledescription={t('ox.listing.featured_carousel_role')}
        >
          {cards.map((entry, index) => (
            <li
              className="ox-posters__slide"
              key={entry.card.slug}
              style={{ ['--i' as string]: String(index) }}
              ref={(node) => {
                itemRefs.current[index] = node;
              }}
              aria-roledescription={t('ox.listing.featured_slide_role')}
              aria-label={t('ox.home.posters_slide_label', {
                index: index + 1,
                total: cards.length,
              })}
            >
              {entry.kind === 'offer' ? (
                <PosterCard
                  slug={entry.card.slug}
                  photo={entry.photo}
                  srcSet={entry.card.srcSet}
                  to={entry.to}
                  alt={entry.alt}
                  available={entry.available}
                  loading={index < 2 ? 'eager' : 'lazy'}
                />
              ) : (
                <ContentPosterCard
                  slug={entry.card.slug}
                  photo={entry.card.photo}
                  photoWidth={entry.card.width}
                  photoHeight={entry.card.height}
                  title={entry.title}
                  line={entry.line}
                  to={entry.to}
                />
              )}
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="ox-rail__cue"
          onClick={() => goTo(startIndex + STEP_AT_DESKTOP)}
          aria-label={t('ox.home.posters_next')}
        >
          <span className="ox-rail__cue-arm" aria-hidden="true" />
          <span className="ox-rail__cue-arm ox-rail__cue-arm--down" aria-hidden="true" />
        </button>
        <div className="ox-rail__progress" />
      </div>
    </section>
  );
}
