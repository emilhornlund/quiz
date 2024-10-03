import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, it } from 'vitest'

import LobbyState from './LobbyState'

describe('LobbyState', () => {
  it('should render LobbyState', async () => {
    render(
      <LobbyState
        event={{
          type: GameEventType.Lobby,
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
