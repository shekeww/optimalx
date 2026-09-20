import { Link } from '@salla.sa/twilight-theme-engine/common';
import { Icon, type OxIconName } from '../common/Icon';

export interface CategoryTileProps {
  label: string;
  to: string;
  icon: OxIconName;
  className?: string;
}

/**
 * One category tile (homepage-spec section 3).
 *
 * A light card with a hairline, a large line-art glyph, and the name centred
 * under it. That is the whole tile, and the restraint is the point: eight of
 * these sit in one row and the row has to read as one set.
 *
 * **No photograph, deliberately.** The tile used to show `Category.image`
 * when the API had one and the sprite when it did not, which meant a row of
 * eight could hold five supplier packshots at five crops and three drawings.
 * The reference draws eight identical line glyphs, and the sprite already has
 * a symbol for every root type, so the glyph is the artwork. It also removes
 * the broken-image case entirely: there is nothing here that can fail to load.
 *
 * The count came off with the photograph. It was meta on a tile that now has
 * room for a name and nothing else, and the API returns 0 both for an empty
 * category and for one whose count it did not compute.
 */
export function CategoryTile({ label, to, icon, className }: CategoryTileProps) {
  return (
    <Link
      to={to}
      className={['ox-tile', className].filter(Boolean).join(' ')}
      data-testid="ox-category-tile"
    >
      {/* Drawn large: at this size the symbol is the tile's artwork rather
          than an interface control sitting above a word. The stylesheet
          scales it per viewport, which the inline width and height cannot. */}
      <Icon name={icon} size={44} className="ox-tile__icon" />
      <span className="ox-tile__label">{label}</span>
    </Link>
  );
}
