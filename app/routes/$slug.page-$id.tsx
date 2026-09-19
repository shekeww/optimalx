import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageSingle } from '@salla.sa/twilight-theme-engine/routes/page';
import type { PageSingleProps } from '@salla.sa/twilight-theme-engine/routes/page';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { PolicyIntro } from '../components/commerce/PolicyIntro';
import { isFaqPage } from '../components/commerce/policyKind';
import { commerceHeadExtend } from '../components/commerce/head';
import { FaqPage } from '../components/pages/FaqPage';

/**
 * A store page: the FAQ, the policies, and anything else the owner writes in
 * the dashboard (DIRECTION 6.18 "policies: h1 plus sanitised body in the text
 * measure").
 *
 * Two renders, decided by the slug and the page title:
 *
 *  - **the FAQ page** is the one store page whose body the theme replaces.
 *    Its questions live in `app/content/faq.ts` and are shared with the
 *    services hub, the home block and the branch page, so a merchant editing
 *    the dashboard copy cannot put a second version of the same answer in
 *    front of a shopper. `FaqPage` renders the band, the filter, the anchor
 *    strip and the grouped panels;
 *  - **everything else** is the engine page wrapped whole and restyled.
 *    `PolicyIntro` is a sibling in DOM order and the stylesheet places it
 *    between the breadcrumb and the page card, which is where FINAL-content
 *    6.3 puts it ("each intro sits above the full policy text").
 *
 * Head: the C12 canonical correction, `index, follow`, and nothing else. The
 * engine head already carries the title, the description built from the body
 * and the article open-graph fields; the engine `Breadcrumb` emits the one
 * BreadcrumbList (C11).
 */
export const Route = createFileRoute('/{-$locale}/$slug/page-{$id}')({
  loader: ({ params }): Promise<PageSingleProps> =>
    PageSingle.loader({ params: { id: params.id }, locale: params.locale }),
  head: withHead(PageSingle, commerceHeadExtend()),
  component: PageSingleComponent,
});

function PageSingleComponent() {
  const data: PageSingleProps = Route.useLoaderData();
  const { slug } = Route.useParams();

  if (isFaqPage(slug, data.page.title)) {
    return <FaqPage title={data.page.title} />;
  }

  return (
    <div className="ox-policy">
      <Suspense fallback={<div className="ox-policy__pending" aria-hidden="true" />}>
        <PageSingle.Component {...data} />
      </Suspense>
      <PolicyIntro slug={slug} title={data.page.title} />
    </div>
  );
}
