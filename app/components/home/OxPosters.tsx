import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { category } from '@salla.sa/twilight-theme-engine/api/category';
import type { Category } from '@salla.sa/twilight-theme-engine/types';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { matchesSlug, useHeaderMenu } from '../layout/Header/useHeaderMenu';
import { CATEGORIES } from '../../content/categories';
import { POSTER_CARDS } from '../../content/posters';
import { PosterCard } from './PosterCard';
import { useSectionReveal } from './useSectionReveal';
import type { OxBlockProps } from './defaults';

/**
 * The poster carousel (homepage-scale-spec section 7).
 *
 * The connective tissue between the page's two full stops: five secondary
 * posters in a native scroll-snap scroller, sized so 1.3 to 1.5 of the next
 * card shows at the trailing edge. That partial card is the whole reason the
 * row works. A scroller that ends flush at the container's edge looks
 * finished when it is not, and every retail app this market has learned
 * shows the next card instead.
 *
 * **Native scroll, no JavaScript per frame.** `scroll-snap-type: inline
 * mandatory` on the track and `scroll-snap-align: start` on each card. There
 * is no autoplay: nothing on this page moves under a thumb, and a carousel
 * that advances itself is the one interaction pattern the spec bans outright.
 * The arrows are a desktop affordance over the same native scroll, so a
 * pointer user is not asked to drag.
 *
 * The row bleeds: the track starts at the container's inline start and runs
 * off the trailing edge of the screen, which is what makes the partial card
 * read as "there is more that way" rather than "this box is clipped".
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
  const trackRef = useSectionReveal<HTMLUListElement>();

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

  return (
    <section className="ox-posters" data-testid="ox-posters">
      <div className="ox-container">
        <SectionHeader title={t('ox.home.posters_title')} />
      </div>
      {/* The track sits outside the container so it can run off the trailing
          screen edge; its own start padding puts the first card on the
          container's inline start. */}
      <ul className="ox-posters__track ox-reveal" ref={trackRef}>
        {cards.map(({ card, to }, index) => (
          <li className="ox-posters__slide" key={card.id} style={{ ['--i' as string]: String(index) }}>
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
    </section>
  );
}
