import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import AuthRegisterPageUI from './AuthRegisterPageUI'

describe('AuthRegisterPageUI', () => {
  it('should render AuthRegisterPageUI', async () => {
    render(
      <MemoryRouter>
        <AuthRegisterPageUI loading={false} onSubmit={() => undefined} />
      </MemoryRouter>,
    )
  })
})
