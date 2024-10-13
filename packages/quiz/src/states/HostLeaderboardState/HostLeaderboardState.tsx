import { GameEventLeaderboardHost } from '@quiz/common'
import React, { FC } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Leaderboard,
  Page,
  Typography,
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
        <Typography variant="subtitle">Leaderboard</Typography>
        <Leaderboard values={leaderboard} />
      </div>
    </Page>
  )
}

export default HostLeaderboardState
