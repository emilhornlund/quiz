import { GameParticipantType } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { Client } from '../../../client/services/models/schemas'
import { Quiz } from '../../../quiz/services/models/schemas'
import { Game } from '../models/schemas'

import { buildLobbyTask } from './task.converter'

/**
 * Builds a complete game document from the provided partial game model and other details.
 *
 * @param {Quiz} quiz - The quiz document.
 * @param {string} gamePIN - The unique 6-digit game PIN of the game to create.
 * @param {Client} client - The client object representing the host creating the game.
 *
 * @returns {Game} A fully constructed Game document.
 */
export function buildGameModel(
  quiz: Quiz,
  gamePIN: string,
  client: Client,
): Game {
  const now = Date.now()

  return {
    _id: uuidv4(),
    name: quiz.title,
    mode: quiz.mode,
    pin: gamePIN,
    quiz,
    questions: quiz.questions,
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
