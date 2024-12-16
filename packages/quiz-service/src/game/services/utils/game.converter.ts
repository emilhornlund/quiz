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
  BaseQuestionDao,
  QuestionMediaDao,
  QuestionMultiChoiceDao,
  QuestionRangeDao,
  QuestionTrueFalseDao,
  QuestionTypeAnswerDao,
} from '../../../quiz/services/models/schemas'
import { calculateRangeStep } from '../../../quiz/services/utils'
import { Game, PartialGameModel } from '../models/schemas'

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
            text: question.question,
            media: buildQuestionMediaDao(question.media),
            points: question.points,
            duration: question.duration,
            options: question.answers.map((option) => ({
              value: option.value,
              correct: option.correct,
            })),
          } as BaseQuestionDao & QuestionMultiChoiceDao
        }

        if (
          isCreateClassicModeQuestionSliderRequestDto(request.mode, question)
        ) {
          return {
            type: QuestionType.Range,
            text: question.question,
            media: buildQuestionMediaDao(question.media),
            min: question.min,
            max: question.max,
            step: calculateRangeStep(question.min, question.max),
            margin: question.margin,
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as BaseQuestionDao & QuestionRangeDao
        }

        if (
          isCreateZeroToOneHundredModeQuestionRangeRequestDto(
            request.mode,
            question,
          )
        ) {
          return {
            type: QuestionType.Range,
            text: question.question,
            media: buildQuestionMediaDao(question.media),
            min: 0,
            max: 100,
            step: 1,
            margin: QuestionRangeAnswerMargin.None,
            correct: question.correct,
            points: -1,
            duration: question.duration,
          } as BaseQuestionDao & QuestionRangeDao
        }

        if (
          isCreateClassicModeQuestionTrueFalseRequestDto(request.mode, question)
        ) {
          return {
            type: QuestionType.TrueFalse,
            text: question.question,
            media: buildQuestionMediaDao(question.media),
            correct: question.correct,
            points: question.points,
            duration: question.duration,
          } as BaseQuestionDao & QuestionTrueFalseDao
        }

        if (
          isCreateClassicModeQuestionTypeAnswerRequestDto(
            request.mode,
            question,
          )
        ) {
          return {
            type: QuestionType.TypeAnswer,
            text: question.question,
            media: buildQuestionMediaDao(question.media),
            options: [question.correct],
            points: question.points,
            duration: question.duration,
          } as BaseQuestionDao & QuestionTypeAnswerDao
        }
      })
      .filter((obj) => !!obj),
  }
}

function buildQuestionMediaDao(
  media?: CreateCommonMediaRequestDto,
): QuestionMediaDao {
  if (!media) {
    return undefined
  }
  return { type: media.type, url: media.url }
}
