import { QuizVisibility } from '@klurigo/common'

import { Quiz } from '../../repositories/models/schemas'

/**
 * Whether a cover image is required for a quiz to be eligible for discovery.
 *
 * When `true`, any quiz without a non-empty `imageCoverURL` is excluded from
 * all discovery rails.
 *
 * Default: `true`
 */
export const MIN_COVER_REQUIRED = true

/**
 * Minimum number of characters required in a quiz description for discovery
 * eligibility.
 *
 * Quizzes with a description shorter than this value (or no description at all)
 * are excluded from discovery rails.
 *
 * Default: `20`
 */
export const MIN_DESCRIPTION_LENGTH = 20

/**
 * Minimum number of questions a quiz must contain to be eligible for discovery.
 *
 * Quizzes with fewer than this number of questions are excluded from all
 * discovery rails. The threshold enforces a minimum content density so that
 * rail entries represent substantive quizzes.
 *
 * Default: `10`
 */
export const MIN_QUESTION_COUNT = 10

/**
 * Determines whether a quiz is eligible to appear on any discovery rail.
 *
 * A quiz must satisfy all of the following predicates:
 *
 * 1. `visibility === QuizVisibility.Public` — In this system, `PUBLIC` is the
 *    only published state. Drafts are stored as non-public, so this single check
 *    excludes both drafts and hidden quizzes. If a separate `isDraft` field is
 *    ever introduced, an additional clause must be added here.
 * 2. `imageCoverURL` is set and non-empty after trimming whitespace — controlled
 *    by `MIN_COVER_REQUIRED`. A string containing only whitespace (e.g., `"   "`)
 *    is treated as absent.
 * 3. `description`, after trimming whitespace, is non-empty and at least
 *    `MIN_DESCRIPTION_LENGTH` characters long (`MIN_DESCRIPTION_LENGTH = 20`).
 *    Surrounding whitespace is not counted toward the length.
 * 4. `questions.length >= MIN_QUESTION_COUNT` (`MIN_QUESTION_COUNT = 10`).
 *
 * @param quiz - The quiz document to evaluate.
 * @returns `true` if the quiz meets all discovery eligibility criteria, `false`
 *   otherwise.
 */
export function isDiscoveryEligible(quiz: Quiz): boolean {
  if (quiz.visibility !== QuizVisibility.Public) {
    return false
  }

  if (MIN_COVER_REQUIRED && !quiz.imageCoverURL?.trim()) {
    return false
  }

  const trimmedDesc = quiz.description?.trim() ?? ''
  if (trimmedDesc.length < MIN_DESCRIPTION_LENGTH) {
    return false
  }

  if (quiz.questions.length < MIN_QUESTION_COUNT) {
    return false
  }

  return true
}
