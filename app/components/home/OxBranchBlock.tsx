import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { OxBranch } from '../blocks/OxBranch';
import type { OxBlockProps } from './defaults';

/**
 * The branch block (DIRECTION 5.2 OxBranch, 6.2 row 9).
 *
 * The shared P1b block does the work; the home page only fixes its heading
 * level at h2 (the branch page passes h1) and hands it the 1.4 intro line. The
 * block has no merchant fields: the address, the hours, the WhatsApp number and
 * the map link are theme settings, so an unset setting removes its row instead
 * of printing a promise.
 */
export function OxBranchBlock(_props: OxBlockProps) {
  const { t } = useTranslation();
  return (
    <div className="ox-branch-block">
      <div className="ox-container">
        <OxBranch headingLevel="h2" showPageLink intro={t('ox.blocks.branch.intro')} />
      </div>
    </div>
  );
}
