import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import PlayerLeaderboardState from './PlayerLeaderboardState.tsx'

describe('PlayerLeaderboardState', () => {
  it('should render PlayerLeaderboardState with default props', async () => {
    render(
      <MemoryRouter>
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
        />
      </MemoryRouter>,
    )
  })
})
