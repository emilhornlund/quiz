import { join } from 'path'

import { GameMode, isDefined } from '@klurigo/common'
import { diffString } from 'json-diff'

import {
  transformGameDocument,
  transformGameResultsDocument,
  transformPlayerOrUserDocument,
  transformQuizDocument,
  transformTokenDocument,
} from '../transformers'
import { transformQuizRatingDocument } from '../transformers/quiz-rating.transformers'

import {
  BSONDocument,
  cleanBSONValue,
  parseBsonDocuments,
  writeBsonDocuments,
} from './bson.utils'
import {
  COLLECTION_NAME_GAME_RESULTS,
  COLLECTION_NAME_GAMES,
  COLLECTION_NAME_QUIZ_RATINGS,
  COLLECTION_NAME_QUIZZES,
  COLLECTION_NAME_TOKENS,
  COLLECTION_NAME_USERS,
} from './constants'
import { toDateOrThrow } from './date.utils'
import { extractValue, extractValueOrThrow } from './extract-value.utils'
import { JSONObject, writeJSONObject } from './json.utils'

/**
 * Represents a parsed BSON collection during migration.
 *
 * - `originalDocuments` contains the raw documents as loaded from the input dump.
 * - `documents` contains the transformed and patched documents that will be written to the output dump.
 * - `metadata` contains the MongoDB collection metadata (e.g. indexes) written alongside the BSON.
 */
export interface Collection {
  originalDocuments: BSONDocument[]
  documents: BSONDocument[]
  metadata: JSONObject
}

/**
 * A lookup map of collection name -> collection payload.
 *
 * Keys are MongoDB collection names (e.g. `games`, `users`, `tokens`).
 */
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
  return bsonFiles.reduce((previousValue, bsonFile) => {
    const collectionName = bsonFile.replace(/\.bson$/, '')

    const bsonPath = join(inputDir, bsonFile)

    const originalDocuments = parseBsonDocuments(bsonPath)
    const metadata = getCollectionMetadataObject(collectionName)

    if (originalDocuments.length > 0 && metadata) {
      return {
        ...previousValue,
        [collectionName]: {
          originalDocuments,
          documents: originalDocuments
            .map((doc) => transformDocument(collectionName, doc))
            .filter(Boolean),
          metadata: metadata,
        } as Collection,
      }
    }
    return previousValue
  }, {} as CollectionsRecord)
}

/**
 * Patches `quizzes` by backfilling a derived `gameplaySummary` when it is missing.
 *
 * For each quiz document without `gameplaySummary`, this patch:
 * - Finds all `games` referencing the quiz (by `games.quiz === quizzes._id`).
 * - Finds all `game_results` for those games (by `game_results.game === games._id`).
 * - Sorts matching `game_results` by `completed` ascending.
 * - Aggregates per-game metrics into an overall `gameplaySummary` on the quiz:
 *   - `count`: number of completed games included in the aggregation.
 *   - `totalPlayerCount`: sum of players across all included game results.
 *   - Classic totals:
 *     - `totalClassicCorrectCount`
 *     - `totalClassicIncorrectCount`
 *     - `totalClassicUnansweredCount`
 *   - ZeroToOneHundred totals:
 *     - `totalZeroToOneHundredPrecisionSum` (weighted by attempted answers per question)
 *     - `totalZeroToOneHundredAnsweredCount`
 *     - `totalZeroToOneHundredUnansweredCount`
 *   - `lastPlayedAt` and `updated`: set to the most recent aggregated `completed` timestamp.
 *
 * Notes:
 * - If a quiz already has a `gameplaySummary`, it is left untouched.
 * - This patch assumes `games.quiz` is stored as an ID string; other shapes should be normalized earlier.
 *
 * @param collections - Parsed collections containing `quizzes`, `games`, and `game_results`.
 * @returns The same collections record with patched `quizzes` documents.
 */
export function patchQuizGameplaySummaries(
  collections: CollectionsRecord,
): CollectionsRecord {
  collections[COLLECTION_NAME_QUIZZES].documents = collections[
    COLLECTION_NAME_QUIZZES
  ].documents.map((quizDoc) => {
    const gameplaySummary = extractValue<BSONDocument>(
      quizDoc,
      {},
      'gameplaySummary',
    )
    if (!gameplaySummary) {
      const quizId = extractValueOrThrow<string>(quizDoc, {}, '_id')

      const games = collections[COLLECTION_NAME_GAMES].documents.filter(
        (gameDoc) =>
          quizId === extractValueOrThrow<string>(gameDoc, {}, 'quiz'),
      )

      const gameResults = collections[COLLECTION_NAME_GAME_RESULTS].documents
        .filter((gameResultDoc) =>
          games.some(
            (gameDoc) =>
              extractValueOrThrow<string>(gameDoc, {}, '_id') ===
              extractValueOrThrow<string>(gameResultDoc, {}, 'game'),
          ),
        )
        .sort(
          (a, b) =>
            toDateOrThrow(
              extractValueOrThrow<string>(a, {}, 'completed'),
            ).getTime() -
            toDateOrThrow(
              extractValueOrThrow<string>(b, {}, 'completed'),
            ).getTime(),
        )
        .map((gameResultDoc) => {
          const gameDoc = collections[COLLECTION_NAME_GAMES].documents.filter(
            (gameDoc) =>
              extractValueOrThrow<string>(gameDoc, {}, '_id') ===
              extractValueOrThrow<string>(gameResultDoc, {}, 'game'),
          )?.[0]

          if (!gameDoc) {
            throw new Error('Game does not exist')
          }

          const gameMode = extractValueOrThrow<string>(gameDoc, {}, 'mode')

          const players = extractValueOrThrow<BSONDocument[]>(
            gameResultDoc,
            {},
            'players',
          )

          const questions = extractValueOrThrow<BSONDocument[]>(
            gameResultDoc,
            {},
            'questions',
          )

          const aggregatedClassicTotals =
            gameMode === GameMode.Classic
              ? (questions.reduce(
                  (acc, q) => ({
                    correct:
                      extractValueOrThrow<number>(acc, {}, 'correct') +
                      (extractValue<number>(q, {}, 'correct') ?? 0),
                    incorrect:
                      extractValueOrThrow<number>(acc, {}, 'incorrect') +
                      (extractValue<number>(q, {}, 'incorrect') ?? 0),
                    unanswered:
                      extractValueOrThrow<number>(acc, {}, 'unanswered') +
                      (extractValue<number>(q, {}, 'unanswered') ?? 0),
                  }),
                  { correct: 0, incorrect: 0, unanswered: 0 },
                ) as { correct: number; incorrect: number; unanswered: number })
              : { correct: 0, incorrect: 0, unanswered: 0 }

          const aggregatedZeroToOneHundredTotals =
            gameMode === GameMode.ZeroToOneHundred
              ? (questions.reduce(
                  (acc, q) => {
                    const unanswered = extractValueOrThrow<number>(
                      q,
                      {},
                      'unanswered',
                    )
                    const attempted = Math.max(0, players.length - unanswered)

                    const precisionSum =
                      attempted > 0 && isDefined(q.averagePrecision)
                        ? extractValueOrThrow<number>(acc, {}, 'precisionSum') +
                          extractValueOrThrow<number>(
                            q,
                            {},
                            'averagePrecision',
                          ) *
                            attempted
                        : extractValueOrThrow<number>(acc, {}, 'precisionSum')

                    return {
                      precisionSum,
                      answeredCount:
                        extractValueOrThrow<number>(acc, {}, 'answeredCount') +
                        attempted,
                      unansweredCount:
                        extractValueOrThrow<number>(
                          acc,
                          {},
                          'unansweredCount',
                        ) + unanswered,
                    }
                  },
                  { precisionSum: 0, answeredCount: 0, unansweredCount: 0 },
                ) as {
                  precisionSum: number
                  answeredCount: number
                  unansweredCount: number
                })
              : { precisionSum: 0, answeredCount: 0, unansweredCount: 0 }

          return {
            players,
            ...aggregatedClassicTotals,
            ...aggregatedZeroToOneHundredTotals,
            completed: toDateOrThrow(
              extractValueOrThrow<string>(gameResultDoc, {}, 'completed'),
            ) as Date,
          }
        })

      quizDoc.gameplaySummary = gameResults.reduce(
        (gameplaySummary: BSONDocument, gameResult, currentIndex) => {
          const prevTotalPlayerCount = extractValueOrThrow<number>(
            gameplaySummary,
            {},
            'totalPlayerCount',
          )

          const nextPlayerCount = gameResult.players.length

          return {
            ...gameplaySummary,
            count: currentIndex + 1,
            totalPlayerCount: prevTotalPlayerCount + nextPlayerCount,
            totalClassicCorrectCount:
              extractValueOrThrow<number>(
                gameplaySummary,
                {},
                'totalClassicCorrectCount',
              ) + gameResult.correct,
            totalClassicIncorrectCount:
              extractValueOrThrow<number>(
                gameplaySummary,
                {},
                'totalClassicIncorrectCount',
              ) + gameResult.incorrect,
            totalClassicUnansweredCount:
              extractValueOrThrow<number>(
                gameplaySummary,
                {},
                'totalClassicUnansweredCount',
              ) + gameResult.unanswered,
            totalZeroToOneHundredPrecisionSum:
              extractValueOrThrow<number>(
                gameplaySummary,
                {},
                'totalZeroToOneHundredPrecisionSum',
              ) + gameResult.precisionSum,
            totalZeroToOneHundredAnsweredCount:
              extractValueOrThrow<number>(
                gameplaySummary,
                {},
                'totalZeroToOneHundredAnsweredCount',
              ) + gameResult.answeredCount,
            totalZeroToOneHundredUnansweredCount:
              extractValueOrThrow<number>(
                gameplaySummary,
                {},
                'totalZeroToOneHundredUnansweredCount',
              ) + gameResult.unansweredCount,
            lastPlayedAt: gameResult.completed,
            updated: gameResult.completed,
          }
        },
        {
          count: 0,
          totalPlayerCount: 0,
          totalClassicCorrectCount: 0,
          totalClassicIncorrectCount: 0,
          totalClassicUnansweredCount: 0,
          totalZeroToOneHundredPrecisionSum: 0,
          totalZeroToOneHundredAnsweredCount: 0,
          totalZeroToOneHundredUnansweredCount: 0,
          lastPlayedAt: null,
          updated: null,
        },
      )
    }
    return quizDoc
  })

  return collections
}

/**
 * Removes `null` values from a BSON document recursively.
 *
 * - Object properties whose value is `null` are removed.
 * - Array items that resolve to `null` are removed.
 *
 * This is used to produce cleaner BSON output (MongoDB distinguishes between missing fields and explicit `null`).
 *
 * @param document - The document to clean.
 * @returns A new document with all `null` values removed.
 */
const cleanDocument = (document: BSONDocument): BSONDocument =>
  cleanBSONValue(document) as BSONDocument

/**
 * Cleans every document in every collection by removing `null` values recursively.
 *
 * Both `originalDocuments` and `documents` are cleaned to make diffs consistent and output deterministic.
 *
 * @param collections - The parsed collections record to clean.
 * @returns A new collections record where all documents have been cleaned.
 */
export const cleanCollections = (
  collections: CollectionsRecord,
): CollectionsRecord => {
  const cleaned: CollectionsRecord = {}

  for (const [collectionName, collection] of Object.entries(collections)) {
    cleaned[collectionName] = {
      ...collection,
      originalDocuments: collection.originalDocuments.map(cleanDocument),
      documents: collection.documents.map(cleanDocument),
    }
  }

  return cleaned
}

/**
 * Prints a human-readable diff between `originalDocuments` and `documents` for selected collections.
 *
 * Intended for debugging migration patches. The function only prints collections listed in
 * `collectionsToPrint` and only prints diffs for documents that can be matched by `_id`.
 *
 * @param collections - The parsed collections record to diff and print.
 */
export function printCollectionsDiff(collections: CollectionsRecord) {
  const collectionsToPrint: string[] = [
    // COLLECTION_NAME_GAMES,
    // COLLECTION_NAME_GAME_RESULTS,
    // COLLECTION_NAME_QUIZZES,
    // COLLECTION_NAME_QUIZ_RATINGS,
    // COLLECTION_NAME_TOKENS,
    // COLLECTION_NAME_USERS,
  ]

  Object.entries(collections).forEach(([name, collection]) => {
    if (collectionsToPrint.includes(name)) {
      if (collection.documents.length > 0) {
        collection.documents.forEach((newDocument) => {
          const id = newDocument._id
          if (id) {
            const originalDocument = collection.originalDocuments.find(
              (originalDocument) => originalDocument._id === id,
            )
            console.log(`Diff ${name} - ${id}`)
            console.log(diffString(originalDocument, newDocument))
          }
        })
      }
    }
  })
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
        `✔ ${name} → ${collection.documents.length} (${collection.originalDocuments.length}) documents written`,
      )
    } else {
      console.log(`✔ ${name} → 0 (0) documents written`)
    }
  })
}

/**
 * Transforms a document from the original collection format into the desired output format.
 * Returns `null` if the collection is not handled (and should be skipped).
 *
 * @param collectionName - The source collection the document belongs to.
 * @param originalDocument - The document to transform.
 * @returns The transformed document, or `null` if skipped.
 */
function transformDocument(
  collectionName: string,
  originalDocument: BSONDocument,
): BSONDocument | null {
  try {
    switch (collectionName) {
      case COLLECTION_NAME_GAME_RESULTS:
        return transformGameResultsDocument(originalDocument)
      case COLLECTION_NAME_GAMES:
        return transformGameDocument(originalDocument)
      case COLLECTION_NAME_QUIZZES:
        return transformQuizDocument(originalDocument)
      case COLLECTION_NAME_QUIZ_RATINGS:
        return transformQuizRatingDocument(originalDocument)
      case COLLECTION_NAME_USERS:
        return transformPlayerOrUserDocument(originalDocument)
      case COLLECTION_NAME_TOKENS:
        return transformTokenDocument(originalDocument)
      default:
        return null
    }
  } catch (error) {
    const { message } = error as Error
    console.error(`Error transforming document (${collectionName}): ${message}`)
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

    case COLLECTION_NAME_QUIZ_RATINGS:
      return {
        indexes: [
          {
            v: { $numberInt: '2' },
            key: { _id: { $numberInt: '1' } },
            name: '_id_',
          },
          {
            v: { $numberInt: '2' },
            key: { quizId: { $numberInt: '1' } },
            name: 'quizId_1',
          },
          {
            v: { $numberInt: '2' },
            key: { author: { $numberInt: '1' } },
            name: 'author_1',
          },
          {
            v: { $numberInt: '2' },
            key: { quizId: { $numberInt: '1' }, author: { $numberInt: '1' } },
            name: 'quizId_1_author_1',
            unique: true,
          },
          {
            v: { $numberInt: '2' },
            key: { quizId: { $numberInt: '1' }, created: { $numberInt: '-1' } },
            name: 'quizId_1_created_-1',
          },
          {
            v: { $numberInt: '2' },
            key: { author: { $numberInt: '1' }, created: { $numberInt: '-1' } },
            name: 'author_1_created_-1',
          },
        ],
        uuid: '118d5d9cc37a440b9607abfc543c79ab',
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
          {
            v: { $numberInt: '2' },
            key: { expiresAt: { $numberInt: '1' } },
            name: 'expiresAt_1',
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
