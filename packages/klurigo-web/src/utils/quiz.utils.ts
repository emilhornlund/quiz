export type DifficultyLabel = 'Easy' | 'Medium' | 'Hard' | 'Extreme'

/**
 * Converts a difficulty percentage into a human-readable difficulty label.
 *
 * The input is clamped to the range 0..1 and mapped to:
 * - 0.00..0.24 => Easy
 * - 0.25..0.49 => Medium
 * - 0.50..0.74 => Hard
 * - 0.75..1.00 => Extreme
 *
 * @param difficultyPercentage - Estimated difficulty as a value between 0 and 1.
 * @returns The corresponding difficulty label, or `undefined` if the input is not a number.
 */
export function toDifficultyLabel(
  difficultyPercentage?: number,
): DifficultyLabel | undefined {
  if (
    typeof difficultyPercentage !== 'number' ||
    Number.isNaN(difficultyPercentage)
  )
    return undefined

  const d = Math.min(1, Math.max(0, difficultyPercentage))

  if (d < 0.25) return 'Easy'
  if (d < 0.5) return 'Medium'
  if (d < 0.75) return 'Hard'
  return 'Extreme'
}
