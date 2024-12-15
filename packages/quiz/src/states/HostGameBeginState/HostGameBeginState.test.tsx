import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import HostGameBeginState from './HostGameBeginState'

describe('HostGameBeginState', () => {
  it('should render HostGameBeginState', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostGameBeginState
          event={{
            type: GameEventType.GameBeginHost,
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
