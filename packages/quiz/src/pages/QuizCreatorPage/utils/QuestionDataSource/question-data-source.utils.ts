import {
  GameMode,
  QuestionMultiChoiceDto,
  QuestionPinDto,
  QuestionPinTolerance,
  QuestionPuzzleDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'

import { buildValidationModel } from '../../../../utils/validation'

import {
  ClassicModeQuestionValidationModel,
  QuestionData,
  ZeroToOneHundredModeQuestionValidationModel,
} from './question-data-source.types.ts'
import {
  getRulesForClassicModeQuestionType,
  getRulesForZeroToOneHundredModeQuestionType,
} from './question-data-source.validation-rules.ts'

/**
 * Recomputes the `validation` map for a `QuestionData` model based on:
 * - `question.mode`
 * - `question.data.type` (Classic)
 * - the applicable rule set (Classic type rules or ZeroToOneHundred range rules)
 *
 * Behavior:
 * - Classic:
 *   - If `data.type` is missing or unknown, validation becomes `{}`.
 *   - Otherwise, validation is computed using the rules for that type.
 * - ZeroToOneHundred:
 *   - Validation is always computed using `zeroToOneHundredRangeRules`.
 *
 * Note:
 * - This function does not modify `data`; it only recalculates `validation`.
 */
export const recomputeQuestionValidation = (
  question: QuestionData,
): QuestionData => {
  switch (question.mode) {
    case GameMode.Classic: {
      const type = question.data?.type
      if (!type) {
        return { ...question, validation: {} }
      }

      const rules = getRulesForClassicModeQuestionType(type)
      if (!rules) {
        return { ...question, validation: {} }
      }

      return {
        ...question,
        validation: buildValidationModel(question.data, rules).validation,
      }
    }

    case GameMode.ZeroToOneHundred: {
      const rules = getRulesForZeroToOneHundredModeQuestionType(
        QuestionType.Range,
      )
      if (!rules) {
        return { ...question, validation: {} }
      }

      return {
        ...question,
        validation: buildValidationModel(question.data, rules).validation,
      }
    }
  }
}

/**
 * Creates a new question model with default values and a computed `validation` map.
 *
 * This is the primary entry point for:
 * - initial state for a quiz in the creator
 * - adding new questions of a given mode + type
 *
 * Defaults:
 * - Classic:
 *   - MultiChoice: empty `options`, standard `points`, `duration`
 *   - TrueFalse: standard `points`, `duration`
 *   - Range: min/max/correct/margin + standard `points`, `duration`
 *   - TypeAnswer: empty `options` + standard `points`, `duration`
 *   - Pin: centered position + medium tolerance + standard `points`, `duration`
 *   - Puzzle: empty `values` + standard `points`, `duration`
 * - ZeroToOneHundred:
 *   - Range: `correct` mid-point + standard `duration`
 *
 * Throws:
 * - `Error` for unsupported mode/type combinations.
 */
export const createQuestionValidationModel = (
  mode: GameMode,
  type: QuestionType,
): QuestionData => {
  if (mode === GameMode.Classic) {
    if (type === QuestionType.MultiChoice) {
      return recomputeQuestionValidation({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.MultiChoice,
          options: [],
          points: 1000,
          duration: 30,
        },
        validation: {},
      })
    }
    if (type === QuestionType.TrueFalse) {
      return recomputeQuestionValidation({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.TrueFalse,
          points: 1000,
          duration: 30,
        },
        validation: {},
      })
    }
    if (type === QuestionType.Range) {
      return recomputeQuestionValidation({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Range,
          min: 0,
          max: 100,
          margin: QuestionRangeAnswerMargin.Medium,
          correct: 50,
          points: 1000,
          duration: 30,
        },
        validation: {},
      })
    }
    if (type === QuestionType.TypeAnswer) {
      return recomputeQuestionValidation({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.TypeAnswer,
          options: [],
          points: 1000,
          duration: 30,
        },
        validation: {},
      })
    }
    if (type === QuestionType.Pin) {
      return recomputeQuestionValidation({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Pin,
          positionX: 0.5,
          positionY: 0.5,
          tolerance: QuestionPinTolerance.Medium,
          points: 1000,
          duration: 30,
        },
        validation: {},
      })
    }
    if (type === QuestionType.Puzzle) {
      return recomputeQuestionValidation({
        mode: GameMode.Classic,
        data: {
          type: QuestionType.Puzzle,
          values: [],
          points: 1000,
          duration: 30,
        },
        validation: {},
      })
    }
  }
  if (mode === GameMode.ZeroToOneHundred) {
    return recomputeQuestionValidation({
      mode: GameMode.ZeroToOneHundred,
      data: {
        type: QuestionType.Range,
        correct: 50,
        duration: 60,
      },
      validation: {},
    })
  }
  throw new Error('Unknown game mode or question type')
}

/**
 * Type guard for Classic MultiChoice questions.
 *
 * Narrows:
 * - `question.mode` to `GameMode.Classic`
 * - `question.data` to `QuestionMultiChoiceDto`
 */
export function isClassicMultiChoiceQuestion(
  question: QuestionData,
): question is ClassicModeQuestionValidationModel & {
  data: QuestionMultiChoiceDto
} {
  return (
    question.mode === GameMode.Classic &&
    question.data?.type === QuestionType.MultiChoice
  )
}

/**
 * Type guard for Classic Range questions.
 *
 * Narrows:
 * - `question.mode` to `GameMode.Classic`
 * - `question.data` to `QuestionRangeDto`
 */
export function isClassicRangeQuestion(
  question: QuestionData,
): question is ClassicModeQuestionValidationModel & {
  data: QuestionRangeDto
} {
  return (
    question.mode === GameMode.Classic &&
    question.data?.type === QuestionType.Range
  )
}

/**
 * Type guard for Classic True/False questions.
 *
 * Narrows:
 * - `question.mode` to `GameMode.Classic`
 * - `question.data` to `QuestionTrueFalseDto`
 */
export function isClassicTrueFalseQuestion(
  question: QuestionData,
): question is ClassicModeQuestionValidationModel & {
  data: QuestionTrueFalseDto
} {
  return (
    question.mode === GameMode.Classic &&
    question.data?.type === QuestionType.TrueFalse
  )
}

/**
 * Type guard for Classic TypeAnswer questions.
 *
 * Narrows:
 * - `question.mode` to `GameMode.Classic`
 * - `question.data` to `QuestionTypeAnswerDto`
 */
export function isClassicTypeAnswerQuestion(
  question: QuestionData,
): question is ClassicModeQuestionValidationModel & {
  data: QuestionTypeAnswerDto
} {
  return (
    question.mode === GameMode.Classic &&
    question.data?.type === QuestionType.TypeAnswer
  )
}

/**
 * Type guard for Classic Pin questions.
 *
 * Narrows:
 * - `question.mode` to `GameMode.Classic`
 * - `question.data` to `QuestionPinDto`
 */
export function isClassicPinQuestion(
  question: QuestionData,
): question is ClassicModeQuestionValidationModel & {
  data: QuestionPinDto
} {
  return (
    question.mode === GameMode.Classic &&
    question.data?.type === QuestionType.Pin
  )
}

/**
 * Type guard for Classic Puzzle questions.
 *
 * Narrows:
 * - `question.mode` to `GameMode.Classic`
 * - `question.data` to `QuestionPuzzleDto`
 */
export function isClassicPuzzleQuestion(
  question: QuestionData,
): question is ClassicModeQuestionValidationModel & {
  data: QuestionPuzzleDto
} {
  return (
    question.mode === GameMode.Classic &&
    question.data?.type === QuestionType.Puzzle
  )
}

/**
 * Type guard for ZeroToOneHundred Range questions.
 *
 * Narrows:
 * - `question.mode` to `GameMode.ZeroToOneHundred`
 * - `question.data` to `QuestionZeroToOneHundredRangeDto`
 */
export function isZeroToOneHundredRangeQuestion(
  question: QuestionData,
): question is ZeroToOneHundredModeQuestionValidationModel & {
  data: QuestionZeroToOneHundredRangeDto
} {
  return (
    question.mode === GameMode.ZeroToOneHundred &&
    question.data?.type === QuestionType.Range
  )
}
