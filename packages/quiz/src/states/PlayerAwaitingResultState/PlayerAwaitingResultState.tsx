import { GameAwaitingResultPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  LoadingSpinner,
  PlayerGameFooter,
  RocketImage,
  Typography,
} from '../../components'
import { GamePage } from '../common'

export interface PlayerAwaitingResultStateProps {
  event: GameAwaitingResultPlayerEvent
}

const PlayerAwaitingResultState: FC<PlayerAwaitingResultStateProps> = ({
  event: {
    player: {
      nickname,
      score: { total: totalScore },
    },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <GamePage
    footer={
      <PlayerGameFooter
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        nickname={nickname}
        totalScore={totalScore}
      />
    }>
    <RocketImage />
    <Typography variant="title" size="medium">
      Waiting for other players
    </Typography>
    <LoadingSpinner />
  </GamePage>
)

export default PlayerAwaitingResultState
