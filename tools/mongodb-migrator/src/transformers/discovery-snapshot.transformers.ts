import {
  BSONDocument,
  extractValue,
  extractValueOrThrow,
  toDate,
} from '../utils'

/**
 * Fixed UUID `_id` identifying the singleton discovery snapshot document.
 *
 * This value MUST stay in sync with `DISCOVERY_SNAPSHOT_SINGLETON_ID` in
 * `packages/klurigo-service/src/modules/discovery-api/constants/discovery.constants.ts`.
 *
 * The `discovery_snapshots` collection contains exactly one document, and this
 * constant enforces that invariant during export/import and validation.
 */
const DISCOVERY_SNAPSHOT_SINGLETON_ID = '00000000-0000-0000-0000-000000000000'

/**
 * Transforms a document from the `discovery_snapshots` collection.
 *
 * The collection contains a single singleton document identified by
 * {@link DISCOVERY_SNAPSHOT_SINGLETON_ID}. This transformer validates the
 * document shape, enforces the singleton id, and normalises date fields.
 *
 * @param document - A single document from the `discovery_snapshots` collection.
 * @returns The validated and normalised snapshot document.
 * @throws If `_id` is not the expected singleton id or required fields are missing.
 */
export function transformDiscoverySnapshotDocument(
  document: BSONDocument,
): BSONDocument {
  const id = extractValueOrThrow<string>(document, {}, '_id')

  if (id !== DISCOVERY_SNAPSHOT_SINGLETON_ID) {
    throw new Error(
      `Invalid discovery snapshot _id: expected '${DISCOVERY_SNAPSHOT_SINGLETON_ID}', got '${id}'`,
    )
  }

  const rawSections = extractValue<BSONDocument[]>(document, {}, 'sections')

  const sections = Array.isArray(rawSections)
    ? rawSections.map((section) => {
        const key = extractValueOrThrow<string>(section, {}, 'key')
        const rawEntries = extractValue<BSONDocument[]>(section, {}, 'entries')

        const entries = Array.isArray(rawEntries)
          ? rawEntries.map((entry) => ({
              quizId: extractValueOrThrow<string>(entry, {}, 'quizId'),
              score: extractValueOrThrow<number>(entry, {}, 'score'),
            }))
          : []

        return { key, entries }
      })
    : []

  return {
    _id: id,
    generatedAt: toDate(
      extractValueOrThrow<string>(document, {}, 'generatedAt'),
    ),
    sections,
  }
}
