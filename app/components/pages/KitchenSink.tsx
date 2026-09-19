import { ErrorState, statusCodeOf } from './ErrorState';
import { HowItWorks } from './HowItWorks';
import { ScopePanel } from './ScopePanel';
import { PickupSteps } from './PickupSteps';
import { ContactRow } from './ContactRow';
import { UnitConverter } from './UnitConverter';
import { UNIT_IDS, convert } from './convert';
import { SERVICE_STEPS } from '../../content/services';

/**
 * The B5 kitchen-sink section (dev only, PLAN-final C16).
 *
 * The full pages are routes, so what is worth exercising here is the parts
 * that are conditional: the scope panel with its mandated line, the steps
 * strip, the pickup steps (which render nothing until both pickup settings
 * are filled), the contact row (nothing without a number or a phone), the
 * converter and the error state at each status the engine can hand us.
 */
export default function KitchenSink() {
  return (
    <div className="ox-ks-pages">
      <h3>ScopePanel</h3>
      <ScopePanel headingLevel="h3" />

      <h3>HowItWorks / ServiceSteps</h3>
      <HowItWorks steps={SERVICE_STEPS} headingLevel="h3" stepHeadingLevel="h4" />

      <h3>PickupSteps (hidden until pickup_ready_hours and pickup_hold_days are set)</h3>
      <PickupSteps />

      <h3>ContactRow (hidden without a WhatsApp number and a phone)</h3>
      <ContactRow />

      <h3>UnitConverter</h3>
      <UnitConverter />
      <p>
        1 kg ={' '}
        {UNIT_IDS.map((unit) => `${unit}:${convert(1, 'kg', unit)?.toFixed(3) ?? '-'}`).join(' ')}
      </p>

      <h3>ErrorState, 500</h3>
      <ErrorState error={new Error('kitchen sink')} reset={() => {}} />

      <h3>ErrorState status mapping</h3>
      <p>{`plain Error -> ${statusCodeOf(new Error('x'))}`}</p>
    </div>
  );
}
