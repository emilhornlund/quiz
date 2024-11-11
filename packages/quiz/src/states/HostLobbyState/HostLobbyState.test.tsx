import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import HostLobbyState from './HostLobbyState'

describe('HostLobbyState', () => {
  it('should render HostLobbyState', async () => {
    const { container } = render(
      <HostLobbyState
        event={{
          type: GameEventType.GameLobbyHost,
          game: { id: 'de6f4af5-f472-4e30-bbeb-97b881e0a569', pin: '123456' },
          players: [
            { nickname: 'ShadowCyborg' },
            { nickname: 'Radar' },
            { nickname: 'ShadowWhirlwind' },
            { nickname: 'WhiskerFox' },
            { nickname: 'JollyNimbus' },
            { nickname: 'PuddingPop' },
            { nickname: 'MysticPine' },
            { nickname: 'FrostyBear' },
            { nickname: 'Willo' },
            { nickname: 'ScarletFlame' },
          ],
        }}
        onStart={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
