import { useEffect, useRef } from 'react';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useTaxonomyLinks } from '../../listing/useTaxonomyLinks';
import { Icon, type OxIconName } from '../../common/Icon';
import { toSafeLinks } from '../navLinks';
import { MegaPromo } from './MegaPromo';

export interface MegaPanelProps {
  id: string;
  /** The nav item that owns the panel, for `aria-labelledby`. */
  labelledBy: string;
  /** Fires on a link click and on the closing focusout (NAV-2026-09-23 §5.5). */
  onClose: () => void;
  /** Fires on Escape only: closes AND returns focus to the trigger. */
  onEscape: () => void;
  /** Kept open while the pointer is inside either the item or the panel. */
  onPointerEnter?: () => void;
  onPointerLeave?: () => void;
}

/**
 * The one mega panel in the header (NAV-2026-09-23 §5): three columns under
 * تسوق — حسب النوع (the ten type roots, protein's five children nested),
 * حسب الهدف (the six goals) and the promoted tile — closed by a foot row of
 * two "see everything" links.
 *
 * It is a **disclosure**, not a menu and not a dialog (§5.5): no
 * `useDialogFocus`, no `role="group"`, no `tabIndex`. A hover-opened,
 * non-modal popover that traps focus strands a keyboard visitor, which is
 * exactly the defect this rewrite removes (S3c finding 1). The panel stays a
 * DOM child of its `<li>` so Tab order runs trigger, column A, column B,
 * column C, the foot row, then the next nav item, with no code needed to
 * make that true.
 *
 * Both columns come from `useTaxonomyLinks` (Contract C): a type or goal
 * resolves to its live category once the merchant creates one, and to a
 * search for its own name otherwise (PLAN-final C15).
 */
export function MegaPanel({
  id,
  labelledBy,
  onClose,
  onEscape,
  onPointerEnter,
  onPointerLeave,
}: MegaPanelProps) {
  const { t } = useTranslation();
  const taxonomy = useTaxonomyLinks();
  // `useTaxonomyLinks` is shared with the listing page's `ChildChips`, which
  // renders a live category's raw `.url` on purpose (its own test pins that);
  // this batch's own consumers reduce every `.to` to a path here instead of
  // inside the hook (NAV-2026-09-23 §8 item 1).
  const types = toSafeLinks(taxonomy.types);
  const goals = toSafeLinks(taxonomy.goals);
  const utility = toSafeLinks(taxonomy.utility);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onEscape();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onEscape]);

  // Closing on focusout: when focus leaves the `<li>` this panel sits in
  // (trigger + panel), the panel closes. No `stopPropagation` anywhere in
  // this file, so the drawer's own Escape keeps working (§5.5).
  useEffect(() => {
    const li = panelRef.current?.parentElement;
    if (!li) return;
    const onFocusOut = (event: FocusEvent) => {
      const next = event.relatedTarget as Node | null;
      if (!next || !li.contains(next)) onClose();
    };
    li.addEventListener('focusout', onFocusOut);
    return () => li.removeEventListener('focusout', onFocusOut);
  }, [onClose]);

  // §5.2's own split: the first five type roots (protein's children nested
  // under it) in track one, the last five plus the non-services utility
  // categories in track two. الاستشارات والخدمات is never in this column:
  // slot 4 (اسأل قبل أن تشتري) already owns `/services`, and a second anchor
  // for the same page is the duplicate-entry defect this document removes.
  const trackOne = types.slice(0, 5);
  const trackTwo = types.slice(5, 10);
  const otherCategories = utility.filter((node) => node.slug !== 'services');

  return (
    <div
      id={id}
      ref={panelRef}
      className="ox-mega"
      aria-labelledby={labelledBy}
      data-testid="ox-mega-panel"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
    >
      <section className="ox-mega__col ox-mega__col-a" aria-label={t('ox.nav.by_type')}>
        <h3 className="ox-mega__heading">{t('ox.nav.by_type')}</h3>
        <div className="ox-mega__tracks">
          <ul className="ox-mega__track">
            {trackOne.map((type) => (
              <li key={type.slug}>
                <Link to={type.to} className="ox-mega__root" onClick={onClose}>
                  {type.label}
                </Link>
                {type.children.length > 0 ? (
                  <ul className="ox-mega__children">
                    {type.children.map((child) => (
                      <li key={child.slug}>
                        <Link to={child.to} className="ox-mega__child" onClick={onClose}>
                          {child.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
          <ul className="ox-mega__track">
            {trackTwo.map((type) => (
              <li key={type.slug}>
                <Link to={type.to} className="ox-mega__root" onClick={onClose}>
                  {type.label}
                </Link>
              </li>
            ))}
            <li className="ox-mega__divider" role="presentation" aria-hidden="true" />
            {otherCategories.map((node) => (
              <li key={node.slug}>
                <Link to={node.to} className="ox-mega__root" onClick={onClose}>
                  {node.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="ox-mega__col ox-mega__col-b" aria-label={t('ox.nav.by_goal')}>
        <h3 className="ox-mega__heading">{t('ox.nav.by_goal')}</h3>
        <ul className="ox-mega__goalgrid">
          {goals.map((goal) => (
            <li key={goal.slug}>
              <Link to={goal.to} className="ox-mega__goal" onClick={onClose}>
                <Icon name={goal.icon as OxIconName} size={24} />
                <span className="ox-mega__goal-label">{goal.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <MegaPromo onNavigate={onClose} />

      <div className="ox-mega__foot">
        <Link to="/categories" className="ox-mega__foot-link" onClick={onClose}>
          {t('ox.nav.all_types')}
        </Link>
        <Link to="/brands" className="ox-mega__foot-link" onClick={onClose}>
          {t('ox.nav.all_brands')}
        </Link>
      </div>
    </div>
  );
}
