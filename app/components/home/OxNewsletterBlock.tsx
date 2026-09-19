import { OxNewsletter } from '../blocks/OxNewsletter';
import type { OxBlockProps } from './defaults';

/**
 * The newsletter band (DIRECTION 5.2 OxNewsletter, 6.2 row 11).
 *
 * Hidden unless the `show_newsletter` theme setting is on, which the shared
 * block checks itself (PLAN-final C7 and open question Q1: no provider is
 * chosen yet, so nothing is wired to a transport). The block declares no
 * merchant fields because its copy is `ox.newsletter.*` and the shared block
 * takes no title or body prop; a dashboard field that cannot reach the markup
 * would be dead configuration.
 */
export function OxNewsletterBlock(_props: OxBlockProps) {
  return <OxNewsletter />;
}
