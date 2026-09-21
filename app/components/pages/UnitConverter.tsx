import { useId, useMemo, useState } from 'react';

import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import type { Page } from '@salla.sa/twilight-theme-engine/types';
import { Bdi } from '../common/Bdi';
import { convert, formatAmount, UNIT_IDS, type UnitId } from './convert';
import { OxBreadcrumb } from '../common/OxBreadcrumb';

/**
 * `/tools/converter` (DIRECTION 6.18): a narrow form of one input and two
 * selects with a single result line.
 *
 * It is a comparison aid, not advice: the note under the result says the
 * serving size and the dose stay exactly as printed on the label, so nobody
 * reads a converted number as a new dose. The route is noindex; it exists for
 * a shopper standing in front of two tubs labelled in different units.
 *
 * All arithmetic is client side and synchronous, so there is no loading state
 * and no request. Numerals are Western everywhere (DIRECTION 3.3), and the
 * result is a `bdi` so an Arabic sentence around a Latin number keeps its
 * order.
 */
export function UnitConverter() {
  const { t } = useTranslation();
  const fieldId = useId();
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState<UnitId>('kg');
  const [to, setTo] = useState<UnitId>('lb');

  const result = useMemo(() => convert(Number(amount), from, to), [amount, from, to]);
  const page: Page = { title: t('ox.tools.converter.h1'), slug: 'tools/converter' };

  return (
    <div className="ox-page ox-page--converter">
      <OxBreadcrumb page={page} />

      <header className="ox-page-head">
        <h1 className="ox-page-head__title ox-h1">{t('ox.tools.converter.h1')}</h1>
        <p className="ox-page-head__lead ox-body">{t('ox.tools.converter.intro')}</p>
      </header>

      <form className="ox-converter" onSubmit={(event) => event.preventDefault()}>
        <div className="ox-field">
          <label className="ox-field__label" htmlFor={`${fieldId}-amount`}>
            {t('ox.tools.converter.amount_label')}
          </label>
          <input
            id={`${fieldId}-amount`}
            className="ox-input ox-num"
            type="number"
            inputMode="decimal"
            min="0"
            step="any"
            dir="ltr"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
        </div>

        <div className="ox-field">
          <label className="ox-field__label" htmlFor={`${fieldId}-from`}>
            {t('ox.tools.converter.from_label')}
          </label>
          <select
            id={`${fieldId}-from`}
            className="ox-select"
            value={from}
            onChange={(event) => setFrom(event.target.value as UnitId)}
          >
            {UNIT_IDS.map((unit) => (
              <option key={unit} value={unit}>
                {t(`ox.tools.converter.unit_${unit}`)}
              </option>
            ))}
          </select>
        </div>

        <div className="ox-field">
          <label className="ox-field__label" htmlFor={`${fieldId}-to`}>
            {t('ox.tools.converter.to_label')}
          </label>
          <select
            id={`${fieldId}-to`}
            className="ox-select"
            value={to}
            onChange={(event) => setTo(event.target.value as UnitId)}
          >
            {UNIT_IDS.map((unit) => (
              <option key={unit} value={unit}>
                {t(`ox.tools.converter.unit_${unit}`)}
              </option>
            ))}
          </select>
        </div>
      </form>

      <p className="ox-converter__result ox-h3" aria-live="polite" data-testid="ox-converter-result">
        <span className="ox-converter__result-label ox-small">
          {t('ox.tools.converter.result_label')}
        </span>
        {result === null ? (
          <span className="ox-converter__invalid">{t('ox.tools.converter.invalid')}</span>
        ) : (
          <Bdi ltr lang={null}>
            {t('ox.tools.converter.result', {
              value: formatAmount(result),
              unit: t(`ox.tools.converter.unit_${to}`),
            })}
          </Bdi>
        )}
      </p>

      <p className="ox-converter__note ox-small">{t('ox.tools.converter.note')}</p>
    </div>
  );
}
