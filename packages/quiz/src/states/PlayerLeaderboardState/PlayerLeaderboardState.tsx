import { GameLeaderboardPlayerEvent } from '@quiz/common'
import React, { FC } from 'react'

import StreakBadge, {
  Badge,
  getBadgePositionBackgroundColor,
  NicknameChip,
  Page,
  PlayerGameFooter,
} from '../../components'

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
      <StreakBadge streak={streaks}>Streak</StreakBadge>
    </Page>
  )
}

export default PlayerLeaderboardState
