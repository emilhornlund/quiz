import {
  QuestionResultTaskBaseCorrectAnswer,
  QuestionResultTaskCorrectPuzzleAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskPuzzleAnswer,
} from '../../repositories/models/schemas'

type PuzzleCorrect = QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectPuzzleAnswer
type PuzzleAnswer = QuestionTaskBaseAnswer & QuestionTaskPuzzleAnswer

/**
 * Calculates a time-weighted base score.
 *
 * Linear decay from 1.0 (answered instantly) to 0.5 (answered at the deadline).
 * Answers outside the allowed time window score 0.
 *
 * @param presented The time when the question was presented.
 * @param answered  The time when the answer was submitted.
 * @param duration  Allowed answering time in seconds. Must be > 0.
 * @param points    Max points for a fully correct answer. Must be > 0.
 * @returns The base score (can be fractional). Returns 0 on invalid inputs or out-of-window.
 */
export function calculateClassicModeRawScore(
  presented: Date,
  answered: Date,
  duration: number,
  points: number,
): number {
  if (
    !(presented instanceof Date) ||
    !(answered instanceof Date) ||
    !Number.isFinite(duration) ||
    !Number.isFinite(points) ||
    duration <= 0 ||
    points <= 0
  ) {
    return 0
  }

  const start = presented.getTime()
  const at = answered.getTime()
  if (Number.isNaN(start) || Number.isNaN(at)) return 0
  if (at < start) return 0

  const end = start + duration * 1000
  if (at > end) return 0

  // Seconds between present and answer, clamped to [0, duration]
  const responseSec = Math.min(Math.max((at - start) / 1000, 0), duration)

  // Linear decay to 50% at the deadline:
  // ratio ∈ [0,1], adjustment = ratio/2, multiplier = 1 - adjustment → [1.0..0.5]
  const ratio = responseSec / duration
  const scoreMultiplier = 1 - ratio / 2

  return points * scoreMultiplier
}

/**
 * Counts how many positions in the puzzle answer match the correct value.
 *
 * @param correct The correct puzzle answer.
 * @param answer  The submitted puzzle answer.
 * @returns Number of positions that are correct (0 if inputs are invalid or lengths differ).
 */
function countCorrectPuzzlePositions(
  correct: PuzzleCorrect,
  answer?: PuzzleAnswer,
): number {
  const correctVals = correct?.value
  const givenVals = answer?.answer

  if (!Array.isArray(correctVals) || !Array.isArray(givenVals)) return 0
  if (correctVals.length !== givenVals.length) return 0

  let count = 0
  for (let i = 0; i < correctVals.length; i += 1) {
    if (correctVals[i] === givenVals[i]) count += 1
  }
  return count
}

/**
 * Returns true if at least one puzzle tile is in the correct position.
 * Useful as a quick guard before computing partial credit.
 *
 * @param correct The correct puzzle answer.
 * @param answer  The submitted puzzle answer.
 */
function hasAnyCorrectPuzzlePosition(
  correct: PuzzleCorrect,
  answer?: PuzzleAnswer,
): boolean {
  return countCorrectPuzzlePositions(correct, answer) > 0
}

/**
 * (Kept for backward compatibility)
 * Returns true if at least one puzzle tile is in the correct position.
 *
 * Prefer using `hasAnyCorrectPuzzlePosition`.
 */
export function isPuzzleQuestionAnswerCorrect(
  correct: PuzzleCorrect,
  answer?: PuzzleAnswer,
): boolean {
  return hasAnyCorrectPuzzlePosition(correct, answer)
}

/**
 * Calculates the puzzle score using base time-weighted scoring * partial correctness.
 *
 * - If no positions are correct, returns 0.
 * - Otherwise: `round(baseScore * (correctPositions / totalPositions))`.
 *
 * @param presented Time the question was presented.
 * @param duration  Allowed answering time (seconds).
 * @param points    Max points.
 * @param correct   Correct puzzle answer.
 * @param answer    Submitted puzzle answer (must include `created` timestamp).
 */
export function calculatePuzzleScore(
  presented: Date,
  duration: number,
  points: number,
  correct: PuzzleCorrect,
  answer?: PuzzleAnswer,
): number {
  const total = correct?.value?.length ?? 0
  if (!answer?.created || total <= 0) return 0

  const correctCount = countCorrectPuzzlePositions(correct, answer)
  if (correctCount === 0) return 0

  const base = calculateClassicModeRawScore(
    presented,
    answer.created,
    duration,
    points,
  )
  if (base <= 0) return 0

  const fraction = correctCount / total
  return Math.round(base * fraction)
}
