import {
  CreateClassicModeGameRequestDto,
  CreateZeroToOneHundredModeGameRequestDto,
  GameMode,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'

type ClassicModeQuestions = CreateClassicModeGameRequestDto['questions']

type ZeroToOneHundredModeQuestions =
  CreateZeroToOneHundredModeGameRequestDto['questions']

export type QuestionsForMode<T extends GameMode> = T extends GameMode.Classic
  ? ClassicModeQuestions
  : T extends GameMode.ZeroToOneHundred
    ? ZeroToOneHundredModeQuestions
    : never

const assertType = <T>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
  type: string,
  fieldName: string,
  options?: {
    validate?: (val: T) => boolean
    minLength?: number
    maxLength?: number
  },
): T => {
  if (typeof value !== type) {
    throw new Error(
      `Invalid type for field '${fieldName}'. Expected ${type}, got ${typeof value}`,
    )
  }
  if (options?.validate && !options.validate(value)) {
    throw new Error(
      `Invalid value for field '${fieldName}'. Value did not pass custom validation.`,
    )
  }
  if (Array.isArray(value)) {
    if (options?.minLength !== undefined && value.length < options?.minLength) {
      throw new Error(
        `Invalid length for field '${fieldName}'. Expected at least ${options?.minLength}, got ${value.length}.`,
      )
    }
    if (options?.maxLength !== undefined && value.length > options?.maxLength) {
      throw new Error(
        `Invalid length for field '${fieldName}'. Expected at most ${options?.maxLength}, got ${value.length}.`,
      )
    }
  }
  return value as T
}

const assertQuestionType = (question: string) => {
  return assertType<string>(question, 'string', 'question')
}

const assertImageURLType = (imageURL?: string) => {
  if (imageURL) {
    return assertType<string>(imageURL, 'string', 'imageURL')
  }
  return imageURL
}

const assertQuestionMarginType = (margin: string) => {
  return assertType<string>(margin, 'string', 'margin', {
    validate: validateQuestionRangeAnswerMargin,
  })
}

const assertPointsType = (points: number) => {
  return assertType<number>(points, 'number', 'points', {
    validate: validatePoints,
  })
}

const assertDurationType = (duration: number) => {
  return assertType<number>(duration, 'number', 'duration', {
    validate: validateDuration,
  })
}

const validateQuestionRangeAnswerMargin = (margin: string): boolean =>
  ([...Object.values(QuestionRangeAnswerMargin)] as string[]).includes(margin)

const validatePoints = (points: number): boolean =>
  [0, 1000, 2000].includes(points)

const validateDuration = (points: number): boolean =>
  [5, 30, 60, 120].includes(points)

export const parseQuestionsJson = <T extends GameMode>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedJson: any[],
  mode: T,
): QuestionsForMode<T> => {
  if (mode === GameMode.Classic) {
    return assertType(
      parsedJson.map((question) => {
        if (question.type === QuestionType.MultiChoice) {
          return {
            type: QuestionType.MultiChoice,
            question: assertQuestionType(question.question),
            imageURL: assertImageURLType(question.imageURL),
            answers: assertType(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              question.answers.map((answer: any) => ({
                value: assertType<string>(
                  answer.value,
                  'string',
                  'answers.value',
                ),
                correct: assertType<boolean>(
                  answer.correct,
                  'boolean',
                  'answers.correct',
                ),
              })),
              'object',
              'answers',
              {
                minLength: 2,
                maxLength: 6,
              },
            ),
            points: assertPointsType(question.points),
            duration: assertDurationType(question.duration),
          } as ClassicModeQuestions[number]
        } else if (question.type === QuestionType.TrueFalse) {
          return {
            type: QuestionType.TrueFalse,
            question: assertQuestionType(question.question),
            imageURL: assertImageURLType(question.imageURL),
            correct: assertType<boolean>(
              question.correct,
              'boolean',
              'correct',
            ),
            points: assertPointsType(question.points),
            duration: assertDurationType(question.duration),
          } as ClassicModeQuestions[number]
        } else if (question.type === QuestionType.Range) {
          return {
            type: QuestionType.Range,
            question: assertQuestionType(question.question),
            imageURL: assertImageURLType(question.imageURL),
            min: assertType<number>(question.min, 'number', 'min'),
            max: assertType<number>(question.max, 'number', 'max'),
            margin: assertQuestionMarginType(question.margin),
            correct: assertType<number>(question.correct, 'number', 'correct'),
            points: assertPointsType(question.points),
            duration: assertDurationType(question.duration),
          } as ClassicModeQuestions[number]
        } else if (question.type === QuestionType.TypeAnswer) {
          return {
            type: QuestionType.TypeAnswer,
            question: assertQuestionType(question.question),
            imageURL: assertImageURLType(question.imageURL),
            correct: assertType<string>(question.correct, 'string', 'correct'),
            points: assertPointsType(question.points),
            duration: assertDurationType(question.duration),
          } as ClassicModeQuestions[number]
        } else {
          throw new Error('Unknown question type for Classic mode')
        }
      }) as QuestionsForMode<T>,
      'object',
      'questions',
      {
        minLength: 1,
        maxLength: 50,
      },
    )
  } else if (mode === GameMode.ZeroToOneHundred) {
    return assertType(
      parsedJson.map((question) => {
        if (question.type === QuestionType.Range) {
          return {
            type: QuestionType.Range,
            question: assertQuestionType(question.question),
            imageURL: assertImageURLType(question.imageURL),
            correct: assertType<number>(question.correct, 'number', 'correct'),
            duration: assertDurationType(question.duration),
          } as ZeroToOneHundredModeQuestions[number]
        } else {
          throw new Error('Unknown question type for ZeroToOneHundred mode')
        }
      }) as QuestionsForMode<T>,
      'object',
      'questions',
      {
        minLength: 1,
        maxLength: 50,
      },
    )
  } else {
    throw new Error('Unsupported game mode')
  }
}
