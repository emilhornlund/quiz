/**
 * Parses an ISO-8601 date string into a JavaScript `Date`, or returns `null`.
 *
 * @param dateString - ISO string (e.g. `"2025-07-22T12:34:56Z"`), or `undefined`/`null`.
 * @returns The corresponding `Date` object, or `null` if input was missing.
 */
export function toDate(dateString?: string | null): Date | null {
  if (!dateString) {
    return null
  }

  const date = new Date(dateString)

  return Number.isNaN(date.getTime()) ? null : date
}

/**
 * Parses an ISO-8601 date string into a JavaScript `Date`, or throws if invalid.
 *
 * @param dateString - ISO string (e.g. `"2025-07-22T12:34:56Z"`).
 * @returns The corresponding `Date` object.
 * @throws If the value is missing or not a valid ISO date string.
 */
export function toDateOrThrow(dateString?: string | null): Date {
  if (!dateString) {
    throw new Error('Missing required date value')
  }

  const date = new Date(dateString)

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${dateString}`)
  }

  return date
}
