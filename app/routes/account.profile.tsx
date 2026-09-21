import { createFileRoute } from '@tanstack/react-router';
import { Profile } from '@salla.sa/twilight-theme-engine/routes/account';
import type { ProfilePageProps } from '@salla.sa/twilight-theme-engine/routes/account';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountShell } from '../components/commerce/AccountShell';
import { commerceHeadExtend } from '../components/commerce/head';
import { orGuest, type GuestResult, isGuest } from '../components/commerce/guest';
import { AccountSignedOut } from '../components/commerce/AccountSignedOut';

/**
 * The profile (PLAN-final 6.3 "Account").
 *
 * `SallaUserProfile`, `SallaVerify` and `SallaUserSettings` are Salla's own
 * form components and they own the account data, the verification flow and
 * the preference writes. They are restyled, never replaced: the theme has no
 * business holding a customer's name, mobile or verification state.
 *
 * The avatar uploader stays where the engine puts it, in `nav.sidebar`, so
 * there is only ever one `SallaFileUpload` bound to the profile image on the
 * page; the stylesheet lifts it out of the dead 288 column the engine parks
 * it in and sets it at the RTL start above the title.
 *
 * `noindex, follow`: a profile is per visitor and behind a login.
 */
export const Route = createFileRoute('/{-$locale}/account/profile')({
  loader: ({ params }): Promise<ProfilePageProps | GuestResult> =>
    orGuest(() => Profile.loader({ locale: params.locale })),
  head: withHead(Profile, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: ProfileComponent,
});

function ProfileComponent() {
  const data = Route.useLoaderData();

  return (
    <AccountShell current="profile" titleKey="ox.account.profile" leadKey="ox.account.profile_lead">
      {isGuest(data) ? (
        <AccountSignedOut bodyKey="ox.account.signed_out_profile" />
      ) : (
        <div className="ox-forms">
          <Profile.Component {...data} />
        </div>
      )}
    </AccountShell>
  );
}
