import { lazy, Suspense } from 'react';
import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { useUser } from '@salla.sa/twilight-theme-engine/hooks/useUser';
import type { LayoutProps } from '@salla.sa/twilight-theme-engine/layout';
import { Sprite } from '../common/Sprite';
import { BottomTabBar } from './BottomTabBar';
import { Footer } from './Footer/Footer';
import { Header } from './Header/Header';
import { LocalizationModal } from './Header/LocalizationButton';
import { RouteAnnouncer } from './RouteAnnouncer';
import { SkipLink } from './SkipLink';

// Same three lazily imported web components the engine's MasterLayout declares
// (theme-engine chunk-DTWFNS3F.js:926-940); the modals only load on the client.
const SallaLoginModal = lazy(() =>
  import('@salla.sa/twilight-components-react/login-modal').then((m) => ({
    default: m.SallaLoginModal,
  }))
);
const SallaScopes = lazy(() =>
  import('@salla.sa/twilight-components-react/scopes').then((m) => ({
    default: m.SallaScopes,
  }))
);
const SallaOfferModal = lazy(() =>
  import('@salla.sa/twilight-components-react/offer-modal').then((m) => ({
    default: m.SallaOfferModal,
  }))
);

/**
 * The theme's layout seam, passed as `layout={OptimalXLayout}` to
 * `TwilightProvider`. It reproduces the engine `MasterLayout` body tree
 * (chunk-DTWFNS3F.js:941-981) so nothing the engine, the Salla SDK or the
 * storefront apps key off (`.app-inner`, `#main-content`, the login, offer and
 * scope modals) moves, and replaces the engine `Header` and `Footer` with the
 * OptimalX ones (DIRECTION 5.1, 5.2).
 *
 * Order inside `.app-inner`: the sprite (inlined once, DIRECTION 8.7), the
 * skip link, the header, `main`, the footer, then the route announcer (A6).
 * `main` carries `tabindex="-1"` so both the skip link and the announcer can
 * move focus to it.
 */
export function OptimalXLayout({ children }: LayoutProps) {
  const { store } = useTwilight();
  const { isLoggedIn } = useUser();
  const auth = store?.settings?.auth;

  return (
    <>
      <div className="app-inner flex flex-col min-h-full">
        <Sprite />
        <SkipLink />
        <Header />
        <main id="main-content" role="main" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <RouteAnnouncer />
      </div>
      <BottomTabBar />
      <LocalizationModal />
      <Suspense>
        <SallaOfferModal />
      </Suspense>
      {!isLoggedIn && (
        <Suspense>
          <SallaLoginModal
            isEmailAllowed={auth?.email_allowed}
            isMobileAllowed={auth?.mobile_allowed}
            isEmailRequired={auth?.is_email_required}
            suppressHydrationWarning
          />
        </Suspense>
      )}
      {store?.scope && (
        <Suspense>
          <SallaScopes
            selection={store.scope.display_as === 'popup' ? 'mandatory' : 'optional'}
            suppressHydrationWarning
          />
        </Suspense>
      )}
    </>
  );
}
