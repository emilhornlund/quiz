/**
 * Normalizes a string by trimming whitespace and converting to lowercase.
 *
 * @param input - The input value to normalize.
 * @returns The trimmed, lowercased string. Returns an empty string for null or undefined input.
 */
export function normalizeString(input?: string | null): string {
  return (input ?? '').trim().toLowerCase()
}
