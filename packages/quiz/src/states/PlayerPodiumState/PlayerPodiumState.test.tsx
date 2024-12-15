import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import PlayerPodiumState from './PlayerPodiumState.tsx'

describe('PlayerPodiumState', () => {
  it('should render PlayerPodiumState', async () => {
    render(
      <MemoryRouter>
        <PlayerPodiumState
          event={{
            type: GameEventType.GamePodiumPlayer,
            game: {
              name: 'Friday Office Quiz',
            },
            player: {
              nickname: 'ShadowCyborg',
              score: {
                total: 18456,
                position: 1,
              },
            },
          }}
        />
      </MemoryRouter>,
    )
  })
})
