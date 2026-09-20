import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { categoryBySlug } from '../../../content/categories';
import type { GoalSubNeed } from '../../../content/goals';
import { SectionHeader } from '../../common/SectionHeader';
import { useSlugLink } from '../useSlugLink';

export interface SubNeedsProps {
  needs: GoalSubNeed[];
  /** Group heading (goal-ideal-weight renders two groups with anchors). */
  title?: string;
  intro?: string;
  /** Fragment id for the group, e.g. `gain` renders as `#gain`. */
  anchor?: string;
  headingId?: string;
}

/**
 * The sub-needs row (DIRECTION 5.3 SubNeeds row, 6.4 block 5): three cards,
 * each a need title, one line, and a link into the type category the content
 * map names.
 *
 * The destination is resolved at runtime by slug (PLAN-final C15): the live
 * category URL when the merchant has created it, a search for the category's
 * own name when not. A named filter chip is carried in the query so the
 * destination opens on the same need, and it is only ever a chip the
 * destination category's own content declares.
 */
export function SubNeeds({ needs, title, intro, anchor, headingId }: SubNeedsProps) {
  const { t } = useTranslation();
  const { resolve } = useSlugLink();
  if (needs.length === 0) return null;

  const id = headingId ?? (anchor ? `${anchor}-title` : 'ox-subneeds-title');

  return (
    <section
      className="ox-subneeds"
      {...(anchor ? { id: anchor } : {})}
      aria-labelledby={id}
    >
      <SectionHeader
        as="h2"
        title={title ?? t('ox.goal.subneeds_title')}
        titleId={id}
      />
      <ul className="ox-subneeds__row">
        {needs.map((need) => {
          const category = categoryBySlug(need.categorySlug);
          const label = category ? t(category.h1Key) : need.categorySlug;
          const base = resolve(need.categorySlug, label);
          const chip = need.filterChipKey ? t(need.filterChipKey) : undefined;
          const to =
            chip && !chip.startsWith('ox.')
              ? `${base}${base.includes('?') ? '&' : '?'}chip=${encodeURIComponent(chip)}`
              : base;
          return (
            <li key={need.titleKey} className="ox-subneed">
              <Link to={to} className="ox-subneed__link">
                <span className="ox-subneed__title ox-h3">{t(need.titleKey)}</span>
                <span className="ox-subneed__line ox-body">{t(need.lineKey)}</span>
                <span className="ox-subneed__cta ox-small">
                  {t('ox.goal.subneed_cta')}
                  <i className="sicon-keyboard_arrow_left ox-mirror" aria-hidden="true" />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
