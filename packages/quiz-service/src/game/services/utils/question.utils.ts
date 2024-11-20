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
