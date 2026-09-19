import { createFileRoute } from '@tanstack/react-router';
import { OrderSingle } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import type { OrderSinglePageProps } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountShell } from '../components/commerce/AccountShell';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * One order (PLAN-final 6.3 "Account").
 *
 * The engine page already carries every fact the order has: the reference,
 * the date, the status, the items, the shipping and the totals, all of it
 * straight from the API. Rebuilding it in the theme would be reimplementing
 * Salla's own data, so it is kept whole and restyled to the panel contract in
 * `_b6-commerce.scss`; the frame and the title come from `AccountShell`.
 *
 * Nothing here states a delivery date. The order carries a carrier only once
 * one is assigned, and the store has no carrier agreement (PLAN-final 0.3).
 */
export const Route = createFileRoute('/{-$locale}/account/orders/$id')({
  loader: ({ params }): Promise<OrderSinglePageProps> =>
    OrderSingle.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(OrderSingle, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: OrderSingleComponent,
});

function OrderSingleComponent() {
  const data: OrderSinglePageProps = Route.useLoaderData();

  return (
    <AccountShell current="orders" titleKey="ox.order.details">
      <div className="ox-order">
        <OrderSingle.Component {...data} />
      </div>
    </AccountShell>
  );
}
