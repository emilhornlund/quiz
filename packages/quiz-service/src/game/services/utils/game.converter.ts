import {
  CreateClassicModeGameRequestDto,
  CreateZeroToOneHundredModeGameRequestDto,
  isCreateClassicModeQuestionMultiChoiceRequestDto,
  isCreateClassicModeQuestionSliderRequestDto,
  isCreateClassicModeQuestionTrueFalseRequestDto,
  isCreateClassicModeQuestionTypeAnswerRequestDto,
  isCreateZeroToOneHundredModeQuestionRangeRequestDto,
  QuestionType,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import {
  Game,
  PartialGameModel,
  QuestionMultiChoice,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
  TaskType,
} from '../models/schemas'

/**
 * Constructs a complete Game model from a partial game input and a game PIN.
 *
 * @param {PartialGameModel} game - The partial game data to create the game document.
 * @param {string} gamePIN - The unique 6-digit game PIN of the game to create.
 *
 * @returns {Game} A fully constructed Game document.
 */
export function buildGameModel(game: PartialGameModel, gamePIN: string): Game {
  const now = Date.now()

  return {
    ...game,
    _id: uuidv4(),
    pin: gamePIN,
    nextQuestion: 0,
    hostClientId: uuidv4(),
    players: [],
    currentTask: {
      _id: uuidv4(),
      type: TaskType.Lobby,
      status: 'active',
      created: new Date(now),
    },
    previousTasks: [],
    expires: new Date(now + 6 * 60 * 60 * 1000),
    created: new Date(now),
  }
}

/**
 * Converts the incoming request DTO into a partial Game model object for saving in the database.
 *
 * @param request The request DTO containing the game details.
 *
 * @returns A partial Game model object ready for saving.
 *
 * @private
 */
export function buildPartialGameModel(
  request:
    | CreateClassicModeGameRequestDto
    | CreateZeroToOneHundredModeGameRequestDto,
): PartialGameModel {
  return {
    name: request.name,
    mode: request.mode,
    questions: request.questions
      .map((question) => {
        if (
          isCreateClassicModeQuestionMultiChoiceRequestDto(
            request.mode,
            question,
          )
        ) {
          return {
            type: QuestionType.MultiChoice,
            question: question.question,
            imageURL: question.imageURL,
            points: question.points,
            duration: question.duration,
            options: question.answers.map((option) => ({
              value: option.value,
              correct: option.correct,
            })),
          } as QuestionMultiChoice
        }

        if (
          isCreateClassicModeQuestionSliderRequestDto(request.mode, question)
        ) {
          return {
            type: QuestionType.Range,
            question: question.question,
            imageURL: question.imageURL,
            min: question.min,
            max: question.max,
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as QuestionRange
        }

        if (
          isCreateZeroToOneHundredModeQuestionRangeRequestDto(
            request.mode,
            question,
          )
        ) {
          return {
            type: QuestionType.Range,
            question: question.question,
            imageURL: question.imageURL,
            min: 0,
            max: 100,
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as QuestionRange
        }

        if (
          isCreateClassicModeQuestionTrueFalseRequestDto(request.mode, question)
        ) {
          return {
            type: QuestionType.TrueFalse,
            question: question.question,
            imageURL: question.imageURL,
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as QuestionTrueFalse
        }

        if (
          isCreateClassicModeQuestionTypeAnswerRequestDto(
            request.mode,
            question,
          )
        ) {
          return {
            type: QuestionType.TypeAnswer,
            question: question.question,
            imageURL: question.imageURL,
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as QuestionTypeAnswer
        }
      })
      .filter((obj) => !!obj),
  }
}
