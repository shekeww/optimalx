import { createFileRoute } from '@tanstack/react-router';
import { Home } from '@salla.sa/twilight-theme-engine/routes/home';
import type { HomeLoaderData } from '@salla.sa/twilight-theme-engine/routes/home';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { DefaultHome } from '../components/home/DefaultHome';
import { OxWhatsApp } from '../components/home/OxWhatsApp';
import { HomeSkeleton } from '../components/home/HomeSkeleton';
import { hasHeroBlock, hasOxBlock } from '../components/home/defaults';
import { canonicalFor, robots, tryOriginOf } from '../components/seo/head';

/**
 * Home (PLAN-final B2).
 *
 * The loader and the head stay the engine's: `Home.loader` fetches the
 * merchant's block list and `Home.head` builds the title, description, OG block
 * and the WebSite JSON-LD. `extend` applies the C12 correction only, the same
 * one every owned route applies: the engine's canonical is `origin + path` with
 * no locale prefix while og:url and hreflang carry one, so both are rebuilt
 * with `canonicalFor`, which adds the prefix only on a multilingual store. A
 * single-language store emits no hreflang cluster at all.
 *
 * Composition: the merchant's blocks when the dashboard has any, the twelve
 * DIRECTION 6.2 blocks otherwise (C2). A merchant may delete the hero block, so
 * the h1 rule (C19, DIRECTION 9.2) is enforced here: without an `ox-hero` in
 * the composition the route renders the keyword line as a visually hidden h1,
 * which keeps exactly one h1 on the page in every configuration. With a hero
 * the h1 is the hero's own headline; the keyword line stays the engine head's
 * title and this fallback, and is no longer drawn as an eyebrow above the
 * statement, which the reference does not have.
 */
export const Route = createFileRoute('/{-$locale}/')({
  loader: ({ params }): Promise<HomeLoaderData> => Home.loader({ locale: params.locale }),
  head: withHead(Home, (result, ctx) => {
    const origin = tryOriginOf(ctx.settings?.store?.url);
    const path = ctx.location?.pathname ?? '';
    const multilingual = Boolean(ctx.settings?.store?.settings?.is_multilingual);
    const canonical =
      origin && path
        ? canonicalFor(origin, multilingual ? ctx.locale : null, path)
        : result.canonical;

    return {
      ...result,
      robots: robots(false),
      canonical,
      openGraph: { ...result.openGraph, url: canonical },
      alternateLanguages: multilingual ? result.alternateLanguages : undefined,
    };
  }),
  pendingComponent: () => <HomeSkeleton />,
  component: HomeComponent,
});

function HomeComponent() {
  const data: HomeLoaderData = Route.useLoaderData();
  const { t } = useTranslation();
  // A composition counts as the merchant's only when it holds a block of ours.
  // A store arriving from another theme sends that theme's blocks instead, and
  // rendering them would hide this theme's home behind the old one.
  const configured = data.components.length > 0 && hasOxBlock(data.components);
  const heroPresent = configured ? hasHeroBlock(data.components) : true;

  return (
    <>
      {heroPresent ? null : <h1 className="ox-sr-only">{t('ox.home.h1')}</h1>}
      {configured ? <Home.Component {...data} /> : <DefaultHome locale={data.locale} />}
      {/* The floating contact affordance the reference draws above the
          footer. It is gated on a configured WhatsApp number and renders
          nothing without one. It lives on the route rather than in the
          layout because the layout is another batch's file; promoting it to
          every page is a one line move whenever the owner wants that. */}
      <OxWhatsApp />
    </>
  );
}
