import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it } from 'vitest'

import AuthLoginPageUI from './AuthLoginPageUI'

describe('AuthLoginPageUI', () => {
  it('should render AuthLoginPage', async () => {
    render(
      <MemoryRouter>
        <AuthLoginPageUI
          loading={false}
          onSubmit={() => undefined}
          onGoogleClick={() => undefined}
        />
      </MemoryRouter>,
    )
  })
})
