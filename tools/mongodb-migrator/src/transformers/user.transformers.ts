import {
  BSONDocument,
  extractValue,
  extractValueOrThrow,
  toDate,
} from '../utils'

/**
 * Transforms a document from the `players` collection into a `users` document format.
 *
 * @param document - A single document from the original `players` collection.
 * @returns The transformed `users`-format document.
 */
export function transformPlayerOrUserDocument(
  document: BSONDocument,
): BSONDocument {
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    authProvider: extractValue<string>(document, {}, 'authProvider') || 'NONE',
    email: extractValue<string>(document, {}, 'email'),
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
    createdAt: toDate(
      extractValueOrThrow<string>(document, {}, 'createdAt', 'created'),
    ),
    updatedAt: toDate(
      extractValueOrThrow<string>(document, {}, 'updatedAt', 'modified'),
    ),
  }
}
