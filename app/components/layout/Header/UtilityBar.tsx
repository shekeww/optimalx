import { useTwilight } from '@salla.sa/twilight-theme-engine';
import { Link } from '@salla.sa/twilight-theme-engine/common';
import { useTranslation } from '@salla.sa/twilight-theme-engine/i18n';
import { Icon } from '../../common/Icon';
import { ContactAffordance } from './ContactAffordance';
import { otherLocaleLink, useRouterPathname } from '../navLinks';
import { UtilityTrust } from './UtilityTrust';

/**
 * The utility bar's own language switch (NAV-2026-09-23 addendum, S9g; owner,
 * 2026-09-24: "arabic and english language switch can be confusing, as the
 * other would only see the country; it should be obvious to be a language
 * switch, showing العربية in English, and EN in the Arabic version"). One
 * plain link to the SAME page under the other language, never a
 * country/currency menu: the store is a single market (SAR only) and offers
 * no country selector anywhere now.
 *
 * A raw `<a>`, not the engine `Link` (`navLinks.ts`'s own precedent for the
 * shop trigger): it needs `lang`/`hrefLang`, which `Link`'s `BaseLinkProps`
 * does not carry, and a real, hand-prefixed href still reaches the other
 * language with no JS.
 *
 * Renders nothing until the store lists a second language
 * (`store.settings.is_multilingual` and `settings.languages` both have to
 * say so) - the live store today, English disabled, shows no link at all.
 */
function LanguageSwitch() {
  const { t } = useTranslation();
  const { store, settings } = useTwilight();
  const pathname = useRouterPathname();
  const link = store?.settings?.is_multilingual
    ? otherLocaleLink(
        pathname,
        (settings?.languages ?? []).map((language) => language.code)
      )
    : null;
  if (!link) return null;

  return (
    <a
      href={link.to}
      className="ox-util__lang"
      lang={link.locale}
      hrefLang={link.locale}
      aria-label={t(link.ariaLabelKey)}
      data-testid="ox-language-switch"
    >
      {t(link.labelKey)}
    </a>
  );
}

/**
 * The utility strip above the header: the branch link then the WhatsApp
 * affordance at the inline-start, the three trust items centred, the
 * language switch at the inline-end, on the same near-black as the header so
 * the two read as one band.
 *
 * The branch moved here from `المزيد` (NAV-2026-09-23 §4.2): it is the
 * store's one physical proof and it was three taps away. It is a standing
 * route, so unlike the WhatsApp affordance it is never gated.
 *
 * The bar always renders. The old rule ("hide the whole strip when the
 * merchant has written no promise") went with the promise line: the three
 * trust items are standing statements about the store, not a campaign, so the
 * strip is never empty. Its two outer zones gate independently and the grid
 * keeps the trust row centred whichever of them is absent.
 *
 * Below 1024 the strip is hidden and the trust row re-mounts on paper under
 * the header as a snap scroller (see `Header`).
 */
export function UtilityBar() {
  const { t } = useTranslation();
  return (
    <div className="ox-utility" data-testid="ox-utility-bar">
      <div className="ox-utility__inner ox-container">
        <div className="ox-utility__start">
          <Link to="/branch" className="ox-util__branch" data-testid="ox-utility-branch">
            <Icon name="store" size={20} />
            <span>{t('ox.nav.branch')}</span>
          </Link>
          <ContactAffordance />
        </div>
        <UtilityTrust />
        <div className="ox-utility__end">
          <LanguageSwitch />
        </div>
      </div>
    </div>
  );
}
