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
          type: GameEventType.PodiumPlayer,
          title: 'Friday Office Quiz',
          nickname: 'ShadowCyborg',
          position: 1,
          score: 18456,
        }}
      />,
    )
  })
})
