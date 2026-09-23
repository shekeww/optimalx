import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';
import { ContactAffordance } from './ContactAffordance';
import { CountryControl } from './CountryControl';
import { UtilityTrust } from './UtilityTrust';

/**
 * The utility strip above the header: the branch link then the WhatsApp
 * affordance at the inline-start, the three trust items centred, the country
 * control at the inline-end, on the same near-black as the header so the two
 * read as one band.
 *
 * The branch moved here from `المزيد` (NAV-2026-09-23 §4.2): it is the
 * store's one physical proof and it was three taps away. It is a standing
 * route, so unlike the WhatsApp affordance it is never gated.
 *
 * The bar always renders. The old rule ("hide the whole strip when the
 * merchant has written no promise") went with the promise line: the three
 * trust items are standing statements about the store, not a campaign, so the
 * strip is never empty. Its two outer zones gate independently and the grid
 * keeps the trust row centred whichever of them is absent.
 *
 * Below 1024 the strip is hidden and the trust row re-mounts on paper under
 * the header as a snap scroller (see `Header`).
 */
export function UtilityBar() {
  const { t } = useTranslation();
  return (
    <div className="ox-utility" data-testid="ox-utility-bar">
      <div className="ox-utility__inner ox-container">
        <div className="ox-utility__start">
          <Link to="/branch" className="ox-util__branch" data-testid="ox-utility-branch">
            <Icon name="store" size={20} />
            <span>{t('ox.nav.branch')}</span>
          </Link>
          <ContactAffordance />
        </div>
        <UtilityTrust />
        <div className="ox-utility__end">
          <CountryControl />
        </div>
      </div>
    </div>
  );
}
