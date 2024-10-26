import { CreateGameRequestDto, GameMode, QuestionType } from '@quiz/common'

type ClassicModeQuestions = Extract<
  CreateGameRequestDto,
  { mode: GameMode.Classic }
>['questions']

type ZeroToOneHundredModeQuestions = Extract<
  CreateGameRequestDto,
  { mode: GameMode.ZeroToOneHundred }
>['questions']

export type QuestionsForMode<T extends GameMode> = T extends GameMode.Classic
  ? ClassicModeQuestions
  : T extends GameMode.ZeroToOneHundred
    ? ZeroToOneHundredModeQuestions
    : never

/* eslint-disable-next-line */
const assertType = <T>(value: any, type: string, fieldName: string): T => {
  if (typeof value !== type) {
    throw new Error(
      `Invalid type for field '${fieldName}'. Expected ${type}, got ${typeof value}`,
    )
  }
  return value as T
}

export const parseQuestionsJson = <T extends GameMode>(
  /* eslint-disable-next-line */
  parsedJson: any[],
  mode: T,
): QuestionsForMode<T> => {
  if (mode === GameMode.Classic) {
    return parsedJson.map((question) => {
      if (question.type === QuestionType.Multi) {
        return {
          type: QuestionType.Multi,
          question: assertType<string>(question.question, 'string', 'question'),
          imageURL: assertType<string>(question.imageURL, 'string', 'imageURL'),
          /* eslint-disable-next-line */
          answers: question.answers.map((answer: any) => ({
            value: assertType<string>(answer.value, 'string', 'answers.value'),
            correct: assertType<boolean>(
              answer.correct,
              'boolean',
              'answers.correct',
            ),
          })),
          points: assertType<number>(question.points, 'number', 'points'),
          duration: assertType<number>(question.duration, 'number', 'duration'),
        } as ClassicModeQuestions[number]
      } else if (question.type === QuestionType.TrueFalse) {
        return {
          type: QuestionType.TrueFalse,
          question: assertType<string>(question.question, 'string', 'question'),
          imageURL: assertType<string>(question.imageURL, 'string', 'imageURL'),
          correct: assertType<boolean>(question.correct, 'boolean', 'correct'),
          points: assertType<number>(question.points, 'number', 'points'),
          duration: assertType<number>(question.duration, 'number', 'duration'),
        } as ClassicModeQuestions[number]
      } else if (question.type === QuestionType.Slider) {
        return {
          type: QuestionType.Slider,
          question: assertType<string>(question.question, 'string', 'question'),
          imageURL: assertType<string>(question.imageURL, 'string', 'imageURL'),
          min: assertType<number>(question.min, 'number', 'min'),
          max: assertType<number>(question.max, 'number', 'max'),
          correct: assertType<number>(question.correct, 'number', 'correct'),
          points: assertType<number>(question.points, 'number', 'points'),
          duration: assertType<number>(question.duration, 'number', 'duration'),
        } as ClassicModeQuestions[number]
      } else if (question.type === QuestionType.TypeAnswer) {
        return {
          type: QuestionType.TypeAnswer,
          question: assertType<string>(question.question, 'string', 'question'),
          imageURL: assertType<string>(question.imageURL, 'string', 'imageURL'),
          correct: assertType<string>(question.correct, 'string', 'correct'),
          points: assertType<number>(question.points, 'number', 'points'),
          duration: assertType<number>(question.duration, 'number', 'duration'),
        } as ClassicModeQuestions[number]
      } else {
        throw new Error('Unknown question type for Classic mode')
      }
    }) as QuestionsForMode<T>
  } else if (mode === GameMode.ZeroToOneHundred) {
    return parsedJson.map((question) => {
      if (question.type === QuestionType.Slider) {
        return {
          type: QuestionType.Slider,
          question: assertType<string>(question.question, 'string', 'question'),
          imageURL: assertType<string>(question.imageURL, 'string', 'imageURL'),
          correct: assertType<number>(question.correct, 'number', 'correct'),
          points: assertType<number>(question.points, 'number', 'points'),
          duration: assertType<number>(question.duration, 'number', 'duration'),
        } as ZeroToOneHundredModeQuestions[number]
      } else {
        throw new Error('Unknown question type for ZeroToOneHundred mode')
      }
    }) as QuestionsForMode<T>
  } else {
    throw new Error('Unsupported game mode')
  }
}
