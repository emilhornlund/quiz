import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

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

  it('disables submit until a valid email is entered', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPageUI loading={false} onSubmit={() => undefined} />
      </MemoryRouter>,
    )

    const submit = container.querySelector(
      '#continue-button',
    ) as HTMLButtonElement
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'not-an-email' },
    })
    expect(submit).toBeDisabled()

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })
    expect(submit).not.toBeDisabled()
  })

  it('calls onSubmit with the entered email', () => {
    const onSubmit = vi.fn()
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPageUI loading={false} onSubmit={onSubmit} />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })

    fireEvent.click(
      container.querySelector('#continue-button') as HTMLButtonElement,
    )

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith({ email: 'user@example.com' })
  })

  it('keeps input and submit disabled when loading', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthPasswordForgotPageUI loading={true} onSubmit={() => undefined} />
      </MemoryRouter>,
    )

    const email = screen.getByPlaceholderText('Email') as HTMLInputElement
    const submit = container.querySelector(
      '#continue-button',
    ) as HTMLButtonElement

    expect(email).toBeDisabled()
    expect(submit).toBeDisabled()
  })
})
