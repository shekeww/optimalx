import { createFileRoute } from '@tanstack/react-router';
import { Notifications } from '@salla.sa/twilight-theme-engine/routes/account';
import type { NotificationsPageProps } from '@salla.sa/twilight-theme-engine/routes/account';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountShell } from '../components/commerce/AccountShell';
import { AccountEmpty } from '../components/commerce/AccountEmpty';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * Notifications (PLAN-final 6.3 "Account").
 *
 * The list is the engine's, restyled: the shadowed item box becomes a panel
 * row and the unread mark becomes the accent dot. The copy under the empty
 * state states what the store does send and, as plainly, that it sends no
 * promotional notification.
 *
 * `noindex, follow`: notifications are per visitor and behind a login.
 */
export const Route = createFileRoute('/{-$locale}/account/notifications')({
  loader: ({ params }): Promise<NotificationsPageProps> =>
    Notifications.loader({ locale: params.locale }),
  head: withHead(Notifications, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: NotificationsComponent,
});

function NotificationsComponent() {
  const data: NotificationsPageProps = Route.useLoaderData();
  const empty = (data.notifications?.length ?? 0) === 0;

  return (
    <AccountShell
      current="notifications"
      titleKey="ox.account.notifications"
      leadKey="ox.account.notifications_lead"
    >
      {empty ? (
        <AccountEmpty
          icon="headset"
          titleKey="ox.empty.notifications_title"
          bodyKey="ox.empty.notifications_body"
          primaryTo="/account/orders"
          primaryKey="ox.account.orders"
        />
      ) : (
        <div className="ox-notifications">
          <Notifications.Component {...data} />
        </div>
      )}
    </AccountShell>
  );
}
