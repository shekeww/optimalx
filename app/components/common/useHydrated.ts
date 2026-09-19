import { useSyncExternalStore } from 'react';

const subscribeNothing = () => () => {};
// Hoisted, not inline. useSyncExternalStore compares the snapshot functions
// by identity; a fresh arrow on every render makes React warn that "the
// result of getServerSnapshot should be cached to avoid an infinite loop",
// and in the worst case it re-renders forever.
const snapshotHydrated = () => true;
const snapshotServer = () => false;

/**
 * `false` on the server and through hydration, then `true` once mounted on
 * the client — flips on the same tick hydration completes, no extra render.
 * Use it to gate anything that must match the SSR output exactly on first
 * paint (avoiding a hydration mismatch) and only reveal / upgrade once it's
 * safe to differ from the server render.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribeNothing, snapshotHydrated, snapshotServer);
}
