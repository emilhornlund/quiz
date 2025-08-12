import { join } from 'path'

import {
  transformGameDocument,
  transformGameResultsDocument,
  transformGameResultsDocumentFromGameDocument,
  transformPlayerOrUserDocument,
  transformQuizDocument,
  transformTokenDocument,
} from '../transformers'

import { assertIsDefined } from './assert.utils'
import {
  BSONDocument,
  hashBSON,
  parseBsonDocuments,
  writeBsonDocuments,
} from './bson.utils'
import {
  ClientPlayerMapper,
  parseClientPlayerMapper,
} from './client-player-mapper.utils'
import {
  COLLECTION_NAME_GAME_RESULTS,
  COLLECTION_NAME_GAMES,
  COLLECTION_NAME_PLAYERS,
  COLLECTION_NAME_QUIZZES,
  COLLECTION_NAME_TOKENS,
  COLLECTION_NAME_USERS,
  UNKNOWN_NICKNAME_PLACEHOLDER,
} from './constants'
import { extractValueOrThrow } from './extract-value.utils'
import { JSONObject, writeJSONObject } from './json.utils'

export interface Collection {
  documents: BSONDocument[]
  metadata: JSONObject
}

export type CollectionsRecord = Record<string, Collection>

/**
 * Reads all `.bson` files in the input directory, transforms each document
 * to the target schema, and groups them by output collection name.
 *
 * @param inputDir - Directory containing the source BSON dump.
 * @param bsonFiles - List of `.bson` filenames to process.
 * @returns A record mapping each target collection name to its documents & metadata.
 */
export function parseCollections(
  inputDir: string,
  bsonFiles: string[],
): CollectionsRecord {
  const clientPlayerMapper = parseClientPlayerMapper(inputDir, bsonFiles)

  return bsonFiles.reduce((previousValue, bsonFile) => {
    const originalCollectionName = bsonFile.replace(/\.bson$/, '')
    const targetCollectionName = getTargetCollectionName(originalCollectionName)

    const bsonPath = join(inputDir, bsonFile)

    const originalDocuments = parseBsonDocuments(bsonPath)
    const metadata = getCollectionMetadataObject(targetCollectionName)

    if (originalDocuments.length > 0 && metadata) {
      return {
        ...previousValue,
        [targetCollectionName]: {
          documents: originalDocuments
            .map((doc) =>
              transformOriginalDocument(
                originalCollectionName,
                doc,
                clientPlayerMapper,
              ),
            )
            .filter(Boolean),
          metadata: metadata,
        } as Collection,
      }
    }
    return previousValue
  }, {} as CollectionsRecord)
}

/**
 * Removes any `games` documents whose status isn’t `COMPLETED` or
 * that have too few participants.
 *
 * @param collections – Your collections map, must include `games`.
 * @returns The same map with `games` filtered down to valid completed games.
 */
export function filterCompletedGames(collections: CollectionsRecord) {
  collections[COLLECTION_NAME_GAMES].documents = collections[
    COLLECTION_NAME_GAMES
  ].documents.filter((doc) => {
    if (doc.status === 'COMPLETED') {
      return (doc.participants as BSONDocument[]).length > 2
    }
    return false
  })
  return collections
}

/**
 * Scans for embedded quizzes in games, deduplicates by question‐hash, adds one
 * instance of each unique quiz to `quizzes`, and rewrites game references.
 *
 * @param collections – Map containing `games` and `quizzes`.
 * @returns The same map with quizzes deduped and referenced by ID.
 */
export function dedupeAndCollectQuizzes(
  collections: CollectionsRecord,
): CollectionsRecord {
  const questionQuizHashes: Record<string, string> = {}
  collections[COLLECTION_NAME_GAMES].documents.forEach((doc) => {
    if (typeof doc.quiz !== 'string') {
      const hash = hashBSON(doc.questions)
      if (hash in questionQuizHashes) {
        doc.quiz = questionQuizHashes[hash]
      } else {
        const quiz = doc.quiz as BSONDocument
        collections[COLLECTION_NAME_QUIZZES].documents.push(quiz)
      }
    }
  })
  collections[COLLECTION_NAME_QUIZZES].documents.sort(
    (a, b) => (a.created as Date).getTime() - (b.created as Date).getTime(),
  )
  return collections
}

/**
 * Filters `users` to only those who either have an authProvider ≠ 'NONE', own
 * at least one quiz, or have participated in a completed game.
 *
 * @param collections – Map containing `users`, `quizzes`, and `games`.
 * @returns The same map with `users` pruned to active ones.
 */
export function filterUsers(collections: CollectionsRecord): CollectionsRecord {
  collections[COLLECTION_NAME_USERS].documents = collections[
    COLLECTION_NAME_USERS
  ].documents.filter((userDoc) => {
    // Always keep users with a configured auth provider
    if (userDoc.authProvider !== 'NONE') {
      return true
    }

    // For users with authProvider 'NONE', keep only if they own any quizzes
    const ownsQuiz = collections[COLLECTION_NAME_QUIZZES].documents.some(
      (quizDoc) => quizDoc.owner === userDoc._id,
    )
    if (ownsQuiz) {
      return true
    }

    // Or keep if they have participated in any game
    return collections[COLLECTION_NAME_GAMES].documents.some((gameDoc) =>
      (gameDoc.participants as BSONDocument[]).some(
        (participant) => participant.participantId === userDoc._id,
      ),
    )
  })

  return collections
}

/**
 * Replaces any unknown nickname placeholder in game‐results with the real
 * participant nickname from the corresponding game.
 *
 * @param collections – Map containing `game_results` and `games`.
 * @returns The same map with unknown nicknames patched.
 */
export function patchUnknownNicknameInGameResults(
  collections: CollectionsRecord,
): CollectionsRecord {
  if (!collections[COLLECTION_NAME_GAME_RESULTS]) {
    collections[COLLECTION_NAME_GAME_RESULTS] = {
      documents: [],
      metadata: getCollectionMetadataObject(
        COLLECTION_NAME_GAME_RESULTS,
      ) as JSONObject,
    }
  }

  collections[COLLECTION_NAME_GAME_RESULTS].documents = collections[
    COLLECTION_NAME_GAME_RESULTS
  ].documents.map((gameResultDoc) => {
    const gameId = extractValueOrThrow<string>(gameResultDoc, {}, 'game')

    const gameDocument = assertIsDefined(
      collections[COLLECTION_NAME_GAMES].documents.find(
        (gameDoc) => extractValueOrThrow<string>(gameDoc, {}, '_id') === gameId,
      ),
    )

    const gameParticipants = extractValueOrThrow<BSONDocument[]>(
      gameDocument,
      {},
      'participants',
    )

    const players = extractValueOrThrow<BSONDocument[]>(
      gameResultDoc,
      {},
      'players',
    ).map((player) => {
      const nickname = extractValueOrThrow<string>(player, {}, 'nickname')
      if (nickname === UNKNOWN_NICKNAME_PLACEHOLDER) {
        const participantId = extractValueOrThrow<string>(
          player,
          {},
          'participantId',
        )
        const foundNickname =
          gameParticipants.find(
            (participant) =>
              extractValueOrThrow<string>(participant, {}, 'participantId') ===
              participantId,
          )?.nickname || 'Unknown'
        console.log(
          `Replacing '${UNKNOWN_NICKNAME_PLACEHOLDER}' nickname with '${foundNickname}' in game result ${gameId} for player ${participantId}`,
        )
        return { ...player, nickname: foundNickname }
      }
      return { ...player, nickname }
    })
    return { ...gameResultDoc, players }
  })

  return collections
}

/**
 * For any games lacking a `game_results` entry, synthesizes one from the game data.
 *
 * @param collections – Map containing `games` and `game_results`.
 * @returns The same map with missing results built and appended.
 */
export function buildMissingGameResults(
  collections: CollectionsRecord,
): CollectionsRecord {
  if (!collections[COLLECTION_NAME_GAME_RESULTS]) {
    collections[COLLECTION_NAME_GAME_RESULTS] = {
      documents: [],
      metadata: getCollectionMetadataObject(
        COLLECTION_NAME_GAME_RESULTS,
      ) as JSONObject,
    }
  }

  const existingResultIds = new Set(
    collections[COLLECTION_NAME_GAME_RESULTS].documents.map((doc) => doc.game),
  )

  const missingResults = collections[COLLECTION_NAME_GAMES].documents
    .filter((gameDoc) => !existingResultIds.has(gameDoc._id))
    .map(transformGameResultsDocumentFromGameDocument)

  collections[COLLECTION_NAME_GAME_RESULTS].documents.push(...missingResults)
  return collections
}

/**
 * Writes each collection’s BSON dump and accompanying metadata JSON to disk.
 *
 * @param outputDir - Directory under which to write `.bson` and `.metadata.json`.
 * @param collections - Map of collection names to their documents & metadata.
 */
export function writeCollections(
  outputDir: string,
  collections: CollectionsRecord,
): void {
  return Object.entries(collections).forEach(([name, collection]) => {
    if (collection.documents.length > 0) {
      const outBsonPath = join(outputDir, `${name}.bson`)
      writeBsonDocuments(outBsonPath, collection.documents)

      const outMetadataPath = join(outputDir, `${name}.metadata.json`)
      writeJSONObject(outMetadataPath, collection.metadata)

      console.log(
        `✔ ${name} → ${collection.documents.length} documents written`,
      )
    }
  })
}

/**
 * Maps an original collection name to a new target name.
 * Useful for renaming collections during the migration process.
 *
 * @param originalCollectionName - The name of the source collection.
 * @returns The name to use for the migrated collection.
 */
function getTargetCollectionName(originalCollectionName: string): string {
  switch (originalCollectionName) {
    case COLLECTION_NAME_PLAYERS:
      return COLLECTION_NAME_USERS
    default:
      return originalCollectionName
  }
}

/**
 * Transforms a document from the original collection format into the desired output format.
 * Returns `null` if the collection is not handled (and should be skipped).
 *
 * @param originalCollectionName - The source collection the document belongs to.
 * @param originalDocument - The document to transform.
 * @param clientPlayerMapper - description here
 * @returns The transformed document, or `null` if skipped.
 */
function transformOriginalDocument(
  originalCollectionName: string,
  originalDocument: BSONDocument,
  clientPlayerMapper: ClientPlayerMapper,
): BSONDocument | null {
  try {
    switch (originalCollectionName) {
      case COLLECTION_NAME_GAME_RESULTS:
        return transformGameResultsDocument(originalDocument)
      case COLLECTION_NAME_GAMES:
        return transformGameDocument(originalDocument, clientPlayerMapper)
      case COLLECTION_NAME_QUIZZES:
        return transformQuizDocument(originalDocument)
      case COLLECTION_NAME_PLAYERS:
      case COLLECTION_NAME_USERS:
        return transformPlayerOrUserDocument(
          originalDocument,
          clientPlayerMapper,
        )
      case COLLECTION_NAME_TOKENS:
        return transformTokenDocument(originalDocument)
      default:
        return null
    }
  } catch (error) {
    const { message } = error as Error
    console.error(`Error transforming document: ${message}`)
    return null
  }
}

/**
 * Returns the metadata object for a given target collection name.
 * This metadata is written alongside the BSON output for compatibility with `mongorestore`.
 *
 * @param collectionName - The name of the target collection.
 * @returns A metadata object if found, otherwise `null`.
 */
function getCollectionMetadataObject(
  collectionName: string,
): JSONObject | null {
  switch (collectionName) {
    case COLLECTION_NAME_GAME_RESULTS:
      return {
        indexes: [
          {
            v: { $numberInt: '2' },
            key: { _id: { $numberInt: '1' } },
            name: '_id_',
          },
        ],
        uuid: '97d7fe42ae18460bb9d2010de5c09482',
        collectionName,
        type: 'collection',
      }

    case COLLECTION_NAME_GAMES:
      return {
        indexes: [
          {
            v: { $numberInt: '2' },
            key: { _id: { $numberInt: '1' } },
            name: '_id_',
          },
        ],
        uuid: '4231303ad7b24b42aeb2815f5317eb45',
        collectionName,
        type: 'collection',
      }

    case COLLECTION_NAME_QUIZZES:
      return {
        indexes: [
          {
            v: { $numberInt: '2' },
            key: { _id: { $numberInt: '1' } },
            name: '_id_',
          },
        ],
        uuid: '0c009d9f2fbe4b63b7a001305017bc16',
        collectionName,
        type: 'collection',
      }

    case COLLECTION_NAME_TOKENS:
      return {
        indexes: [
          {
            v: { $numberInt: '2' },
            key: { _id: { $numberInt: '1' } },
            name: '_id_',
          },
        ],
        uuid: 'aec92960442c4a819cd69b452f9f93ca',
        collectionName,
        type: 'collection',
      }

    case COLLECTION_NAME_USERS:
      return {
        indexes: [
          {
            v: { $numberInt: '2' },
            key: { _id: { $numberInt: '1' } },
            name: '_id_',
          },
          {
            v: { $numberInt: '2' },
            key: { email: { $numberInt: '1' } },
            name: 'email_1',
            background: true,
            unique: true,
          },
        ],
        uuid: '086a41b7e06d431194179717f2331bfa',
        collectionName,
        type: 'collection',
      }

    default:
      return null
  }
}
