import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  login: vi
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    .fn<[{ email: string; password: string }], Promise<void>>()
    .mockResolvedValue({}),
  navigate: vi.fn(),

  genSeq: ['STATE_X', 'PKCE_Y'],
  genIndex: 0,
  generateRandomString: vi.fn((len: number) => {
    const v = h.genSeq[h.genIndex] ?? `RND_${len}`
    h.genIndex++
    return v
  }),
  sha256: vi.fn(async () => 'CODE_CHALLENGE_HASH'),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ login: h.login }),
}))

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ...actual, useNavigate: () => h.navigate }
})

vi.mock('../../config.ts', () => ({
  default: {
    googleClientId: 'TEST_CLIENT_ID',
    googleRedirectUri: 'https://app.example.com/auth/google/callback',
  },
}))

vi.mock('../../utils/oauth.ts', () => ({
  generateRandomString: (len: number) => h.generateRandomString(len),
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  sha256: (s: string) => h.sha256(s),
  GOOGLE_OAUTH_STORAGE_KEY: 'goog_store',
  GOOGLE_OAUTH_STORAGE_STATE_KEY: 'goog_state',
  GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY: 'goog_pkce',
}))

import AuthLoginPage from './AuthLoginPage'

describe('AuthLoginPage', () => {
  beforeEach(() => {
    h.login.mockClear()
    h.navigate.mockClear()
    h.generateRandomString.mockClear()
    h.sha256.mockClear()
    h.genIndex = 0
    sessionStorage.clear()
  })

  it('renders and keeps submit disabled until fields are valid', () => {
    const { container } = render(
      <MemoryRouter>
        <AuthLoginPage />
      </MemoryRouter>,
    )

    const submit = container.querySelector('#join') as HTMLButtonElement
    expect(submit).toBeDisabled()
  })

  it('submits with valid credentials, toggles loading, and navigates home', async () => {
    let resolveLogin!: () => void
    h.login.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          resolveLogin = resolve
        }),
    )

    const { container } = render(
      <MemoryRouter>
        <AuthLoginPage />
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'user@example.com' },
    })
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'PPss11!!' },
    })

    const submit = container.querySelector('#join') as HTMLButtonElement
    expect(submit).not.toBeDisabled()

    fireEvent.click(submit)
    expect(h.login).toHaveBeenCalledWith({
      email: 'user@example.com',
      password: 'PPss11!!',
    })

    expect(submit).toBeDisabled()

    resolveLogin()
    await waitFor(() => {
      expect(h.navigate).toHaveBeenCalledWith('/')
    })

    expect(submit).not.toBeDisabled()
  })

  it('starts Google OAuth, stores state & verifier, and redirects with correct params', async () => {
    const originalLocation = window.location
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (window as any).location
    // @ts-expect-error define minimal location
    window.location = { href: '' } as Location

    try {
      const { container } = render(
        <MemoryRouter>
          <AuthLoginPage />
        </MemoryRouter>,
      )

      const googleBtn = container.querySelector(
        '#google-login-button',
      ) as HTMLButtonElement
      fireEvent.click(googleBtn)

      expect(h.generateRandomString).toHaveBeenCalledTimes(2)
      expect(h.generateRandomString).toHaveBeenNthCalledWith(1, 48)
      expect(h.generateRandomString).toHaveBeenNthCalledWith(2, 64)
      expect(h.sha256).toHaveBeenCalledWith('PKCE_Y')

      await waitFor(() =>
        expect(window.location.href).toContain(
          'https://accounts.google.com/o/oauth2/auth?',
        ),
      )

      const href = window.location.href
      expect(href).toContain('client_id=TEST_CLIENT_ID')
      expect(href).toContain(
        'redirect_uri=https%3A%2F%2Fapp.example.com%2Fauth%2Fgoogle%2Fcallback',
      )
      expect(href).toContain('response_type=code')
      expect(href).toContain('scope=openid+profile+email')
      expect(href).toContain('state=STATE_X')
      expect(href).toContain('code_challenge=CODE_CHALLENGE_HASH')
      expect(href).toContain('code_challenge_method=S256')

      const stored = JSON.parse(sessionStorage.getItem('goog_store') || '{}')
      expect(stored['goog_state']).toBe('STATE_X')
      expect(stored['goog_pkce']).toBe('PKCE_Y')
    } finally {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      window.location = originalLocation
    }
  })
})
