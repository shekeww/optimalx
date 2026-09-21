import { createFileRoute } from '@tanstack/react-router';
import { Orders } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import type { OrdersPageProps } from '@salla.sa/twilight-theme-engine/routes/account/orders';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountShell } from '../components/commerce/AccountShell';
import { AccountEmpty } from '../components/commerce/AccountEmpty';
import { commerceHeadExtend } from '../components/commerce/head';
import { orGuest, type GuestResult, isGuest } from '../components/commerce/guest';
import { AccountSignedOut } from '../components/commerce/AccountSignedOut';

/**
 * Order history (PLAN-final 6.3 "Account").
 *
 * The engine page keeps the list: `ItemsList` owns the cursor and the load
 * more button, and the cursor is Salla's pagination, not ours. What this
 * wrapper adds is the frame (`AccountShell`) and the empty state, which the
 * route can decide because the loader has already answered with the orders.
 * On this store that answer is always an empty array, so the empty render is
 * the one the design is checked in.
 *
 * `noindex, follow`: an order history is per visitor and behind a login.
 */
export const Route = createFileRoute('/{-$locale}/account/orders')({
  validateSearch: (search: Record<string, unknown>) => {
    const status = (search.status as string) || undefined;
    return status ? { status } : {};
  },
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ deps, params }): Promise<OrdersPageProps | GuestResult> =>
    orGuest(() => Orders.loader({ search: { status: deps.status }, locale: params.locale })),
  head: withHead(Orders, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: OrdersComponent,
});

function OrdersComponent() {
  const data = Route.useLoaderData();
  const guest = isGuest(data);
  const empty = !guest && (data.orders?.length ?? 0) === 0;

  return (
    <AccountShell current="orders" titleKey="ox.account.orders" leadKey="ox.account.orders_lead">
      {guest ? (
        <AccountSignedOut bodyKey="ox.account.signed_out_orders" />
      ) : empty ? (
        <AccountEmpty
          icon="plan"
          titleKey="ox.empty.orders_title"
          bodyKey="ox.empty.orders_body"
          secondaryTo="/"
          secondaryKey="ox.empty.cta_goals"
        />
      ) : (
        <Orders.Component {...data} />
      )}
    </AccountShell>
  );
}
