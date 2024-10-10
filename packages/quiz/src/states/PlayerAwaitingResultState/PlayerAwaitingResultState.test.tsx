import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import PlayerAwaitingResultState from './PlayerAwaitingResultState'

describe('PlayerAwaitingResultState', () => {
  it('should render PlayerAwaitingResultState with default props', async () => {
    const { container } = render(
      <PlayerAwaitingResultState
        event={{
          type: GameEventType.AwaitingResultPlayer,
          nickname: 'FrostyBear',
          score: {
            total: 10458,
          },
          pagination: {
            current: 1,
            total: 20,
          },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
