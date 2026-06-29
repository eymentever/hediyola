/**
 * Registry utility helpers — pure functions, no server actions, safe to import
 * in both Server Components and Client Components.
 */

/** Cookie name marking a private registry as unlocked for this browser. */
export function unlockCookieName(registryId: string): string {
  return `hediyola_unlock_${registryId}`;
}
