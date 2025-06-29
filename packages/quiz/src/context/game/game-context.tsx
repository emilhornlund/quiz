import {
  QuestionCorrectAnswerDto,
  SubmitQuestionAnswerRequestDto,
} from '@quiz/common'
import { createContext } from 'react'

/**
 * Defines the shape of the `GameContext`.
 *
 * @property gameID - The unique identifier for the current game (optional).
 * @property completeTask - A function to complete the current task, resolving a promise.
 * @property submitQuestionAnswer - A function to submit a question answer request, resolving a promise.
 * @property leaveGame - A function to remove a player from the game.
 */
export type GameContextType = {
  gameID?: string
  isFullscreenActive: boolean
  toggleFullscreen: () => Promise<void>
  completeTask?: () => Promise<void>
  submitQuestionAnswer?: (
    request: SubmitQuestionAnswerRequestDto,
  ) => Promise<void>
  leaveGame?: (playerID: string) => Promise<void>
  addCorrectAnswer?: (answer: QuestionCorrectAnswerDto) => Promise<void>
  deleteCorrectAnswer?: (answer: QuestionCorrectAnswerDto) => Promise<void>
}

/**
 * React context for managing the state and actions of a game session.
 */
export const GameContext = createContext<GameContextType>({
  isFullscreenActive: false,
  toggleFullscreen: () => Promise.resolve(),
})
