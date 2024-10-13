import { GameLeaderboardHostEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  HostGameFooter,
  IconButtonArrowRight,
  Leaderboard,
  Page,
  Typography,
} from '../../components'

export interface HostLeaderboardStateProps {
  event: GameLeaderboardHostEvent
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
      width="medium"
      height="full"
      align="start"
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
      <Typography variant="subtitle">Leaderboard</Typography>
      <Leaderboard values={leaderboard} />
    </Page>
  )
}

export default HostLeaderboardState
