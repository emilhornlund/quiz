import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import AuthVerifyPageUI from './AuthVerifyPageUI'

describe('AuthVerifyPageUI', () => {
  it('should render AuthVerifyPageUI as loading', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={false} loggedIn={false} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render AuthVerifyPageUI as verified', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={true} loggedIn={false} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render AuthVerifyPageUI as verified and logged in', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={true} loggedIn={true} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render AuthVerifyPageUI with error', async () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={false} loggedIn={false} error={true} />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
