import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../common/Icon';

/**
 * The seven pastel tints plus the one black emphasis card, the SAME run
 * `_b2-home.scss` defines as `--ox-need-tint-<name>` (S2b, 2026-09-22). The
 * name is never a hex at the call site.
 */
export type CategoryTileTone =
  | 'peach'
  | 'ash'
  | 'mint'
  | 'sand'
  | 'sky'
  | 'rose'
  | 'violet'
  | 'black';

export interface CategoryTileProps {
  slug: string;
  tone: CategoryTileTone;
  icon: OxIconName;
  /** The short name (`ox.tax.<key>.name`), never the live category's own longer name. */
  label: string;
  /** Two-line, claims-clean: the product types the shelf stocks (`cardLineKey`). */
  line: string;
  to: string;
  /** Only rendered when the live category carries a real, positive count. */
  count?: number;
  /** `Category.image` when the API has one; the CSS fallback covers the rest. */
  image?: string;
  /**
   * The owner's own curated packshot photograph (`CategoryContent.backgroundImage`,
   * S2h, 2026-09-23), `/categories/<file>.webp`, 1024x1536, portrait 2:3.
   * When present it replaces the whole card: the tint and the `image` slot
   * both go unused. An `<img>`, never a CSS background - this is a design
   * asset the theme ships, not a merchant URL that can 404.
   */
  art?: string;
  /** DOM index, consumed by the reveal stagger (`--stagger-step` times index). */
  index?: number;
  className?: string;
}

/**
 * One type tile (owner restyle 2026-09-22, reverting the "shop by need"
 * merge): the icon ABOVE the image slot (the owner: "the icons to be above
 * the images"), every tile on a tinted pastel ground, the two-line subline
 * and the count gated on a live, positive `products_count`.
 *
 * The image slot is a `background-image`, never an `<img>`: a merchant's
 * `Category.image` is an external URL that can 404, and a failed background
 * paint just leaves the tint showing, where a failed `<img>` paints a
 * broken-image glyph in a card every other tile shares. When the API has no
 * image the slot falls through to the theme custom property
 * `--ox-need-image-<slug>` (undefined until the owner fills it) and then to
 * `none`.
 *
 * ART VARIANT (`art`, S2h 2026-09-23): the six root slugs the owner has
 * supplied a curated packshot photograph for skip that tinted-ground card
 * entirely - the `<img>` IS the whole card (`.ox-tile--art`, `_b2-home.scss`
 * section 4b), and the icon/name/line/foot stack in a content column
 * (`.ox-tile__body`) overlaid on the card's PHYSICAL LEFT in both languages,
 * matching the reference composition the owner supplied for these six.
 *
 * The card's one angled gesture is the corner cut on `.ox-tile` itself
 * (`_b2-home.scss`), the same notch/lean technique the type tiles carried
 * under `OxNeeds` - no extra element here for it. The footer arrow shares
 * `_primitives.scss`'s `.ox-iconbtn--angled` (S2g) with `GoalCard`'s own CTA
 * arrow, on both the tinted and the art card, so every type/goal tile draws
 * the same arrow.
 */
export function CategoryTile({
  slug,
  tone,
  icon,
  label,
  line,
  to,
  count,
  image,
  art,
  index = 0,
  className,
}: CategoryTileProps) {
  const { t } = useTranslation();
  const backgroundImage = image ? `url("${image}")` : `var(--ox-need-image-${slug}, none)`;
  const hasArt = Boolean(art);

  const foot = (
    <span className="ox-tile__foot">
      {count && count > 0 ? (
        <span className="ox-tile__count">{t('ox.home.need_count', { count })}</span>
      ) : null}
      <i
        className="sicon-keyboard_arrow_right ox-tile__arrow ox-mirror ox-iconbtn--angled"
        aria-hidden="true"
      />
    </span>
  );

  return (
    <Link
      to={to}
      className={['ox-tile', `ox-tile--${tone}`, hasArt ? 'ox-tile--art' : null, className]
        .filter(Boolean)
        .join(' ')}
      data-testid="ox-category-tile"
      data-tone={tone}
      data-category={slug}
      style={{ ['--i' as string]: String(index) }}
    >
      {hasArt ? (
        <>
          <img
            className="ox-tile__art"
            src={art}
            loading="lazy"
            decoding="async"
            width={1024}
            height={1536}
            alt=""
          />
          <span className="ox-tile__body">
            <Icon name={icon} size={36} className="ox-tile__icon" />
            <span className="ox-tile__name">{label}</span>
            <span className="ox-tile__line">{line}</span>
            {foot}
          </span>
        </>
      ) : (
        <>
          <Icon name={icon} size={32} className="ox-tile__icon" />
          <span className="ox-tile__image" aria-hidden="true" style={{ backgroundImage }} />
          <span className="ox-tile__name">{label}</span>
          <span className="ox-tile__line">{line}</span>
          {foot}
        </>
      )}
    </Link>
  );
}
