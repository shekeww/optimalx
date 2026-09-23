import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { toInternalPath } from '../layout/navLinks';
import type { ArticleSummary } from '@salla.sa/twilight-theme-engine/routes/blog';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';

export interface GuideCardProps {
  article: ArticleSummary;
  /**
   * Reading time in minutes. Rendered only when the caller knows it (the blog
   * loaders do not carry one, and an invented figure is a claim).
   */
  readMinutes?: number;
  /** Overrides the label above the title; the first tag otherwise. */
  label?: string;
  className?: string;
}

/**
 * A guide card (DIRECTION 5.2 GuideCard): a 4/3 image on the plate, the
 * category label, the title clamped to two lines, and the reading time. The
 * whole card is one link and the image never zooms. `alt=""` because the title
 * beside it names the article (DIRECTION 9.6).
 */
export function GuideCard({ article, readMinutes, label, className }: GuideCardProps) {
  const { t } = useTranslation();
  const tagLabel = label ?? article.tags?.[0]?.name ?? t('ox.blocks.guide.label');

  return (
    <article className={['ox-guide', className].filter(Boolean).join(' ')} data-testid="ox-guide-card">
      {/* toInternalPath: the API publishes this URL absolute (P0-14). */}
      <Link to={toInternalPath(article.url)} className="ox-guide__link">
        <span className="ox-guide__plate">
          {article.image ? (
            <Image
              src={article.image}
              alt=""
              width={300}
              height={225}
              srcSetWidths={[300, 600]}
              sizes="(min-width: 1024px) 33vw, 300px"
              objectFit="cover"
              noWrapper
            />
          ) : null}
        </span>
        <span className="ox-guide__body">
          <span className="ox-guide__label ox-small">{tagLabel}</span>
          <span className="ox-guide__title ox-h3">{article.name}</span>
          {readMinutes !== undefined ? (
            <span className="ox-guide__meta ox-small">
              {t('ox.blocks.guide.read_time', { minutes: readMinutes })}
            </span>
          ) : null}
        </span>
      </Link>
    </article>
  );
}
