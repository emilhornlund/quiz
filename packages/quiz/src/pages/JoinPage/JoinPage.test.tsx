import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import JoinPage from './JoinPage'

describe('JoinPage', () => {
  it('should render JoinPage', async () => {
    render(
      <MemoryRouter>
        <JoinPage />
      </MemoryRouter>,
    )
  })
})
