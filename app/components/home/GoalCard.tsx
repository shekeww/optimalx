import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../common/Icon';
import { BandPhoto } from './BandPhoto';

export interface GoalCardProps {
  /** Goal slug; also the reveal test hook. */
  slug: string;
  label: string;
  /** One line under the label, clamped by the stylesheet. */
  line?: string;
  icon: OxIconName;
  /** Resolved category URL, or the search fallback when it does not exist yet. */
  to: string;
  /**
   * The frame `GOAL_PHOTOS` names for this goal. Absent, or present and not
   * yet generated, the card falls back to its flat dark ground.
   */
  photo?: string;
  /** DOM index, consumed by the reveal stagger (`--stagger-step` times index). */
  index?: number;
}

/**
 * One goal card (homepage-spec section 4).
 *
 * A dark photographic card: the frame, a scrim over it, a white glyph, the
 * goal's name, one line under it, and a small outline parallelogram that
 * reads as the card's action. The diagonal cuts and the sharp corners carry
 * the identity; the orange strap is gone (owner item 2026-09-24, S8a). The
 * whole card is a single link and the parallelogram is a `span`, never a
 * nested button (DIRECTION 9.2).
 *
 * **It has to be finished without the photograph.** None of the six frames
 * exists yet. The card's own background is the dark plate and the scrim is a
 * gradient painted whether or not an image loads under it, so `BandPhoto`
 * taking itself out of the tree on a 404 leaves a finished dark card. No grey
 * box, no icon in a frame, no broken image, no collapse.
 *
 * This is the largest visual block on the page, which is why the composition
 * is fixed rather than content-driven: every card is the same height, the
 * glyph sits at the same optical position, and the line clamps to one line, so
 * six goals with names of six different lengths still read as one row.
 */
export function GoalCard({ slug, label, line, icon, to, photo, index = 0 }: GoalCardProps) {
  const { t } = useTranslation();
  return (
    <Link
      to={to}
      className="ox-goal"
      data-testid="ox-goal-card"
      data-goal={slug}
      style={{ ['--i' as string]: String(index) }}
    >
      {photo ? <BandPhoto src={photo} className="ox-goal__photo" /> : null}
      <span className="ox-goal__scrim" aria-hidden="true" />
      <span className="ox-goal__body">
        <Icon name={icon} size={26} className="ox-goal__icon" />
        <span className="ox-goal__label">{label}</span>
        {line ? <span className="ox-goal__line">{line}</span> : null}
        <span className="ox-goal__cta">
          <span className="ox-goal__cta-label">{t('ox.home.shop_now')}</span>
          <Icon name="chevron-end" size={24} className="ox-iconbtn--angled" />
        </span>
      </span>
    </Link>
  );
}
