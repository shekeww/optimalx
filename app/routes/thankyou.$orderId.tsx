import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ThankYou } from '@salla.sa/twilight-theme-engine/routes/thank-you';
import type { ThankYouPageProps } from '@salla.sa/twilight-theme-engine/routes/thank-you';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { ThankYouBlocks } from '../components/commerce/ThankYouBlocks';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * The thank-you page (DIRECTION 6.10). The engine's order summary is kept
 * whole and `ThankYouBlocks` is appended under it.
 *
 * The blocks sit in this wrapper rather than in one of the four
 * `thank-you:*` hook slots the engine does render
 * (ThankYouPage-A7IWCMXJ.js) because those slots are handed no context: the
 * order is in the loader data here, and the "how to start" lines are chosen
 * from it.
 *
 * `ThankYou.Component` is a `React.lazy` component, so it needs a Suspense
 * boundary of its own on a route that has no pending component.
 *
 * Head: `noindex, follow` (an order confirmation is nobody's landing page)
 * and the C12 canonical correction.
 */
export const Route = createFileRoute('/{-$locale}/thankyou/$orderId')({
  loader: ({ params }): Promise<ThankYouPageProps> =>
    ThankYou.loader({ params: { orderId: params.orderId }, locale: params.locale }),
  head: withHead(ThankYou, commerceHeadExtend({ noindex: true })),
  component: ThankYouComponent,
});

function ThankYouComponent() {
  const data: ThankYouPageProps = Route.useLoaderData();
  return (
    <div className="ox-thankyou">
      <Suspense fallback={<div className="ox-thankyou__pending" aria-hidden="true" />}>
        <ThankYou.Component {...data} />
      </Suspense>
      <div className="ox-thankyou__blocks">
        <ThankYouBlocks order={data.order} />
      </div>
    </div>
  );
}
