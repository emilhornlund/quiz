import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import HostPodiumState from './HostPodiumState'

describe('HostPodiumState', () => {
  it('should render HostPodiumState', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'ShadowCyborg', score: 18456 },
              { position: 2, nickname: 'Radar', score: 18398 },
              { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
              { position: 4, nickname: 'WhiskerFox', score: 14118 },
              { position: 5, nickname: 'JollyNimbus', score: 13463 },
              { position: 6, nickname: 'PuddingPop', score: 12459 },
              { position: 7, nickname: 'MysticPine', score: 11086 },
              { position: 8, nickname: 'FrostyBear', score: 10361 },
              { position: 9, nickname: 'Willo', score: 9360 },
              { position: 10, nickname: 'ScarletFlame', score: 6723 },
            ],
          }}
          onComplete={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostPodiumState without a full leaderboard', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'ShadowCyborg', score: 18456 },
              { position: 2, nickname: 'Radar', score: 18398 },
              { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
            ],
          }}
          onComplete={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
