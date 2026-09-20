import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';

/**
 * The guides index header (DIRECTION 6.13 Index row 2, FINAL-content 1.4
 * "Guides"), registered at `blog:start`.
 *
 * That slot is the first child of the engine's article column, under the
 * breadcrumb and above the slider, which is where the page header belongs.
 * The engine renders an h1 of its own from the SDK string `blocks.footer.blog`
 * (BlogPage-OZTHYA3G.js: either `.blog-category__title` or an `sr-only` one
 * depending on whether the store has blog slides); `_b6-commerce.scss` hides
 * it so the page keeps exactly one h1, which is this one.
 */
export function BlogIndexHeader() {
  const { t } = useTranslation();
  return (
    <div className="ox-blog-head" data-testid="ox-blog-head">
      <SectionHeader
        as="h1"
        title={t('ox.blog.index_title')}
      />
    </div>
  );
}
