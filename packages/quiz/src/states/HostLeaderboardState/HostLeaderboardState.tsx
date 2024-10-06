import { GameEventLeaderboardHost } from '@quiz/common'
import React, { FC } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Leaderboard,
  Page,
} from '../../components'

import styles from './HostLeaderboardState.module.scss'

export interface HostLeaderboardStateProps {
  event: GameEventLeaderboardHost
}

const HostLeaderboardState: FC<HostLeaderboardStateProps> = ({
  event: {
    gamePIN,
    leaderboard,
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  return (
    <Page
      header={
        <IconButtonArrowRight
          id={'next-button'}
          type="button"
          kind="secondary"
          size="small"
          value="Next"
        />
      }
      footer={
        <HostGameFooter
          gamePIN={gamePIN}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
        />
      }>
      <div className={styles.main}>
        <div className={styles.title}>Leaderboard</div>
        <Leaderboard values={leaderboard} />
      </div>
    </Page>
  )
}

export default HostLeaderboardState
