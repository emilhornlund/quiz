import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import {
  GOOGLE_OAUTH_STORAGE_KEY,
  GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY,
  GOOGLE_OAUTH_STORAGE_STATE_KEY,
} from '../../utils/oauth.ts'

const h = vi.hoisted(() => ({
  googleExchangeCode: vi.fn<
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [{ code: string; codeVerifier: string }],
    Promise<void>
  >(),
  navigate: vi.fn(),
  notifyError: vi.fn(),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ googleExchangeCode: h.googleExchangeCode }),
}))
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ...actual, useNavigate: () => h.navigate }
})
vi.mock('../../utils/notification.ts', () => ({
  notifyError: h.notifyError,
}))

import AuthGoogleCallbackPage from './AuthGoogleCallbackPage'

describe('AuthGoogleCallbackPage', () => {
  beforeEach(() => {
    h.googleExchangeCode.mockReset()
    h.navigate.mockReset()
    h.notifyError.mockReset()
    sessionStorage.clear()
  })

  it('shows error and redirects to /auth/login when required params are missing', async () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/google/callback']}>
        <Routes>
          <Route
            path="/auth/google/callback"
            element={<AuthGoogleCallbackPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(h.notifyError).toHaveBeenCalledWith(
        'Google OAuth error. Please try again.',
      )
      expect(h.navigate).toHaveBeenCalledWith('/auth/login')
    })
    expect(h.googleExchangeCode).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  it('shows error and redirects when state does not match storage', async () => {
    sessionStorage.setItem(
      GOOGLE_OAUTH_STORAGE_KEY,
      JSON.stringify({
        [GOOGLE_OAUTH_STORAGE_STATE_KEY]: 'expected-state',
        [GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY]: 'verifier-123',
      }),
    )

    render(
      <MemoryRouter
        initialEntries={['/auth/google/callback?code=abc&state=wrong-state']}>
        <Routes>
          <Route
            path="/auth/google/callback"
            element={<AuthGoogleCallbackPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(h.notifyError).toHaveBeenCalledWith(
        'Google OAuth error. Please try again.',
      )
      expect(h.navigate).toHaveBeenCalledWith('/auth/login')
    })
    expect(h.googleExchangeCode).not.toHaveBeenCalled()
  })

  it('shows error and redirects when codeVerifier is missing', async () => {
    sessionStorage.setItem(
      GOOGLE_OAUTH_STORAGE_KEY,
      JSON.stringify({
        [GOOGLE_OAUTH_STORAGE_STATE_KEY]: 'state-123',
        // missing PKCE verifier
      }),
    )

    render(
      <MemoryRouter
        initialEntries={['/auth/google/callback?code=abc&state=state-123']}>
        <Routes>
          <Route
            path="/auth/google/callback"
            element={<AuthGoogleCallbackPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(h.notifyError).toHaveBeenCalledWith(
        'Google OAuth error. Please try again.',
      )
      expect(h.navigate).toHaveBeenCalledWith('/auth/login')
    })
    expect(h.googleExchangeCode).not.toHaveBeenCalled()
  })

  it('exchanges code and navigates to / on success', async () => {
    h.googleExchangeCode.mockResolvedValueOnce({})

    sessionStorage.setItem(
      GOOGLE_OAUTH_STORAGE_KEY,
      JSON.stringify({
        [GOOGLE_OAUTH_STORAGE_STATE_KEY]: 'good-state',
        [GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY]: 'verifier-xyz',
      }),
    )

    const { container } = render(
      <MemoryRouter
        initialEntries={[
          '/auth/google/callback?code=the-code&state=good-state',
        ]}>
        <Routes>
          <Route
            path="/auth/google/callback"
            element={<AuthGoogleCallbackPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() =>
      expect(h.googleExchangeCode).toHaveBeenCalledWith({
        code: 'the-code',
        codeVerifier: 'verifier-xyz',
      }),
    )
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'))
    expect(h.notifyError).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  it('exchanges code and navigates to /auth/login on failure', async () => {
    h.googleExchangeCode.mockRejectedValueOnce(new Error('boom'))

    sessionStorage.setItem(
      GOOGLE_OAUTH_STORAGE_KEY,
      JSON.stringify({
        [GOOGLE_OAUTH_STORAGE_STATE_KEY]: 'ok',
        [GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY]: 'pkce-123',
      }),
    )

    render(
      <MemoryRouter
        initialEntries={['/auth/google/callback?code=code123&state=ok']}>
        <Routes>
          <Route
            path="/auth/google/callback"
            element={<AuthGoogleCallbackPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => {
      expect(h.googleExchangeCode).toHaveBeenCalledTimes(1)
      expect(h.navigate).toHaveBeenCalledWith('/auth/login')
    })
    expect(h.notifyError).not.toHaveBeenCalled()
  })

  it('runs only once even if component re-renders with same params', async () => {
    h.googleExchangeCode.mockResolvedValueOnce({})

    sessionStorage.setItem(
      GOOGLE_OAUTH_STORAGE_KEY,
      JSON.stringify({
        [GOOGLE_OAUTH_STORAGE_STATE_KEY]: 'stable',
        [GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY]: 'pkce-stable',
      }),
    )

    const { rerender } = render(
      <MemoryRouter
        initialEntries={['/auth/google/callback?code=c&state=stable']}>
        <Routes>
          <Route
            path="/auth/google/callback"
            element={<AuthGoogleCallbackPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    // Force a re-render without unmounting (props/route unchanged)
    rerender(
      <MemoryRouter
        initialEntries={['/auth/google/callback?code=c&state=stable']}>
        <Routes>
          <Route
            path="/auth/google/callback"
            element={<AuthGoogleCallbackPage />}
          />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => expect(h.googleExchangeCode).toHaveBeenCalledTimes(1))
  })
})
