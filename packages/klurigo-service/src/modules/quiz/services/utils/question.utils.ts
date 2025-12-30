import { GameMode, QuestionType } from '@klurigo/common'

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
 * Checks if the given game mode is `Classic` and the question is a `MultiChoice` question.
 *
 * This is a type guard that narrows `question` to the concrete MultiChoice DAO shape
 * when it returns `true`.
 *
 * @param mode - Game mode to check.
 * @param question - Question to check.
 *
 * @returns `true` if the mode is `Classic` and the question is a `MultiChoice` question, otherwise `false`.
 */
export function isClassicMultiChoiceQuestion(
  mode?: GameMode,
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionMultiChoiceDao & { type: QuestionType.MultiChoice } {
  return (
    mode === GameMode.Classic && question?.type === QuestionType.MultiChoice
  )
}

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
 * Checks if the given game mode is `Classic` and the question is a `Range` question.
 *
 * This is a type guard that narrows `question` to the concrete Range DAO shape
 * when it returns `true`.
 *
 * @param mode - Game mode to check.
 * @param question - Question to check.
 * @returns `true` if the mode is `Classic` and the question is a `Range` question, otherwise `false`.
 */
export function isClassicRangeQuestion(
  mode?: GameMode,
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionRangeDao & { type: QuestionType.Range } {
  return mode === GameMode.Classic && question?.type === QuestionType.Range
}

/**
 * Checks if the given game mode is `ZeroToOneHundred` and the question is a `Range` question.
 *
 * This is a type guard that narrows `question` to the concrete Range DAO shape
 * when it returns `true`.
 *
 * @param mode - Game mode to check.
 * @param question - Question to check.
 * @returns `true` if the mode is `ZeroToOneHundred` and the question is a `Range` question, otherwise `false`.
 */
export function isZeroToOneHundredRangeQuestion(
  mode?: GameMode,
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionRangeDao & { type: QuestionType.Range } {
  return (
    mode === GameMode.ZeroToOneHundred && question?.type === QuestionType.Range
  )
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
 * Checks if the given game mode is `Classic` and the question is a `TrueFalse` question.
 *
 * This is a type guard that narrows `question` to the concrete TrueFalse DAO shape
 * when it returns `true`.
 *
 * @param mode - Game mode to check.
 * @param question - Question to check.
 * @returns `true` if the mode is `Classic` and the question is a `TrueFalse` question, otherwise `false`.
 */
export function isClassicTrueFalseQuestion(
  mode?: GameMode,
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionTrueFalseDao & { type: QuestionType.TrueFalse } {
  return mode === GameMode.Classic && question?.type === QuestionType.TrueFalse
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
 * Checks if the given game mode is `Classic` and the question is a `TypeAnswer` question.
 *
 * This is a type guard that narrows `question` to the concrete TypeAnswer DAO shape
 * when it returns `true`.
 *
 * @param mode - Game mode to check.
 * @param question - Question to check.
 * @returns `true` if the mode is `Classic` and the question is a `TypeAnswer` question, otherwise `false`.
 */
export function isClassicTypeAnswerQuestion(
  mode?: GameMode,
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionTypeAnswerDao & { type: QuestionType.TypeAnswer } {
  return mode === GameMode.Classic && question?.type === QuestionType.TypeAnswer
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
 * Checks if the given game mode is `Classic` and the question is a `Pin` question.
 *
 * This is a type guard that narrows `question` to the concrete Pin DAO shape
 * when it returns `true`.
 *
 * @param mode - Game mode to check.
 * @param question - Question to check.
 * @returns `true` if the mode is `Classic` and the question is a `Pin` question, otherwise `false`.
 */
export function isClassicPinQuestion(
  mode?: GameMode,
  question?: QuestionDao,
): question is BaseQuestionDao & QuestionPinDao & { type: QuestionType.Pin } {
  return mode === GameMode.Classic && question?.type === QuestionType.Pin
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
 * Checks if the given game mode is `Classic` and the question is a `Puzzle` question.
 *
 * This is a type guard that narrows `question` to the concrete Puzzle DAO shape
 * when it returns `true`.
 *
 * @param mode - Game mode to check.
 * @param question - Question to check.
 * @returns `true` if the mode is `Classic` and the question is a `Puzzle` question, otherwise `false`.
 */
export function isClassicPuzzleQuestion(
  mode?: GameMode,
  question?: QuestionDao,
): question is BaseQuestionDao &
  QuestionPuzzleDao & { type: QuestionType.Puzzle } {
  return mode === GameMode.Classic && question?.type === QuestionType.Puzzle
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
