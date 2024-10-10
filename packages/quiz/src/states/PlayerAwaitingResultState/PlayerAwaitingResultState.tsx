import { GameEventAwaitingResultPlayer } from '@quiz/common'
import React, { FC } from 'react'

import { Page, PlayerGameFooter, RocketImage } from '../../components'

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
      <div className={styles.title}>Waiting for other players</div>
      <div className={styles.loadingSpinner}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  </Page>
)

export default PlayerAwaitingResultState
