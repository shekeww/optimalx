import { createFileRoute } from '@tanstack/react-router';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { robots } from '../components/seo/head';

/**
 * /services (P0 stub). B5 owns this file and builds the services hub here
 * (DIRECTION 6.11). Custom routes sit under `{-$locale}` through app/routes.ts,
 * so this serves at /ar/services; the engine gives it no RouteId and no body
 * class (engine-surface 8.5), which B5 sets through `useDocumentClass`. The
 * layout already renders <main id="main-content">, so a page is a section.
 * noindex until the real head lands.
 */
export const Route = createFileRoute('/{-$locale}/services')({
  head: withHead({ head: () => ({ robots: robots(true) }) }),
  component: ServicesStub,
});

function ServicesStub() {
  const { t } = useTranslation();
  return (
    <section aria-busy="true">
      <p>{t('ox.common.loading')}</p>
      {import.meta.env.DEV && <p>TODO B5: services hub</p>}
    </section>
  );
}
