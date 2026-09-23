import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTaxonomyLinks } from '../../listing/useTaxonomyLinks';
import { toSafeLinks } from '../navLinks';

export interface ShopTreeProps {
  /** `list`: the drawer's nested accordion rows. `grid`: the sheet's tiles. */
  mode: 'list' | 'grid';
  /**
   * List mode appends the (non-services) utility categories after the ten
   * type roots, in the drawer's own single group (§6.1). Grid mode leaves
   * them out by default: the sheet gives them their own headed
   * "أقسام أخرى" region instead (§7.1.1).
   */
  includeUtility?: boolean;
  onNavigate?: () => void;
}

/**
 * The one catalogue type tree (NAV-2026-09-23 §3, §6, §7.1.1), rendered by
 * both the mobile drawer and the shop sheet so the two surfaces can never
 * become two different site maps again (the defect `MobileDrawer.tsx:113`
 * used to describe).
 *
 * Ten type roots, protein's five children nested under it. Grid mode never
 * shows the children (a tile grid has no room for a third tap and the goal
 * this component serves — every root two taps away — does not need them,
 * §7.1.1: they stay three taps away, by design, on the drawer's own
 * accordion and the protein listing's chip row).
 */
export function ShopTree({ mode, includeUtility = mode === 'list', onNavigate }: ShopTreeProps) {
  const taxonomy = useTaxonomyLinks();
  // Reduced to a path here, not inside the hook: `useTaxonomyLinks` is
  // shared with the listing page's `ChildChips`, whose own test pins
  // today's raw-URL behaviour for its live-children path (NAV-2026-09-23 §8
  // item 1).
  const types = toSafeLinks(taxonomy.types);
  const otherCategories = includeUtility
    ? toSafeLinks(taxonomy.utility.filter((node) => node.slug !== 'services'))
    : [];

  if (mode === 'grid') {
    return (
      <ul className="ox-sheet__grid ox-sheet__grid--type" data-testid="ox-shoptree-grid">
        {types.map((type) => (
          <li key={type.slug}>
            <Link to={type.to} className="ox-sheet__tile ox-sheet__tile--type" onClick={onNavigate}>
              <span className="ox-sheet__tile-label">{type.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <>
      {types.map((type) => (
        <li key={type.slug}>
          <Link to={type.to} className="ox-drawer__row ox-drawer__row--sub" onClick={onNavigate}>
            <span>{type.label}</span>
          </Link>
          {type.children.length > 0 ? (
            <ul className="ox-drawer__sublist">
              {type.children.map((child) => (
                <li key={child.slug}>
                  <Link to={child.to} className="ox-drawer__row ox-drawer__row--child" onClick={onNavigate}>
                    <span>{child.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
        </li>
      ))}
      {otherCategories.map((node) => (
        <li key={node.slug}>
          <Link to={node.to} className="ox-drawer__row ox-drawer__row--sub" onClick={onNavigate}>
            <span>{node.label}</span>
          </Link>
        </li>
      ))}
    </>
  );
}
