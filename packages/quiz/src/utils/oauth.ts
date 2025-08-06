/**
 * Key under which the entire Google OAuth session object is stored
 * in sessionStorage.
 */
export const GOOGLE_OAUTH_STORAGE_KEY = 'google_oauth'

/**
 * Property name for the OAuth "state" value within the Google OAuth session object.
 */
export const GOOGLE_OAUTH_STORAGE_STATE_KEY = 'state'

/**
 * Property name for the PKCE code verifier within the Google OAuth session object.
 */
export const GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY = 'pkce_verifier'

/**
 * Generates a cryptographically secure random string.
 *
 * Uses the Web Crypto API to produce `length` random bytes, and
 * returns them hex-encoded (2 chars per byte). This is suitable
 * for use as a PKCE code verifier.
 *
 * @param length - Number of random bytes to generate (default: 48).
 *                 Higher values increase entropy.
 * @returns A hex-encoded string of length `length × 2`.
 */
export function generateRandomString(length: number = 48): string {
  const arr = new Uint8Array(length)
  window.crypto.getRandomValues(arr)
  return Array.from(arr)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * Computes the SHA-256 hash of an input string and returns it
 * in a URL-safe Base64 format. This is used to turn the code
 * verifier into a code challenge for OAuth PKCE.
 *
 * @param buffer - The input string to hash.
 *                 If omitted or empty, hashes an empty string.
 * @returns A promise that resolves to the Base64-URL-encoded SHA-256 digest.
 */
export async function sha256(buffer?: string): Promise<string> {
  const data = new TextEncoder().encode(buffer ?? '')
  const digest = await window.crypto.subtle.digest('SHA-256', data)

  // Convert to URL-safe Base64
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
