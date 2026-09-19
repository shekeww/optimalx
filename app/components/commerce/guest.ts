/**
 * Signed-out handling for the account surfaces.
 *
 * The engine's account loaders call the customer API and throw when there is
 * no session. A loader that throws never reaches its component, so the gate a
 * route writes inside that component is dead code for exactly the visitor who
 * needs it: a signed-out person clicking the account button in the header got
 * the engine's default error page printing the raw key `common.errors.500` and
 * the English word "Unauthorized", on an Arabic-first store.
 *
 * These routes therefore run their loader through `orGuest`, which converts an
 * authentication failure into a value the component can render. Any other
 * failure still throws, because a 500 on a real server fault is correct and
 * swallowing it would hide it.
 */

/** What a loader returns in place of its data when there is no session. */
export interface GuestResult {
  readonly oxGuest: true;
}

const GUEST: GuestResult = { oxGuest: true };

/** Narrows a loader result that may be the guest sentinel. */
export function isGuest(value: unknown): value is GuestResult {
  return typeof value === 'object' && value !== null && (value as GuestResult).oxGuest === true;
}

/**
 * True for the shapes an unauthenticated customer call comes back as.
 *
 * The engine uses ky, whose HTTPError carries `response.status`; some paths
 * reject with a plain object instead, and some only carry the word in the
 * message. All three are treated the same, and nothing else is.
 */
function isAuthFailure(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const record = error as { response?: { status?: unknown }; status?: unknown; message?: unknown };
  const status =
    typeof record.response?.status === 'number'
      ? record.response.status
      : typeof record.status === 'number'
        ? record.status
        : undefined;
  if (status === 401 || status === 403) return true;

  const message = typeof record.message === 'string' ? record.message.toLowerCase() : '';
  return message.includes('unauthorized') || message.includes('unauthenticated');
}

/**
 * Runs an engine loader and answers with the guest sentinel when the visitor
 * has no session. Every other error is rethrown untouched.
 */
export async function orGuest<T>(run: () => Promise<T>): Promise<T | GuestResult> {
  try {
    return await run();
  } catch (error) {
    if (isAuthFailure(error)) return GUEST;
    throw error;
  }
}

/** Salla serves the storefront's own sign-in page; the theme does not own it. */
export const LOGIN_PATH = '/login';
