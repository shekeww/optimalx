import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon, type OxIconName } from '../common/Icon';

export interface CategoryTileProps {
  label: string;
  to: string;
  /** Packshot or category photo (asset brief 8.3); the sprite stands in without one. */
  image?: string;
  icon: OxIconName;
  /** Live product count, rendered at the end of the label strip when known. */
  count?: number;
  className?: string;
}

/**
 * One category tile (DIRECTION 5.2 CategoryTile, 6.2 row 4).
 *
 * The image sits contained on the plate so packaging never touches the edge,
 * and a category with no artwork yet shows its sprite symbol on the same plate
 * rather than a broken image. The whole tile is one link; the count is meta,
 * never the only information, and a zero never prints: the API returns 0 both
 * for an empty category and for one whose count it did not compute, and "0"
 * beside a name reads as a claim that the shelf is bare.
 */
export function CategoryTile({ label, to, image, icon, count, className }: CategoryTileProps) {
  const { t } = useTranslation();
  return (
    <Link to={to} className={['ox-tile', className].filter(Boolean).join(' ')} data-testid="ox-category-tile">
      <span className="ox-tile__plate">
        {image ? (
          <Image
            src={image}
            alt=""
            width={344}
            height={258}
            srcSetWidths={[344, 688]}
            sizes="(min-width: 640px) 25vw, 50vw"
            objectFit="contain"
            className="ox-tile__img"
            noWrapper
          />
        ) : (
          // Drawn large on purpose. A 32px mark in a 4:3 plate reads as a
          // failed image; at this size the symbol IS the tile's artwork, and
          // the grid still looks finished on a catalogue with no photography.
          // 72 rather than 88: at a 171px tile on a 390 phone the plate has
          // 104px of inner height, and the symbol has to breathe inside it.
          <Icon name={icon} size={72} className="ox-tile__icon" />
        )}
      </span>
      <span className="ox-tile__strip">
        <span className="ox-tile__label">{label}</span>
        {count !== undefined && count > 0 ? (
          <span className="ox-tile__count ox-small ox-num">
            <span aria-hidden="true">{count}</span>
            <span className="ox-sr-only">{t('ox.home.tile_count', { count })}</span>
          </span>
        ) : null}
      </span>
    </Link>
  );
}
