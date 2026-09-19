import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
// Statically imported on purpose: the PDP gallery already pulls this module
// into the main chunk, so a lazy import here would only add a boundary.
import { SallaSocialShare } from '@salla.sa/twilight-components-react/social-share';
import { GuideCard } from '../blocks/GuideCard';
import { OxNewsletter } from '../blocks/OxNewsletter';
import { articleKeyPoints } from './articleKeyPoints';
import { useArticle } from './ArticleContext';

/**
 * The "الخلاصة" panel (DIRECTION 6.13 Article row 4), registered at
 * `blog:single.start`.
 *
 * The bullets are the article's own summary list, parsed out of the sanitised
 * body; nothing is written here. With no such section in the article the
 * panel does not render, so the block can never be a claim the copywriter did
 * not make.
 *
 * The hook slot is the engine's first child inside the article column, which
 * puts the panel above the title in DOM order; `_b6-commerce.scss` reorders
 * the column so it lands under the hero image, where the answer-first device
 * belongs.
 */
export function ArticleKeyPoints() {
  const { t } = useTranslation();
  const context = useArticle();
  const points = articleKeyPoints(context?.article.description);
  if (points.length === 0) return null;

  return (
    <aside className="ox-keypoints" aria-labelledby="ox-keypoints-title" data-testid="ox-keypoints">
      <h2 className="ox-keypoints__title ox-h3" id="ox-keypoints-title">
        {t('ox.blog.key_points')}
      </h2>
      <ul className="ox-keypoints__list">
        {points.map((point) => (
          <li className="ox-body" key={point}>
            {point}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/**
 * Everything under the article body (DIRECTION 6.13 Article rows 7 to 10),
 * registered at `blog:single.end`: the disclaimer line, the share row, the
 * related guides and the newsletter.
 *
 * The mentioned-products rail (row 6) is not here: the blog API gives an
 * article no product list of any kind (`ArticleDetail` in
 * engine routes/blog/types.d.ts carries tags, categories and related articles
 * only), and a rail seeded with anything else would be a recommendation we
 * invented. It ships when the owner links products to an article.
 */
export function ArticleExtras() {
  const { t } = useTranslation();
  const context = useArticle();
  const related = context?.related ?? context?.article.related ?? [];

  return (
    <div className="ox-article-extras" data-testid="ox-article-extras">
      <p className="ox-article-extras__note ox-small">{t('ox.blog.disclaimer')}</p>

      <div className="ox-article-extras__share">
        <h2 className="ox-small ox-article-extras__share-title">{t('ox.blog.share')}</h2>
        <SallaSocialShare />
      </div>

      {related.length > 0 ? (
        <section className="ox-article-extras__related" aria-labelledby="ox-related-title">
          <h2 className="ox-h2" id="ox-related-title">
            {t('ox.blog.related')}
          </h2>
          <div className="ox-guide-row">
            {related.slice(0, 3).map((item) => (
              <GuideCard article={item} key={item.id} />
            ))}
          </div>
        </section>
      ) : null}

      <OxNewsletter />
    </div>
  );
}
