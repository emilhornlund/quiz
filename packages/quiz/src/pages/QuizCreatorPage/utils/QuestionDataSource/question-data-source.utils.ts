import {
  GameMode,
  QuestionMultiChoiceDto,
  QuestionRangeAnswerMargin,
  QuestionRangeDto,
  QuestionTrueFalseDto,
  QuestionType,
  QuestionTypeAnswerDto,
  QuestionZeroToOneHundredRangeDto,
} from '@quiz/common'

import {
  ClassicModeQuestionValidationModel,
  QuestionData,
  ZeroToOneHundredModeQuestionValidationModel,
} from './question-data-source.types.ts'

export const createQuestionValidationModel = (
  mode: GameMode,
  type: QuestionType,
): QuestionData => {
  if (mode === GameMode.Classic) {
    if (type === QuestionType.MultiChoice) {
      return {
        mode: GameMode.Classic,
        data: {
          type: QuestionType.MultiChoice,
          options: [],
          points: 1000,
          duration: 30,
        },
        validation: {},
      }
    }
    if (type === QuestionType.TrueFalse) {
      return {
        mode: GameMode.Classic,
        data: {
          type: QuestionType.TrueFalse,
          points: 1000,
          duration: 30,
        },
        validation: {},
      }
    }
    if (type === QuestionType.Range) {
      return {
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
      }
    }
    if (type === QuestionType.TypeAnswer) {
      return {
        mode: GameMode.Classic,
        data: {
          type: QuestionType.TypeAnswer,
          options: [],
          points: 1000,
          duration: 30,
        },
        validation: {},
      }
    }
  }
  if (mode === GameMode.ZeroToOneHundred) {
    return {
      mode: GameMode.ZeroToOneHundred,
      data: {
        type: QuestionType.Range,
        duration: 60,
      },
      validation: {},
    }
  }
  throw new Error('Unknown game mode or question type')
}

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

export function isZeroToOneHundredRangeDto(
  question: QuestionData,
): question is ZeroToOneHundredModeQuestionValidationModel & {
  data: QuestionZeroToOneHundredRangeDto
} {
  return (
    question.mode === GameMode.ZeroToOneHundred &&
    question.data?.type === QuestionType.Range
  )
}
