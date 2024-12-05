import {
  CreateClassicModeGameRequestDto,
  CreateCommonMediaRequestDto,
  CreateZeroToOneHundredModeGameRequestDto,
  GameParticipantType,
  isCreateClassicModeQuestionMultiChoiceRequestDto,
  isCreateClassicModeQuestionSliderRequestDto,
  isCreateClassicModeQuestionTrueFalseRequestDto,
  isCreateClassicModeQuestionTypeAnswerRequestDto,
  isCreateZeroToOneHundredModeQuestionRangeRequestDto,
  QuestionRangeAnswerMargin,
  QuestionType,
} from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { Client } from '../../../client/services/models/schemas'
import {
  BaseQuestion,
  Game,
  Media,
  PartialGameModel,
  QuestionMultiChoice,
  QuestionRange,
  QuestionTrueFalse,
  QuestionTypeAnswer,
} from '../models/schemas'

import { calculateRangeStep } from './question.utils'
import { buildLobbyTask } from './task.converter'

/**
 * Builds a complete game document from the provided partial game model and other details.
 *
 * @param {PartialGameModel} game - The partial game data to create the game document.
 * @param {string} gamePIN - The unique 6-digit game PIN of the game to create.
 * @param {Client} client - The client object representing the host creating the game.
 *
 * @returns {Game} A fully constructed Game document.
 */
export function buildGameModel(
  game: PartialGameModel,
  gamePIN: string,
  client: Client,
): Game {
  const now = Date.now()

  return {
    ...game,
    _id: uuidv4(),
    pin: gamePIN,
    nextQuestion: 0,
    participants: [
      {
        type: GameParticipantType.HOST,
        client,
        created: new Date(now),
        updated: new Date(now),
      },
    ],
    currentTask: buildLobbyTask(),
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
            media: buildMedia(question.media),
            points: question.points,
            duration: question.duration,
            options: question.answers.map((option) => ({
              value: option.value,
              correct: option.correct,
            })),
          } as BaseQuestion & QuestionMultiChoice
        }

        if (
          isCreateClassicModeQuestionSliderRequestDto(request.mode, question)
        ) {
          return {
            type: QuestionType.Range,
            question: question.question,
            media: buildMedia(question.media),
            min: question.min,
            max: question.max,
            step: calculateRangeStep(question.min, question.max),
            margin: question.margin,
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as BaseQuestion & QuestionRange
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
            media: buildMedia(question.media),
            min: 0,
            max: 100,
            step: 1,
            margin: QuestionRangeAnswerMargin.None,
            correct: question.correct,
            points: -1,
            duration: question.duration,
          } as BaseQuestion & QuestionRange
        }

        if (
          isCreateClassicModeQuestionTrueFalseRequestDto(request.mode, question)
        ) {
          return {
            type: QuestionType.TrueFalse,
            question: question.question,
            media: buildMedia(question.media),
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as BaseQuestion & QuestionTrueFalse
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
            media: buildMedia(question.media),
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as BaseQuestion & QuestionTypeAnswer
        }
      })
      .filter((obj) => !!obj),
  }
}

function buildMedia(media?: CreateCommonMediaRequestDto): Media {
  if (!media) {
    return undefined
  }
  return { type: media.type, url: media.url }
}
