import { QuestionCorrectAnswerDto } from '@quiz/common'
import React, { FC, ReactNode, useMemo } from 'react'
import { FullScreen, useFullScreenHandle } from 'react-full-screen'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useAuthContext } from '../auth'

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
  const { revokeGame } = useAuthContext()
  const { game } = useAuthContext()

  const gameID = useMemo(() => game?.ACCESS.gameId, [game])
  const gameToken = useMemo(() => game?.ACCESS.token, [game])
  const participantId = useMemo(() => game?.ACCESS.sub, [game])
  const participantType = useMemo(() => game?.ACCESS.participantType, [game])

  const {
    completeTask,
    submitQuestionAnswer,
    leaveGame,
    addCorrectAnswer,
    deleteCorrectAnswer,
  } = useQuizServiceClient()

  const fullScreenHandle = useFullScreenHandle()

  /**
   * Memoized value for the `GameContext`, containing the current game ID
   * and methods for completing tasks and submitting question answers.
   */
  const value = useMemo<GameContextType>(
    () => ({
      gameID,
      gameToken,
      participantId,
      participantType,
      isFullscreenActive: fullScreenHandle.active,
      completeTask: () => (gameID ? completeTask(gameID) : Promise.reject()),
      submitQuestionAnswer: (request) =>
        gameID ? submitQuestionAnswer(gameID, request) : Promise.reject(),
      leaveGame: (playerID: string) =>
        gameID
          ? leaveGame(gameID, playerID).then(revokeGame)
          : Promise.reject(),
      addCorrectAnswer: (answer: QuestionCorrectAnswerDto) =>
        gameID ? addCorrectAnswer(gameID, answer) : Promise.reject(),
      deleteCorrectAnswer: (answer: QuestionCorrectAnswerDto) =>
        gameID ? deleteCorrectAnswer(gameID, answer) : Promise.reject(),
      toggleFullscreen: fullScreenHandle.active
        ? fullScreenHandle.exit
        : fullScreenHandle.enter,
    }),
    [
      gameID,
      gameToken,
      participantId,
      participantType,
      fullScreenHandle,
      completeTask,
      submitQuestionAnswer,
      leaveGame,
      addCorrectAnswer,
      deleteCorrectAnswer,
      revokeGame,
    ],
  )

  return (
    <GameContext.Provider value={value}>
      <FullScreen handle={fullScreenHandle}>{children}</FullScreen>
    </GameContext.Provider>
  )
}

export default GameContextProvider
