import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import HomePage from './HomePage'

describe('HomePage', () => {
  it('should render HomePage', async () => {
    render(
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>,
    )
  })
})
