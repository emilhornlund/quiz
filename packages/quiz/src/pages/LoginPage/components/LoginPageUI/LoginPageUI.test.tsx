import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import LoginPageUI from './LoginPageUI'

describe('LoginPageUI', () => {
  it('should render LoginPage', async () => {
    render(
      <MemoryRouter>
        <LoginPageUI loading={false} onSubmit={() => undefined} />
      </MemoryRouter>,
    )
  })
})
