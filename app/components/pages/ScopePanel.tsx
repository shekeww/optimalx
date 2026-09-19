import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../common/Icon';
import { SERVICES_HUB } from '../../content/services';

export interface ScopePanelProps {
  /** Locale keys of the positive list (FINAL-content 4.2). */
  items?: readonly string[];
  titleKey?: string;
  /**
   * The lawyer-gated closing line. It is a claims gate, not decoration: the
   * panel always renders it and never softens or paraphrases it
   * (PLAN-final 5.1, FINAL-content 4.2).
   */
  closingKey?: string;
  headingLevel?: 'h2' | 'h3';
  className?: string;
}

/**
 * "What we help with": the positive scope list plus the mandated medical line
 * (DIRECTION 6.11 block 4, FINAL-content 4.2).
 *
 * The list is positive by rule: BUILD.md section 7 forbids a list of
 * exclusions, so what is outside the work is said in one sentence at the end
 * rather than as a column of "we do not" bullets.
 */
export function ScopePanel({
  items = SERVICES_HUB.scopeKeys,
  titleKey = SERVICES_HUB.scopeTitleKey,
  closingKey = 'ox.services.medical_line',
  headingLevel: Heading = 'h2',
  className,
}: ScopePanelProps) {
  const { t } = useTranslation();
  return (
    <section
      className={['ox-scope', className].filter(Boolean).join(' ')}
      data-testid="ox-scope-panel"
    >
      <Heading className="ox-scope__title ox-h3">{t(titleKey)}</Heading>
      <ul className="ox-scope__list">
        {items.map((key) => (
          <li key={key} className="ox-scope__item ox-body">
            <Icon name="tick" size={20} className="ox-scope__tick" />
            <span>{t(key)}</span>
          </li>
        ))}
      </ul>
      <p className="ox-scope__closing ox-small" data-testid="ox-medical-line">
        {t(closingKey)}
      </p>
    </section>
  );
}
