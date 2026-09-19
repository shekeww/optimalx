import { lazy, Suspense, useEffect, type ReactNode } from 'react';
import { HeadContent, Scripts } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
} from '@salla.sa/twilight-theme-engine/tanstack';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import { OptimalXLayout } from '../components/layout/OptimalXLayout';
import { ErrorState } from '../components/pages/ErrorState';
import { NotFound } from '../components/pages/NotFound';
import { dropBaseCanonical, stopDarkMode } from '../components/pages/rootHead';
import '../styles/app.css';

// Dev-only: reads the theme's local twilight.json (settings + components),
// fills defaults, and lets you edit them live. Imported from the engine's `/dev`
// subpath under an import.meta.env.DEV gate so it is tree-shaken from prod builds.
const DevSettingsWidget = import.meta.env.DEV
  ? lazy(() =>
      import('@salla.sa/twilight-theme-engine/dev').then((m) => ({ default: m.DevSettingsWidget }))
    )
  : null;

// Dev-only, same gate as DevSettingsWidget: the router devtools never reach a
// production bundle.
const RouterDevtools = import.meta.env.DEV
  ? lazy(() =>
      import('@tanstack/react-router-devtools').then((m) => ({
        default: m.TanStackRouterDevtools,
      }))
    )
  : null;

/**
 * The engine's own root options, read off a throwaway route.
 *
 * `createTwilightRootRoute()` calls the TanStack factory with
 * `{ beforeLoad, head, errorComponent, ...options }` and spreads `options`
 * LAST (theme-engine chunk-QVPMWMPP.js:459-467), so anything this theme passes
 * replaces the engine's version outright. `beforeLoad` must never be replaced
 * (it is the settings prefetch), and `head` must not be replaced either: it
 * builds the base meta, the font and style links, the import map and the
 * engine scripts. The engine's `head` is therefore captured here and wrapped,
 * which is the only way to post-process it from outside the package.
 * Constructing a second root route is side-effect free; it is never added to
 * the route tree.
 */
const engineRootHead = createTwilightRootRoute()({}).options.head as
  | ((ctx: unknown) => Record<string, unknown>)
  | undefined;

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
  // Exactly one <link rel="canonical"> per page (brief B5 addendum): the
  // engine root emits a path-less, locale-less one and every route head adds
  // the real one, so the base one is dropped here.
  head: engineRootHead
    ? (ctx: unknown) => dropBaseCanonical(engineRootHead(ctx))
    : undefined,
  // Global 404 and the root error boundary, themed and inside the layout.
  notFoundComponent: NotFound,
  errorComponent: ErrorState,
});

function RootComponent({ children }: { children?: ReactNode }) {
  const ctx = getTwilightContext();

  // The live store serves `<body class="... color-mode-dark">` from a store or
  // SDK setting; this theme has one light palette and no dark token set
  // (DIRECTION 2), so the class only makes the scaffold's dark rules fight
  // ours. The store setting is left alone; only this document is corrected.
  useEffect(() => stopDarkMode(), []);

  return (
    <html lang={ctx.locale} dir={ctx.dir} suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        <noscript>
          To get full functionality of this site you need to enable JavaScript.
          <a href="https://www.enable-javascript.com/" rel="noreferrer" target="_blank">
            To enable JavaScript on webpage
          </a>
          .
        </noscript>
        {/*
          `children`, not a bare `<Outlet/>`: TanStack renders the root's
          suspense, error and not-found boundaries INSIDE the shell and hands
          them to it as children (react-router Match.js:46). A shell that
          renders its own Outlet instead drops all three, which is why the
          root `errorComponent` and `notFoundComponent` above would otherwise
          never appear. The Outlet still runs, one level down, inside
          `MatchInner`.
        */}
        <TwilightProvider translations={themeTranslations} layout={OptimalXLayout}>
          {children}
        </TwilightProvider>
        {RouterDevtools && (
          <Suspense fallback={null}>
            <RouterDevtools position="bottom-right" />
          </Suspense>
        )}
        {DevSettingsWidget && (
          <Suspense fallback={null}>
            <DevSettingsWidget schema={devSchema} />
          </Suspense>
        )}
        <Scripts />
      </body>
    </html>
  );
}
