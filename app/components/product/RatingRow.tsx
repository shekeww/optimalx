import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { PdpIcon } from './PdpIcon';

export interface RatingRowProps {
  /** The product's own average, 0 to 5. */
  stars: number;
  /** The product's own review count. Nothing renders at zero. */
  count: number;
  /** Where the count links, when the page has a reviews region. */
  href?: string;
  /** Drawn star size; 14 in the buy column, 12 on a card. */
  size?: number;
  className?: string;
}

const STARS = [0, 1, 2, 3, 4];

/**
 * The rating row (design region 19), and the only place in the theme that
 * draws stars.
 *
 * Claims gate B1: it renders nothing at all until the product carries a real
 * review count above zero. The store has none today, so the default render of
 * every product page is the render without this row, and the buy column is
 * spaced so that it looks finished that way.
 *
 * A partial star is a clipped overlay of the filled row over the unfilled row,
 * never an opacity fade: a half star has to read as half a star, not as a
 * faint one.
 */
export function RatingRow({ stars, count, href, size = 14, className }: RatingRowProps) {
  const { t } = useTranslation();
  if (!Number.isFinite(count) || count <= 0) return null;

  const clamped = Math.max(0, Math.min(5, Number.isFinite(stars) ? stars : 0));
  const label = t('ox.pdp.rating_count', { count });
  const classes = ['ox-rating', className].filter(Boolean).join(' ');

  return (
    <p className={classes}>
      <span
        className="ox-rating__stars"
        style={{ ['--ox-rating-fill' as string]: String((clamped / 5) * 100) + '%' }}
      >
        <span className="ox-rating__row ox-rating__row--base" aria-hidden="true">
          {STARS.map((n) => (
            <PdpIcon key={n} name="star" size={size} />
          ))}
        </span>
        <span className="ox-rating__row ox-rating__row--fill" aria-hidden="true">
          {STARS.map((n) => (
            <PdpIcon key={n} name="star" size={size} filled />
          ))}
        </span>
      </span>
      <span className="ox-rating__value">{clamped.toFixed(1)}</span>
      {href ? (
        <a className="ox-rating__count" href={href}>
          {label}
        </a>
      ) : (
        <span className="ox-rating__count">{label}</span>
      )}
    </p>
  );
}

export default RatingRow;
