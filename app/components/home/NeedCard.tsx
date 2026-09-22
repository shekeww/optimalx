import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../common/Icon';

/**
 * The seven pastel tints plus the one black emphasis card
 * (X-IDENTITY-2026-09-22.md §4.6, §3.3; `docs/build/progress/S2b.md` carries
 * the measured contrast ratio for each). A tint is a NAME, never a hex at the
 * call site: every value lives once, in `_b2-home.scss`'s "1. OxNeeds and
 * NeedCard" section, as `--ox-need-tint-<name>`.
 */
export type NeedTone =
  | 'peach'
  | 'ash'
  | 'mint'
  | 'sand'
  | 'sky'
  | 'rose'
  | 'violet'
  | 'black';

export interface NeedCardProps {
  /** Goal or category slug; also the reveal stagger key and the image fallback name. */
  slug: string;
  tone: NeedTone;
  icon: OxIconName;
  /** The card's short name (a goal's `cardKey` or a type's `ox.tax.<key>.name`). */
  title: string;
  /** Two-line, claims-clean: product types the card routes to, never an outcome. */
  line: string;
  /** Resolved category/goal URL, or the search fallback (`useTaxonomyLinks`). */
  to: string;
  /** Only rendered when the live category carries a real, positive count. */
  count?: number;
  /** `Category.image` when the API has one; the CSS fallback below covers the rest. */
  image?: string;
  /** DOM index, consumed by the reveal stagger (`--stagger-step` times index). */
  index?: number;
}

/**
 * One "shop by need" card (owner amendment 2026-09-22; homepage-spec §3/§4
 * merged): a row on the phone, a cell in the 2-up and 3/4-up grids above it.
 *
 * `grid-template-areas: 'icon title arrow' 'icon line arrow'` is the card's
 * one shape at every width (S2b brief: "Card = row composition"); what
 * changes between breakpoints is the grid the CARDS sit in
 * (`_b2-home.scss` "2. Layout"), not this internal one.
 *
 * The image slot is a `background-image`, never an `<img>`: a merchant's
 * `Category.image` is an external URL that can 404, and a failed background
 * paint just leaves the tint showing, where a failed `<img>` paints a broken-
 * image glyph in the one corner every card shares. When the API has no image
 * the slot falls through to the theme custom property
 * `--ox-need-image-<slug>` (undefined until the owner fills it) and then to
 * `none`, so the card is finished at every stage.
 */
export function NeedCard({
  slug,
  tone,
  icon,
  title,
  line,
  to,
  count,
  image,
  index = 0,
}: NeedCardProps) {
  const { t } = useTranslation();
  const backgroundImage = image ? `url("${image}")` : `var(--ox-need-image-${slug}, none)`;

  return (
    <Link
      to={to}
      className={`ox-need ox-need--${tone}`}
      data-testid="ox-need-card"
      data-need={slug}
      style={{ ['--i' as string]: String(index) }}
    >
      <span className="ox-need__image" aria-hidden="true" style={{ backgroundImage }} />
      <Icon name={icon} size={40} className="ox-need__icon" />
      <span className="ox-need__title">{title}</span>
      <span className="ox-need__line">{line}</span>
      <span className="ox-need__foot">
        {count && count > 0 ? (
          <span className="ox-need__count">{t('ox.home.need_count', { count })}</span>
        ) : null}
        <i className="sicon-keyboard_arrow_right ox-need__arrow ox-mirror" aria-hidden="true" />
      </span>
    </Link>
  );
}
