import { GameAwaitingResultPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import HourglassIcon from '../../assets/images/hourglass-icon.svg'
import {
  LoadingSpinner,
  PageProminentIcon,
  PlayerGameFooter,
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
    <PageProminentIcon src={HourglassIcon} alt="Hourglass" />
    <Typography variant="title" size="medium">
      Waiting for other players
    </Typography>
    <LoadingSpinner />
  </GamePage>
)

export default PlayerAwaitingResultState
