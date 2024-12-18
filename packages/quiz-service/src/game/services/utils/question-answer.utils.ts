import { QuestionType, SubmitQuestionAnswerRequestDto } from '@quiz/common'

import {
  QuestionTaskAnswer,
  QuestionTaskBaseAnswer,
  QuestionTaskMultiChoiceAnswer,
  QuestionTaskRangeAnswer,
  QuestionTaskTrueFalseAnswer,
  QuestionTaskTypeAnswerAnswer,
} from '../models/schemas'

type Answer = QuestionTaskBaseAnswer &
  (
    | QuestionTaskMultiChoiceAnswer
    | QuestionTaskRangeAnswer
    | QuestionTaskTrueFalseAnswer
    | QuestionTaskTypeAnswerAnswer
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
 * Converts a player's submitted answer into a question task answer format.
 *
 * This function takes the player ID and the submitted answer data, and returns a
 * properly formatted answer object based on the question type. It supports multiple
 * question types, including multi-choice, range, true/false, and type answer.
 *
 * @param {string} playerId - The unique identifier of the player submitting the answer.
 * @param {SubmitQuestionAnswerRequestDto} submitQuestionAnswerRequest - The answer data
 * from the player, including the answer type and value.
 *
 * @returns {QuestionTaskAnswer} The formatted answer object for the current question.
 *
 * @private
 */
export function toQuestionTaskAnswer(
  playerId: string,
  submitQuestionAnswerRequest: SubmitQuestionAnswerRequestDto,
): QuestionTaskAnswer {
  const { type } = submitQuestionAnswerRequest

  let answer: string | number | boolean

  if (type === QuestionType.MultiChoice) {
    answer = submitQuestionAnswerRequest.optionIndex
  } else if (
    type === QuestionType.Range ||
    type === QuestionType.TrueFalse ||
    type === QuestionType.TypeAnswer
  ) {
    answer = submitQuestionAnswerRequest.value
  }

  return {
    type,
    playerId,
    answer,
    created: new Date(),
  }
}
