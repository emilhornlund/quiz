import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, it } from 'vitest'

import PlayerLobbyState from './PlayerLobbyState'

describe('PlayerLobbyState', () => {
  it('should render PlayerLobbyState', async () => {
    render(
      <PlayerLobbyState
        event={{
          type: GameEventType.LobbyPlayer,
          nickname: 'FrostyBear',
        }}
      />,
    )
  })
})
