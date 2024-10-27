import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import PlayerLobbyState from './PlayerLobbyState'

describe('PlayerLobbyState', () => {
  it('should render PlayerLobbyState', async () => {
    render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            nickname: 'FrostyBear',
          }}
        />
      </MemoryRouter>,
    )
  })
})
