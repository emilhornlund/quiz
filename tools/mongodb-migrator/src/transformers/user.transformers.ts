import { createHash } from 'crypto'

import {
  BSONDocument,
  ClientPlayerMapper,
  extractValue,
  extractValueOrThrow,
  toDate,
} from '../utils'

/**
 * Transforms a document from the `players` collection into a `users` document format.
 *
 * @param document - A single document from the original `players` collection.
 * @param clientPlayerMapper - Mapper used for client/player ID lookups.
 * @returns The transformed `users`-format document.
 */
export function transformPlayerOrUserDocument(
  document: BSONDocument,
  clientPlayerMapper: ClientPlayerMapper,
): BSONDocument {
  const userId = extractValueOrThrow<string>(document, {}, '_id')
  return {
    _id: userId,
    __v: 0,
    authProvider: extractValue<string>(document, {}, 'authProvider') || 'NONE',
    email:
      extractValue<string>(document, {}, 'email') ||
      `non-migrated-${userId}@klurigo.com`,
    givenName: extractValue<string>(document, {}, 'givenName'),
    familyName: extractValue<string>(document, {}, 'familyName'),
    defaultNickname: extractValue<string>(
      document,
      {},
      'defaultNickname',
      'nickname',
    ),
    lastLoggedInAt: toDate(
      extractValue<string>(document, {}, 'lastLoggedInAt'),
    ),
    migrationTokens:
      extractValue<string[]>(document, {}, 'migrationTokens') ||
      clientPlayerMapper.clients
        .filter((client) => client.player.id === userId)
        .map((client) => computeMigrationToken(client.id, client.player.id)),
    createdAt: toDate(
      extractValueOrThrow<string>(document, {}, 'createdAt', 'created'),
    ),
    updatedAt: toDate(
      extractValueOrThrow<string>(document, {}, 'updatedAt', 'modified'),
    ),
  }
}

/**
 * Computes a URL-safe, Base64-encoded SHA-256 hash to use as a migration token.
 *
 * The token is derived from the `clientId` and `playerId`.
 *
 * @param clientId - The unique identifier of the client.
 * @param playerId - The unique identifier of the player.
 * @returns A URL-safe Base64-encoded SHA-256 hash string representing the migration token.
 */
function computeMigrationToken(clientId: string, playerId: string): string {
  const data = Buffer.from(`${clientId}:${playerId}`, 'utf-8')
  const hash = createHash('sha256').update(data).digest()

  return hash
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}
