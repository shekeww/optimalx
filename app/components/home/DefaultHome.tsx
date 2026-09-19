import { Home } from '@salla.sa/twilight-theme-engine/routes/home';
import { DEFAULT_HOME_COMPONENTS } from './defaults';

export interface DefaultHomeProps {
  locale?: string;
}

/**
 * The home a merchant sees before configuring anything (PLAN-final C2).
 *
 * `virtual:twilight/schema` is the empty module in production, so the manifest
 * defaults never reach the browser and a fresh install's `components[]` comes
 * back empty. This renders the twelve blocks of DIRECTION 6.2 through the
 * engine's own `HomePage`, which means the default composition and a configured
 * one go through exactly the same shell: the same lazy wrapper, the same
 * `s-block--ox-*` class, the same reserved height, the same priority flag on
 * the first three blocks.
 */
export function DefaultHome({ locale }: DefaultHomeProps) {
  return <Home.Component components={DEFAULT_HOME_COMPONENTS} {...(locale ? { locale } : {})} />;
}
