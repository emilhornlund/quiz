import { GameEventType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import HostGameBeginState from './HostGameBeginState'

describe('HostGameBeginState', () => {
  it('should render HostGameBeginState', async () => {
    const { container } = render(
      <HostGameBeginState
        event={{
          type: GameEventType.GameBeginHost,
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
