import { HookSlot } from '@salla.sa/twilight-theme-engine/hooks';
import { FooterBottom } from './FooterBottom';
import { FooterBrand } from './FooterBrand';
import { FooterColumns } from './FooterColumns';
import { RegistrationBlock } from './RegistrationBlock';

/**
 * The OptimalX footer.
 *
 * It keeps the engine's outer contract: the class `store-footer`, the
 * `footer:start` and `footer:end` hook slots, and the `copyright` slot with
 * the engine's own `Copyright` as the fallback, which now lives in the bottom
 * strip (theme-engine chunk-DTWFNS3F.js:835, :901-913, :924).
 *
 * The main row runs inline-start to inline-end: the social and registration
 * block, the three link columns, then the brand lockup at the end edge, which
 * is the order of the approved design read from the RTL start. `FooterColumns`
 * is `display: contents` so its three columns are grid items of this row
 * rather than a nested box.
 *
 * Payment methods are never named here, in text or as marks: the store's
 * gateways belong beside the buy button, where the customer is deciding, and
 * naming a method the store may not have enabled would be a claim.
 */
export function Footer() {
  return (
    <footer
      className="store-footer ox-footer ox-band-dark"
      suppressHydrationWarning
      data-testid="ox-footer"
    >
      <HookSlot name="footer:start" />

      <div className="ox-footer__inner ox-container">
        <RegistrationBlock />
        <FooterColumns />
        <FooterBrand />
      </div>

      <FooterBottom />

      <HookSlot name="footer:end" />
    </footer>
  );
}
