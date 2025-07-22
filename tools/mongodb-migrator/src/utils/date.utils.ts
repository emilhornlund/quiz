/**
 * Parses an ISO-8601 date string into a JavaScript `Date`, or returns `null`.
 *
 * @param dateString - ISO string (e.g. `"2025-07-22T12:34:56Z"`), or `undefined`/`null`.
 * @returns The corresponding `Date` object, or `null` if input was missing.
 */
export function toDate(dateString?: string | null): Date | null {
  if (dateString) {
    return new Date(dateString)
  }
  return null
}
