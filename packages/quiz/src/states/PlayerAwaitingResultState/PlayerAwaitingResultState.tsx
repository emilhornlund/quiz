import { GameAwaitingResultPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  LoadingSpinner,
  Page,
  PlayerGameFooter,
  RocketImage,
  Typography,
} from '../../components'

export interface PlayerAwaitingResultStateProps {
  event: GameAwaitingResultPlayerEvent
}

const PlayerAwaitingResultState: FC<PlayerAwaitingResultStateProps> = ({
  event: {
    nickname,
    score: { total: totalScore },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => (
  <Page
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
  </Page>
)

export default PlayerAwaitingResultState
