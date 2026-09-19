import type { ReactNode } from 'react';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks';
import { AccountNav, type AccountSurface } from './AccountNav';

export type { AccountSurface } from './AccountNav';

export interface AccountShellProps {
  /** Which rail row is current, and which body class the frame rules read. */
  current: AccountSurface;
  /** `ox.account.*` key for the page's one h1. */
  titleKey: string;
  /** One honest line under the title. */
  leadKey?: string;
  /** A panel above the surface's own content (the profile avatar). */
  lead?: ReactNode;
  children: ReactNode;
}

/**
 * The account frame (PLAN-final 6.3 "Account", reference `account.png`).
 *
 * The engine's `CustomerLayout` is a fixed wrapper the theme cannot replace:
 * it is mounted by the generated `/account` layout route inside the engine
 * package. So this shell is mounted *inside* that layout's `.main-content`
 * and takes the row over, while `body.ox-account` lets `_b6-commerce.scss`
 * stand the engine's own chrome down:
 *
 *  - `nav.sidebar` holds `SallaUserMenu` behind `hidden lg:block`, so the
 *    engine gives a phone no account navigation at all. `AccountNav` replaces
 *    it at every width.
 *  - `.main-content` is capped at `max-w-3xl` (768), which cannot hold a rail
 *    and a content column. The class lifts the cap.
 *  - the engine prints `page.title` from Salla's own platform strings as a
 *    centred `h1`. Ours is at the RTL start in the theme's voice, and the
 *    engine's is hidden so the page keeps exactly one h1.
 *
 * The body class is registered through `useDocumentClass`, which the engine
 * mirrors into the server render through `DocumentClassProvider`
 * (chunk-JWXJPJBO.js), so the frame is correct on first paint and not only
 * after hydration.
 */
export function AccountShell({ current, titleKey, leadKey, lead, children }: AccountShellProps) {
  const { t } = useTranslation();
  useDocumentClass({ body: { class: 'ox-account' } });

  return (
    <div className="ox-acct" data-testid="ox-account-shell" data-surface={current}>
      <AccountNav current={current} />
      <div className="ox-acct__main">
        <header className="ox-acct__head">
          <h1 className="ox-acct__title ox-h1">{t(titleKey)}</h1>
          {leadKey ? <p className="ox-acct__lead ox-body">{t(leadKey)}</p> : null}
        </header>
        {lead}
        <div className="ox-acct__body">{children}</div>
      </div>
    </div>
  );
}
