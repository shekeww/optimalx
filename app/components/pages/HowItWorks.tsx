import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface HowItWorksStep {
  titleKey: string;
  lineKey: string;
}

export interface HowItWorksProps {
  steps: readonly HowItWorksStep[];
  titleKey?: string;
  headingLevel?: 'h2' | 'h3';
  /** Step headings sit one level under the block heading. */
  stepHeadingLevel?: 'h3' | 'h4';
  className?: string;
}

/**
 * A numbered three-step strip (DIRECTION 6.11 block 5, 6.12 block 4).
 *
 * An ordered list, so the order is in the markup and not only in the numeral;
 * the numeral itself is decorative and hidden from assistive tech, which reads
 * the list semantics instead. Used by the services hub, the branch pickup
 * steps and, through the `ServiceSteps` alias, by the service PDP.
 */
export function HowItWorks({
  steps,
  titleKey,
  headingLevel: Heading = 'h2',
  stepHeadingLevel: StepHeading = 'h3',
  className,
}: HowItWorksProps) {
  const { t } = useTranslation();
  if (steps.length === 0) return null;
  return (
    <section className={['ox-how', className].filter(Boolean).join(' ')} data-testid="ox-how">
      {titleKey ? <Heading className="ox-how__title ox-h3">{t(titleKey)}</Heading> : null}
      <ol className="ox-how__list">
        {steps.map((step, index) => (
          <li key={step.titleKey} className="ox-how__step">
            <span className="ox-how__num ox-num" aria-hidden="true">
              {index + 1}
            </span>
            <StepHeading className="ox-how__step-title">{t(step.titleKey)}</StepHeading>
            <p className="ox-how__line ox-small">{t(step.lineKey)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

/**
 * The name the service PDP imports (brief B5 addendum): the PDP's "how it
 * works" block is this same strip over `SERVICE_STEPS`, so the hub and the
 * PDP can never drift apart.
 */
export const ServiceSteps = HowItWorks;
