import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../../common/SectionHeader';

export interface HowToUseProps {
  /** Sentences from the description's "طريقة الاستخدام" paragraph. */
  steps: string[];
}

/**
 * Numbered steps in the label's own words (DIRECTION 5.4 HowToUse). The text
 * comes only from the merchant's how-to-use paragraph; nothing is added, and
 * the block disappears when that paragraph is absent.
 */
export function HowToUse({ steps }: HowToUseProps) {
  const { t } = useTranslation();
  if (steps.length === 0) return null;
  return (
    <section className="ox-howto" aria-labelledby="ox-howto-title">
      <SectionHeader title={t('ox.pdp.how_to_use')} titleId="ox-howto-title" />
      <ol className="ox-howto__list">
        {steps.map((step, index) => (
          <li className="ox-howto__step" key={String(index) + step.slice(0, 12)}>
            <span className="ox-howto__num" aria-hidden="true">
              {index + 1}
            </span>
            <span className="ox-howto__text">{step}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
