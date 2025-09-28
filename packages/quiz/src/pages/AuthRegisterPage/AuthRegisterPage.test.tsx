import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  register: vi.fn<[], Promise<void>>().mockResolvedValue(),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  login: vi.fn<[], Promise<void>>().mockResolvedValue(),
  navigate: vi.fn(),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ register: h.register, login: h.login }),
}))

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ...actual, useNavigate: () => h.navigate }
})

import AuthRegisterPage from './AuthRegisterPage'

function fillAllFields() {
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'user@example.com' },
  })
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'PPss11!!' },
  })
  fireEvent.change(screen.getByPlaceholderText('Given Name'), {
    target: { value: 'John' },
  })
  fireEvent.change(screen.getByPlaceholderText('Family Name'), {
    target: { value: 'Doe' },
  })

  const textboxes = screen.getAllByRole('textbox')
  const known = new Set([
    screen.getByPlaceholderText('Email'),
    screen.getByPlaceholderText('Given Name'),
    screen.getByPlaceholderText('Family Name'),
  ])
  const nicknameInput = textboxes.find(
    (el) => !known.has(el as HTMLInputElement),
  )
  if (!nicknameInput) throw new Error('Nickname input not found')
  fireEvent.change(nicknameInput, { target: { value: 'ShadowCyborg' } })
}

describe('AuthRegisterPage', () => {
  beforeEach(() => {
    h.register.mockClear()
    h.login.mockClear()
    h.navigate.mockClear()
  })

  it('renders and keeps submit disabled until all fields valid', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthRegisterPage />
      </MemoryRouter>,
    )

    const submit = container.querySelector('#join') as HTMLButtonElement
    expect(submit).toBeDisabled()

    fillAllFields()

    expect(submit).not.toBeDisabled()
  })

  it('registers, then logs in, then navigates home; submit disabled during pending', async () => {
    let resolveRegister!: () => void
    let resolveLogin!: () => void

    h.register.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveRegister = resolve
        }),
    )
    h.login.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve
        }),
    )

    const { container } = render(
      <MemoryRouter>
        <AuthRegisterPage />
      </MemoryRouter>,
    )

    fillAllFields()
    const submit = container.querySelector('#join') as HTMLButtonElement
    fireEvent.click(submit)

    expect(h.register).toHaveBeenCalledTimes(1)
    expect(submit).toBeDisabled()

    resolveRegister!()
    await waitFor(() => expect(h.login).toHaveBeenCalledTimes(1))

    resolveLogin!()
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'))

    expect(submit).not.toBeDisabled()
  })

  it('disables during successful register+login and re-enables after', async () => {
    let resolveLogin!: () => void
    h.register.mockResolvedValue({})
    h.login.mockImplementation(
      () => new Promise<void>((r) => (resolveLogin = r)),
    )

    const { container } = render(
      <MemoryRouter>
        <AuthRegisterPage />
      </MemoryRouter>,
    )

    fillAllFields()

    const submit = container.querySelector('#join') as HTMLButtonElement
    fireEvent.click(submit)

    await waitFor(() => expect(h.register).toHaveBeenCalledTimes(1))
    await waitFor(() => expect(h.login).toHaveBeenCalledTimes(1))

    await waitFor(() => expect(submit).toBeDisabled())

    resolveLogin()
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'))
    await waitFor(() => expect(submit).not.toBeDisabled())
  })
})
