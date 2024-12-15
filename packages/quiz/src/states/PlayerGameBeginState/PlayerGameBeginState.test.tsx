import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import PlayerGameBeginState from './PlayerGameBeginState'

describe('PlayerGameBeginState', () => {
  it('should render PlayerGameBeginState', async () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerGameBeginState
          event={{
            type: GameEventType.GameBeginPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
