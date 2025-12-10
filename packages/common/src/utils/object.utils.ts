import equal from 'fast-deep-equal'

/**
 * Performs deep equality comparison between two values.
 *
 * This is a thin wrapper around fast-deep-equal library that provides
 * type-safe deep comparison for any values including objects, arrays,
 * and primitive types.
 *
 * @param a - First value to compare
 * @param b - Second value to compare
 * @returns true if values are deeply equal, false otherwise
 */
export const deepEqual = <T>(a: T, b: T): boolean => {
  return equal(a, b)
}
