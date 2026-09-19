import { useState } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { MAX_DOSE, MIN_DOSE, clampDose, estimateSupply } from '../lib/supply';

export interface SupplyCalculatorProps {
  /** Servings printed on the label; the block hides without it. */
  servings: number | null | undefined;
}

/**
 * "How many days does this package last?" (DIRECTION 5.4 SupplyCalculator).
 *
 * The line describes the package, never the person: servings on the label
 * divided by the servings a day the shopper picked. There is no recommended
 * dose here, no health claim, and nothing at all when the label printed no
 * servings count.
 */
export function SupplyCalculator({ servings }: SupplyCalculatorProps) {
  const { t } = useTranslation();
  const [dose, setDose] = useState(MIN_DOSE);
  const estimate = estimateSupply(servings, dose);
  if (!estimate) return null;

  return (
    <section className="ox-supply" aria-labelledby="ox-supply-title">
      <h2 className="ox-supply__title" id="ox-supply-title">
        {t('ox.supply.title')}
      </h2>
      <div className="ox-supply__row">
        <span className="ox-supply__label" id="ox-supply-dose">
          {t('ox.supply.servings_per_day')}
        </span>
        <div className="ox-supply__stepper">
          <button
            type="button"
            className="ox-supply__step"
            onClick={() => setDose((value) => clampDose(value - 1))}
            disabled={dose <= MIN_DOSE}
            aria-label={t('ox.supply.decrease')}
          >
            <span aria-hidden="true">{String.fromCharCode(0x2212)}</span>
          </button>
          <output className="ox-supply__value" htmlFor="ox-supply-dose">
            {dose}
          </output>
          <button
            type="button"
            className="ox-supply__step"
            onClick={() => setDose((value) => clampDose(value + 1))}
            disabled={dose >= MAX_DOSE}
            aria-label={t('ox.supply.increase')}
          >
            <span aria-hidden="true">+</span>
          </button>
        </div>
      </div>
      <p className="ox-supply__result" aria-live="polite">
        <strong>{t('ox.supply.result_days', { days: estimate.days })}</strong>
        <span className="ox-supply__runout">
          {t('ox.supply.result_runout', { date: estimate.runOut })}
        </span>
      </p>
      <p className="ox-supply__note">{t('ox.supply.note')}</p>
    </section>
  );
}
