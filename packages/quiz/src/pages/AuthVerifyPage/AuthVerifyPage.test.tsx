import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// hoisted shared state
const h = vi.hoisted(() => ({
  verifyEmail: vi.fn<(token: string) => Promise<void>>().mockResolvedValue(),
  isUserAuthenticated: false,
  navigate: vi.fn(),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ verifyEmail: h.verifyEmail }),
}))

vi.mock('../../context/auth', () => ({
  useAuthContext: () => ({ isUserAuthenticated: h.isUserAuthenticated }),
}))

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ...actual, useNavigate: () => h.navigate }
})

import AuthVerifyPage from './AuthVerifyPage'

describe('AuthVerifyPage', () => {
  beforeEach(() => {
    h.verifyEmail.mockClear()
    h.isUserAuthenticated = false
    h.navigate.mockClear()
  })

  it('navigates home when token is missing', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/verify']}>
        <AuthVerifyPage />
      </MemoryRouter>,
    )

    expect(h.navigate).toHaveBeenCalledWith('/')
    expect(container).toMatchSnapshot()
  })

  it('shows loading while verifying with token present', () => {
    h.verifyEmail.mockReturnValue(new Promise(() => {})) // stay pending

    const { container } = render(
      <MemoryRouter initialEntries={['/auth/verify?token=ABC']}>
        <AuthVerifyPage />
      </MemoryRouter>,
    )

    expect(h.verifyEmail).toHaveBeenCalledWith('ABC')
    expect(
      screen.getByText('One moment… verifying your magic link!'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Good things come to those who wait!'),
    ).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('renders verified state (logged out) with login link', async () => {
    let resolve!: () => void
    h.verifyEmail.mockImplementation(
      () =>
        new Promise<void>((r) => {
          resolve = r
        }),
    )

    const { container } = render(
      <MemoryRouter initialEntries={['/auth/verify?token=TOK']}>
        <AuthVerifyPage />
      </MemoryRouter>,
    )

    resolve()
    await waitFor(() =>
      expect(
        screen.getByText('Hooray! Your email’s all set!'),
      ).toBeInTheDocument(),
    )

    const loginLink = screen.getByRole('link', {
      name: 'Log in to get started!',
    })
    expect(loginLink).toHaveAttribute('href', '/auth/login')
    expect(container).toMatchSnapshot()
  })

  it('renders verified state (logged in) with home link', async () => {
    h.isUserAuthenticated = true
    let resolve!: () => void
    h.verifyEmail.mockImplementation(
      () =>
        new Promise<void>((r) => {
          resolve = r
        }),
    )

    const { container } = render(
      <MemoryRouter initialEntries={['/auth/verify?token=ZZZ']}>
        <AuthVerifyPage />
      </MemoryRouter>,
    )

    resolve()
    await waitFor(() =>
      expect(
        screen.getByText('Hooray! Your email’s all set!'),
      ).toBeInTheDocument(),
    )

    const homeLink = screen.getByRole('link', { name: 'Take me home' })
    expect(homeLink).toHaveAttribute('href', '/')
    expect(container).toMatchSnapshot()
  })

  it('shows error state when verification fails', async () => {
    let reject!: (e?: unknown) => void
    h.verifyEmail.mockImplementation(
      () =>
        new Promise<void>((_, r) => {
          reject = r
        }),
    )

    const { container } = render(
      <MemoryRouter initialEntries={['/auth/verify?token=BAD']}>
        <AuthVerifyPage />
      </MemoryRouter>,
    )

    reject(new Error('nope'))
    await waitFor(() =>
      expect(
        screen.getByText('Oops! Something went wrong.'),
      ).toBeInTheDocument(),
    )
    expect(container).toMatchSnapshot()
  })
})
