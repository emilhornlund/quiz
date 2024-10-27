import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, it } from 'vitest'

import PlayerPodiumState from './PlayerPodiumState.tsx'

describe('PlayerPodiumState', () => {
  it('should render PlayerPodiumState', async () => {
    render(
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
      />,
    )
  })
})
