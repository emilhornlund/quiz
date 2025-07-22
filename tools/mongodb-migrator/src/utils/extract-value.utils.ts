import { logObject } from './log.utils'

/**
 * Attempts to read the first non-null value at any of the given paths
 * within a document, returning `null` if none match.
 *
 * @template T
 * @param document - The object to traverse.
 * @param options - Logging flags for debugging missing values or full document.
 * @param paths - One or more dot-notation paths (e.g. `"user.name"`).
 * @returns The found value cast to `T`, or `null` if not present.
 */
export function extractValue<T>(
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
 * Like `extractValue`, but throws an error if no defined, non-null value is found.
 *
 * @template T
 * @param document - The object to traverse.
 * @param options - Logging flags for debugging missing values or full document.
 * @param paths - One or more dot-notation paths to try.
 * @throws {Error} If none of the paths yield a defined, non-null value.
 * @returns The found value as `T`.
 */
export function extractValueOrThrow<T>(
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
