import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import GamePage from './GamePage'

describe('GamePage', () => {
  it('should render GamePage', async () => {
    const { container } = render(
      <MemoryRouter>
        <GamePage />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
