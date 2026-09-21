import { useQuery } from '@tanstack/react-query';
import { product } from '@salla.sa/twilight-theme-engine/api/product';
import { useTheme } from '@salla.sa/twilight-theme-engine/hooks/useTheme';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Bdi } from '../common/Bdi';
import { Button } from '../common/Button';
import { Icon } from '../common/Icon';
import { Panel, PanelRowGroup } from '../common/Panel';
import { Price } from '../common/Price';
import { StatStrip, type StatCellData } from '../common/StatStrip';
import { replySlaHours } from '../product/lib/claims';
import { idForSku, pathForSku } from '../../content/salla-ids';
import type { ServicePage } from '../../content/services';

/** `Product.price` is `number | string` in the engine types. */
function priceNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

export interface ServiceSectionProps {
  page: ServicePage;
  /** Overrides the id resolved from the SKU (kitchen sink, tests). */
  productId?: number;
}

/**
 * One advisory service, in full, as an anchored section of `/services`
 * (PLAN-final 5.3 "Service pages").
 *
 * It was specified as its own route at `/services/$channel`. The route cannot
 * ship: the engine's route-tree generator will not add ANY new path to
 * `app/routeTree.gen.ts`, verified by registering three throwaway routes
 * (`/svc`, `/zztest`, and `/zzz` pointing at an existing file) and rebuilding
 * from a cleared cache with `app/routeTree.gen.ts` deleted. All three were
 * loaded from `app/routes.ts`, all three had their `createFileRoute` id
 * rewritten by the generator, and none of the three reached the tree, while
 * the six routes the tree already knew kept working. That is an engine defect
 * and it is reported rather than worked around.
 *
 * So the five services live on one page, each with its own `id`, reachable as
 * `/services#personal-training` and navigable through the anchor strip. The
 * page owns the one band and the one wedge; a section carries no band of its
 * own, because five dark heroes stacked would turn the site's section break
 * into wallpaper.
 *
 * Composition per section: the heading and lead, the statistic strip, three
 * panels (what it covers, what to prepare, what you leave with), the limit
 * lines and the primary action.
 *
 * Claims gates:
 *  - **the price is never typed.** It is read from the live product behind the
 *    service's SKU and rendered through `useMoney` (`Price`), or as the shared
 *    free label at zero. A service with no product behind it shows no price
 *    cell at all, which is what `nutrition-plans` does;
 *  - **no reply time is promised** unless `reply_sla_hours` is set, and then
 *    the setting's own number is what renders;
 *  - the limit-of-our-work line renders verbatim from the section's
 *    `footerKey` and is never softened;
 *  - nothing states what the service will achieve. Every panel says what the
 *    service covers, what to bring and what you leave with.
 */
export function ServiceSection({ page, productId }: ServiceSectionProps) {
  const { t } = useTranslation();
  const { settings } = useTheme();

  const id = productId ?? (page.sku ? idForSku(page.sku) : undefined);
  const query = useQuery({
    ...product.queries.detail(String(id ?? '')),
    enabled: id !== undefined,
  });
  const amount = priceNumber(query.data?.price);

  const replyHours = replySlaHours(settings as Record<string, unknown> | undefined);
  const productPath = page.sku ? pathForSku(page.sku) : undefined;
  const ctaTo = productPath ?? page.ctaTo ?? '/services';
  const titleId = `${page.slug}-title`;

  const cells: StatCellData[] = [];
  if (amount !== undefined) {
    cells.push({
      id: 'price',
      value:
        amount === 0 ? (
          <span className="ox-stats__free">{t('ox.common.free')}</span>
        ) : (
          <Price amount={amount} />
        ),
      label: t('ox.services.stat_price'),
    });
  }
  if (replyHours) {
    cells.push({
      id: 'reply',
      value: <Bdi>{replyHours}</Bdi>,
      label: t('ox.services.stat_reply'),
      sub: t('ox.services.stat_reply_unit'),
    });
  }
  if (page.changeKey) {
    cells.push({
      id: 'change',
      glyph: 'tick',
      label: t('ox.services.stat_change'),
      sub: t(page.changeKey),
    });
  }

  return (
    <section
      className="ox-service"
      id={page.slug}
      aria-labelledby={titleId}
      data-testid={`ox-service-${page.slug}`}
    >
      <header className="ox-service__head">
        <Icon name={page.icon} size={32} className="ox-service__icon" />
        <h2 id={titleId} className="ox-service__title ox-h2">
          {t(page.titleKey)}
        </h2>
        <p className="ox-service__sub ox-lead">{t(page.sublineKey)}</p>
      </header>

      <StatStrip cells={cells} className="ox-service__stats" />

      <p className="ox-service__lead ox-body">{t(page.introKey)}</p>

      <PanelRowGroup>
        <Panel title={t(page.scopeTitleKey)} tone="plate">
          <ul className="ox-scope__list">
            {page.scopeKeys.map((key) => (
              <li key={key} className="ox-scope__item ox-body">
                <Icon name="tick" size={20} className="ox-scope__tick" />
                <span>{t(key)}</span>
              </li>
            ))}
          </ul>
        </Panel>
        {page.prepareKey ? (
          <Panel title={t('ox.services.prepare_title')}>
            <p className="ox-body">{t(page.prepareKey)}</p>
          </Panel>
        ) : null}
        {page.outputKey ? (
          <Panel title={t('ox.services.output_title')}>
            <p className="ox-body">{t(page.outputKey)}</p>
          </Panel>
        ) : null}
      </PanelRowGroup>

      <p className="ox-service-limit ox-small" data-testid={`ox-service-limit-${page.slug}`}>
        {t(page.footerKey)}
      </p>

      <div className="ox-service__actions">
        <Button to={ctaTo} size={48} variant="primary">
          {t(page.ctaKey)}
        </Button>
      </div>
    </section>
  );
}

export default ServiceSection;
