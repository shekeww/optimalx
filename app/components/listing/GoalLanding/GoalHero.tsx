import { Image } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { GoalContent } from '../../../content/goals';
import { Button } from '../../common/Button';
import { goalNameKey } from '../resolve';

export interface GoalHeroProps {
  goal: GoalContent;
  /** The category's own cover image from the dashboard, when the owner set one. */
  image?: string | null;
  /** Fragment the hero button scrolls to (the grid heading). */
  gridId: string;
  titleId?: string;
}

/** The first sentence of a paragraph, terminator kept. */
export function firstSentence(text: string): string {
  const stops = ['.', String.fromCharCode(0x061f), '!'];
  let cut = -1;
  for (const stop of stops) {
    const index = text.indexOf(stop);
    if (index >= 0 && (cut < 0 || index < cut)) cut = index;
  }
  return cut < 0 ? text : text.slice(0, cut + 1);
}

/**
 * The goal landing hero (DIRECTION 5.3 GoalLanding hero, 6.4 block 2): the
 * home hero's construction without the orange stroke, 360 mobile and 420
 * desktop, the eyebrow being the goal name and the headline the goal's H1
 * verbatim from the content map.
 *
 * No eyebrow count and no claim of any kind sits in this band (amendment A4:
 * no invented counts). The lead is the first sentence of the goal intro, so
 * the full intro below it repeats nothing.
 *
 * Until the owner uploads the six goal photographs (DIRECTION 8.2) the end
 * panel is the tonal wedge alone, which is a finished state rather than a
 * placeholder: the band never renders an empty image box.
 */
export function GoalHero({ goal, image, gridId, titleId }: GoalHeroProps) {
  const { t } = useTranslation();
  const intro = t(goal.introKey);
  const lead = intro && intro !== goal.introKey ? firstSentence(intro) : '';
  const cta = t('ox.goal.hero_cta');

  return (
    <section
      className={`ox-goal-hero ox-band-dark${image ? ' has-photo' : ''}`}
      aria-labelledby={titleId}
    >
      <div className="ox-goal-hero__photo" aria-hidden="true">
        {image ? (
          <Image
            className="ox-goal-hero__img"
            src={image}
            alt=""
            objectFit="cover"
            priority
          />
        ) : null}
      </div>
      <span className="ox-goal-hero__corner" aria-hidden="true" />
      <div className="ox-container ox-goal-hero__inner">
        <p className="ox-goal-hero__eyebrow ox-small">{t(goalNameKey(goal.slug))}</p>
        <h1 className="ox-goal-hero__title ox-display" id={titleId}>
          {t(goal.h1Key)}
        </h1>
        {lead ? <p className="ox-goal-hero__lead ox-lead">{lead}</p> : null}
        <Button variant="primary" size={48} href={`#${gridId}`} className="ox-goal-hero__cta">
          {cta}
        </Button>
      </div>
    </section>
  );
}
