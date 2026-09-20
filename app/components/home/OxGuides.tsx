import { useQuery } from '@tanstack/react-query';
import { Blog } from '@salla.sa/twilight-theme-engine/routes/blog';
import type { ArticleSummary } from '@salla.sa/twilight-theme-engine/routes/blog';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { SectionHeader } from '../common/SectionHeader';
import { GuideCard } from '../blocks/GuideCard';
import { fieldText, type OxBlockProps } from './defaults';

/**
 * The guides row (DIRECTION 5.2 GuideCard, 6.2 row 8).
 *
 * Hidden under three articles: two cards in a three-column row is a hole, and a
 * guides section that promises explanation and shows one post is worse than no
 * section (6.2 row 8, "hidden when the blog has fewer than three posts").
 *
 * The engine package exports no `api/blog` subpath, so the data comes through
 * `Blog.loader`, the same function the `/blog` route uses; it catches its own
 * network error and returns empty arrays, and react-query keeps one request per
 * page. A failure therefore hides the block instead of breaking the home page.
 */

export const MIN_ARTICLES = 3;

export function OxGuides({ data }: OxBlockProps) {
  const { t } = useTranslation();
  const query = useQuery({
    queryKey: ['ox', 'home', 'guides'],
    queryFn: () => Blog.loader(),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const articles: ArticleSummary[] = query.data?.articles ?? [];
  if (articles.length < MIN_ARTICLES) return null;

  const title = fieldText(data, 'title') || t('ox.home.guides_title');

  return (
    <section className="ox-guides-block" data-testid="ox-guides">
      <div className="ox-container">
        <SectionHeader
          title={title}
          viewAll={{ to: '/blog' }}
        />
        <ul className="ox-guides">
          {articles.slice(0, 3).map((article) => (
            <li key={article.id}>
              <GuideCard article={article} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
