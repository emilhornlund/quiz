import { GameEventAwaitingResultPlayer } from '@quiz/common'
import React, { FC } from 'react'

import {
  LoadingSpinner,
  Page,
  PlayerGameFooter,
  RocketImage,
  Typography,
} from '../../components'

import styles from './PlayerAwaitingResultState.module.scss'

export interface PlayerAwaitingResultStateProps {
  event: GameEventAwaitingResultPlayer
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
    <div className={styles.main}>
      <RocketImage />
      <Typography variant="title" size="medium">
        Waiting for other players
      </Typography>
      <LoadingSpinner />
    </div>
  </Page>
)

export default PlayerAwaitingResultState
