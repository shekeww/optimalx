import { createFileRoute } from '@tanstack/react-router';
import { Settings } from '@salla.sa/twilight-theme-engine/routes/account';
import type { SettingsPageProps } from '@salla.sa/twilight-theme-engine/routes/account';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountShell } from '../components/commerce/AccountShell';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * Account settings (PLAN-final 6.3 "Account").
 *
 * `SallaUserSettings` is the platform's own preference form: language,
 * currency and whether the customer accepts notifications. It writes through
 * the SDK, so it is restyled in `_b6-commerce.scss` and never rebuilt.
 *
 * `noindex, follow`: settings are per visitor and behind a login.
 */
export const Route = createFileRoute('/{-$locale}/account/settings')({
  loader: ({ params }): Promise<SettingsPageProps> => Settings.loader({ locale: params.locale }),
  head: withHead(Settings, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: SettingsComponent,
});

function SettingsComponent() {
  const data: SettingsPageProps = Route.useLoaderData();

  return (
    <AccountShell
      current="settings"
      titleKey="ox.account.settings"
      leadKey="ox.account.settings_lead"
    >
      <div className="ox-forms">
        <Settings.Component {...data} />
      </div>
    </AccountShell>
  );
}
