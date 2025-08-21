/**
 * Compares two arrays for strict equality.
 *
 * Arrays are considered equal if:
 * - They have the same length.
 * - Each element at the same index is strictly equal (`===`).
 *
 * @param a - The first array to compare.
 * @param b - The second array to compare.
 * @returns `true` if the arrays are equal, otherwise `false`.
 */
export function arraysEqual<T>(a?: T[], b?: T[]): boolean {
  if (!a || !b || a.length !== b.length) return false
  return a.every((val, i) => val === b[i])
}

/**
 * Creates a shuffled copy of the input array using the Fisher–Yates algorithm.
 *
 * - Returns a new array without modifying the original.
 * - Elements are shuffled uniformly at random.
 *
 * @param arr - The array to shuffle.
 * @returns A new shuffled array.
 */
export function shuffleArray<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr

  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }

  return copy
}

/**
 * Shuffles the input array into a new random order that is guaranteed
 * to differ from the original array.
 *
 * - Uses {@link shuffleArray} internally.
 * - Retries until the shuffled array is not equal to the input.
 * - Returns the original array unchanged if its length is `0` or `1`.
 *
 * @param arr - The array to shuffle.
 * @returns A new shuffled array that differs from the input.
 */
export function shuffleDifferent<T>(arr: T[]): T[] {
  if (arr.length <= 1) return arr

  let shuffled: T[]
  do {
    shuffled = shuffleArray(arr)
  } while (arraysEqual(shuffled, arr))

  return shuffled
}
