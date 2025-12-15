import { QuestionType } from '@quiz/common'

import {
  QuestionResultTaskBaseCorrectAnswer,
  QuestionResultTaskCorrectAnswer,
  QuestionResultTaskCorrectMultiChoiceAnswer,
  QuestionResultTaskCorrectPinAnswer,
  QuestionResultTaskCorrectPuzzleAnswer,
  QuestionResultTaskCorrectRangeAnswer,
  QuestionResultTaskCorrectTrueFalseAnswer,
  QuestionResultTaskCorrectTypeAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskPinAnswer,
  QuestionTaskPuzzleAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
} from '../repositories/models/schemas'

type Answer = QuestionTaskBaseAnswer &
  (
    | QuestionTaskMultiChoiceAnswer
    | QuestionTaskRangeAnswer
    | QuestionTaskTrueFalseAnswer
    | QuestionTaskTypeAnswerAnswer
    | QuestionTaskPinAnswer
    | QuestionTaskPuzzleAnswer
  )

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
 * Checks if the given answer is of type `Pin`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `Pin`, otherwise `false`.
 */
export function isPinAnswer(answer?: Answer): answer is QuestionTaskBaseAnswer &
  QuestionTaskPinAnswer & {
    type: QuestionType.Pin
  } {
  return answer?.type === QuestionType.Pin
}

/**
 * Checks if the given answer is of type `Puzzle`.
 *
 * @param {Answer} answer - The answer object to check.
 *
 * @returns {boolean} Returns `true` if the answer is of type `Puzzle`, otherwise `false`.
 */
export function isPuzzleAnswer(
  answer?: Answer,
): answer is QuestionTaskBaseAnswer &
  QuestionTaskPuzzleAnswer & {
    type: QuestionType.Puzzle
  } {
  return answer?.type === QuestionType.Puzzle
}

/**
 * Checks if the given correct answer is of type `MultiChoice`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `MultiChoice`, otherwise `false`.
 */
export function isMultiChoiceCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectMultiChoiceAnswer & {
    type: QuestionType.MultiChoice
  } {
  return answer?.type === QuestionType.MultiChoice
}

/**
 * Checks if the given correct answer is of type `Range`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `Range`, otherwise `false`.
 */
export function isRangeCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectRangeAnswer & {
    type: QuestionType.Range
  } {
  return answer?.type === QuestionType.Range
}

/**
 * Checks if the given correct answer is of type `TrueFalse`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `TrueFalse`, otherwise `false`.
 */
export function isTrueFalseCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectTrueFalseAnswer & {
    type: QuestionType.TrueFalse
  } {
  return answer?.type === QuestionType.TrueFalse
}

/**
 * Checks if the given correct answer is of type `TypeAnswer`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `TypeAnswer`, otherwise `false`.
 */
export function isTypeAnswerCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectTypeAnswer & {
    type: QuestionType.TypeAnswer
  } {
  return answer?.type === QuestionType.TypeAnswer
}

/**
 * Checks if the given correct answer is of type `Pin`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `Pin`, otherwise `false`.
 */
export function isPinCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectPinAnswer & {
    type: QuestionType.Pin
  } {
  return answer?.type === QuestionType.Pin
}

/**
 * Checks if the given correct answer is of type `Puzzle`.
 *
 * @param answer - The answer object to check.
 *
 * @returns Returns `true` if the correct answer is of type `Puzzle`, otherwise `false`.
 */
export function isPuzzleCorrectAnswer(
  answer?: QuestionResultTaskCorrectAnswer,
): answer is QuestionResultTaskBaseCorrectAnswer &
  QuestionResultTaskCorrectPuzzleAnswer & {
    type: QuestionType.Puzzle
  } {
  return answer?.type === QuestionType.Puzzle
}
