import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { OxBranch } from '../blocks/OxBranch';
import { STORE_PHOTOS } from '../../content/store-photos';
import type { OxBlockProps } from './defaults';

/**
 * The branch block (DIRECTION 5.2 OxBranch, 6.2 row 9; VISIT-2026-09-24 §4.1
 * moves it directly after the advisory band it fulfils and gives it the
 * store-wide photograph).
 *
 * The shared P1b block does the work; the home page only fixes its heading
 * level at h2 (the branch page passes h1), hands it the 1.4 intro line and the
 * home-only offer line and page link. The block has no merchant fields: the
 * address, the hours and the WhatsApp number are theme settings, so an unset
 * setting removes its row instead of printing a promise.
 */
export function OxBranchBlock(_props: OxBlockProps) {
  const { t } = useTranslation();
  return (
    <div className="ox-branch-block">
      <div className="ox-container">
        <OxBranch
          headingLevel="h2"
          showPageLink
          showOfferLine
          photo={STORE_PHOTOS['store-wide'].photo}
          intro={t('ox.blocks.branch.intro')}
        />
      </div>
    </div>
  );
}
