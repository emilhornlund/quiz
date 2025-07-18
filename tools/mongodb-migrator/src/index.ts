#!/usr/bin/env node

/**
 * MongoDB BSON Migration Transformer
 *
 * This script reads BSON dump files from a source directory, transforms the documents
 * based on hardcoded rules (e.g., quiz format normalization), and outputs BSON files
 * and metadata compatible with `mongorestore`.
 *
 * Features:
 * - Full document rewriting (not just renaming or copying).
 * - Robust BSON-aware typing, including support for ObjectId, Decimal128, Date, etc.
 * - Safely converts ISO date strings to native `Date` values.
 * - Skips collections without recognized transformation rules.
 */

import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs'
import { join, resolve } from 'path'
import { inspect } from 'util'

import { BSON } from 'bson'
import { Binary, BSONRegExp, Decimal128, Long, ObjectId, Timestamp } from 'bson'
import { Command } from 'commander'

export type JSONValue =
  | string
  | number
  | boolean
  | JSONObject
  | JSONArray
  | undefined

export interface JSONObject {
  [x: string]: JSONValue
}

export type JSONArray = Array<JSONValue>

export type BSONValue =
  | string
  | number
  | boolean
  | null
  | Date
  | ObjectId
  | Binary
  | Long
  | Timestamp
  | Decimal128
  | BSONRegExp
  | BSONDocument
  | BSONArray

export interface BSONDocument {
  [key: string]: BSONValue
}

export type BSONArray = BSONValue[]

interface Collection {
  documents: BSONDocument[]
  metadata: JSONObject
}

type CollectionsRecord = Record<string, Collection>

const COLLECTION_NAME_PLAYERS = 'players'
const COLLECTION_NAME_USERS = 'users'
const COLLECTION_NAME_GAMES = 'games'
const COLLECTION_NAME_GAME_RESULTS = 'game_results'
const COLLECTION_NAME_QUIZZES = 'quizzes'
const COLLECTION_NAME_TOKENS = 'tokens'

const program = new Command()

program
  .name('mongodb-migrator')
  .description('CLI tool to process MongoDB migration files')
  .requiredOption('-i, --inputDir <directory>', 'Input directory')
  .requiredOption('-o, --outputDir <directory>', 'Output directory')
  .option(
    '--dbName <name>',
    'MongoDB database name to use for output',
    'klurigo',
  )

program.parse(process.argv)

const options = program.opts()

const inputDir = resolve(options.inputDir)
const outputDir = resolve(options.outputDir)
const dbOutputDir = join(outputDir, options.dbName)

if (!existsSync(inputDir)) {
  console.error(`Input directory does not exist: ${inputDir}`)
  process.exit(1)
}

if (!existsSync(dbOutputDir)) {
  mkdirSync(dbOutputDir, { recursive: true })
  console.log(`Created outputDir directory: ${dbOutputDir}`)
}

const bsonFiles = readdirSync(inputDir)
  .filter((f) => f.endsWith('.bson'))
  .filter((f) => /^[^.].*\.bson$/.test(f))
const collections = parseCollections(bsonFiles)
// TODO: filter collections
// TODO: further process collections
writeCollections(collections)

/**
 * Parses the BSON files in the input directory, applies any necessary transformations,
 * and returns a map of target collection names to their transformed documents and metadata.
 *
 * @param bsonFiles - A list of `.bson` filenames from the input directory.
 * @returns A mapping from collection name to parsed and transformed collection data.
 */
function parseCollections(bsonFiles: string[]): CollectionsRecord {
  return bsonFiles.reduce((previousValue, bsonFile) => {
    const originalCollectionName = bsonFile.replace(/\.bson$/, '')
    const targetCollectionName = getTargetCollectionName(originalCollectionName)

    const bsonPath = join(inputDir, bsonFile)

    const originalDocuments = parseBsonDocuments(bsonPath)
    const metadata = getMetadata(targetCollectionName)

    if (originalDocuments.length > 0 && metadata) {
      return {
        ...previousValue,
        [targetCollectionName]: {
          documents: originalDocuments
            .map((doc) =>
              transformOriginalDocument(originalCollectionName, doc),
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
 * Reads and deserializes a `.bson` file into an array of JSON-like documents.
 *
 * @param filePath - Path to the `.bson` file.
 * @returns An array of deserialized documents from the file.
 */
function parseBsonDocuments(filePath: string): BSONDocument[] {
  const bsonBuffer = readFileSync(filePath)
  const documents: BSONDocument[] = []
  let offset = 0
  while (offset < bsonBuffer.length) {
    const size = bsonBuffer.readInt32LE(offset)
    const slice = bsonBuffer.slice(offset, offset + size)
    const doc = BSON.deserialize(slice)
    documents.push(doc)
    offset += size
  }
  return documents
}

/**
 * Returns the metadata object for a given target collection name.
 * This metadata is written alongside the BSON output for compatibility with `mongorestore`.
 *
 * @param collectionName - The name of the target collection.
 * @returns A metadata object if found, otherwise `null`.
 */
function getMetadata(collectionName: string): JSONObject | null {
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

/**
 * Serializes the transformed documents and writes both the BSON and metadata
 * to the output directory under the specified database name.
 *
 * @param collections - The collection data to be written, grouped by collection name.
 */
function writeCollections(collections: CollectionsRecord): void {
  return Object.entries(collections).forEach(([name, collection]) => {
    if (collection.documents.length > 0) {
      const transformedBuffer = Buffer.concat(
        collection.documents.map((d) => BSON.serialize(d)),
      )
      const outBsonPath = join(dbOutputDir, `${name}.bson`)
      writeFileSync(outBsonPath, transformedBuffer)

      const outMetadataPath = join(dbOutputDir, `${name}.metadata.json`)
      writeFileSync(outMetadataPath, JSON.stringify(collection.metadata))

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
 * @returns The transformed document, or `null` if skipped.
 */
function transformOriginalDocument(
  originalCollectionName: string,
  originalDocument: BSONDocument,
): BSONDocument | null {
  switch (originalCollectionName) {
    case COLLECTION_NAME_GAME_RESULTS:
      return transformGameResultsDocument(originalDocument)
    case COLLECTION_NAME_GAMES:
      return transformGameDocument(originalDocument)
    case COLLECTION_NAME_QUIZZES:
      return transformQuizDocument(originalDocument)
    case COLLECTION_NAME_PLAYERS:
    case COLLECTION_NAME_USERS:
      return transformPlayerOrUserDocument(originalDocument)
    case COLLECTION_NAME_TOKENS:
      return transformTokenDocument(originalDocument)
    default:
      return null
  }
}

/**
 * Transforms a document from the `game_results` collection into a `game_results` document format.
 *
 * @param document - A single document from the original `game_results` collection.
 * @returns The transformed `game_results`-format document.
 */
function transformGameResultsDocument(document: BSONDocument): BSONDocument {
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    name: extractValueOrThrow<string>(document, {}, 'name'),
    game: extractValueOrThrow<string>(document, {}, 'game'),
    hostParticipantId: extractValueOrThrow<string>(
      document,
      {},
      'hostParticipantId',
    ),
    players: extractValueOrThrow<BSONDocument[]>(document, {}, 'players').map(
      (player) => ({
        participantId: extractValueOrThrow<string>(player, {}, 'participantId'),
        nickname: extractValueOrThrow<string>(player, {}, 'nickname'),
        rank: extractValueOrThrow<number>(player, {}, 'rank'),
        correct: extractValueOrThrow<number>(player, {}, 'correct'),
        incorrect: extractValueOrThrow<number>(player, {}, 'incorrect'),
        unanswered: extractValueOrThrow<number>(player, {}, 'unanswered'),
        averageResponseTime: extractValueOrThrow<number>(
          player,
          {},
          'averageResponseTime',
        ),
        longestCorrectStreak: extractValueOrThrow<number>(
          player,
          {},
          'longestCorrectStreak',
        ),
        score: extractValueOrThrow<number>(player, {}, 'score'),
      }),
    ),
    questions: extractValueOrThrow<BSONDocument[]>(
      document,
      {},
      'questions',
    ).map((question) => ({
      text: extractValueOrThrow<string>(question, {}, 'text'),
      type: extractValueOrThrow<string>(question, {}, 'type'),
      correct: extractValueOrThrow<number>(question, {}, 'correct'),
      incorrect: extractValueOrThrow<number>(question, {}, 'incorrect'),
      unanswered: extractValueOrThrow<number>(question, {}, 'unanswered'),
      averageResponseTime: extractValueOrThrow<number>(
        question,
        {},
        'averageResponseTime',
      ),
    })),
    hosted: toDate(extractValueOrThrow<string>(document, {}, 'hosted')),
    completed: toDate(extractValueOrThrow<string>(document, {}, 'completed')),
  }
}

/**
 * Transforms a document from the `games` collection into a `games` document format.
 *
 * @param document - A single document from the original `games` collection.
 * @returns The transformed `games`-format document.
 */
function transformGameDocument(document: BSONDocument): BSONDocument {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const buildTask = (task: BSONDocument): BSONDocument => {
    return {}
  }
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    name: extractValueOrThrow<string>(document, {}, 'name'),
    mode: extractValueOrThrow<string>(document, {}, 'mode'),
    // status: extractValueOrThrow<string>(document, {}, 'status'), //TODO: retrieve this or calculate this based on completed tasks
    pin: extractValueOrThrow<string>(document, {}, 'pin'),
    // quiz: extractValueOrThrow<string>(document, {}, 'quiz'), //TODO: retrieve quiz ID or build new temp quiz from questions
    // questions: extractValueOrThrow<BSONDocument[]>(document, {}, 'questions').map() //TODO: build questions
    nextQuestion: extractValueOrThrow<number>(document, {}, 'nextQuestion'),
    // participants: extractValueOrThrow<BSONDocument[]>(document, {}, 'participants').map() //TODO: build participants from or players
    currentTask: buildTask(
      extractValueOrThrow<BSONDocument>(document, {}, 'currentTask'),
    ),
    previousTasks: extractValueOrThrow<BSONDocument[]>(
      document,
      {},
      'previousTasks',
    ).map(buildTask),
    updated: toDate(
      extractValueOrThrow<string>(document, {}, 'updated', 'created'),
    ),
    created: toDate(extractValueOrThrow<string>(document, {}, 'created')),
  }
}

/**
 * Transforms a document from the `quizzes` collection into a `quiz` document format.
 *
 * @param document - A single document from the original `quizzes` collection.
 * @returns The transformed `quiz`-format document.
 */
function transformQuizDocument(document: BSONDocument): BSONDocument {
  const questions: BSONDocument[] = extractValueOrThrow<BSONDocument[]>(
    document,
    {},
    'questions',
  ).map((question) => {
    const type = extractValueOrThrow<string>(question, {}, 'type')
    let additional: BSONDocument = {}
    if (type === 'MULTI_CHOICE') {
      additional = {
        options: ((options) =>
          options.map((option) => ({
            value: extractValueOrThrow<string>(option, {}, 'value'),
            correct: extractValueOrThrow<boolean>(option, {}, 'correct'),
          })))(extractValueOrThrow<BSONDocument[]>(question, {}, 'options')),
      }
    }
    if (type === 'RANGE') {
      additional = {
        min: extractValueOrThrow<number>(question, {}, 'min'),
        max: extractValueOrThrow<number>(question, {}, 'max'),
        step: extractValueOrThrow<number>(question, {}, 'step'),
        margin: extractValueOrThrow<string>(question, {}, 'margin'),
        correct: extractValueOrThrow<number>(question, {}, 'correct'),
      }
    }
    if (type === 'TRUE_FALSE') {
      additional = {
        correct: extractValueOrThrow<boolean>(question, {}, 'correct'),
      }
    }
    if (type === 'TYPE_ANSWER') {
      additional = {
        options: extractValueOrThrow<string[]>(question, {}, 'options'),
      }
    }
    return {
      type,
      text: extractValueOrThrow<string>(question, {}, 'text'),
      media: ((media) => {
        if (media) {
          return {
            type: extractValueOrThrow<string>(media, {}, 'type'),
            url: extractValueOrThrow<string>(media, {}, 'url'),
          }
        }
        return null
      })(extractValue<BSONDocument>(question, {}, 'media')),
      points: extractValueOrThrow<number>(question, {}, 'points'),
      duration: extractValueOrThrow<number>(question, {}, 'duration'),
      ...additional,
    }
  })
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    title: extractValueOrThrow<string>(document, {}, 'title'),
    description: extractValue<string>(document, {}, 'description'),
    mode: extractValueOrThrow<string>(document, {}, 'mode'),
    visibility: extractValueOrThrow<string>(document, {}, 'visibility'),
    category: extractValue<string>(document, {}, 'category') || 'OTHER',
    imageCoverURL: extractValue<string>(document, {}, 'imageCoverURL'),
    languageCode: extractValueOrThrow<string>(document, {}, 'languageCode'),
    questions,
    owner: extractValueOrThrow<string>(document, {}, 'owner'),
    updated: toDate(extractValueOrThrow<string>(document, {}, 'updated')),
    created: toDate(extractValueOrThrow<string>(document, {}, 'created')),
  }
}

/**
 * Transforms a document from the `players` collection into a `users` document format.
 *
 * @param document - A single document from the original `players` collection.
 * @returns The transformed `users`-format document.
 */
function transformPlayerOrUserDocument(document: BSONDocument): BSONDocument {
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

/**
 * Transforms a document from the `tokens` collection into a `tokens` document format.
 *
 * @param document - A single document from the original `tokens` collection.
 * @returns The transformed `tokens`-format document.
 */
function transformTokenDocument(document: BSONDocument): BSONDocument {
  return {
    _id: extractValueOrThrow<string>(document, {}, '_id'),
    __v: 0,
    pairId: extractValueOrThrow<string>(document, {}, 'pairId'),
    type: extractValueOrThrow<string>(document, {}, 'type'),
    scope: extractValueOrThrow<string>(document, {}, 'scope'),
    principalId: extractValueOrThrow<string>(document, {}, 'principalId'),
    ipAddress: extractValueOrThrow<string>(document, {}, 'ipAddress'),
    userAgent: extractValueOrThrow<string>(document, {}, 'userAgent'),
    createdAt: toDate(extractValueOrThrow<string>(document, {}, 'createdAt')),
    expiresAt: toDate(extractValueOrThrow<string>(document, {}, 'expiresAt')),
  }
}

/**
 * Attempts to extract the first defined and non-null value from a list of dot-separated paths within a document.
 * Optionally logs the matched value or the entire document if no match is found.
 *
 * @param document - The document to search within.
 * @param options - Optional logging options.
 *   - `logValue`: If `true`, logs the found value or missing path message.
 *   - `logDocument`: If `true`, logs the entire document if no value is found.
 * @param paths - One or more dot-separated key paths (e.g., 'created', 'user.profile.name').
 * @returns The first found value of type `T`, or `null` if none of the paths yield a value.
 */
function extractValue<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: Record<string, any>,
  options?: { logValue?: boolean; logDocument?: boolean },
  ...paths: string[]
): T | null {
  for (const path of paths) {
    const value = path.split('.').reduce((acc, key) => {
      if (acc === undefined || acc === null) return undefined
      return acc[key]
    }, document)

    if (value !== undefined && value !== null) {
      if (options?.logValue) {
        logObject(value)
      }
      return value as T
    }
  }
  if (options?.logValue) {
    console.log(`No value found at paths '${paths.join(',')}'.`)
  }
  if (options?.logDocument) {
    logObject(document)
  }
  return null
}

/**
 * Extracts the first defined and non-null value from a list of dot-separated paths within a document.
 * Throws an error if none of the paths yield a valid value.
 *
 * @param document - The document to search within.
 * @param options - Optional logging options.
 *   - `logValue`: If `true`, logs the found value or missing path message.
 *   - `logDocument`: If `true`, logs the entire document if no value is found.
 * @param paths - One or more dot-separated key paths (e.g., 'created', 'user.profile.name').
 * @returns The first found value of type `T`.
 * @throws If none of the provided paths yield a defined and non-null value.
 */
function extractValueOrThrow<T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: Record<string, any>,
  options?: { logValue?: boolean; logDocument?: boolean },
  ...paths: string[]
): T {
  const value = extractValue<T>(document, options, ...paths)
  if (value !== undefined && value !== null) {
    return value
  }
  throw new Error(`Expected value in paths '${paths.join(', ')}' to be defined`)
}

/**
 * Pretty-prints a JavaScript object to the console using util.inspect,
 * useful for debugging deeply nested documents.
 *
 * @param object - The object to log.
 */
function logObject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  object: any,
): void {
  console.log(inspect(object, false, null, true))
}

/**
 * Converts a date string (in ISO format) to a JavaScript `Date` object.
 * Returns `null` if the input is `undefined` or `null`.
 *
 * @param dateString - A date string in ISO 8601 format, or `undefined`/`null`.
 * @returns A `Date` object if valid input is provided, otherwise `null`.
 */
function toDate(dateString?: string | null): Date | null {
  if (dateString) {
    return new Date(dateString)
  }
  return null
}
