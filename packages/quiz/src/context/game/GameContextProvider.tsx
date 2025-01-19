import React, { FC, ReactNode, useMemo } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useGameIDQueryParam } from '../../utils/use-game-id-query-param.tsx'

import { GameContext, GameContextType } from './game-context.tsx'

/**
 * Props for the `GameContextProvider` component.
 *
 * @property children - The child components to be wrapped by the provider.
 */
export interface GameContextProviderProps {
  children: ReactNode | ReactNode[]
}

/**
 * Provides the `GameContext` to its child components.
 *
 * Wraps its children with the `GameContext.Provider` to supply the current game ID,
 * as well as methods for completing tasks and submitting question answers.
 *
 * @param children - The child components to be wrapped by the provider.
 *
 * @returns A React component wrapping its children with the `GameContext` provider.
 */
const GameContextProvider: FC<GameContextProviderProps> = ({ children }) => {
  const [gameID] = useGameIDQueryParam()

  const { completeTask, submitQuestionAnswer, leaveGame } =
    useQuizServiceClient()

  /**
   * Memoized value for the `GameContext`, containing the current game ID
   * and methods for completing tasks and submitting question answers.
   */
  const value = useMemo<GameContextType>(
    () => ({
      gameID,
      completeTask: () => (gameID ? completeTask(gameID) : Promise.reject()),
      submitQuestionAnswer: (request) =>
        gameID ? submitQuestionAnswer(gameID, request) : Promise.reject(),
      leaveGame: (playerID: string) =>
        gameID ? leaveGame(gameID, playerID) : Promise.reject(),
    }),
    [gameID, completeTask, submitQuestionAnswer, leaveGame],
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}

export default GameContextProvider
