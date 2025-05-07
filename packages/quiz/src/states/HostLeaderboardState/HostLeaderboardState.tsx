import { GameLeaderboardHostEvent } from '@quiz/common'
import React, { FC, useState } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Leaderboard,
  Typography,
} from '../../components'
import { useGameContext } from '../../context/game'
import { GamePage } from '../common'

export interface HostLeaderboardStateProps {
  event: GameLeaderboardHostEvent
}

const HostLeaderboardState: FC<HostLeaderboardStateProps> = ({
  event: {
    game: { pin },
    leaderboard,
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  const [isInitiatingNextQuestion, setIsInitiatingNextQuestion] =
    useState<boolean>(false)

  const { completeTask } = useGameContext()

  const handleInitiateNextQuestion = () => {
    setIsInitiatingNextQuestion(true)
    completeTask?.().finally(() => setIsInitiatingNextQuestion(false))
  }

  return (
    <GamePage
      width="medium"
      height="full"
      align="start"
      header={
        <IconButtonArrowRight
          id={'next-button'}
          type="button"
          kind="call-to-action"
          size="small"
          value="Next"
          loading={isInitiatingNextQuestion}
          onClick={handleInitiateNextQuestion}
        />
      }
      footer={
        <HostGameFooter
          gamePIN={pin}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />
      }>
      <Typography variant="subtitle">Leaderboard</Typography>
      <Leaderboard values={leaderboard} />
    </GamePage>
  )
}

export default HostLeaderboardState
