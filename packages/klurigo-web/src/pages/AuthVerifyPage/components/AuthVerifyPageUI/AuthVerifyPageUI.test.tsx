import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import AuthVerifyPageUI from './AuthVerifyPageUI'

describe('AuthVerifyPageUI', () => {
  it('renders verifying state', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={false} loggedIn={false} />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('One moment… verifying your magic link!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Good things come to those who wait!'),
    ).toBeInTheDocument()
    expect(screen.queryByText('Hooray! Your email’s all set!')).toBeNull()
    expect(screen.queryByText('Oops! Something went wrong.')).toBeNull()

    expect(container).toMatchSnapshot()
  })

  it('renders verified state (not logged in) with login link', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={true} loggedIn={false} />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Hooray! Your email’s all set!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Welcome aboard the fun train. Let’s roll!'),
    ).toBeInTheDocument()

    const loginLink = container.querySelector('a[href="/auth/login"]')
    expect(loginLink).toBeTruthy()
    expect(screen.getByText('Log in to get started!')).toBeInTheDocument()

    // no home link in this branch
    expect(container.querySelector('a[href="/"]')).toBeNull()

    expect(container).toMatchSnapshot()
  })

  it('renders verified state (logged in) with home link', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={true} loggedIn={true} />
      </MemoryRouter>,
    )

    expect(
      screen.getByText('Hooray! Your email’s all set!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Welcome aboard the fun train. Let’s roll!'),
    ).toBeInTheDocument()

    const home = screen.getByRole('link', { name: 'Take me home' })
    expect(home).toHaveAttribute('href', '/')

    // ensure the *component’s* login link isn’t present
    expect(
      screen.queryByRole('link', { name: 'Log in to get started!' }),
    ).toBeNull()

    expect(container).toMatchSnapshot()
  })

  it('renders error state', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthVerifyPageUI verified={false} loggedIn={false} error={true} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Oops! Something went wrong.')).toBeInTheDocument()
    expect(
      screen.getByText('The supplied link is invalid or has expired.'),
    ).toBeInTheDocument()

    // no verifying or success texts in error branch
    expect(
      screen.queryByText('One moment… verifying your magic link!'),
    ).toBeNull()
    expect(screen.queryByText('Hooray! Your email’s all set!')).toBeNull()

    expect(container).toMatchSnapshot()
  })
})
