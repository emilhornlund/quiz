import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import AuthPasswordResetPage from './AuthPasswordResetPageUI'

describe('AuthPasswordResetPage', () => {
  it('should render AuthPasswordResetPage', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordResetPage
          loading={false}
          error={false}
          onSubmit={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render AuthPasswordResetPage when loading', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordResetPage
          loading={true}
          error={false}
          onSubmit={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render AuthPasswordResetPage when error', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordResetPage
          loading={false}
          error={true}
          onSubmit={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
