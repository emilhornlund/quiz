import { QuestionType } from '@quiz/common'

import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
} from '../models/schemas'

/**
 * Checks if the given question is of type `MultiChoice`.
 *
 * @param {QuestionDao} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `MultiChoice`, otherwise `false`.
 */
export function isMultiChoiceQuestion(
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionMultiChoiceDao & { type: QuestionType.MultiChoice } {
  return question?.type === QuestionType.MultiChoice
}

/**
 * Checks if the given question is of type `Range`.
 *
 * @param {QuestionDao} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `Range`, otherwise `false`.
 */
export function isRangeQuestion(
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionRangeDao & { type: QuestionType.Range } {
  return question?.type === QuestionType.Range
}

/**
 * Checks if the given question is of type `TrueFalse`.
 *
 * @param {QuestionDao} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `TrueFalse`, otherwise `false`.
 */
export function isTrueFalseQuestion(
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionTrueFalseDao & { type: QuestionType.TrueFalse } {
  return question?.type === QuestionType.TrueFalse
}

/**
 * Checks if the given question is of type `TypeAnswer`.
 *
 * @param {QuestionDao} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `TypeAnswer`, otherwise `false`.
 */
export function isTypeAnswerQuestion(
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionTypeAnswerDao & { type: QuestionType.TypeAnswer } {
  return question?.type === QuestionType.TypeAnswer
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
