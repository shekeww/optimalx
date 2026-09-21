import { Fragment, useId, useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';

export interface CategoryIntroProps {
  /** Locale key from `content/categories.ts`, `content/goals.ts` or `content/taxonomy.ts`. */
  introKey: string;
  /** Clamped to two lines, mobile and desktop alike, behind a toggle (DIRECTION 6.3 block 2). */
  clamp?: boolean;
  className?: string;
}

/**
 * The paragraph under a listing title (DIRECTION 6.3 block 2). The copy lives
 * in the content maps as a locale key and is rendered verbatim: this batch
 * adds no sentence of its own to a category or goal page.
 *
 * **Two lines, not one, and a toggle rather than a hard cut.** The clamp used
 * to drop to one line at 1024 with no way to read the rest, which made the
 * 60 to 90 word opening copy every category is supposed to carry
 * unreadable on desktop, where most of this store's traffic renders
 * (SEO-ENG-009: a category page needs unique opening copy, not a fragment of
 * one). The toggle follows the same pattern `Explainer` already uses for the
 * goal-performance block: a class change, never a truncated string, so the
 * whole paragraph stays in the DOM and indexable either way.
 *
 * Nothing renders when the key does not resolve, which is what happens on a
 * category the content map does not know (an owner-created category outside
 * the taxonomy).
 */
export function CategoryIntro({ introKey, clamp = true, className }: CategoryIntroProps) {
  const { t } = useTranslation();
  const [expanded, setExpanded] = useState(false);
  const bodyId = `ox-listing-intro-${useId()}`;
  const text = t(introKey);
  if (!text || text === introKey) return null;

  const classes = [
    'ox-listing__intro-text',
    'ox-body',
    clamp && !expanded ? 'is-clamped' : null,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // `ListingHeader` already wraps `intro` in the `.ox-listing__intro` box;
  // this returns siblings for it, not a second nested box.
  return (
    <Fragment>
      <p className={classes} id={bodyId}>
        {text}
      </p>
      {clamp ? (
        <Button
          variant="link"
          className="ox-listing__intro-toggle"
          aria-expanded={expanded}
          aria-controls={bodyId}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? t('ox.common.show_less') : t('ox.common.show_more')}
        </Button>
      ) : null}
    </Fragment>
  );
}
