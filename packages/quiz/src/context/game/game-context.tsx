import { SubmitQuestionAnswerRequestDto } from '@quiz/common'
import { createContext } from 'react'

/**
 * Defines the shape of the `GameContext`.
 *
 * @property gameID - The unique identifier for the current game (optional).
 * @property completeTask - A function to complete the current task, resolving a promise.
 * @property submitQuestionAnswer - A function to submit a question answer request, resolving a promise.
 */
export type GameContextType = {
  gameID?: string
  completeTask?: () => Promise<void>
  submitQuestionAnswer?: (
    request: SubmitQuestionAnswerRequestDto,
  ) => Promise<void>
}

/**
 * React context for managing the state and actions of a game session.
 */
export const GameContext = createContext<GameContextType>({})
