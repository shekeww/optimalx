import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Bdi } from '../../common/Bdi';
import { PdpIcon, type PdpIconName } from '../PdpIcon';
import { splitStep } from '../lib/steps';

export interface HowToUseProps {
  /** Sentences from the description's "طريقة الاستخدام" paragraph. */
  steps: string[];
  /** The supply calculator, when the label printed a servings count. */
  footer?: ReactNode;
}

/** One glyph per step, at the step's inline start. */
const GLYPHS: PdpIconName[] = ['scoop-cup', 'shaker', 'shaker-straw'];

/**
 * The method of use panel (design region 37): numbered steps, one outline
 * glyph each, separated by hairlines.
 *
 * The words are the merchant's own how-to-use paragraph and nothing else. No
 * dose is suggested, no step is added to reach three, and the whole panel and
 * its tab disappear when the paragraph is absent (B21). The step number is
 * two digits in the accent, and any numeric range inside a step sits in a bidi
 * isolate so "250-350" does not reverse in Arabic.
 */
export function HowToUse({ steps, footer }: HowToUseProps) {
  const { t } = useTranslation();
  if (steps.length === 0) return null;

  return (
    <section className="ox-panel ox-howto" id="ox-howto" aria-labelledby="ox-howto-title">
      <h2 className="ox-panel__title" id="ox-howto-title">
        {t('ox.pdp.how_to_use')}
      </h2>
      <ol className="ox-howto__list">
        {steps.map((step, index) => {
          const parts = splitStep(step);
          return (
            <li className="ox-howto__step" key={String(index) + step.slice(0, 12)}>
              <PdpIcon
                name={GLYPHS[index] ?? GLYPHS[GLYPHS.length - 1]}
                size={44}
                className="ox-howto__glyph"
              />
              <div className="ox-howto__body">
                <span className="ox-howto__num" aria-hidden="true">
                  <Bdi>{String(index + 1).padStart(2, '0')}</Bdi>
                </span>
                <p className="ox-howto__lead">{parts.lead}</p>
                {parts.tail ? <p className="ox-howto__tail">{parts.tail}</p> : null}
              </div>
            </li>
          );
        })}
      </ol>
      {footer ? <div className="ox-howto__footer">{footer}</div> : null}
    </section>
  );
}
