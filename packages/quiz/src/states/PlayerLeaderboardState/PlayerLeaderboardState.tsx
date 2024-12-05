import { GameLeaderboardPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  Badge,
  getBadgePositionBackgroundColor,
  NicknameChip,
  Page,
  PlayerGameFooter,
} from '../../components'

import styles from './PlayerLeaderboardState.module.scss'

export interface PlayerLeaderboardStateProps {
  event: GameLeaderboardPlayerEvent
}

const PlayerLeaderboardState: FC<PlayerLeaderboardStateProps> = ({
  event: {
    player: {
      nickname,
      score: { position, score, streaks },
    },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  return (
    <Page
      footer={
        <PlayerGameFooter
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          nickname={nickname}
          totalScore={score}
        />
      }>
      <Badge
        size="large"
        backgroundColor={getBadgePositionBackgroundColor(position)}>
        {position}
      </Badge>
      <NicknameChip value={nickname} />
      {!!streaks && streaks > 1 && (
        <div className={styles.streak}>
          Streak{' '}
          <Badge size="small" backgroundColor="orange">
            {streaks}
          </Badge>
        </div>
      )}
    </Page>
  )
}

export default PlayerLeaderboardState
