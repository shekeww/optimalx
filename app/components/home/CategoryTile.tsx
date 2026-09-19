import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
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
 * never the only information.
 */
export function CategoryTile({ label, to, image, icon, count, className }: CategoryTileProps) {
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
          <Icon name={icon} size={32} className="ox-tile__icon" />
        )}
      </span>
      <span className="ox-tile__strip">
        <span className="ox-tile__label">{label}</span>
        {count !== undefined ? <span className="ox-tile__count ox-small ox-num">{count}</span> : null}
      </span>
    </Link>
  );
}
