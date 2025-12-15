import { QUESTION_PIN_TOLERANCE_RADIUS, QuestionType } from '@quiz/common'

import {
  BaseClassicScoringStrategy,
  ClassicAnswer,
  ClassicCorrect,
  ClassicMeta,
} from '../core/classic-base-scoring-strategy'

/**
 * Scoring strategy for Pin (map/location) questions in Classic mode.
 *
 * This strategy:
 * - checks whether the pinned location is within a tolerance radius
 *   of the correct location
 * - combines a precision score (distance-based) with a time-based score
 *   from the Classic model
 */
export class ClassicPinScoringStrategy extends BaseClassicScoringStrategy<QuestionType.Pin> {
  /**
   * Determines whether a Pin answer is correct based on the configured
   * tolerance radius.
   *
   * @param correct Canonical correct pin position (serialized as `"x,y"`).
   * @param answer  Player's pin position (serialized as `"x,y"`), or `undefined`.
   * @param meta    Pin scoring metadata, including the tolerance level.
   * @returns `true` if the distance between correct and answer is within the radius.
   */
  public isCorrect(
    correct: ClassicCorrect<QuestionType.Pin>,
    answer: ClassicAnswer<QuestionType.Pin> | undefined,
    meta: ClassicMeta<QuestionType.Pin>,
  ): boolean {
    if (!correct.value || !answer?.answer) {
      return false
    }

    const correctPosition = this.toPinPositionFromString(correct.value)
    const answerPosition = this.toPinPositionFromString(answer.answer)

    const distance = this.calculateDistanceNorm(correctPosition, answerPosition)

    const radius = QUESTION_PIN_TOLERANCE_RADIUS[meta.tolerance]

    return distance <= radius
  }

  /**
   * Calculates the score for a Classic Pin answer.
   *
   * Scoring model:
   * - 0 points if the answer is outside the tolerance radius.
   * - 20% of the score comes from answering quickly (Classic time-based model).
   * - 80% of the score comes from spatial precision:
   *   - full 80% at the exact correct location
   *   - linearly decreasing to 0 at the edge of the tolerance radius
   *
   * @param presented When the question was shown to the player.
   * @param answered  When the player submitted the answer.
   * @param duration  Allowed answering time in seconds.
   * @param points    Maximum number of points for the question.
   * @param correct   Canonical correct pin position.
   * @param answer    Player's pin position, or `undefined`.
   * @param meta      Pin scoring metadata, including tolerance radius.
   * @returns The calculated score for this answer.
   */
  public calculateScore(
    presented: Date,
    answered: Date,
    duration: number,
    points: number,
    correct: ClassicCorrect<QuestionType.Pin>,
    answer: ClassicAnswer<QuestionType.Pin> | undefined,
    meta: ClassicMeta<QuestionType.Pin>,
  ): number {
    if (!answer || !this.isAnsweredInTime(presented, answered, duration)) {
      return 0
    }

    // If the answer is not correct based on the question logic, return 0
    if (!this.isCorrect(correct, answer, meta)) {
      return 0
    }

    // Calculate speed-based score (20%)
    const speedScore =
      this.calculateBaseScore(presented, answered, duration, points) *
      this.SPEED_BASED_MULTIPLIER

    const correctPosition = this.toPinPositionFromString(correct.value)
    const answerPosition = this.toPinPositionFromString(answer!.answer)

    const distance = this.calculateDistanceNorm(correctPosition, answerPosition)

    const radius = QUESTION_PIN_TOLERANCE_RADIUS[meta.tolerance]

    if (distance > radius) {
      return 0
    }

    const precisionMultiplier = 1 - distance / radius // linear
    const precisionScore =
      points * precisionMultiplier * this.PRECISION_BASED_MULTIPLIER

    // Total score: sum of speed and precision scores
    return Math.round(speedScore + precisionScore)
  }

  /**
   * Parses a `"x,y"` string into a normalized pin position.
   *
   * - Returns `{ x: 0, y: 0 }` if the input is falsy or not in `"x,y"` form.
   * - Does not clamp or validate ranges; callers may enforce 0..1 if required.
   * - If the numeric parts are not parseable, `x`/`y` will be `NaN`.
   *
   * @param value A string in the form `"x,y"` where both are decimal numbers.
   * @returns An object with `x` and `y` numeric coordinates.
   */
  private toPinPositionFromString(value?: string): {
    x: number
    y: number
  } {
    if (!value) {
      return { x: 0, y: 0 }
    }

    const split = value.split(',')

    if (
      split.length !== 2 ||
      split[0].trim() === '' ||
      split[1].trim() === ''
    ) {
      return { x: 0, y: 0 }
    }

    const x = Number(split[0])
    const y = Number(split[1])
    return { x, y }
  }

  /**
   * Computes the Euclidean distance between two normalized positions.
   *
   * - Inputs are expected (but not enforced) to be normalized to the image
   *   size (0..1 per axis). The theoretical max distance is √2.
   * - The result is rounded to 2 decimals to align with tolerance checks.
   *
   * @param a First point `{ x, y }`.
   * @param b Second point `{ x, y }`.
   * @returns The Euclidean distance rounded to 2 decimals.
   */
  private calculateDistanceNorm(
    a: { x: number; y: number },
    b: { x: number; y: number },
  ) {
    const dx = a.x - b.x
    const dy = a.y - b.y
    const d = Math.hypot(dx, dy) // normalized (since inputs are 0..1)
    return Math.round((d + Number.EPSILON) * 100) / 100
  }
}
