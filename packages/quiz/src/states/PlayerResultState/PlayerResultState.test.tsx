import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, it } from 'vitest'

import PlayerResultState from './PlayerResultState'

describe('PlayerResultState', () => {
  it('should render PlayerResultState with default props', async () => {
    render(
      <PlayerResultState
        event={{
          type: GameEventType.ResultPlayer,
          nickname: 'FrostyBear',
          correct: true,
          score: {
            last: 634,
            total: 10458,
            position: 1,
            streak: 3,
          },
          pagination: {
            current: 1,
            total: 20,
          },
        }}
      />,
    )
  })
})
