import { createFileRoute } from '@tanstack/react-router';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks';
import { pageHead } from '../components/pages/head';
import { resolveFaq } from '../components/pages/faq';
import { SERVICES_FAQ, ServicesHub } from '../components/pages/ServicesHub';

/**
 * `/services`: the "ask before you buy" hub (DIRECTION 6.11).
 *
 * Custom routes are nested under `{-$locale}` through `app/routes.ts`, so this
 * serves at `/ar/services`. The engine's route map has no entry for it, so it
 * gets neither a semantic `RouteId` nor a `<body>` route class
 * (engine-surface 8.5, 15.8 item 15) and the component registers its own.
 *
 * The loader is not decoration: `withHead` returns an empty head when
 * `ctx.loaderData` is falsy (theme-engine chunk-4D44TJ72.js:108), so a route
 * with no loader would ship no title, no description and no canonical.
 */
export const Route = createFileRoute('/{-$locale}/services')({
  loader: () => ({ path: '/services' }),
  head: withHead({
    head: pageHead({
      path: '/services',
      titleKey: 'ox.services.meta_title',
      descriptionKey: 'ox.services.meta_description',
      faq: (t) => resolveFaq(t, SERVICES_FAQ),
    }),
  }),
  component: ServicesRoute,
});

function ServicesRoute() {
  useDocumentClass({ body: { class: 'ox-page-services' } });
  return <ServicesHub />;
}
