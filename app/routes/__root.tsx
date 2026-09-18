import React, { lazy, Suspense } from 'react';
import { HeadContent, Scripts, Outlet } from '@tanstack/react-router';
import { TwilightProvider } from '@salla.sa/twilight-theme-engine';
import {
  createTwilightRootRoute,
  getTwilightContext,
} from '@salla.sa/twilight-theme-engine/tanstack';
import themeTranslations from 'virtual:twilight/theme-translations';
import devSchema from 'virtual:twilight/schema';
import { OptimalXLayout } from '../components/layout/OptimalXLayout';
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

export const Route = createTwilightRootRoute()({
  shellComponent: RootComponent,
});

function RootComponent() {
  const ctx = getTwilightContext();

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
        <TwilightProvider translations={themeTranslations} layout={OptimalXLayout}>
          <Outlet />
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
