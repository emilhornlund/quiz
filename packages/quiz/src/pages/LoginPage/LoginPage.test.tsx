import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import LoginPage from './LoginPage'

describe('LoginPage', () => {
  it('should render LoginPage', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
  })
})
