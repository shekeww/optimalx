import { Suspense } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { PageSingle } from '@salla.sa/twilight-theme-engine/routes/page';
import type { PageSingleProps } from '@salla.sa/twilight-theme-engine/routes/page';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { PolicyIntro } from '../components/commerce/PolicyIntro';
import { commerceHeadExtend } from '../components/commerce/head';

/**
 * A store page: the policies, and anything else the owner writes in the
 * dashboard (DIRECTION 6.18 "policies: h1 plus sanitised body in the text
 * measure").
 *
 * The engine page is wrapped whole. `PolicyIntro` is a sibling in DOM order
 * and `_b6-commerce.scss` places it between the breadcrumb and the page card,
 * which is where FINAL-content 6.3 puts it ("each intro sits above the full
 * policy text").
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
  return (
    <div className="ox-policy">
      <Suspense fallback={<div className="ox-policy__pending" aria-hidden="true" />}>
        <PageSingle.Component {...data} />
      </Suspense>
      <PolicyIntro slug={slug} title={data.page.title} />
    </div>
  );
}
