import type { ReactNode } from 'react';

export interface ListingHeaderProps {
  title: ReactNode;
  /** h1 everywhere except the goal landing, where the hero carries the h1. */
  as?: 'h1' | 'h2';
  titleId?: string;
  /** A media slot before the title: the brand logo plate (DIRECTION 6.14). */
  media?: ReactNode;
  /** The category intro paragraph, rendered under the title row. */
  intro?: ReactNode;
  className?: string;
}

/**
 * The listing title block (DIRECTION 5.3 ListingHeader, 6.3 block 2).
 *
 * On every variant but the goal landing this sits inside the masthead band
 * (`.ox-listing__band`), a full-bleed warm plate under the dark chrome: the
 * approved design separates surfaces by value plus a hairline, and applying
 * that at page scale is what stops a catalogue page opening as a bare grid.
 * The goal landing has its own dark hero instead, so it renders this block as
 * the grid's h2 and nothing else.
 *
 * No count line: the products API returns no total, and a count that is only
 * the loaded page would be a number the page cannot stand behind (PLAN-final
 * B4). The progress line under the grid states the loaded count instead.
 *
 * The sort and filter controls are not here. They live in `ListingToolbar`,
 * directly on the grid, which is where a shopper reaches for them.
 *
 * The h1 is the category name from the loader, not a string of ours, and the
 * engine's own `#page-main-title` heading is not rendered anywhere on the page.
 */
export function ListingHeader({
  title,
  as: Heading = 'h1',
  titleId,
  media,
  intro,
  className,
}: ListingHeaderProps) {
  const classes = ['ox-listing__head', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="ox-listing__title-row">
        {media ? <div className="ox-listing__media">{media}</div> : null}
        <Heading className={Heading === 'h1' ? 'ox-h1' : 'ox-h2'} id={titleId}>
          {title}
        </Heading>
      </div>
      {intro ? <div className="ox-listing__intro">{intro}</div> : null}
    </div>
  );
}
