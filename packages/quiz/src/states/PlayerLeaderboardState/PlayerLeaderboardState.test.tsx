import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, it } from 'vitest'

import PlayerLeaderboardState from './PlayerLeaderboardState.tsx'

describe('PlayerLeaderboardState', () => {
  it('should render PlayerLeaderboardState with default props', async () => {
    render(
      <PlayerLeaderboardState
        event={{
          type: GameEventType.GameLeaderboardPlayer,
          player: {
            nickname: 'FrostyBear',
            score: {
              position: 1,
              score: 10458,
              streaks: 3,
            },
          },
          pagination: {
            current: 1,
            total: 20,
          },
        }}
      />,
    )
  })
})
