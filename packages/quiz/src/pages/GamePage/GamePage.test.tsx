import { GameEventType } from '@quiz/common'
import { act, fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import type { Location } from 'react-router'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import GamePage from './GamePage'

const makeLocation = (overrides: Partial<Location> = {}): Location => ({
  pathname: '/somewhere',
  search: '',
  hash: '',
  state: null,
  key: 'test',
  ...overrides,
})

vi.mock('./GamePage.module.scss', () => ({
  default: { leaveModalActionButtons: 'leave-modal-actions' },
}))

const h = vi.hoisted(() => {
  return {
    setContextMock: vi.fn(),
    notifySuccess: vi.fn(),
    notifyWarning: vi.fn(),
    notifyError: vi.fn(),
    navigateMock: vi.fn(),
    proceedMock: vi.fn(),
    resetMock: vi.fn(),
    leaveGameMock: vi.fn(() => Promise.resolve()),
    context: {
      gameID: 'game-123',
      gameToken: 'token-abc',
      participantId: 'p-1',
      participantType: 'Player',
    } as {
      gameID: string
      gameToken: string
      participantId: string
      participantType: 'Player' | 'Host'
    },
    control: {
      event: null as unknown,
      status: 'INITIALIZED' as
        | 'INITIALIZED'
        | 'CONNECTED'
        | 'RECONNECTING'
        | 'RECONNECTING_FAILED',
    },
    ConnectionStatus: {
      INITIALIZED: 'INITIALIZED',
      CONNECTED: 'CONNECTED',
      RECONNECTING: 'RECONNECTING',
      RECONNECTING_FAILED: 'RECONNECTING_FAILED',
    },
  }
})

vi.mock('@sentry/react', () => ({ setContext: h.setContextMock }))

vi.mock('../../utils/notification.ts', () => ({
  notifySuccess: h.notifySuccess,
  notifyWarning: h.notifyWarning,
  notifyError: h.notifyError,
}))

vi.mock('../../context/game', () => ({
  useGameContext: () => ({
    ...h.context,
    leaveGame: h.leaveGameMock,
  }),
}))

vi.mock('../../utils/useEventSource.tsx', () => ({
  ConnectionStatus: h.ConnectionStatus,
  useEventSource: vi.fn(() => [h.control.event, h.control.status]),
}))

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>('react-router-dom')
  return {
    ...actual,
    useNavigate: () => h.navigateMock,
    useBlocker: actual.useBlocker,
  }
})

const renderWithRouter = () => {
  const router = createMemoryRouter([{ path: '/', element: <GamePage /> }], {
    initialEntries: ['/'],
  })
  return render(<RouterProvider router={router} />)
}

beforeEach(() => {
  h.control.event = null
  h.control.status = 'INITIALIZED'
  h.navigateMock.mockReset()
  h.proceedMock.mockReset()
  h.resetMock.mockReset()
  h.setContextMock.mockReset()
  h.notifySuccess.mockReset()
  h.notifyWarning.mockReset()
  h.notifyError.mockReset()
  h.leaveGameMock.mockClear()
  h.context.gameID = 'game-123'
  h.context.gameToken = 'token-abc'
  h.context.participantId = 'p-1'
  h.context.participantType = 'Player'
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('GamePage (extended)', () => {
  it('should render GamePage (snapshot)', async () => {
    const router = createMemoryRouter(
      [
        {
          path: '/',
          element: <GamePage />,
        },
      ],
      {
        initialEntries: ['/'],
      },
    )
    const { container } = render(<RouterProvider router={router} />)
    expect(container).toMatchSnapshot()
  })

  it('sets Sentry context on mount and clears on unmount', () => {
    const { unmount } = renderWithRouter()
    expect(h.setContextMock).toHaveBeenCalledWith(
      'game',
      expect.objectContaining({
        gameId: 'game-123',
        participantId: 'p-1',
        participantType: 'Player',
      }),
    )
    unmount()
    expect(h.setContextMock).toHaveBeenLastCalledWith('game', null)
  })

  it('clears Sentry context when gameID/token are missing', () => {
    h.context.gameID = ''
    h.context.gameToken = ''
    renderWithRouter()
    expect(h.setContextMock).toHaveBeenLastCalledWith('game', null)
  })

  it('navigates to "/" on GameQuitEvent', () => {
    h.control.event = { type: GameEventType.GameQuitEvent }
    renderWithRouter()
    expect(h.navigateMock).toHaveBeenCalledWith('/')
  })

  it('emits reconnect → connected notifications', () => {
    const { rerender } = renderWithRouter()
    act(() => {
      h.control.status = 'RECONNECTING'
      rerender(
        <RouterProvider
          router={createMemoryRouter([{ path: '/', element: <GamePage /> }], {
            initialEntries: ['/'],
          })}
        />,
      )
    })
    expect(h.notifyWarning).toHaveBeenCalledWith('Reconnecting')

    act(() => {
      h.control.status = 'CONNECTED'
      rerender(
        <RouterProvider
          router={createMemoryRouter([{ path: '/', element: <GamePage /> }], {
            initialEntries: ['/'],
          })}
        />,
      )
    })
    expect(h.notifySuccess).toHaveBeenCalledWith('Connected')
  })

  it('emits error notification on RECONNECTING_FAILED', () => {
    h.control.status = 'RECONNECTING_FAILED'
    renderWithRouter()
    expect(h.notifyError).toHaveBeenCalledWith('Reconnecting failed')
  })

  it('shows blocker modal on blocked navigation and handles cancel/proceed', async () => {
    const rrd = await import('react-router-dom')

    const blocked = {
      state: 'blocked',
      proceed: h.proceedMock,
      reset: h.resetMock,
      location: makeLocation(),
    } as unknown as ReturnType<typeof rrd.useBlocker>

    const useBlockerSpy = vi.spyOn(rrd, 'useBlocker').mockReturnValue(blocked)

    h.control.event = null

    renderWithRouter()

    expect(
      screen.getByRole('dialog', { name: /Leave Game/i }),
    ).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(h.resetMock).toHaveBeenCalled()

    fireEvent.click(screen.getByRole('button', { name: /Proceed/i }))
    expect(h.leaveGameMock).toHaveBeenCalledWith('p-1')

    await act(async () => Promise.resolve())
    expect(h.proceedMock).toHaveBeenCalled()

    useBlockerSpy.mockRestore()
  })
})
