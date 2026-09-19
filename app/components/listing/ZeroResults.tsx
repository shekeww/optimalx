import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { ProductsSliderWrapper } from '../blocks/ProductsSliderWrapper';
import { Bdi } from '../common/Bdi';
import { Button } from '../common/Button';
import { EmptyState } from '../common/EmptyState';
import { GOALS } from '../../content/goals';
import { goalNameKey, searchFallback } from './resolve';
import { useSlugLink } from './useSlugLink';

export interface ZeroResultsProps {
  /** The query the visitor typed; rendered isolated so Latin terms read LTR. */
  query: string;
  className?: string;
}

/** The five fixed suggestions from FINAL-content 6.5, as locale keys. */
const SEARCH_CHIP_KEYS = [
  'ox.search.chip_1',
  'ox.search.chip_2',
  'ox.search.chip_3',
  'ox.search.chip_4',
  'ox.search.chip_5',
];

/**
 * The search zero state (DIRECTION 5.3 ZeroResults, 6.8 rows "Zero").
 *
 * The suggestion chips are a fixed list until the store has real search data
 * (FINAL-content 6.5 note): they are a way out, not a popularity claim about
 * the catalogue, and each one runs the search again rather than pretending to
 * know a destination. The goal chips resolve to the live category when the
 * merchant has created it and to a search for the goal's own name when not
 * (PLAN-final C15).
 */
export function ZeroResults({ query, className }: ZeroResultsProps) {
  const { t } = useTranslation();
  const { resolve } = useSlugLink();

  return (
    <div className={['ox-zero', className].filter(Boolean).join(' ')}>
      <EmptyState
        className="ox-zero__state"
        icon="help"
        title={
          <>
            {t('ox.search.no_results_prefix')} <Bdi lang={null}>{query}</Bdi>
          </>
        }
        body={t('ox.search.no_results_hint')}
        primary={
          <Button variant="secondary" size={48} to="/services">
            {t('ox.nav.services')}
          </Button>
        }
        footer={
          <>
            <div className="ox-zero__row">
              <span className="ox-zero__label ox-small">{t('ox.search.popular')}</span>
              <ul className="ox-zero__chips">
                {SEARCH_CHIP_KEYS.map((key) => {
                  const label = t(key);
                  return (
                    <li key={key}>
                      <Link to={searchFallback(label)} className="ox-chip ox-chip--filter ox-chip--link">
                        <span className="ox-chip__label">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="ox-zero__row">
              <span className="ox-zero__label ox-small">{t('ox.search.browse_goals')}</span>
              <ul className="ox-zero__chips">
                {GOALS.map((goal) => {
                  const label = t(goalNameKey(goal.slug));
                  return (
                    <li key={goal.slug}>
                      <Link
                        to={resolve(goal.slug, label)}
                        className="ox-chip ox-chip--filter ox-chip--link"
                      >
                        <span className="ox-chip__label">{label}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
            <p className="ox-zero__ask ox-small">{t('ox.search.ask_us')}</p>
          </>
        }
      />
      <ProductsSliderWrapper
        source="latest"
        perPage={12}
        sliderId="ox-zero-latest"
        title={t('ox.search.latest_title')}
        className="ox-zero__slider"
      />
    </div>
  );
}
