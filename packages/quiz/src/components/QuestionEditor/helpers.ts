import {
  GameMode,
  MediaType,
  QuestionRangeAnswerMargin,
  QuestionType,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH,
  QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX,
  QUIZ_MULTI_CHOICE_OPTIONS_MAX,
  QUIZ_MULTI_CHOICE_OPTIONS_MIN,
  QUIZ_QUESTION_MAX,
  QUIZ_QUESTION_MIN,
  QUIZ_QUESTION_TEXT_MAX_LENGTH,
  QUIZ_QUESTION_TEXT_MIN_LENGTH,
  QUIZ_QUESTION_TEXT_REGEX,
  QUIZ_TYPE_ANSWER_OPTIONS_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_MIN,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
  QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
  QuizClassicModeRequestDto,
  QuizZeroToOneHundredModeRequestDto,
  URL_REGEX,
} from '@quiz/common'

type ClassicModeQuestions = QuizClassicModeRequestDto['questions']

type ZeroToOneHundredModeQuestions =
  QuizZeroToOneHundredModeRequestDto['questions']

export type QuestionsForMode<T extends GameMode> = T extends GameMode.Classic
  ? ClassicModeQuestions
  : T extends GameMode.ZeroToOneHundred
    ? ZeroToOneHundredModeQuestions
    : never

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

  if (typeof value === 'number') {
    if (options?.min !== undefined && value < options.min) {
      throw new Error(
        `Invalid value for field '${fieldName}'. Expected at least ${options?.min}, got ${value}.`,
      )
    }
    if (options?.max !== undefined && value > options.max) {
      throw new Error(
        `Invalid value for field '${fieldName}'. Expected at most ${options?.max}, got ${value}.`,
      )
    }
  }

  if (typeof value === 'string') {
    if (options?.minLength !== undefined && value.length < options.minLength) {
      throw new Error(
        `Invalid length for field '${fieldName}'. Expected a length at least ${options?.minLength}, got ${value.length}.`,
      )
    }
    if (options?.maxLength !== undefined && value.length > options.maxLength) {
      throw new Error(
        `Invalid length for field '${fieldName}'. Expected a length at most ${options?.maxLength}, got ${value.length}.`,
      )
    }
    if (options?.regex !== undefined && !options.regex.test(value)) {
      throw new Error(
        `Invalid characters for field '${fieldName}. Expected '${options.regex}'.`,
      )
    }
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

  const customValidation = options?.validate
    ? options.validate(value)
    : undefined
  if (customValidation !== undefined) {
    if (typeof customValidation === 'boolean' && !customValidation) {
      throw new Error(
        `Invalid value for field '${fieldName}'. Value did not pass custom validation.`,
      )
    }
    if (typeof customValidation === 'string') {
      throw new Error(
        `Invalid value for field '${fieldName}'. ${customValidation}`,
      )
    }
  }

  return value as T
}

const assertQuestionType = (question: string, fieldName: string) =>
  assertType<string>(question, 'string', fieldName, {
    minLength: QUIZ_QUESTION_TEXT_MIN_LENGTH,
    maxLength: QUIZ_QUESTION_TEXT_MAX_LENGTH,
    regex: QUIZ_QUESTION_TEXT_REGEX,
  })

const assertMediaType = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  media: Record<string, any> | undefined,
  fieldName: string,
): // eslint-disable-next-line @typescript-eslint/no-explicit-any
Record<string, any> | undefined => {
  if (media) {
    return {
      type: assertType<string>(media.type, 'string', `${fieldName}.type`, {
        validate: (mediaType: string): boolean | string => {
          const valid = ([...Object.values(MediaType)] as string[]).includes(
            mediaType,
          )
          if (!valid) {
            return `Expected ${Object.values(MediaType).join(', ')}.`
          }
          return true
        },
      }),
      url: assertType<string>(media.url, 'string', `${fieldName}.url`, {
        regex: URL_REGEX,
      }),
    }
  }
  return undefined
}

const assertQuestionMarginType = (margin: string) => {
  return assertType<string>(margin, 'string', 'margin', {
    validate: (margin: string): boolean =>
      ([...Object.values(QuestionRangeAnswerMargin)] as string[]).includes(
        margin,
      ),
  })
}

const assertPointsType = (points: number, fieldName: string) => {
  return assertType<number>(points, 'number', fieldName, {
    validate: (points: number): boolean | string => {
      const valid = [0, 1000, 2000].includes(points)
      if (!valid) {
        return 'Expected 0, 1000 or 2000.'
      }
      return true
    },
  })
}

const assertDurationType = (duration: number, fieldName: string) => {
  return assertType<number>(duration, 'number', fieldName, {
    validate: (points: number): boolean | string => {
      const valid = [5, 30, 60, 120].includes(points)
      if (!valid) {
        return 'Expected 5, 30, 60 or 120.'
      }
      return true
    },
  })
}

export const parseQuestionsJson = <T extends GameMode>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  parsedJson: any[],
  mode: T,
): QuestionsForMode<T> => {
  if (mode === GameMode.Classic) {
    return assertType(
      parsedJson.map((question, questionIndex) => {
        if (question.type === QuestionType.MultiChoice) {
          return assertType(
            {
              type: QuestionType.MultiChoice,
              question: assertQuestionType(
                question.question,
                `[${questionIndex}].question`,
              ),
              media: assertMediaType(
                question.media,
                `[${questionIndex}].question.media`,
              ),
              options: assertType(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                question.options.map((option: any, optionIndex: number) => ({
                  value: assertType<string>(
                    option.value,
                    'string',
                    `[${questionIndex}].options[${optionIndex}].value`,
                    {
                      minLength: QUIZ_MULTI_CHOICE_OPTION_VALUE_MIN_LENGTH,
                      maxLength: QUIZ_MULTI_CHOICE_OPTION_VALUE_MAX_LENGTH,
                      regex: QUIZ_MULTI_CHOICE_OPTION_VALUE_REGEX,
                    },
                  ),
                  correct: assertType<boolean>(
                    option.correct,
                    'boolean',
                    `[${questionIndex}].options[${optionIndex}].correct`,
                  ),
                })),
                'object',
                'options',
                {
                  arrayMinLength: QUIZ_MULTI_CHOICE_OPTIONS_MIN,
                  arrayMaxLength: QUIZ_MULTI_CHOICE_OPTIONS_MAX,
                },
              ),
              points: assertPointsType(
                question.points,
                `[${questionIndex}].points`,
              ),
              duration: assertDurationType(
                question.duration,
                `[${questionIndex}].duration`,
              ),
            } as ClassicModeQuestions[number],
            'object',
            `[${questionIndex}]`,
          )
        } else if (question.type === QuestionType.TrueFalse) {
          return assertType(
            {
              type: QuestionType.TrueFalse,
              question: assertQuestionType(
                question.question,
                `[${questionIndex}].question`,
              ),
              media: assertMediaType(
                question.media,
                `[${questionIndex}].question.media`,
              ),
              correct: assertType<boolean>(
                question.correct,
                'boolean',
                'correct',
              ),
              points: assertPointsType(
                question.points,
                `[${questionIndex}].points`,
              ),
              duration: assertDurationType(
                question.duration,
                `[${questionIndex}].duration`,
              ),
            } as ClassicModeQuestions[number],
            'object',
            `[${questionIndex}]`,
          )
        } else if (question.type === QuestionType.Range) {
          return assertType(
            {
              type: QuestionType.Range,
              question: assertQuestionType(
                question.question,
                `[${questionIndex}].question`,
              ),
              media: assertMediaType(
                question.media,
                `[${questionIndex}].question.media`,
              ),
              min: assertType<number>(question.min, 'number', 'min', {
                max: question.max,
              }),
              max: assertType<number>(question.max, 'number', 'max', {
                min: question.min,
              }),
              margin: assertQuestionMarginType(question.margin),
              correct: assertType<number>(
                question.correct,
                'number',
                'correct',
                {
                  min: question.min,
                  max: question.max,
                },
              ),
              points: assertPointsType(
                question.points,
                `[${questionIndex}].points`,
              ),
              duration: assertDurationType(
                question.duration,
                `[${questionIndex}].duration`,
              ),
            } as ClassicModeQuestions[number],
            'object',
            `[${questionIndex}]`,
          )
        } else if (question.type === QuestionType.TypeAnswer) {
          return assertType(
            {
              type: QuestionType.TypeAnswer,
              question: assertQuestionType(
                question.question,
                `[${questionIndex}].question`,
              ),
              media: assertMediaType(
                question.media,
                `[${questionIndex}].question.media`,
              ),
              options: assertType(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                question.options.map((option: any, optionsIndex: number) =>
                  assertType<string>(
                    option,
                    'string',
                    `[${questionIndex}].options[${optionsIndex}]`,
                    {
                      minLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MIN,
                      maxLength: QUIZ_TYPE_ANSWER_OPTIONS_VALUE_MAX,
                    },
                  ),
                ),
                'object',
                `[${questionIndex}].options`,
                {
                  arrayMinLength: QUIZ_TYPE_ANSWER_OPTIONS_MIN,
                  arrayMaxLength: QUIZ_TYPE_ANSWER_OPTIONS_MAX,
                },
              ),
              points: assertPointsType(
                question.points,
                `[${questionIndex}].points`,
              ),
              duration: assertDurationType(
                question.duration,
                `[${questionIndex}].duration`,
              ),
            } as ClassicModeQuestions[number],
            'object',
            `[${questionIndex}]`,
          )
        } else {
          throw new Error('Unknown question type for Classic mode')
        }
      }) as QuestionsForMode<T>,
      'object',
      'questions',
      {
        arrayMinLength: QUIZ_QUESTION_MIN,
        arrayMaxLength: QUIZ_QUESTION_MAX,
      },
    )
  } else if (mode === GameMode.ZeroToOneHundred) {
    return assertType(
      parsedJson.map((question, questionIndex) => {
        if (question.type === QuestionType.Range) {
          return assertType(
            {
              type: QuestionType.Range,
              question: assertQuestionType(
                question.question,
                `[${questionIndex}].question`,
              ),
              media: assertMediaType(
                question.media,
                `[${questionIndex}].question.media`,
              ),
              correct: assertType<number>(
                question.correct,
                'number',
                'correct',
                {
                  min: 0,
                  max: 100,
                },
              ),
              duration: assertDurationType(
                question.duration,
                `[${questionIndex}].duration`,
              ),
            } as ZeroToOneHundredModeQuestions[number],
            'object',
            `[${questionIndex}]`,
          )
        } else {
          throw new Error('Unknown question type for ZeroToOneHundred mode')
        }
      }) as QuestionsForMode<T>,
      'object',
      'questions',
      {
        arrayMinLength: QUIZ_QUESTION_MIN,
        arrayMaxLength: QUIZ_QUESTION_MAX,
      },
    )
  } else {
    throw new Error('Unsupported game mode')
  }
}
