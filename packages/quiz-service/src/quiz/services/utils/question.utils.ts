import { QuestionType } from '@quiz/common'

import {
  BaseQuestionDao,
  QuestionDao,
  QuestionMultiChoiceDao,
  QuestionPinDao,
  QuestionPuzzleDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
} from '../../repositories/models/schemas'

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
 * Checks if the given question is of type `Pin`.
 *
 * @param {QuestionDao} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `Pin`, otherwise `false`.
 */
export function isPinQuestion(
  question?: QuestionDao,
): question is BaseQuestionDao & QuestionPinDao & { type: QuestionType.Pin } {
  return question?.type === QuestionType.Pin
}

/**
 * Checks if the given question is of type `Puzzle`.
 *
 * @param {QuestionDao} question - The question object to check.
 *
 * @returns {boolean} Returns `true` if the question is of type `Puzzle`, otherwise `false`.
 */
export function isPuzzleQuestion(
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionPuzzleDao & { type: QuestionType.Puzzle } {
  return question?.type === QuestionType.Puzzle
}
