import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Price } from '../common/Price';
import { BandPhoto } from './BandPhoto';
import { effectivePrice } from '../product/lib/claims';
import { idForSku } from '../../content/salla-ids';
import type { HomePlan } from '../../content/services';

export interface PlanCardProps {
  plan: HomePlan;
}

/**
 * One programme card, row two of the advisory band (owner brief 2026-09-24;
 * UX audit 2026-09-24 P1-20).
 *
 * THE PLATE. The photograph stays, but the text no longer floats on it. The
 * card's whole content block sits at the FOOT of the card on a solid ink
 * plate (`--ox-ink` at 0.92, `_b2-home.scss` section 8), which is both the
 * audit's fix (the title, the line and the action used to occupy the top
 * 110px of a 300px card and the rest was an empty photograph) and what lets
 * the card carry a list of what is included without a contrast argument for
 * every line: over a 0.92 ink plate the measure is the plate, not the
 * worst-case white pixel of the frame underneath it (X-IDENTITY §4.5's floor
 * is alpha ≥ 0.60 for `--ox-ink-on-dark`; 0.92 clears it with room).
 *
 * WHAT THE CARD SAYS, in the order it says it: the name; one line of WHO it
 * is for, never what it will do to anybody; two things that are included,
 * each one an already-approved scope line of the service the card opens
 * (`HomePlan.itemKeys`); the live "from" price, and only when a real product
 * backs the card (`HomePlan.sku`; the nutrition page has none, so it shows
 * none rather than inventing a figure); then a real full-width outline button
 * carrying the card's own verb, 48 tall, pinned to the plate's foot so three
 * cards of unequal copy still end on one line.
 *
 * Like the doors above it, the card is NOT one big anchor any more: a button
 * cannot live inside an `<a>`, and the accent word plus a detached chevron
 * box that the anchor version showed instead is exactly the "nothing here
 * looks pressable" the owner's screenshot caught.
 *
 * NO WATERMARK AND NO FOOT GLYPH. X-IDENTITY §4.1 allows one watermark per
 * SECTION and this row drew three, plus a decorative icon on every card; the
 * band's one identity device is the ground motif and the offer strip's corner
 * cut. The only accent left on the card is the check glyph on the included
 * list (§4.4's benefit-list bullet), and the card carries no angled gesture
 * of its own beyond its button's own shape.
 */
export function PlanCard({ plan }: PlanCardProps) {
  const { t } = useTranslation();
  const id = plan.sku ? idForSku(plan.sku) : undefined;
  const query = useQuery({
    ...product.queries.detail(String(id ?? '')),
    enabled: id !== undefined,
  });
  const amount = query.data ? effectivePrice(query.data) : undefined;

  return (
    <div className="ox-plan" data-testid="ox-plan-card" data-plan={plan.id}>
      {plan.photo ? <BandPhoto src={plan.photo} className="ox-plan__photo" /> : null}
      <span className="ox-plan__scrim" aria-hidden="true" />
      <div className="ox-plan__body">
        <p className="ox-plan__title ox-title">{t(plan.titleKey)}</p>
        <p className="ox-plan__line ox-small">{t(plan.lineKey)}</p>
        <ul className="ox-plan__items" role="list">
          {plan.itemKeys.map((key) => (
            <li className="ox-plan__item ox-small" key={key}>
              <Icon name="check" size={16} className="ox-plan__check" />
              {t(key)}
            </li>
          ))}
        </ul>
        {/* The price ROW is reserved for every card that has a product
            behind it, and filled once the live price arrives: the figure
            comes from React Query after mount, so a row that appears late
            would push the card's whole plate down and shift the page under
            the reader. The row is empty until the price is known and absent
            entirely where no product backs the card. */}
        {plan.sku ? (
          <p className="ox-plan__price">
            {amount !== undefined && amount > 0 ? (
              <span className="ox-plan__price-value" data-testid="ox-plan-price">
                <span className="ox-plan__price-label ox-small">
                  {t('ox.home.plan_price_from')}
                </span>
                <Price amount={amount} size="h3" />
              </span>
            ) : null}
          </p>
        ) : null}
        <Button
          to={plan.to}
          size={48}
          block
          variant="secondary"
          className="ox-plan__action"
        >
          {t(plan.ctaKey)}
        </Button>
      </div>
    </div>
  );
}
