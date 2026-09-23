import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Image, Link } from '@salla.sa/twilight-theme-engine/common';
import { Bdi } from '../../common/Bdi';
import { toInternalPath } from '../../layout/navLinks';
import { SectionHeader } from '../../common/SectionHeader';
import type { BundleMember } from '../lib/variant';

export interface BundleMembersProps {
  members: BundleMember[];
}

/**
 * "What is in the bundle" (DIRECTION 6.7, bundle row 5).
 *
 * The rows come from the API's `consisted_products`, read defensively in
 * lib/variant. When the field is absent the block does not render and the
 * members stay described by the merchant's own description table, which the
 * page already shows; nothing is reconstructed.
 */
export function BundleMembers({ members }: BundleMembersProps) {
  const { t } = useTranslation();
  if (members.length === 0) return null;
  return (
    <section className="ox-bundle" aria-labelledby="ox-bundle-title">
      <SectionHeader title={t('ox.pdp.bundle_members')} titleId="ox-bundle-title" />
      <ul className="ox-bundle__list">
        {members.map((member) => (
          <li className="ox-bundle__row" key={member.id}>
            <div className="ox-bundle__thumb">
              <Image
                src={member.image}
                alt=""
                aspectRatio="1/1"
                objectFit="contain"
                noWrapper
                srcSetWidths={[112]}
                sizes="56px"
              />
            </div>
            <p className="ox-bundle__name">
              {member.url ? (
                <Link to={toInternalPath(member.url)}>
                  <Bdi>{member.name}</Bdi>
                </Link>
              ) : (
                <Bdi>{member.name}</Bdi>
              )}
            </p>
            {member.quantity ? (
              <span className="ox-bundle__qty">{member.quantity}</span>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
