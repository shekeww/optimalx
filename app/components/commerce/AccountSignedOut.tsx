import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Panel } from '../common/Panel';
import { EmptyState } from '../common/EmptyState';
import { Button } from '../common/Button';
import { LOGIN_PATH } from './guest';

export interface AccountSignedOutProps {
  /** Which surface was asked for, so the body can name it. */
  bodyKey?: string;
}

/**
 * What a signed-out visitor sees on an account surface.
 *
 * This is the honest answer to a page that genuinely needs a session: it says
 * so, and it routes to Salla's own sign-in page rather than reimplementing an
 * OTP flow the platform already owns. It is deliberately not the empty state:
 * telling someone their order history is empty when the truth is that nobody
 * has looked yet would be a different claim.
 */
export function AccountSignedOut({ bodyKey = 'ox.account.signed_out_body' }: AccountSignedOutProps) {
  const { t } = useTranslation();

  return (
    <Panel className="ox-acct-empty">
      <EmptyState
        icon="registry"
        title={t('ox.account.signed_out_title')}
        body={t(bodyKey)}
        primary={
          <Button href={LOGIN_PATH} size={48} variant="primary">
            {t('ox.account.sign_in')}
          </Button>
        }
        secondary={
          <Button to="/latest-products" size={48} variant="secondary">
            {t('ox.empty.cta_shop')}
          </Button>
        }
      />
    </Panel>
  );
}
