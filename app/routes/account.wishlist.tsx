import { createFileRoute } from '@tanstack/react-router';
import { Wishlist } from '@salla.sa/twilight-theme-engine/routes/account';
import type { WishlistPageProps } from '@salla.sa/twilight-theme-engine/routes/account';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountShell } from '../components/commerce/AccountShell';
import { AccountEmpty } from '../components/commerce/AccountEmpty';
import { commerceHeadExtend } from '../components/commerce/head';
import { orGuest, type GuestResult, isGuest } from '../components/commerce/guest';
import { AccountSignedOut } from '../components/commerce/AccountSignedOut';

/**
 * Saved products (PLAN-final 6.3 "Account").
 *
 * The engine's own wishlist row is a list entry with a red sale price and a
 * danger-coloured delete button, neither of which exists in this design. It
 * is kept because it carries the two live controls, `SallaAddProductButton`
 * and the `useWishlist().remove()` call, and restyled in
 * `_b6-commerce.scss`: the thumbnail onto `--ox-plate`, the prices to ink,
 * the row onto the panel contract.
 *
 * `noindex, follow`: a wishlist is per visitor and behind a login.
 */
export const Route = createFileRoute('/{-$locale}/account/wishlist')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    return page > 1 ? { page } : {};
  },
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ deps, params }): Promise<WishlistPageProps | GuestResult> =>
    orGuest(() => Wishlist.loader({ search: { page: deps.page ?? 1 }, locale: params.locale })),
  head: withHead(Wishlist, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: WishlistComponent,
});

function WishlistComponent() {
  const data = Route.useLoaderData();
  const guest = isGuest(data);
  const empty = !guest && (data.products?.length ?? 0) === 0;

  return (
    <AccountShell
      current="wishlist"
      titleKey="ox.account.wishlist"
      leadKey="ox.account.wishlist_lead"
    >
      {guest ? (
        <AccountSignedOut bodyKey="ox.account.signed_out_wishlist" />
      ) : empty ? (
        <AccountEmpty
          icon="gift"
          titleKey="ox.empty.wishlist_title"
          bodyKey="ox.empty.wishlist_body"
          secondaryTo="/"
          secondaryKey="ox.empty.cta_goals"
        />
      ) : (
        <div className="ox-wishlist">
          <Wishlist.Component {...data} />
        </div>
      )}
    </AccountShell>
  );
}
