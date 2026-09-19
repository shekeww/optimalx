import { createFileRoute } from '@tanstack/react-router';
import { Wallet } from '@salla.sa/twilight-theme-engine/routes/account';
import type { WalletPageProps } from '@salla.sa/twilight-theme-engine/routes/account';
import { CustomerPageSkeleton } from '@salla.sa/twilight-theme-engine/skeleton';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountShell } from '../components/commerce/AccountShell';
import { AccountEmpty } from '../components/commerce/AccountEmpty';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * The wallet (PLAN-final 6.3 "Account").
 *
 * The balance and every transaction come from the API and nothing is
 * computed here: with no transactions the engine hides its own balance row
 * too, so the surface renders one honest empty state rather than a zero
 * dressed up as a figure.
 *
 * `noindex, follow`: a wallet is per visitor and behind a login.
 */
export const Route = createFileRoute('/{-$locale}/account/wallet')({
  validateSearch: (search: Record<string, unknown>) => {
    const page = Number(search.page) || 1;
    return page > 1 ? { page } : {};
  },
  loaderDeps: ({ search }) => ({ page: search.page }),
  loader: ({ deps }): Promise<WalletPageProps> =>
    Wallet.loader({ search: { page: deps.page ?? 1 } }),
  head: withHead(Wallet, commerceHeadExtend({ noindex: true })),
  pendingComponent: () => <CustomerPageSkeleton />,
  component: WalletComponent,
});

function WalletComponent() {
  const data: WalletPageProps = Route.useLoaderData();
  const empty = (data.transactions?.length ?? 0) === 0;

  return (
    <AccountShell current="wallet" titleKey="ox.account.wallet" leadKey="ox.account.wallet_lead">
      {empty ? (
        <AccountEmpty
          icon="points"
          titleKey="ox.empty.wallet_title"
          bodyKey="ox.empty.wallet_body"
          primaryTo="/account/orders"
          primaryKey="ox.account.orders"
        />
      ) : (
        <div className="ox-wallet">
          <Wallet.Component {...data} />
        </div>
      )}
    </AccountShell>
  );
}
