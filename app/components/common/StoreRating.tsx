import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from './Icon';
import { readStoreRating, type StoreRating as StoreRatingData } from '../../content/social-proof';

const STARS = [0, 1, 2, 3, 4];

/**
 * The store's Google rating, as a trust element (content/social-proof.ts).
 *
 * THIS IS THE STORE'S RATING AND NEVER A PRODUCT'S, and the distinction is
 * load bearing rather than pedantic. `RatingRow` draws a product's own stars
 * from its own reviews and stays shut because no product has any. This draws
 * the shop's rating and always says so in its own label. Putting a bare
 * five-star row beside an unreviewed product would tell a shopper the product
 * is rated when it is the shop that is, which is the exact species of
 * borrowed credibility the claims source exists to prevent. Every variant
 * below therefore carries the words "the store" and a link to the source, and
 * the component refuses to render without both.
 *
 * Variants:
 *   rail   the full line, for a section of its own or under the hero
 *   inline a compact chip, for the top bar, the buy column and the cart
 *
 * Attribution is a link to the listing plus the words "Google Maps", which is
 * what an honest citation of a public page needs. It is deliberately NOT the
 * Places API surface: that would oblige us to the Maps logo lockup, per-author
 * avatars and a licensed call on every view, for a figure the owner can read
 * off their own profile. See the module comment for the sourcing.
 */
export interface StoreRatingProps {
  variant?: 'rail' | 'inline';
  /** Overrides the settings read; the tests and the kitchen sink use it. */
  value?: StoreRatingData | null;
  className?: string;
}

function Stars({ rating, size }: { rating: number; size: number }) {
  const fill = `${(Math.max(0, Math.min(5, rating)) / 5) * 100}%`;
  return (
    <span
      className="ox-gr__stars"
      style={{ ['--ox-rating-fill' as string]: fill }}
      aria-hidden="true"
    >
      <span className="ox-gr__row ox-gr__row--base">
        {STARS.map((n) => (
          <Icon key={n} name="star" size={size} />
        ))}
      </span>
      <span className="ox-gr__row ox-gr__row--fill">
        {STARS.map((n) => (
          <Icon key={n} name="star-fill" size={size} />
        ))}
      </span>
    </span>
  );
}

export function StoreRating({ variant = 'rail', value, className }: StoreRatingProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();
  const data = value !== undefined ? value : readStoreRating(settings);
  if (!data) return null;

  const { rating, count, url, verifiedAt } = data;
  const shown = rating.toFixed(1);
  const classes = ['ox-gr', `ox-gr--${variant}`, className].filter(Boolean).join(' ');
  const size = variant === 'inline' ? 13 : 17;

  return (
    <a
      className={classes}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      data-testid="ox-store-rating"
      aria-label={t('ox.proof.aria', { rating: shown, count })}
    >
      <Stars rating={rating} size={size} />
      <span className="ox-gr__value">{shown}</span>
      <span className="ox-gr__text">
        {/* The subject of the rating, always named. */}
        <span className="ox-gr__label">{t('ox.proof.store_label')}</span>
        <span className="ox-gr__count">{t('ox.proof.count', { count })}</span>
      </span>
      {variant === 'rail' && verifiedAt ? (
        <span className="ox-gr__stamp ox-small">{t('ox.proof.verified_at', { date: verifiedAt })}</span>
      ) : null}
    </a>
  );
}

export default StoreRating;
