import { createFileRoute } from '@tanstack/react-router';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks';
import { categoriesHeadExtend } from '../components/seo/routeHeads';
import { CATEGORIES_INDEX_KEYS, CategoriesIndex } from '../components/listing/CategoriesIndex';

/**
 * `/categories`: the taxonomy index (PLAN-ship Batch S1 step 6, Contract E:
 * S1 owns this one route file).
 *
 * Registered in `app/routes.ts` like the other custom pages, so the plugin
 * nests it under `{-$locale}` and the engine gives it neither a `RouteId`
 * nor a `<body>` class (engine-surface 8.5); the component registers its own.
 *
 * The one-line loader is load-bearing, as on `/services`: `withHead`
 * returns an empty head when `ctx.loaderData` is falsy, so a route with no
 * loader ships no title, no description and no canonical. The title and
 * description keys are the same object the page reads, so `<title>` and the
 * h1 come from one source.
 */
export const Route = createFileRoute('/{-$locale}/categories')({
  loader: () => ({ path: '/categories' }),
  head: withHead({
    head: categoriesHeadExtend({
      path: '/categories',
      titleKey: CATEGORIES_INDEX_KEYS.title,
      descriptionKey: CATEGORIES_INDEX_KEYS.description,
    }),
  }),
  component: CategoriesRoute,
});

function CategoriesRoute() {
  useDocumentClass({ body: { class: 'ox-page-categories' } });
  return <CategoriesIndex />;
}
