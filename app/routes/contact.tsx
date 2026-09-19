import { createFileRoute } from '@tanstack/react-router';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks';
import { pageHead } from '../components/pages/head';
import { ContactPage } from '../components/pages/ContactPage';

/**
 * `/contact` (DIRECTION 6.16). Custom route mechanics as `/services`: nested
 * under `{-$locale}`, its own body class, and a loader so `withHead` runs.
 */
export const Route = createFileRoute('/{-$locale}/contact')({
  loader: () => ({ path: '/contact' }),
  head: withHead({
    head: pageHead({
      path: '/contact',
      titleKey: 'ox.pages.contact.meta_title',
      descriptionKey: 'ox.pages.contact.meta_description',
    }),
  }),
  component: ContactRoute,
});

function ContactRoute() {
  useDocumentClass({ body: { class: 'ox-page-contact' } });
  return <ContactPage />;
}
