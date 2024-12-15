import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import PlayerResultState from './PlayerResultState'

describe('PlayerResultState', () => {
  it('should render PlayerResultState with default props', async () => {
    render(
      <MemoryRouter>
        <PlayerResultState
          event={{
            type: GameEventType.GameResultPlayer,
            player: {
              nickname: 'FrostyBear',
              score: {
                correct: true,
                last: 634,
                total: 10458,
                position: 1,
                streak: 3,
              },
            },
            pagination: {
              current: 1,
              total: 20,
            },
          }}
        />
      </MemoryRouter>,
    )
  })
})
