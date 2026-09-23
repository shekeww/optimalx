import { Link } from '@salla.sa/twilight-theme-engine/common';
import { toInternalPath } from '../layout/navLinks';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../common/Icon';
import { BandPhoto } from './BandPhoto';

export interface PosterCardProps {
  id: string;
  photo: string;
  photoWidth: number;
  photoHeight: number;
  eyebrow: string;
  title: string;
  line: string;
  icon: OxIconName;
  to: string;
  /** DOM index, consumed by the reveal stagger. */
  index?: number;
}

/**
 * One secondary poster in the carousel (homepage-scale-spec section 7).
 *
 * It carries the treatment the spec fixes for every card that has a
 * photograph: the frame behind the content at low opacity on the card's own
 * dark ground, a gradient that deepens toward the floor where the label sits,
 * and the ground showing through, so a row of five unrelated shots still
 * reads as one set.
 *
 * The shape is the identity's, not a rounded rectangle: the physical top-left
 * and bottom-left corners are CUT on the same 34 degrees as every other
 * angled edge in the system (X-IDENTITY-2026-09-22.md §2), drawn as a
 * clip-path so the cut is the card's real silhouette and the photograph is
 * cut with it, with an angled accent strap sitting inside the top cut (owner
 * review 2026-09-23, item 3 — the same treatment `GoalCard` carries). A
 * rounded rectangle here is exactly the "close enough" the owner ruled out.
 *
 * The whole card is one link and the action is a span, never a nested button.
 */
export function PosterCard({
  id,
  photo,
  photoWidth,
  photoHeight,
  eyebrow,
  title,
  line,
  icon,
  to,
  index = 0,
}: PosterCardProps) {
  const { t } = useTranslation();
  return (
    <Link
      // The poster's destination is a live category URL, published absolute
      // by the API (UX-2026-09-24 P0-14): one rule, applied at every render
      // of a merchant-supplied destination.
      to={toInternalPath(to)}
      className="ox-pcard"
      data-testid="ox-poster-card"
      data-poster={id}
      style={{ ['--i' as string]: String(index) }}
    >
      <BandPhoto src={photo} className="ox-pcard__photo" width={photoWidth} height={photoHeight} />
      <span className="ox-pcard__scrim" aria-hidden="true" />
      <span className="ox-pcard__slash" aria-hidden="true" />
      <span className="ox-pcard__body">
        <span className="ox-pcard__top">
          <Icon name={icon} size={24} className="ox-pcard__icon" />
          <span className="ox-pcard__eyebrow">{eyebrow}</span>
        </span>
        <span className="ox-pcard__title ox-h3">{title}</span>
        <span className="ox-pcard__line">{line}</span>
        <span className="ox-pcard__cta">
          <span className="ox-pcard__cta-label">{t('ox.common.view_all')}</span>
          <Icon name="chevron-end" size={16} />
        </span>
      </span>
    </Link>
  );
}
