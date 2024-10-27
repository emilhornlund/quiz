import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import PlayerGameBeginState from './PlayerGameBeginState'

describe('PlayerGameBeginState', () => {
  it('should render PlayerGameBeginState', async () => {
    const { container } = render(
      <PlayerGameBeginState
        event={{
          type: GameEventType.GameBeginPlayer,
          player: { nickname: 'FrostyBear' },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
