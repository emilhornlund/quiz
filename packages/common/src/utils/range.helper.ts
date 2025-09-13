import { QuestionRangeAnswerMargin } from '../models'

/**
 * Calculates the valid answer interval (lower and upper bounds) for a range question.
 *
 * Behavior:
 * - Margin is applied as a percentage of the full range (`max - min`).
 * - Bounds are expanded outward from the correct value.
 * - Bounds are snapped to the nearest `step` on each side (outwards).
 * - Bounds are clamped within `[min, max]`.
 * - For `Maximum`, the entire range is accepted.
 * - For `None`, the bounds collapse to the nearest step around `correct`.
 *
 * @param margin - The margin type (`None`, `Low`, `Medium`, `High`, `Maximum`).
 * @param correct - The correct answer value to center the margin around.
 * @param min - The minimum allowed value in the range.
 * @param max - The maximum allowed value in the range.
 * @param step - The step size used to snap the bounds.
 *
 * @returns An object with `lower` and `upper` properties representing the valid interval.
 *
 * @example
 * calculateRangeBounds(QuestionRangeAnswerMargin.Low, 50, 0, 100, 2)
 * // → { lower: 44, upper: 56 }
 *
 * calculateRangeBounds(QuestionRangeAnswerMargin.High, 20, 0, 100, 2)
 * // → { lower: 14, upper: 26 }
 */
export function calculateRangeBounds(
  margin: QuestionRangeAnswerMargin,
  correct: number,
  min: number,
  max: number,
  step: number,
): { lower: number; upper: number } {
  // Guards
  if (!Number.isFinite(min) || !Number.isFinite(max) || max < min) {
    throw new Error('Invalid min/max')
  }
  const s = Number(step) > 0 ? Number(step) : max - min || 1
  const range = max - min

  if (margin === QuestionRangeAnswerMargin.Maximum) {
    return { lower: min, upper: max }
  }
  if (margin === QuestionRangeAnswerMargin.None || range === 0) {
    // Snap `correct` to the grid and clamp
    const snapped = snapToStep(correct, min, s)
    const clamped = clamp(snapped, min, max)
    // Ensure at least one step wide so there's a sensible interval
    const lower = clamp(clamped - s / 2, min, max)
    const upper = clamp(clamped + s / 2, min, max)
    return widenToStepGrid({ lower, upper }, min, max, s)
  }

  // Map levels to percentages of the FULL range
  const pct = {
    [QuestionRangeAnswerMargin.Low]: 0.05,
    [QuestionRangeAnswerMargin.Medium]: 0.1,
    [QuestionRangeAnswerMargin.High]: 0.2,
  }[margin]

  // Desired half-width (each side) in absolute units
  const halfWidth = range * pct

  // Raw (unsnapped) bounds
  const rawLower = correct - halfWidth
  const rawUpper = correct + halfWidth

  // Snap OUTWARDS to the step grid, then clamp to edges
  const lower = clamp(floorToStep(rawLower, min, s), min, max)
  const upper = clamp(ceilToStep(rawUpper, min, s), min, max)

  // Ensure we didn’t collapse to an empty interval due to edges/step
  return ensureAtLeastOneStep({ lower, upper }, min, max, s)
}

/**
 * Calculates an appropriate step value for a slider given the range between `min` and `max`.
 * The step is dynamically adjusted to ensure it is user-friendly and practical for interaction.
 *
 * @param {number} min - The minimum value of the slider range.
 * @param {number} max - The maximum value of the slider range.
 * @param {number} [targetSteps=50] - The approximate number of steps desired for the slider.
 *                                    Defaults to 50 if not provided.
 *
 * @returns {number} - The calculated step size for the slider.
 *
 * @example
 * calculateRangeStep(0, 10000); // Returns 200
 * calculateRangeStep(0, 500);   // Returns 10
 * calculateRangeStep(-50, 50);  // Returns 2
 * calculateRangeStep(0, 100);   // Returns 2
 */
export function calculateRangeStep(
  min: number,
  max: number,
  targetSteps: number = 50,
): number {
  const range = max - min

  if (range <= 0) {
    return 0
  }

  const rawStep = range / targetSteps

  const minimumStep = 1

  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)))

  const refinedStep =
    rawStep <= magnitude
      ? magnitude
      : Math.ceil(rawStep / magnitude) * magnitude

  return Math.max(refinedStep, minimumStep)
}

/**
 * Clamps a value `x` between a lower bound `a` and an upper bound `b`.
 *
 * @param x - The value to clamp.
 * @param a - The minimum allowed value.
 * @param b - The maximum allowed value.
 *
 * @returns The clamped value within the interval `[a, b]`.
 */
export function clamp(x: number, a: number, b: number): number {
  return Math.max(a, Math.min(b, x))
}

/**
 * Floors a value down to the nearest multiple of `step`
 * starting from `min`.
 *
 * @param x - The value to snap down.
 * @param min - The minimum anchor point of the range.
 * @param step - The step size for snapping.
 *
 * @returns The largest multiple of `step` ≥ `min` and ≤ `x`.
 */
export function floorToStep(x: number, min: number, step: number): number {
  return Math.floor((x - min) / step) * step + min
}

/**
 * Ceils a value up to the nearest multiple of `step`
 * starting from `min`.
 *
 * @param x - The value to snap up.
 * @param min - The minimum anchor point of the range.
 * @param step - The step size for snapping.
 *
 * @returns The smallest multiple of `step` ≥ `x`.
 */
export function ceilToStep(x: number, min: number, step: number): number {
  return Math.ceil((x - min) / step) * step + min
}

/**
 * Snaps a value to the nearest multiple of `step`
 * starting from `min`.
 *
 * @param x - The value to snap.
 * @param min - The minimum anchor point of the range.
 * @param step - The step size for snapping.
 *
 * @returns The closest multiple of `step` relative to `min`.
 */
export function snapToStep(x: number, min: number, step: number): number {
  return Math.round((x - min) / step) * step + min
}

/**
 * Ensures that an interval covers at least one full `step`.
 *
 * If the current bounds already cover ≥ one step, they are returned unchanged.
 * Otherwise, the interval is widened outward by one step to the right if possible,
 * or to the left, and as a last resort it falls back to the entire `[min, max]` range.
 *
 * @param b - The current interval with `lower` and `upper` bounds.
 * @param min - The minimum allowed value.
 * @param max - The maximum allowed value.
 * @param step - The step size that the interval must span.
 *
 * @returns A widened interval that spans at least one step.
 */
export function ensureAtLeastOneStep(
  b: { lower: number; upper: number },
  min: number,
  max: number,
  step: number,
): { lower: number; upper: number } {
  if (b.upper - b.lower >= step) return b
  if (b.upper + step <= max) return { lower: b.lower, upper: b.upper + step }
  if (b.lower - step >= min) return { lower: b.lower - step, upper: b.upper }
  return { lower: min, upper: max }
}

/**
 * Widens an interval so that both bounds align with the step grid.
 *
 * - The lower bound is floored to the nearest step from `min`.
 * - The upper bound is ceiled to the nearest step from `min`.
 *
 * @param b - The current interval with `lower` and `upper` bounds.
 * @param min - The minimum anchor point of the range.
 * @param max - The maximum anchor point of the range.
 * @param step - The step size to align to.
 *
 * @returns An interval expanded outward to the nearest step grid.
 */
export function widenToStepGrid(
  b: { lower: number; upper: number },
  min: number,
  max: number,
  step: number,
): { lower: number; upper: number } {
  return {
    lower: floorToStep(b.lower, min, step),
    upper: ceilToStep(b.upper, min, step),
  }
}
