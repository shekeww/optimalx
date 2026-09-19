import { createFileRoute } from '@tanstack/react-router';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks';
import { pageHead } from '../components/pages/head';
import { UnitConverter } from '../components/pages/UnitConverter';

/**
 * `/tools/converter` (DIRECTION 6.18): the weight converter.
 *
 * The only B5 page that is `noindex, follow`. It is a utility for a shopper
 * comparing two tubs, not a page that should compete in search with the
 * category and guide pages that answer the same question in words.
 */
export const Route = createFileRoute('/{-$locale}/tools/converter')({
  loader: () => ({ path: '/tools/converter' }),
  head: withHead({
    head: pageHead({
      path: '/tools/converter',
      titleKey: 'ox.tools.converter.meta_title',
      descriptionKey: 'ox.tools.converter.meta_description',
      noindex: true,
    }),
  }),
  component: ConverterRoute,
});

function ConverterRoute() {
  useDocumentClass({ body: { class: 'ox-page-converter' } });
  return <UnitConverter />;
}
