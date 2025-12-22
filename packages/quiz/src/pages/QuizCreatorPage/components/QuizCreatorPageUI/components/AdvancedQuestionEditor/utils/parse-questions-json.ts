import { GameMode, QUIZ_QUESTION_MAX, QUIZ_QUESTION_MIN } from '@quiz/common'

import {
  isClassicMultiChoiceQuestion,
  isClassicPinQuestion,
  isClassicPuzzleQuestion,
  isClassicRangeQuestion,
  isClassicTrueFalseQuestion,
  isClassicTypeAnswerQuestion,
  isZeroToOneHundredRangeQuestion,
} from '../../../../../../../utils/questions'
import { QuizQuestionModel } from '../../../../../utils/QuestionDataSource'

const assertType = <T>(
  value: T,
  type: string,
  fieldName: string,
  options?: {
    min?: number
    max?: number
    minLength?: number
    maxLength?: number
    arrayMinLength?: number
    arrayMaxLength?: number
    regex?: RegExp
    validate?: (val: T) => boolean | string
  },
): T => {
  if (typeof value !== type) {
    throw new Error(
      `Invalid type for field '${fieldName}'. Expected ${type}, got ${typeof value}`,
    )
  }

  if (Array.isArray(value)) {
    if (
      options?.arrayMinLength !== undefined &&
      value.length < options?.arrayMinLength
    ) {
      throw new Error(
        `Invalid length for field '${fieldName}'. Expected at least ${options?.arrayMinLength}, got ${value.length}.`,
      )
    }
    if (
      options?.arrayMaxLength !== undefined &&
      value.length > options?.arrayMaxLength
    ) {
      throw new Error(
        `Invalid length for field '${fieldName}'. Expected at most ${options?.arrayMaxLength}, got ${value.length}.`,
      )
    }
  }

  return value as T
}

export const parseQuestionsJson = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedJson: any,
  gameMode: GameMode,
): QuizQuestionModel[] => {
  if (!Array.isArray(parsedJson)) {
    throw new Error(
      `Unexpected root element. Expected array got ${typeof parsedJson}.`,
    )
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const parsedJsonArray = parsedJson as any[]

  return assertType(
    parsedJsonArray.map((question) => {
      if (isClassicMultiChoiceQuestion(gameMode, question)) {
        return question
      } else if (isClassicTrueFalseQuestion(gameMode, question)) {
        return question
      } else if (isClassicRangeQuestion(gameMode, question)) {
        return question
      } else if (isClassicTypeAnswerQuestion(gameMode, question)) {
        return question
      } else if (isClassicPinQuestion(gameMode, question)) {
        return question
      } else if (isClassicPuzzleQuestion(gameMode, question)) {
        return question
      } else if (isZeroToOneHundredRangeQuestion(gameMode, question)) {
        return question
      } else {
        throw new Error('Unsupported game mode or question type')
      }
    }),
    'object',
    'questions',
    {
      arrayMinLength: QUIZ_QUESTION_MIN,
      arrayMaxLength: QUIZ_QUESTION_MAX,
    },
  )
}
