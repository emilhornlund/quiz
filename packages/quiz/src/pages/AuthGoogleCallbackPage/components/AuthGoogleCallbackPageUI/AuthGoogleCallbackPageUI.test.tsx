import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import AuthGoogleCallbackPageUI from './AuthGoogleCallbackPageUI'

describe('AuthGoogleCallbackPageUI', () => {
  it('should render AuthGoogleCallbackPageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthGoogleCallbackPageUI />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
