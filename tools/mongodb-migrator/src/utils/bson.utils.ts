import { createHash } from 'crypto'
import { readFileSync, writeFileSync } from 'fs'

import {
  Binary,
  BSON,
  BSONRegExp,
  Decimal128,
  EJSON,
  Long,
  ObjectId,
  Timestamp,
} from 'bson'

/**
 * A union type representing any value that can be stored in BSON.
 *
 * Can be:
 * - a primitive (`string`, `number`, `boolean`, `null`)
 * - a `Date`
 * - a BSON-specific type (`ObjectId`, `Binary`, `Long`, `Timestamp`, `Decimal128`, `BSONRegExp`)
 * - a nested `BSONDocument`
 * - a `BSONArray`
 */
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

/**
 * An object whose keys are strings and whose values are valid BSON values.
 */
export interface BSONDocument {
  [key: string]: BSONValue
}

/**
 * An array of valid BSON values.
 */
export type BSONArray = BSONValue[]

/**
 * Reads and deserializes a `.bson` file into an array of JSON-like documents.
 *
 * @param filePath - Path to the `.bson` file.
 * @returns An array of deserialized documents from the file.
 */
export function parseBsonDocuments(filePath: string): BSONDocument[] {
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
 * Serializes an array of JavaScript objects into a single BSON buffer and writes it to disk.
 *
 * @param filePath - The target file path for the BSON output.
 * @param documents - Array of plain objects to serialize into BSON.
 */
export function writeBsonDocuments(
  filePath: string,
  documents: BSONDocument[],
) {
  const transformedBuffer = Buffer.concat(
    documents.map((document) => BSON.serialize(document)),
  )
  writeFileSync(filePath, transformedBuffer)
}

/**
 * Computes a deterministic MD5 hex hash for any BSONValue by first converting
 * it to Extended JSON.
 *
 * @param value - Any valid BSONValue (primitive, nested document, array, or BSON type).
 * @returns A hex-encoded MD5 hash string.
 */
export function hashBSON(value: BSONValue): string {
  const ejson = EJSON.stringify(value)
  return createHash('md5').update(ejson, 'utf8').digest('hex')
}
