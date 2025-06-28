import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import CreateUserPage from './CreateUserPage'

describe('CreateUserPage', () => {
  it('should render CreateUserPage', async () => {
    render(
      <MemoryRouter>
        <CreateUserPage />
      </MemoryRouter>,
    )
  })
})
