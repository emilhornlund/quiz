import { GameLeaderboardPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import {
  Badge,
  getBadgePositionBackgroundColor,
  NicknameChip,
  PlayerGameFooter,
  StreakBadge,
} from '../../components'
import { GamePage, PointsBehindIndicator } from '../common'

export interface PlayerLeaderboardStateProps {
  event: GameLeaderboardPlayerEvent
}

const PlayerLeaderboardState: FC<PlayerLeaderboardStateProps> = ({
  event: {
    player: {
      nickname,
      score: { position, score, streaks },
      behind,
    },
    pagination: { current: currentQuestion, total: totalQuestions },
  },
}) => {
  return (
    <GamePage
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
      <StreakBadge streak={streaks}>Streak</StreakBadge>
      {behind && <PointsBehindIndicator {...behind} />}
    </GamePage>
  )
}

export default PlayerLeaderboardState
