/**
 * Runtime map of visual variants for the circular progress bar.
 *
 * These numeric values are used at runtime to determine styling
 * and visual emphasis.
 */
export const CircularProgressBarKind = {
  Default: 0,
  Correct: 1,
  Secondary: 2,
} as const

/**
 * Visual variant of a circular progress bar.
 *
 * Possible values:
 * - `Default` – Standard appearance
 * - `Correct` – Emphasized correct / success state
 * - `Secondary` – Secondary or muted appearance
 */
export type CircularProgressBarKind =
  (typeof CircularProgressBarKind)[keyof typeof CircularProgressBarKind]

/**
 * Runtime map of supported sizes for the circular progress bar.
 *
 * These numeric values are used to select size-dependent layout
 * and styling rules.
 */
export const CircularProgressBarSize = {
  Small: 0,
  Medium: 1,
  Large: 2,
} as const

/**
 * Size variant of a circular progress bar.
 *
 * Possible values:
 * - `Small`
 * - `Medium`
 * - `Large`
 */
export type CircularProgressBarSize =
  (typeof CircularProgressBarSize)[keyof typeof CircularProgressBarSize]
