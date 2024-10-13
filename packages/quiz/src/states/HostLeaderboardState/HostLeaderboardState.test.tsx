import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import HostLeaderboardState from './HostLeaderboardState'

describe('HostLeaderboardState', () => {
  it('should render HostLeaderboardState', async () => {
    const { container } = render(
      <HostLeaderboardState
        event={{
          type: GameEventType.GameLeaderboardHost,
          gamePIN: '123456',
          leaderboard: [
            { position: 1, nickname: 'ShadowCyborg', score: 18456, streaks: 0 },
            { position: 2, nickname: 'Radar', score: 18398, streaks: 0 },
            {
              position: 3,
              nickname: 'ShadowWhirlwind',
              score: 15492,
              streaks: 0,
            },
            { position: 4, nickname: 'WhiskerFox', score: 14118, streaks: 0 },
            { position: 5, nickname: 'JollyNimbus', score: 13463, streaks: 0 },
            { position: 6, nickname: 'PuddingPop', score: 12459, streaks: 0 },
            { position: 7, nickname: 'MysticPine', score: 11086, streaks: 0 },
            { position: 8, nickname: 'FrostyBear', score: 10361, streaks: 0 },
            { position: 9, nickname: 'Willo', score: 9360, streaks: 0 },
            { position: 10, nickname: 'ScarletFlame', score: 6723, streaks: 0 },
          ],
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
