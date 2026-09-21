import { ContactAffordance } from './ContactAffordance';
import { CountryControl } from './CountryControl';
import { UtilityTrust } from './UtilityTrust';

/**
 * The utility strip above the header: contact at the inline-start, the three
 * trust items centred, the country control at the inline-end, on the same
 * near-black as the header so the two read as one band.
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
  return (
    <div className="ox-utility" data-testid="ox-utility-bar">
      <div className="ox-utility__inner ox-container">
        <div className="ox-utility__start">
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
