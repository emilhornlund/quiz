/**
 * Type guard that removes `null` and `undefined` from a value.
 *
 * Useful for filtering arrays such as:
 * `array.filter(isDefined)` to produce `T[]` from `(T | null | undefined)[]`.
 *
 * @param value - The value to check.
 * @returns `true` when `value` is neither `null` nor `undefined`.
 */
export function isDefined<T>(value: T | undefined | null): value is T {
  return value !== undefined && value !== null
}
