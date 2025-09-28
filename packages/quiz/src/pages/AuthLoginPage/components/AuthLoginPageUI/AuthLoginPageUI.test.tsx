import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./text.utils.ts', () => ({
  getTitle: () => 'Welcome back!',
  getMessage: () => 'Please sign in to continue.',
}))

import AuthLoginPageUI from './AuthLoginPageUI'

describe('AuthLoginPageUI', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('renders base UI with title, message and links', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthLoginPageUI
          loading={false}
          onSubmit={() => undefined}
          onGoogleClick={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Welcome back!')).toBeInTheDocument()
    expect(screen.getByText('Please sign in to continue.')).toBeInTheDocument()

    // Links
    expect(
      screen.getByRole('link', { name: /Forgot your password\?/i }),
    ).toHaveAttribute('href', '/auth/password/forgot')
    expect(
      screen.getByRole('link', {
        name: /New here\? Join the fun and create your account!/i,
      }),
    ).toHaveAttribute('href', '/auth/register')

    // Join button should be disabled initially (no valid fields yet)
    const joinBtn = container.querySelector('#join') as HTMLButtonElement
    expect(joinBtn).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('enables submit when email and password are valid, then submits values', () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <AuthLoginPageUI
          loading={false}
          onSubmit={onSubmit}
          onGoogleClick={() => undefined}
        />
      </MemoryRouter>,
    )

    const email = screen.getByPlaceholderText('Email') as HTMLInputElement
    const password = screen.getByPlaceholderText('Password') as HTMLInputElement
    const form = email.closest('form') as HTMLFormElement
    const joinBtn = container.querySelector('#join') as HTMLButtonElement

    // Start disabled
    expect(joinBtn).toBeDisabled()

    // Type a valid email
    fireEvent.change(email, { target: { value: 'user@example.com' } })
    // Still disabled because password not valid yet
    expect(joinBtn).toBeDisabled()

    // Type a strong password matching the regex (≥2 upper, ≥2 lower, ≥2 digits, ≥2 symbols)
    fireEvent.change(password, { target: { value: 'AAaa11!!' } })

    // Button should become enabled once both fields are valid
    expect(joinBtn).not.toBeDisabled()

    // Submit the form
    fireEvent.submit(form)
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'AAaa11!!',
    })

    expect(container).toMatchSnapshot()
  })

  it('respects loading state: disables inputs and button, shows loading on submit', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthLoginPageUI
          loading={true}
          onSubmit={() => undefined}
          onGoogleClick={() => undefined}
        />
      </MemoryRouter>,
    )

    const email = screen.getByPlaceholderText('Email') as HTMLInputElement
    const password = screen.getByPlaceholderText('Password') as HTMLInputElement
    const joinBtn = container.querySelector('#join') as HTMLButtonElement

    expect(email).toBeDisabled()
    expect(password).toBeDisabled()
    expect(joinBtn).toBeDisabled()

    expect(container).toMatchSnapshot()
  })

  it('fires Google button handler', () => {
    const onGoogleClick = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <AuthLoginPageUI
          loading={false}
          onSubmit={() => undefined}
          onGoogleClick={onGoogleClick}
        />
      </MemoryRouter>,
    )

    const googleBtn = container.querySelector(
      '#google-login-button',
    ) as HTMLButtonElement
    fireEvent.click(googleBtn)
    expect(onGoogleClick).toHaveBeenCalledTimes(1)

    expect(container).toMatchSnapshot()
  })

  it('keeps submit disabled when fields are invalid', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthLoginPageUI
          loading={false}
          onSubmit={() => undefined}
          onGoogleClick={() => undefined}
        />
      </MemoryRouter>,
    )

    const email = screen.getByPlaceholderText('Email') as HTMLInputElement
    const password = screen.getByPlaceholderText('Password') as HTMLInputElement
    const joinBtn = container.querySelector('#join') as HTMLButtonElement

    // Invalid email and weak password
    fireEvent.change(email, { target: { value: 'not-an-email' } })
    fireEvent.change(password, { target: { value: 'weak' } })

    expect(joinBtn).toBeDisabled()
    expect(container).toMatchSnapshot()
  })
})
