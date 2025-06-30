import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import CreateUserPageUI from './CreateUserPageUI'

describe('CreateUserPageUI', () => {
  it('should render CreateUserPageUI', async () => {
    render(
      <MemoryRouter>
        <CreateUserPageUI loading={false} onSubmit={() => undefined} />
      </MemoryRouter>,
    )
  })
})
