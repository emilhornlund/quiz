import { QuestionType } from '@quiz/common'

import {
  BaseQuestion,
  QuestionMultiChoice,
  QuestionRange,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
  QuestionTrueFalse,
  QuestionTypeAnswer,
} from '../models/schemas'

type Question = BaseQuestion &
  (QuestionMultiChoice | QuestionRange | QuestionTrueFalse | QuestionTypeAnswer)

type Answer = QuestionTaskBaseAnswer &
  (
    | QuestionTaskMultiChoiceAnswer
    | QuestionTaskRangeAnswer
    | QuestionTaskTrueFalseAnswer
    | QuestionTaskTypeAnswerAnswer
  )

/**
 * Checks if the given question is of type `MultiChoice`.
 *
 * @param {Question} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `MultiChoice`, otherwise `false`.
 */
export function isMultiChoiceQuestion(
  question?: Question,
): question is BaseQuestion &
  QuestionMultiChoice & { type: QuestionType.MultiChoice } {
  return question?.type === QuestionType.MultiChoice
}

/**
 * Checks if the given question is of type `Range`.
 *
 * @param {Question} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `Range`, otherwise `false`.
 */
export function isRangeQuestion(
  question?: Question,
): question is BaseQuestion & QuestionRange & { type: QuestionType.Range } {
  return question?.type === QuestionType.Range
}

/**
 * Checks if the given question is of type `TrueFalse`.
 *
 * @param {Question} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `TrueFalse`, otherwise `false`.
 */
export function isTrueFalseQuestion(
  question?: Question,
): question is BaseQuestion &
  QuestionTrueFalse & { type: QuestionType.TrueFalse } {
  return question?.type === QuestionType.TrueFalse
}

/**
 * Checks if the given question is of type `TypeAnswer`.
 *
 * @param {Question} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `TypeAnswer`, otherwise `false`.
 */
export function isTypeAnswerQuestion(
  question?: Question,
): question is BaseQuestion &
  QuestionTypeAnswer & { type: QuestionType.TypeAnswer } {
  return question?.type === QuestionType.TypeAnswer
}

/**
 * Checks if the given answer is of type `MultiChoice`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `MultiChoice`, otherwise `false`.
 */
export function isMultiChoiceAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskMultiChoiceAnswer & {
    type: QuestionType.MultiChoice
  } {
  return answer?.type === QuestionType.MultiChoice
}

/**
 * Checks if the given answer is of type `Range`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `Range`, otherwise `false`.
 */
export function isRangeAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskRangeAnswer & {
    type: QuestionType.Range
  } {
  return answer?.type === QuestionType.Range
}

/**
 * Checks if the given answer is of type `TrueFalse`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `TrueFalse`, otherwise `false`.
 */
export function isTrueFalseAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskTrueFalseAnswer & {
    type: QuestionType.TrueFalse
  } {
  return answer?.type === QuestionType.TrueFalse
}

/**
 * Checks if the given answer is of type `TypeAnswer`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `TypeAnswer`, otherwise `false`.
 */
export function isTypeAnswerAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskTypeAnswerAnswer & {
    type: QuestionType.TypeAnswer
  } {
  return answer?.type === QuestionType.TypeAnswer
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
