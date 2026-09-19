import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface CategoryIntroProps {
  /** Locale key from `content/categories.ts` or `content/goals.ts`. */
  introKey: string;
  /** Clamped to two lines on mobile, one on desktop (DIRECTION 6.3 block 2). */
  clamp?: boolean;
  className?: string;
}

/**
 * The paragraph under a listing title (DIRECTION 6.3 block 2). The copy lives
 * in the content maps as a locale key and is rendered verbatim: this batch
 * adds no sentence of its own to a category or goal page.
 *
 * Nothing renders when the key does not resolve, which is what happens on a
 * category the content map does not know (an owner-created category outside
 * the fifteen).
 */
export function CategoryIntro({ introKey, clamp = true, className }: CategoryIntroProps) {
  const { t } = useTranslation();
  const text = t(introKey);
  if (!text || text === introKey) return null;

  const classes = ['ox-listing__intro-text', 'ox-body', clamp ? 'is-clamped' : null, className]
    .filter(Boolean)
    .join(' ');
  return <p className={classes}>{text}</p>;
}
