import { GameEventType } from '@quiz/common'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import React from 'react'
import { act } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  game: { ACCESS: { sub: 'player-1' } } as any,
  gameID: 'game-1' as string | undefined,
  leaveGame: vi.fn<(id: string) => Promise<void>>().mockResolvedValue(),
  navigate: vi.fn(),
}))

vi.mock('../../context/auth', () => ({
  useAuthContext: () => ({ game: h.game }),
}))
vi.mock('../../context/game', () => ({
  useGameContext: () => ({ gameID: h.gameID, leaveGame: h.leaveGame }),
}))
vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ...actual, useNavigate: () => h.navigate }
})
vi.mock('./message.utils.ts', () => ({
  getMessage: () => 'Be nice and wait',
  getNextMessage: (current: string) =>
    current === 'Be nice and wait'
      ? 'Get ready for questions!'
      : 'Be nice and wait',
}))

import PlayerLobbyState from './PlayerLobbyState'

describe('PlayerLobbyState', () => {
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h.game = { ACCESS: { sub: 'player-1' } } as any
    h.gameID = 'game-1'
    h.leaveGame.mockClear()
    h.navigate.mockClear()
  })

  it('renders lobby with nickname, title and message', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('FrostyBear')).toBeInTheDocument()
    expect(screen.getByText('You’re in the waiting room')).toBeInTheDocument()
    expect(screen.getByText('Be nice and wait')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('opens confirm dialog when clicking Leave', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )
    const leaveBtn = document.querySelector(
      '#leave-game-button',
    ) as HTMLButtonElement
    fireEvent.click(leaveBtn)
    expect(screen.getByText('Confirm Leave Game')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: 'Leave Game' }),
    ).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('confirms leave, calls leaveGame with participant id and navigates home', async () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )
    fireEvent.click(
      document.querySelector('#leave-game-button') as HTMLButtonElement,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Leave Game' }))
    expect(h.leaveGame).toHaveBeenCalledWith('player-1')
    await waitFor(() => expect(h.navigate).toHaveBeenCalledWith('/'))
    expect(container).toMatchSnapshot()
  })

  it('does nothing when gameID is undefined', async () => {
    h.gameID = undefined
    const { container } = render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )
    fireEvent.click(
      document.querySelector('#leave-game-button') as HTMLButtonElement,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Leave Game' }))
    expect(h.leaveGame).not.toHaveBeenCalled()
    expect(h.navigate).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  it('does nothing when participant id is missing', async () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    h.game = undefined as any
    const { container } = render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )
    fireEvent.click(
      document.querySelector('#leave-game-button') as HTMLButtonElement,
    )
    fireEvent.click(screen.getByRole('button', { name: 'Leave Game' }))
    expect(h.leaveGame).not.toHaveBeenCalled()
    expect(h.navigate).not.toHaveBeenCalled()
    expect(container).toMatchSnapshot()
  })

  it('displays initial message with visible animation state', () => {
    render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )

    const messageContainer = document.querySelector('.messageContainer')
    const messageElement = document.querySelector('.message.visible')

    expect(messageContainer).toBeInTheDocument()
    expect(messageElement).toBeInTheDocument()
    expect(screen.getByText('Be nice and wait')).toBeInTheDocument()
  })

  it('rotates messages after timeout', async () => {
    vi.useFakeTimers()

    render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )

    // Initially shows first message
    expect(screen.getByText('Be nice and wait')).toBeInTheDocument()

    // Fast-forward time to trigger message rotation
    act(() => {
      vi.advanceTimersByTime(8000)
    })

    // Fast-forward through the animation timeouts
    act(() => {
      vi.advanceTimersByTime(200) // fade out
    })

    act(() => {
      vi.advanceTimersByTime(300) // fade in
    })

    // Check that message has changed
    expect(screen.getByText('Get ready for questions!')).toBeInTheDocument()

    vi.useRealTimers()
  })

  it('cleans up interval on unmount', async () => {
    vi.useFakeTimers()

    const { unmount } = render(
      <MemoryRouter>
        <PlayerLobbyState
          event={{
            type: GameEventType.GameLobbyPlayer,
            player: { nickname: 'FrostyBear' },
          }}
        />
      </MemoryRouter>,
    )

    // Unmount component
    unmount()

    // Advance timers - should not cause any errors
    await act(async () => {
      vi.advanceTimersByTime(8000)
    })

    vi.useRealTimers()
  })
})
