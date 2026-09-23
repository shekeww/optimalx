import { useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import type { Category } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { matchesSlug, useHeaderMenu } from '../layout/Header/useHeaderMenu';
import { useRailProgress } from '../common/hooks/useRailProgress';
import { useReducedMotion } from '../common/hooks/useReducedMotion';
import { CATEGORIES } from '../../content/categories';
import { POSTER_CARDS } from '../../content/posters';
import { PosterCard } from './PosterCard';
import { useSectionReveal } from './useSectionReveal';
import type { OxBlockProps } from './defaults';

/**
 * The number of cards visible at 1024 (owner review 2026-09-23 late night,
 * item 2: "1.15 cards visible at 390 ... 2 at 768, 3 at 1024, 4 at 1440") —
 * where `SectionHeader`'s own `actions` slot first shows the arrows, and the
 * step every press moves, same convention `OxBrands`/`OxCategoryRail` use.
 */
const STEP_AT_DESKTOP = 3;

/**
 * The poster carousel (homepage-scale-spec section 7).
 *
 * The connective tissue between the page's two full stops: five secondary
 * posters, now a carousel on the shared rail primitive (owner review
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
 * Destinations resolve the same way the rest of the page resolves them, so a
 * goal or a type links to one place on the whole page: goals through the
 * header menu, types through the live category list, and both falling back
 * to a search for their own label while the taxonomy does not exist
 * (PLAN-final C15).
 */
export function OxPosters(_props: OxBlockProps) {
  const { t } = useTranslation();
  const { goals } = useHeaderMenu();
  const { data: live } = useQuery(category.queries.list());
  const reducedMotion = useReducedMotion();
  const revealRef = useSectionReveal<HTMLUListElement>();
  const trackRef = useRef<HTMLUListElement>(null);
  const railRef = useRailProgress(trackRef);
  const itemRefs = useRef<Array<HTMLLIElement | null>>([]);
  const [startIndex, setStartIndex] = useState(0);

  const cards = useMemo(() => {
    const all: Category[] = live ?? [];
    return POSTER_CARDS.map((card) => {
      let to = card.to ?? '';
      if (!to && card.goalSlug) {
        to = goals.find((goal) => goal.slug === card.goalSlug)?.to ?? '';
      }
      if (!to && card.categorySlug) {
        const slug = card.categorySlug;
        const content = CATEGORIES.find((candidate) => candidate.slug === slug);
        const label = content ? t(content.h1Key) : slug;
        const match = all.find(
          (item) => typeof item.url === 'string' && matchesSlug(item.url, slug)
        );
        to = match?.url ?? `/search?q=${encodeURIComponent(label)}`;
      }
      return { card, to };
    }).filter((entry) => entry.to !== '');
  }, [goals, live, t]);

  if (cards.length === 0) return null;

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
          title={t('ox.home.posters_title')}
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
                    <i className="sicon-keyboard_arrow_left ox-mirror" />
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
                    <i className="sicon-keyboard_arrow_right ox-mirror" />
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
          {cards.map(({ card, to }, index) => (
            <li
              className="ox-posters__slide"
              key={card.id}
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
              <PosterCard
                id={card.id}
                photo={card.photo}
                photoWidth={card.width}
                photoHeight={card.height}
                eyebrow={t(card.eyebrowKey)}
                title={t(card.titleKey)}
                line={t(card.lineKey)}
                icon={card.icon}
                to={to}
                index={index}
              />
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
