import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import GameJoinPage from './GameJoinPage'

describe('GameJoinPage', () => {
  it('should render GameJoinPage', async () => {
    render(
      <MemoryRouter>
        <GameJoinPage />
      </MemoryRouter>,
    )
  })
})
