import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Icon, type OxIconName } from '../common/Icon';

export interface GoalCardProps {
  /** Goal slug; also the settle test hook. */
  slug: string;
  label: string;
  /** One line under the label, clamped to one line by the stylesheet. */
  line?: string;
  icon: OxIconName;
  /** Resolved category URL, or the search fallback when it does not exist yet. */
  to: string;
  /** DOM index, consumed by the settle delay (`--stagger-step` times index). */
  index?: number;
}

/**
 * One goal tile (DIRECTION 5.2 GoalCard). The whole card is a single link with
 * nothing interactive inside it (DIRECTION 9.2), the icon carries the one
 * orange element of the sprite, and the card never animates on its own: the
 * only motion it takes part in is the grid settle its parent runs once
 * (DIRECTION 7.2).
 */
export function GoalCard({ slug, label, line, icon, to, index = 0 }: GoalCardProps) {
  return (
    <Link
      to={to}
      className="ox-goal"
      data-testid="ox-goal-card"
      data-goal={slug}
      style={{ ['--i' as string]: String(index) }}
    >
      <Icon name={icon} size={32} className="ox-goal__icon" />
      <span className="ox-goal__body">
        <span className="ox-goal__label ox-h3">{label}</span>
        {line ? <span className="ox-goal__line ox-small">{line}</span> : null}
      </span>
    </Link>
  );
}
