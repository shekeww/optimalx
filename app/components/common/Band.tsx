import { useId, type ReactNode } from 'react';
import { Icon, type OxIconName } from './Icon';
import { Wordmark } from './Wordmark';

export interface BandBadge {
  id: string;
  glyph: OxIconName;
  label: ReactNode;
  /** A Latin gloss under the Arabic label; the caller passes it already wrapped. */
  latin?: ReactNode;
}

export interface BandProps {
  /** Decorative photograph; empty alt unless `alt` names real content. */
  photo: string;
  /**
   * Real alt text for `photo` (S9a-V2, the branch masthead's photo of the
   * store's own wall mark). Every existing caller omits it and keeps the
   * decorative empty alt this component always rendered.
   */
  alt?: string;
  line1: ReactNode;
  line2?: ReactNode;
  subline?: ReactNode;
  /** Zero to three. An empty array collapses the band's lower tier. */
  badges?: BandBadge[];
  /** The owner's mark at the foot of the band. */
  lockup?: boolean;
  /** False when the screen already spends its one wedge somewhere else. */
  wedge?: boolean;
  headingLevel?: 'h1' | 'h2';
  /** A single primary action; the service pages are the only callers. */
  action?: ReactNode;
  id?: string;
  className?: string;
}

/**
 * The dark full-width section break the whole site shares: a photograph under
 * two flat overlays, the wedge at the brand's 34 degrees (X-IDENTITY-2026-09-22.md
 * §2.1, was 22, `.ox-bband__wedge`'s `skewX(var(--ox-skew))` re-derives
 * automatically), a one or two line
 * statement, an optional badge row and the lockup.
 *
 * It emits exactly the `.ox-bband` markup the product page's `BrandBand`
 * emits, and it imports nothing from `app/components/product/**`. The small
 * duplication is on purpose: `BrandBand` is shipped and verified against the
 * approved image and is not reopened to make this generic.
 *
 * `.ox-bband__plate` (S7b, 2026-09-24) wraps the photo and its scrim only -
 * not the wash, not the wedge straps: those keep painting the whole section
 * exactly as before. The plate alone carries the page-hero cut
 * (`_b5-pages.scss` §2, `ox-angled()` at the primary CTA's own angle), so a
 * page-hero caller reads as one angled card rather than a rectangle with an
 * angled photograph inside it, and the cut never reaches a focusable
 * descendant (`.ox-bband__inner`/`.ox-bband__lockup` are its unclipped
 * siblings, not its children).
 *
 * Two rules the band enforces for the page rather than for itself:
 *  - the wedge is a signature, so a screen carries at most one. A page whose
 *    hero already spends it passes `wedge={false}`;
 *  - the badges are facts, not decoration. A caller with nothing to put in
 *    them passes none and the band drops its lower tier and centres the
 *    statement, which is the render most pages get today.
 */
export function Band({
  photo,
  alt = '',
  line1,
  line2,
  subline,
  badges = [],
  lockup = true,
  wedge = true,
  headingLevel: Heading = 'h2',
  action,
  id,
  className,
}: BandProps) {
  const generatedId = useId();
  const titleId = `${id ?? generatedId}-title`;
  const classes = [
    'ox-bband',
    badges.length > 0 ? null : 'ox-bband--short',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <section className={classes} id={id} aria-labelledby={titleId} data-testid="ox-band">
      <div className="ox-bband__plate" aria-hidden="true">
        <img className="ox-bband__photo" src={photo} alt={alt} loading="lazy" decoding="async" />
        <span className="ox-bband__scrim" aria-hidden="true" />
      </div>

      <span className="ox-bband__wash" aria-hidden="true" />
      {wedge ? (
        <>
          <span className="ox-bband__wedge ox-bband__wedge--wide" aria-hidden="true" />
          <span className="ox-bband__wedge ox-bband__wedge--thin" aria-hidden="true" />
        </>

      ) : null}

      <div className="ox-bband__inner">
        <Heading className="ox-bband__headline" id={titleId}>
          <span className="ox-bband__line">{line1}</span>

          {line2 ? <span className="ox-bband__line">{line2}</span> : null}

        </Heading>

        {subline ? <p className="ox-bband__sub">{subline}</p> : null}


        {badges.length > 0 ? (
          <ul className="ox-bband__badges">
            {badges.map((badge) => (
              <li className="ox-bband__badge" key={badge.id}>
                <span className="ox-bband__ring">
                  <Icon name={badge.glyph} size={16} />

                </span>

                <span className="ox-bband__badge-text">
                  <span className="ox-bband__badge-ar">{badge.label}</span>

                  {badge.latin ? (
                    <span className="ox-bband__badge-latin">{badge.latin}</span>

                  ) : null}
                </span>

              </li>

            ))}
          </ul>

        ) : null}

        {action ? <div className="ox-bband__action">{action}</div> : null}

      </div>


      {lockup ? (
        <p className="ox-bband__lockup">
          {/* Both tones render (S9e item 2, `_b5-pages.scss` §2a): the
              reversed cream file for >=1024, where the text still sits on
              the photograph, and the page-ink file for below 1024, where
              the masthead's own outer rectangle is the page background now.
              CSS toggles which one paints; `Wordmark`'s own doc comment is
              why this is two real assets rather than a filter. */}
          <Wordmark
            width={156}
            variant="full"
            tone="dark"
            className="ox-bband__lockup-mark ox-bband__lockup-mark--dark"
          />
          <Wordmark
            width={156}
            variant="full"
            tone="light"
            className="ox-bband__lockup-mark ox-bband__lockup-mark--light"
          />
        </p>

      ) : null}
    </section>

  );
}

export default Band;
