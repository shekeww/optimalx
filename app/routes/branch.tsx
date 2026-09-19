import { createFileRoute } from '@tanstack/react-router';
import { withHead } from '@salla.sa/twilight-theme-engine/tanstack';
import { useDocumentClass } from '@salla.sa/twilight-theme-engine/hooks';
import { pageHead } from '../components/pages/head';
import { resolveFaq } from '../components/pages/faq';
import { BRANCH_FAQ, BranchPage } from '../components/pages/BranchPage';
import { BRANCH } from '../content/branch';

/**
 * `/branch`: the Al Khalidiyah branch (DIRECTION 6.12).
 *
 * No LocalBusiness node is declared here. The site-wide graph emitted by
 * `components/seo/registerHeadHooks.tsx` carries exactly one `#localbusiness`
 * node, with this branch's coordinates and opening hours, on every route; a
 * second declaration on this page would be the same business described twice
 * (PLAN-final B5).
 *
 * Custom route mechanics are the same as `/services`: nested under
 * `{-$locale}`, no engine body class, and a loader so `withHead` runs.
 */
export const Route = createFileRoute('/{-$locale}/branch')({
  loader: () => ({ path: '/branch' }),
  head: withHead({
    head: pageHead({
      path: '/branch',
      titleKey: BRANCH.titleKey,
      descriptionKey: 'ox.branch.meta_description',
      faq: (t) => resolveFaq(t, BRANCH_FAQ),
    }),
  }),
  component: BranchRoute,
});

function BranchRoute() {
  useDocumentClass({ body: { class: 'ox-page-branch' } });
  return <BranchPage />;
}
