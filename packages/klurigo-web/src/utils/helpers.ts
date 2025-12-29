/**
 * Combines multiple class name values into a single space-separated string.
 *
 * @param classes - An array of class name values (string, null, or undefined).
 * @returns A single string containing all non-empty, trimmed class names joined by spaces.
 */
export const classNames = (...classes: (string | null | undefined)[]) => {
  return classes
    .map((value) => value?.trim())
    .filter((value) => !!value?.length)
    .join(' ')
}

/**
 * Extracts the base URL from a full URL string.
 *
 * @param input - Full URL (e.g., 'https://klurigo.com/game?x=1')
 * @param options - Optional settings for URL extraction
 * @param options.omitProtocol - If true, removes the protocol (e.g., 'klurigo.com')
 * @returns The base URL, or undefined if input is invalid
 */
export const extractUrl = (
  input?: string,
  options?: { omitProtocol?: boolean },
): string | undefined => {
  if (!input) return undefined

  try {
    const url = new URL(input)
    return options?.omitProtocol ? url.host : `${url.protocol}//${url.host}`
  } catch {
    return undefined
  }
}

/**
 * Determines if a given value is a valid number within an optional range.
 *
 * @param value - The number to validate.
 * @param min - The minimum allowable value (inclusive).
 * @param max - The maximum allowable value (inclusive).
 * @returns True if `value` is a number (not NaN) and between `min` and `max` if those bounds are provided; otherwise false.
 */
export const isValidNumber = (
  value: number | undefined,
  min?: number,
  max?: number,
): boolean => {
  if (value === undefined || Number.isNaN(value)) return false
  return !(
    (min !== undefined && value < min) ||
    (max !== undefined && value > max)
  )
}

/**
 * Trims whitespace from a string and returns undefined if the result is empty.
 *
 * @param value - The string to trim.
 * @returns The trimmed string, or undefined if `value` is undefined or only contains whitespace.
 */
export const trimToUndefined = (
  value: string | undefined,
): string | undefined => {
  return value?.trim() || undefined
}

/**
 * Parses a string into a finite number, or returns `fallback` if parsing fails.
 */
export const parseNumber = (v: string | null, fallback: number) => {
  const n = v ? Number(v) : NaN
  return Number.isFinite(n) ? n : fallback
}
