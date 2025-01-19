import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { describe, expect, it } from 'vitest'

import HostLobbyState from './HostLobbyState'

describe('HostLobbyState', () => {
  it('should render HostLobbyState', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostLobbyState
          event={{
            type: GameEventType.GameLobbyHost,
            game: { id: 'de6f4af5-f472-4e30-bbeb-97b881e0a569', pin: '123456' },
            players: [
              { id: uuidv4(), nickname: 'ShadowCyborg' },
              { id: uuidv4(), nickname: 'Radar' },
              { id: uuidv4(), nickname: 'ShadowWhirlwind' },
              { id: uuidv4(), nickname: 'WhiskerFox' },
              { id: uuidv4(), nickname: 'JollyNimbus' },
              { id: uuidv4(), nickname: 'PuddingPop' },
              { id: uuidv4(), nickname: 'MysticPine' },
              { id: uuidv4(), nickname: 'FrostyBear' },
              { id: uuidv4(), nickname: 'Willo' },
              { id: uuidv4(), nickname: 'ScarletFlame' },
            ],
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
