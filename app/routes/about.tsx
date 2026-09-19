import { createFileRoute } from '@tanstack/react-router';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks';
import { pageHead } from '../components/pages/head';
import { AboutPage } from '../components/pages/AboutPage';

/**
 * `/about` (DIRECTION 6.15). Custom route mechanics as `/services`: nested
 * under `{-$locale}`, its own body class, and a loader so `withHead` runs.
 */
export const Route = createFileRoute('/{-$locale}/about')({
  loader: () => ({ path: '/about' }),
  head: withHead({
    head: pageHead({
      path: '/about',
      titleKey: 'ox.pages.about.meta_title',
      descriptionKey: 'ox.pages.about.meta_description',
    }),
  }),
  component: AboutRoute,
});

function AboutRoute() {
  useDocumentClass({ body: { class: 'ox-page-about' } });
  return <AboutPage />;
}
