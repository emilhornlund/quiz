import { createHash } from 'crypto'

/**
 * Computes a URL-safe, Base64-encoded SHA-256 hash to use as a migration token.
 *
 * The token is derived from the `clientId` and `playerId`.
 *
 * @param clientId - The unique identifier of the client.
 * @param playerId - The unique identifier of the player.
 * @returns A URL-safe Base64-encoded SHA-256 hash string representing the migration token.
 */
export function computeMigrationToken(
  clientId: string,
  playerId: string,
): string {
  const data = Buffer.from(`${clientId}:${playerId}`, 'utf-8')
  const hash = createHash('sha256').update(data).digest()

  return hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
