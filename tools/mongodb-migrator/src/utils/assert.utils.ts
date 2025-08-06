/**
 * Ensures a value is neither `undefined` nor `null`.
 *
 * @template T
 * @param value - The value to check.
 * @returns The original value, now guaranteed non-null and non-undefined.
 * @throws {Error} If the provided value is `undefined` or `null`.
 */
export function assertIsDefined<T>(value?: T): T {
  if (value === undefined || value === null) {
    throw new Error(`${value} is not defined`)
  }
  return value as T
}
