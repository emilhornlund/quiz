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
          url: 'http://localhost:3000/join',
          pin: '123456',
          players: [
            'ShadowCyborg',
            'Radar',
            'ShadowWhirlwind',
            'WhiskerFox',
            'JollyNimbus',
            'PuddingPop',
            'MysticPine',
            'FrostyBear',
            'Willo',
            'ScarletFlame',
          ],
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
