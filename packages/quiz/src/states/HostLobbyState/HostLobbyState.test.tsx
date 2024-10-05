import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, it } from 'vitest'

import HostLobbyState from './HostLobbyState'

describe('LobbyState', () => {
  it('should render HostLobbyState', async () => {
    render(
      <HostLobbyState
        event={{
          type: GameEventType.LobbyHost,
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
  })
})
