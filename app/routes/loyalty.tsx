import { createFileRoute } from '@tanstack/react-router';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Loyalty } from '@salla.sa/twilight-theme-engine/routes/loyalty';
import type { LoyaltyPageProps } from '@salla.sa/twilight-theme-engine/routes/loyalty';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { AccountEmpty } from '../components/commerce/AccountEmpty';
import { commerceHeadExtend } from '../components/commerce/head';
import { orGuest, type GuestResult, isGuest } from '../components/commerce/guest';
import { AccountSignedOut } from '../components/commerce/AccountSignedOut';

/**
 * The loyalty programme (PLAN-final 6.3 "Loyalty, testimonials, pending
 * orders").
 *
 * The page promises nothing the dashboard has not configured. When the store
 * has published ways to earn points or prizes to spend them on, the engine
 * page renders them from the API and this route only restyles it. When it has
 * not, which is the state today, the route renders an honest empty state
 * instead of an empty programme banner: a reward that is not configured is
 * not a reward, and inventing one is a claims violation (PLAN-final 6.5).
 *
 * `noindex, follow`: the page is meaningless to a visitor who is not signed
 * in, and its content is per customer.
 */
export const Route = createFileRoute('/{-$locale}/loyalty')({
  loader: ({ params }): Promise<LoyaltyPageProps | GuestResult> =>
    orGuest(() => Loyalty.loader({ locale: params.locale })),
  head: withHead(Loyalty, commerceHeadExtend({ noindex: true })),
  component: LoyaltyComponent,
});

/** A programme with no way to earn and no prize to spend on is not running. */
function isRunning(data: LoyaltyPageProps): boolean {
  const loyalty = data.loyalty;
  if (!loyalty || loyalty.status === false) return false;
  return (loyalty.points?.length ?? 0) > 0 || (loyalty.prizes?.length ?? 0) > 0;
}

function LoyaltyComponent() {
  const { t } = useTranslation();
  const data = Route.useLoaderData();

  // A signed-out visitor and a programme that is not running both land on a
  // panel rather than an error, but they are different statements and get
  // different copy.
  if (isGuest(data) || !isRunning(data)) {
    return (
      <div className="ox-surface ox-surface--loyalty">
        <div className="ox-container">
          <header className="ox-surface__head">
            <h1 className="ox-h1">{t('ox.account.loyalty')}</h1>
            <p className="ox-surface__lead ox-body">{t('ox.account.loyalty_lead')}</p>
          </header>
          {isGuest(data) ? (
            <AccountSignedOut bodyKey="ox.account.signed_out_loyalty" />
          ) : (
            <AccountEmpty
              icon="points"
              titleKey="ox.empty.loyalty_title"
              bodyKey="ox.empty.loyalty_body"
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="ox-loyalty">
      <Loyalty.Component {...data} />
    </div>
  );
}
