import { GameParticipantType, GameStatus } from '@quiz/common'
import { v4 as uuidv4 } from 'uuid'

import { Quiz } from '../../../quiz/repositories/models/schemas'
import { User } from '../../../user/repositories'
import { Game } from '../../repositories/models/schemas'

import { buildLobbyTask } from './task.converter'

/**
 * Builds a complete game document from the provided partial game model and other details.
 *
 * @param quiz - The quiz document.
 * @param gamePIN - The unique 6-digit game PIN of the game to create.
 * @param user - The user object representing the host creating the game.
 *
 * @returns A fully constructed Game document.
 */
export function buildGameModel(quiz: Quiz, gamePIN: string, user: User): Game {
  const now = Date.now()

  return {
    _id: uuidv4(),
    name: quiz.title,
    mode: quiz.mode,
    status: GameStatus.Active,
    pin: gamePIN,
    quiz,
    questions: quiz.questions,
    nextQuestion: 0,
    participants: [
      {
        participantId: user._id,
        type: GameParticipantType.HOST,
        created: new Date(now),
        updated: new Date(now),
      },
    ],
    currentTask: buildLobbyTask(),
    previousTasks: [],
    updated: new Date(now),
    created: new Date(now),
  }
}
