import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Chip } from '../../common/Chip';
import type { OxIconName } from '../../common/Icon';
import { LABEL_REPLY_TIME, isNotApplicable, type SpecLine } from '../lib/specLine';
import { replySlaHours, type Settings } from '../lib/claims';

export interface SpecChipsProps {
  spec: SpecLine | null;
  settings?: Settings;
  /** Extra chips the variant adds (the calories line on food). */
  extra?: { icon?: OxIconName; label: string }[];
}

/**
 * The chips read straight off the spec line (DIRECTION 5.4 SpecChips): number
 * of servings, serving size, form, expiry. A field the label did not print
 * renders no chip; "غير منطبق" renders no chip either.
 *
 * Claims gate: a merchant may type a reply-time promise into the product data
 * ("الرد خلال: 24 ساعة عمل" is in the three service descriptions today). That
 * field becomes a chip only when the owner has set `reply_sla_hours`
 * (PLAN-final 5.1, open question Q15).
 */
export function SpecChips({ spec, settings, extra = [] }: SpecChipsProps) {
  const { t } = useTranslation();
  if (!spec && extra.length === 0) return null;

  const chips: { key: string; icon?: OxIconName; label: string }[] = [];
  if (spec) {
    if (spec.servings !== null) {
      chips.push({ key: 'servings', icon: 'servings', label: t('ox.card.servings', { n: spec.servings }) });
    } else if (spec.servingsText && !isNotApplicable(spec.servingsText)) {
      chips.push({ key: 'servings', icon: 'servings', label: spec.servingsText });
    }
    if (spec.servingSize && !isNotApplicable(spec.servingSize)) {
      chips.push({
        key: 'serving-size',
        icon: 'serving-size',
        label: t('ox.card.serving_size', { size: spec.servingSize }),
      });
    }
    if (spec.form && !isNotApplicable(spec.form)) {
      chips.push({ key: 'form', icon: 'form', label: spec.form });
    }
    if (spec.expiry) {
      chips.push({ key: 'expiry', icon: 'expiry', label: t('ox.card.expiry', { date: spec.expiry }) });
    }
  }
  for (const item of extra) {
    chips.push({ key: 'extra-' + item.label, icon: item.icon, label: item.label });
  }
  if (chips.length === 0) return null;

  return (
    <div className="ox-pdp__chips">
      {chips.map((chip) => (
        <Chip key={chip.key} size="pdp" icon={chip.icon}>
          {chip.label}
        </Chip>
      ))}
    </div>
  );
}

/**
 * The remaining spec-line fields as a facts table (the digital, gift card and
 * service variants: الصيغة, القيمة, المدة, القناة). The four fields the chips
 * already carry are skipped, and the reply-time field obeys the same gate.
 */
export function SpecFacts({
  spec,
  settings,
  skip = [],
  title,
}: {
  spec: SpecLine | null;
  settings?: Settings;
  skip?: string[];
  title: string;
}) {
  if (!spec) return null;
  const rows = spec.fields.filter((field) => {
    if (skip.indexOf(field.label) >= 0) return false;
    if (field.label === LABEL_REPLY_TIME && replySlaHours(settings) === null) return false;
    return !isNotApplicable(field.value);
  });
  if (rows.length === 0) return null;
  return (
    <section className="ox-pdp__facts" aria-label={title}>
      <dl className="ox-facts">
        {rows.map((row) => (
          <div className="ox-facts__row" key={row.label}>
            <dt className="ox-facts__label">{row.label}</dt>
            <dd className="ox-facts__value">{row.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
