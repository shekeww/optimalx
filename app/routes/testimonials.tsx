import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Testimonials } from '@salla.sa/twilight-theme-engine/routes/testimonials';
import type { TestimonialsPageProps } from '@salla.sa/twilight-theme-engine/routes/testimonials';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { Panel } from '../components/common/Panel';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * Customer opinions (PLAN-final 6.3, 6.5 "Testimonials must not imply that
 * reviews exist").
 *
 * `SallaComments` is the platform's own list and it renders exactly what the
 * store has, which today is nothing. The page therefore carries one line
 * saying the store is new, above the list and below the breadcrumb, and
 * states no rating, no count and no satisfaction figure anywhere.
 *
 * The note is rendered before the engine's `.container` and ordered into
 * place by `_b6-commerce.scss`, which lifts that container with
 * `display: contents`. The engine renders the page's one h1 from `page.title`
 * and the note deliberately adds no second heading.
 *
 * `noindex, follow`: an empty opinions page is nobody's landing page, and the
 * robots value flips the day the store has opinions to show.
 */
export const Route = createFileRoute('/{-$locale}/testimonials')({
  loader: ({ params }): Promise<TestimonialsPageProps> =>
    Testimonials.loader({ locale: params.locale }),
  head: withHead(Testimonials, commerceHeadExtend({ noindex: true })),
  component: TestimonialsComponent,
});

function TestimonialsComponent() {
  const { t } = useTranslation();
  const data: TestimonialsPageProps = Route.useLoaderData();

  return (
    <div className="ox-testimonials">
      <Panel className="ox-testimonials__note" tone="plate">
        <p className="ox-body">{t('ox.account.testimonials_lead')}</p>
      </Panel>
      <Testimonials.Component {...data} />
    </div>
  );
}
