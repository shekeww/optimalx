/** Prefixes a locale value carries while the wording is still owed. */
const PENDING_PREFIXES = ['TODO-copy:', 'TODO-legal:'];

/**
 * True when a resolved locale value is a marked placeholder rather than copy.
 *
 * Two values in this batch wait on a Saudi lawyer (open question Q11): the
 * PDPL data-request line on the contact page and the intake consent
 * sentence. The protocol keeps them in `locales/partials/` with a marked
 * prefix so B7 and the copywriter can find them, and the surface that would
 * print them uses this gate, so a shopper never reads a build marker and the
 * store never publishes a legal sentence nobody approved.
 */
export function isPendingCopy(value: string | undefined | null): boolean {
  if (!value) return true;
  return PENDING_PREFIXES.some((prefix) => value.startsWith(prefix));
}
