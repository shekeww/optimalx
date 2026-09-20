import { Link } from '@salla.sa/twilight-theme-engine/common';
import type { CategoryTone } from '../../content/categories';
import { Icon, type OxIconName } from '../common/Icon';

export interface CategoryTileProps {
  label: string;
  to: string;
  icon: OxIconName;
  /** The shaker colour this tile carries, or null for the neutral card. */
  tone?: CategoryTone | null;
  className?: string;
}

/**
 * One category tile (homepage-spec section 3).
 *
 * A card with a hairline, a large line-art glyph, and the name centred under
 * it. That is the whole tile, and the restraint is the point: eight of these
 * sit in one row and the row has to read as one set.
 *
 * **The four entry categories carry a shaker colour** (owner: "4 categories,
 * each has a color of the shakers"). The colour arrives as a NAME - blue,
 * green, white, black - and the tile turns it into a modifier class. Every
 * value behind that name is a `--ox-shaker-*` token in _b2-home.scss section
 * 4, sampled from references/shakers.png, so a colour cannot be edited in two
 * places and disagree with itself. A tile with no tone keeps the neutral card,
 * which is the state the other four are in and the state all eight were in
 * before this.
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
export function CategoryTile({ label, to, icon, tone, className }: CategoryTileProps) {
  return (
    <Link
      to={to}
      className={['ox-tile', tone ? `ox-tile--${tone}` : null, className]
        .filter(Boolean)
        .join(' ')}
      data-testid="ox-category-tile"
      data-tone={tone ?? undefined}
    >
      {/* Drawn large: at this size the symbol is the tile's artwork rather
          than an interface control sitting above a word. The stylesheet
          scales it per viewport, which the inline width and height cannot. */}
      <Icon name={icon} size={44} className="ox-tile__icon" />
      <span className="ox-tile__label">{label}</span>
    </Link>
  );
}
