import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import AuthPasswordForgotPageUI from './AuthPasswordForgotPageUI'

describe('AuthPasswordForgotPageUI', () => {
  it('should render AuthPasswordForgotPageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPageUI loading={false} onSubmit={() => undefined} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render AuthPasswordForgotPageUI when loading', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPageUI loading={true} onSubmit={() => undefined} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
