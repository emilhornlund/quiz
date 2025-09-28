import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import AuthRegisterPageUI from './AuthRegisterPageUI'

vi.mock('./text.utils.ts', () => ({
  getTitle: () => 'Create your account',
  getMessage: () => 'Join the party — make an account in seconds.',
}))

describe('AuthRegisterPageUI', () => {
  it('renders default state', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthRegisterPageUI loading={false} onSubmit={() => undefined} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Create your account')).toBeInTheDocument()
    expect(
      screen.getByText('Join the party — make an account in seconds.'),
    ).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders loading state', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthRegisterPageUI loading={true} onSubmit={() => undefined} />
      </MemoryRouter>,
    )
    // Submit should be disabled while loading
    const submit = container.querySelector('#join') as HTMLButtonElement
    expect(submit).toBeDisabled()
    expect(container).toMatchSnapshot()
  })

  it('keeps submit disabled until all fields are valid, then submits values', () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <AuthRegisterPageUI loading={false} onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    const submit = container.querySelector('#join') as HTMLButtonElement
    expect(submit).toBeDisabled()

    // Fill required/validated fields with values that satisfy regex/lengths
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'PPss11!!' }, // ≥2 upper, ≥2 lower, ≥2 digits, ≥2 symbols
    })
    fireEvent.change(screen.getByPlaceholderText('Given Name'), {
      target: { value: 'Alice' },
    })
    fireEvent.change(screen.getByPlaceholderText('Family Name'), {
      target: { value: 'Smith' },
    })

    // NicknameTextField doesn't expose a placeholder; select the remaining text input
    const textInputs = Array.from(
      container.querySelectorAll('input[type="text"]'),
    ) as HTMLInputElement[]
    const nicknameInput = textInputs.find(
      (el) =>
        el.id !== 'email' && el.id !== 'givenName' && el.id !== 'familyName',
    ) as HTMLInputElement
    fireEvent.change(nicknameInput, { target: { value: 'FrostyBear' } })

    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'PPss11!!',
      givenName: 'Alice',
      familyName: 'Smith',
      defaultNickname: 'FrostyBear',
    })
  })
})
