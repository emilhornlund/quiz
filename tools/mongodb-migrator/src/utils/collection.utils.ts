import { join } from 'path'

import { isDefined } from '@klurigo/common'
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
import { toDate } from './date.utils'
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
 * Patches `QUESTION_RESULT` task result items inside `games` by backfilling response-time related fields.
 *
 * For each `QUESTION_RESULT` task result entry, this patch ensures:
 * - `lastResponseTime` exists (derived from the corresponding `QUESTION` task answer timestamp, or the full question duration if unanswered).
 * - `totalResponseTime` exists (cumulative sum of `lastResponseTime` over the game).
 * - `responseCount` exists (number of answered questions counted so far).
 *
 * This patch operates in-order over `previousTasks`, assuming `QUESTION` is followed by its matching `QUESTION_RESULT`.
 *
 * @param collections - The parsed collections record containing the `games` collection.
 * @returns The same collections record with patched `games` documents.
 */
export function patchGameQuestionResultTasks(
  collections: CollectionsRecord,
): CollectionsRecord {
  collections[COLLECTION_NAME_GAMES].documents = collections[
    COLLECTION_NAME_GAMES
  ].documents.map((gameDoc) => {
    const questionDurations = extractValueOrThrow<BSONDocument[]>(
      gameDoc,
      {},
      'questions',
    ).map((question) => extractValueOrThrow<number>(question, {}, 'duration'))

    const previousTasks = extractValueOrThrow<BSONDocument[]>(
      gameDoc,
      {},
      'previousTasks',
    )

    let lastQuestion: {
      questionIndex: number
      presented: Date
      answers: { playerId: string; created: Date }[]
    } | null = null

    let lastResults: BSONDocument[] | null = null

    for (const task of previousTasks) {
      const type = extractValueOrThrow<string>(task, {}, 'type')

      if (type === 'QUESTION') {
        const presented = toDate(extractValue<string>(task, {}, 'presented'))
        if (!presented) {
          throw new Error('Presented date not found')
        }
        lastQuestion = {
          questionIndex: extractValueOrThrow<number>(task, {}, 'questionIndex'),
          presented,
          answers: extractValueOrThrow<BSONDocument[]>(task, {}, 'answers').map(
            (answer) => {
              const created = toDate(
                extractValueOrThrow<string>(answer, {}, 'created'),
              )
              if (!created) {
                throw new Error('No created date found in answer')
              }
              return {
                playerId: extractValueOrThrow<string>(answer, {}, 'playerId'),
                created,
              }
            },
          ),
        }
      } else if (type === 'QUESTION_RESULT') {
        const questionIndex = extractValueOrThrow<number>(
          task,
          {},
          'questionIndex',
        )

        if (!lastQuestion || lastQuestion.questionIndex !== questionIndex) {
          throw new Error('Unknown question index')
        }

        const results = extractValueOrThrow<BSONDocument[]>(task, {}, 'results')

        for (const result of results) {
          const playerId = extractValueOrThrow<string>(result, {}, 'playerId')

          const lastResponseTime = extractValue<number>(
            result,
            {},
            'lastResponseTime',
          )
          if (!isDefined(lastResponseTime)) {
            const answer = lastQuestion.answers.find(
              (p) => p.playerId === playerId,
            )
            if (answer) {
              result.lastResponseTime =
                answer.created.getTime() - lastQuestion.presented.getTime()
            } else {
              result.lastResponseTime = questionDurations[questionIndex] * 1000
            }
          }

          const lastResult = lastResults?.find((lastResult) => {
            return (
              extractValueOrThrow<string>(lastResult, {}, 'playerId') ===
              playerId
            )
          })

          const totalResponseTime = extractValue<number>(
            result,
            {},
            'totalResponseTime',
          )
          if (!isDefined(totalResponseTime)) {
            const nextLastResponseTime = extractValueOrThrow<number>(
              result,
              {},
              'lastResponseTime',
            )

            if (lastResult) {
              const lastTotalResponseTime = extractValueOrThrow<number>(
                lastResult,
                {},
                'totalResponseTime',
              )
              result.totalResponseTime =
                lastTotalResponseTime + nextLastResponseTime
            } else {
              result.totalResponseTime = nextLastResponseTime
            }
          }

          const responseCount = extractValue<number>(
            result,
            {},
            'responseCount',
          )
          if (!isDefined(responseCount)) {
            if (lastResult) {
              const lastResponseCount = extractValueOrThrow<number>(
                lastResult,
                {},
                'responseCount',
              )
              result.responseCount = lastResponseCount + 1
            } else {
              result.responseCount = 1
            }
          }
        }

        lastResults = results
      }
    }

    return gameDoc
  })

  return collections
}

/**
 * Patches `LEADERBOARD` tasks inside `games` by backfilling `previousPosition` for each leaderboard item.
 *
 * If an item is missing `previousPosition`, it is derived from the last seen leaderboard positions:
 * - If a previous position exists and is > 0, that value is used.
 * - Otherwise, `previousPosition` is set to `null`.
 *
 * @param collections - The parsed collections record containing the `games` collection.
 * @returns The same collections record with patched `games` documents.
 */
export function patchGameLeaderboardTasks(
  collections: CollectionsRecord,
): CollectionsRecord {
  collections[COLLECTION_NAME_GAMES].documents = collections[
    COLLECTION_NAME_GAMES
  ].documents.map((gameDoc) => {
    const previousTasks = extractValueOrThrow<BSONDocument[]>(
      gameDoc,
      {},
      'previousTasks',
    )

    let lastLeaderboard: { playerId: string; position: number }[] | null = null

    for (const task of previousTasks) {
      const type = extractValueOrThrow<string>(task, {}, 'type')
      if (type === 'LEADERBOARD') {
        const leaderboard = extractValueOrThrow<BSONDocument[]>(
          task,
          {},
          'leaderboard',
        )
        for (const item of leaderboard) {
          if (!isDefined(extractValue<number>(item, {}, 'previousPosition'))) {
            const lastPreviousPosition =
              lastLeaderboard?.find(
                (p) =>
                  p.playerId ===
                  extractValueOrThrow<string>(item, {}, 'playerId'),
              )?.position || null

            item.previousPosition =
              isDefined(lastPreviousPosition) && lastPreviousPosition > 0
                ? lastPreviousPosition
                : null
          }
        }

        lastLeaderboard = leaderboard.map((p) => {
          return {
            playerId: extractValueOrThrow<string>(p, {}, 'playerId'),
            position: extractValueOrThrow<number>(p, {}, 'position'),
          }
        })
      }
    }

    return gameDoc
  })

  return collections
}

/**
 * Patches `participants` inside `games` by backfilling aggregated participant metrics derived from tasks.
 *
 * For each `PLAYER` participant, this patch ensures:
 * - `worstRank` exists (maximum `position` observed across all `QUESTION_RESULT` tasks).
 * - `totalResponseTime` exists (taken from the final observed `QUESTION_RESULT` result entry).
 * - `responseCount` exists (taken from the final observed `QUESTION_RESULT` result entry).
 *
 * @param collections - The parsed collections record containing the `games` collection.
 * @returns The same collections record with patched `games` documents.
 */
export function patchGameParticipants(
  collections: CollectionsRecord,
): CollectionsRecord {
  collections[COLLECTION_NAME_GAMES].documents = collections[
    COLLECTION_NAME_GAMES
  ].documents.map((gameDoc) => {
    const previousTasks = extractValueOrThrow<BSONDocument[]>(
      gameDoc,
      {},
      'previousTasks',
    )

    const participants = extractValueOrThrow<BSONDocument[]>(
      gameDoc,
      {},
      'participants',
    )

    let worstRanks: { playerId: string; rank: number }[] = []

    let lastQuestionResults:
      | { playerId: string; totalResponseTime: number; responseCount: number }[]
      | null = null

    for (const task of previousTasks) {
      if (extractValueOrThrow<string>(task, {}, 'type') === 'QUESTION_RESULT') {
        const results = extractValueOrThrow<BSONDocument[]>(task, {}, 'results')

        worstRanks = results.reduce((prev, current) => {
          const playerId = extractValueOrThrow<string>(current, {}, 'playerId')
          const rank = extractValueOrThrow<number>(current, {}, 'position')

          const existing = prev.find((p) => p.playerId === playerId)

          if (existing) {
            existing.rank = Math.max(existing.rank, rank)
          } else {
            prev.push({ playerId, rank })
          }

          return prev
        }, worstRanks)

        lastQuestionResults = results.map((result) => ({
          playerId: extractValueOrThrow<string>(result, {}, 'playerId'),
          totalResponseTime: extractValueOrThrow<number>(
            result,
            {},
            'totalResponseTime',
          ),
          responseCount: extractValueOrThrow<number>(
            result,
            {},
            'responseCount',
          ),
        }))
      }
    }

    if (!lastQuestionResults) {
      throw new Error('No question result task found')
    }

    for (const participant of participants) {
      const type = extractValueOrThrow<string>(participant, {}, 'type')
      if (type === 'PLAYER') {
        const participantId = extractValueOrThrow<string>(
          participant,
          {},
          'participantId',
        )

        if (!isDefined(extractValue<number>(participant, {}, 'worstRank'))) {
          const worstRank = worstRanks?.find(
            (item) => item.playerId === participantId,
          )?.rank
          if (!isDefined(worstRank)) {
            throw new Error('No worst rank found.')
          }
          participant.worstRank = worstRank
        }

        if (
          !isDefined(extractValue<number>(participant, {}, 'totalResponseTime'))
        ) {
          const totalResponseTime = lastQuestionResults.find(
            (result) => result.playerId === participantId,
          )?.totalResponseTime
          if (!isDefined(totalResponseTime)) {
            throw new Error('No total response time found for participant')
          }
          participant.totalResponseTime = totalResponseTime
        }

        if (
          !isDefined(extractValue<number>(participant, {}, 'responseCount'))
        ) {
          const responseCount = lastQuestionResults.find(
            (result) => result.playerId === participantId,
          )?.responseCount
          if (!isDefined(responseCount)) {
            throw new Error('No response count found for participant')
          }
          participant.responseCount = responseCount
        }
      }
    }

    return gameDoc
  })

  return collections
}

/**
 * Patches `game_results` player metrics by backfilling derived fields that depend on the final game state.
 *
 * Currently this patch ensures:
 * - `comebackRankGain` exists per player, computed as `max(0, worstRank - rank)` using the corresponding game participants.
 *
 * @param collections - The parsed collections record containing `games` and `game_results`.
 * @returns The same collections record with patched `game_results` documents.
 */
export function patchGameResults(
  collections: CollectionsRecord,
): CollectionsRecord {
  collections[COLLECTION_NAME_GAME_RESULTS].documents = collections[
    COLLECTION_NAME_GAME_RESULTS
  ].documents.map((gameResultDoc) => {
    const gameDoc = collections[COLLECTION_NAME_GAMES].documents.find(
      (gameDoc) =>
        extractValueOrThrow<string>(gameDoc, {}, '_id') ===
        extractValueOrThrow<string>(gameResultDoc, {}, 'game'),
    )

    if (!gameDoc) {
      throw new Error('No game document found.')
    }

    const participants = extractValueOrThrow<BSONDocument[]>(
      gameDoc,
      {},
      'participants',
    )
      .filter((p) => extractValueOrThrow<string>(p, {}, 'type') === 'PLAYER')
      .map((p) => ({
        participantId: extractValueOrThrow<string>(p, {}, 'participantId'),
        rank: extractValueOrThrow<number>(p, {}, 'rank'),
        worstRank: extractValueOrThrow<number>(p, {}, 'worstRank'),
      }))

    const players = extractValueOrThrow<BSONDocument[]>(
      gameResultDoc,
      {},
      'players',
    )

    for (const player of players) {
      if (!isDefined(extractValue<number>(player, {}, 'comebackRankGain'))) {
        const participantId = extractValueOrThrow<string>(
          player,
          {},
          'participantId',
        )
        const participant = participants.find(
          (p) => p.participantId === participantId,
        )
        if (isDefined(participant)) {
          player.comebackRankGain = Math.max(
            0,
            participant.worstRank - participant.rank,
          )
        } else {
          player.comebackRankGain = 0
        }
      }
    }

    return gameResultDoc
  })

  return collections
}

/**
 * Filters the `tokens` collection to only include non-expired tokens.
 *
 * Tokens are dropped if:
 * - `expiresAt` is missing or invalid.
 * - `expiresAt` is in the past.
 *
 * @param collections - The parsed collections record containing `tokens`.
 * @returns The same collections record with `tokens` documents filtered.
 */
export function filterTokens(
  collections: CollectionsRecord,
): CollectionsRecord {
  const now = new Date()

  collections[COLLECTION_NAME_TOKENS].documents = collections[
    COLLECTION_NAME_TOKENS
  ].documents.filter((tokenDoc) => {
    const expiresAt = extractValue<unknown>(tokenDoc, {}, 'expiresAt')

    if (!(expiresAt instanceof Date)) {
      return false
    }

    return expiresAt.getTime() > now.getTime()
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
