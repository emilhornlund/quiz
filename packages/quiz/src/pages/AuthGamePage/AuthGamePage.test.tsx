import { render, waitFor } from '@testing-library/react'
import React from 'react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  authenticateGame: vi.fn<
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    [{ gameId?: string; gamePIN?: string }],
    Promise<void>
  >(),
  navigate: vi.fn(),
  notifyError: vi.fn(),
}))

vi.mock('../../api/use-quiz-service-client.tsx', () => ({
  useQuizServiceClient: () => ({ authenticateGame: h.authenticateGame }),
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

import AuthGamePage from './AuthGamePage'

describe('AuthGamePage', () => {
  beforeEach(() => {
    h.authenticateGame.mockReset()
    h.navigate.mockReset()
    h.notifyError.mockReset()
  })

  it('does nothing when no id or pin', () => {
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/game']}>
        <Routes>
          <Route path="/auth/game" element={<AuthGamePage />} />
        </Routes>
      </MemoryRouter>,
    )
    expect(h.authenticateGame).not.toHaveBeenCalled()
    expect(h.navigate).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  it('authenticates with gameId and navigates to /join on success', async () => {
    h.authenticateGame.mockResolvedValueOnce({})
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/game?id=abc-123']}>
        <Routes>
          <Route path="/auth/game" element={<AuthGamePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => {
      expect(h.authenticateGame).toHaveBeenCalledWith({
        gameId: 'abc-123',
        gamePIN: undefined,
      })
    })
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/join'))
    expect(container).toMatchSnapshot()
  })

  it('authenticates with gamePIN and navigates to /join on success', async () => {
    h.authenticateGame.mockResolvedValueOnce({})
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/game?pin=777777']}>
        <Routes>
          <Route path="/auth/game" element={<AuthGamePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(h.authenticateGame).toHaveBeenCalledWith({
        gameId: undefined,
        gamePIN: '777777',
      }),
    )
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/join'))
    expect(container).toMatchSnapshot()
  })

  it('authenticates with both id and pin and navigates to /join on success', async () => {
    h.authenticateGame.mockResolvedValueOnce({})
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/game?id=abc&pin=123']}>
        <Routes>
          <Route path="/auth/game" element={<AuthGamePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(h.authenticateGame).toHaveBeenCalledWith({
        gameId: 'abc',
        gamePIN: '123',
      }),
    )
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/join'))
    expect(container).toMatchSnapshot()
  })

  it('navigates home and notifies on failure', async () => {
    h.authenticateGame.mockRejectedValueOnce(new Error('nope'))
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/game?id=missing']}>
        <Routes>
          <Route path="/auth/game" element={<AuthGamePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'))
    expect(h.notifyError).toHaveBeenCalledWith(
      'Game not found. Please try again.',
    )
    expect(container).toMatchSnapshot()
  })

  it('runs only once even if user clicks back/forward causing re-render with same params', async () => {
    h.authenticateGame.mockResolvedValueOnce({})
    const { container } = render(
      <MemoryRouter initialEntries={['/auth/game?id=one']} initialIndex={0}>
        <Routes>
          <Route path="/auth/game" element={<AuthGamePage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(h.authenticateGame).toHaveBeenCalledTimes(1))
    expect(container).toMatchSnapshot()
  })
})
