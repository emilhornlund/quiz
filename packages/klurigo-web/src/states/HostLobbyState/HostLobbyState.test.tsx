import { GameEventType } from '@klurigo/common'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  gameID: 'game-1' as string | undefined,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  completeTask: vi.fn<[], Promise<void>>().mockResolvedValue(),
  leaveGame: vi.fn<(id: string) => Promise<void>>().mockResolvedValue(),
}))

vi.mock('../../context/game', () => ({
  useGameContext: () => ({
    gameID: h.gameID,
    completeTask: h.completeTask,
    leaveGame: h.leaveGame,
  }),
}))

vi.mock('../../config', () => ({
  default: { baseUrl: 'https://example.com' },
}))

import HostLobbyState from './HostLobbyState'

describe('HostLobbyState', () => {
  it('should render HostLobbyState', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostLobbyState
          event={{
            type: GameEventType.GameLobbyHost,
            game: { id: 'de6f4af5-f472-4e30-bbeb-97b881e0a569', pin: '123456' },
            players: [
              { id: uuidv4(), nickname: 'ShadowCyborg' },
              { id: uuidv4(), nickname: 'Radar' },
              { id: uuidv4(), nickname: 'ShadowWhirlwind' },
              { id: uuidv4(), nickname: 'WhiskerFox' },
              { id: uuidv4(), nickname: 'JollyNimbus' },
              { id: uuidv4(), nickname: 'PuddingPop' },
              { id: uuidv4(), nickname: 'MysticPine' },
              { id: uuidv4(), nickname: 'FrostyBear' },
              { id: uuidv4(), nickname: 'Willo' },
              { id: uuidv4(), nickname: 'ScarletFlame' },
            ],
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  const sampleEvent = {
    type: GameEventType.GameLobbyHost,
    game: { id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', pin: '654321' },
    players: [
      { id: 'p1', nickname: 'Alice' },
      { id: 'p2', nickname: 'Bob' },
    ],
  } as const

  beforeEach(() => {
    h.gameID = 'game-1'
    h.completeTask.mockClear()
    h.leaveGame.mockClear()
  })

  it('shows join URL and PIN', () => {
    const { container } = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Join at/i)).toBeInTheDocument()
    expect(screen.getByText('example.com')).toBeInTheDocument()
    expect(screen.getByText(/Game PIN/i)).toBeInTheDocument()
    expect(screen.getByText('654321')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('clicks Start when players exist and calls completeTask', async () => {
    const { container } = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    const start = container.querySelector(
      '#start-game-button',
    ) as HTMLButtonElement
    fireEvent.click(start)
    expect(h.completeTask).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()
  })

  it('opens confirm dialog when starting with no players, then confirms and calls completeTask', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostLobbyState
          event={
            {
              type: GameEventType.GameLobbyHost,
              game: {
                id: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
                pin: '111111',
              },
              players: [],
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } as any
          }
        />
      </MemoryRouter>,
    )
    const start = container.querySelector(
      '#start-game-button',
    ) as HTMLButtonElement
    fireEvent.click(start)
    expect(screen.getByText('Start Game Without Players?')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))
    expect(h.completeTask).toHaveBeenCalledTimes(1)
    expect(container).toMatchSnapshot()
  })

  it('opens remove player dialog and confirms removal, calling leaveGame with player id', async () => {
    const { container } = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    const aliceNode = screen.getByText('Alice')
    const aliceChip =
      aliceNode.closest('div')?.querySelector('button') ??
      (aliceNode.parentElement?.querySelector('button') as HTMLButtonElement)
    fireEvent.click(aliceChip as HTMLButtonElement)
    expect(screen.getByText('Confirm Remove Player')).toBeInTheDocument()
    expect(screen.getByText('Remove Player')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Remove Player' }))
    // Wait for shake animation to complete before leaveGame is called
    await new Promise((resolve) => setTimeout(resolve, 600))
    expect(h.leaveGame).toHaveBeenCalledTimes(1)
    expect(h.leaveGame).toHaveBeenCalledWith('p1')
    expect(container).toMatchSnapshot()
  })

  it('does not call leaveGame when gameID is undefined', async () => {
    h.gameID = undefined
    render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    const bobNode = screen.getByText('Bob')
    const bobChip =
      bobNode.closest('div')?.querySelector('button') ??
      (bobNode.parentElement?.querySelector('button') as HTMLButtonElement)
    fireEvent.click(bobChip as HTMLButtonElement)
    fireEvent.click(screen.getByRole('button', { name: 'Remove Player' }))
    expect(h.leaveGame).not.toHaveBeenCalled()
  })

  it('displays player counter with correct count', () => {
    render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    expect(screen.getByText('2 / 20')).toBeInTheDocument()
  })

  it('displays player counter with zero players', () => {
    const noPlayersEvent = {
      ...sampleEvent,
      players: [],
    }
    render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={noPlayersEvent as any} />
      </MemoryRouter>,
    )
    expect(screen.getByText('0 / 20')).toBeInTheDocument()
  })

  it('displays player counter with maximum players', () => {
    const maxPlayersEvent = {
      ...sampleEvent,
      players: Array.from({ length: 20 }, (_, i) => ({
        id: `p${i}`,
        nickname: `Player${i}`,
      })),
    }
    render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={maxPlayersEvent as any} />
      </MemoryRouter>,
    )
    expect(screen.getByText('20 / 20')).toBeInTheDocument()
  })

  it('shows user group icon in player counter', () => {
    render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLobbyState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    const userGroupIcon = document.querySelector('.playerIcon')
    expect(userGroupIcon).toBeInTheDocument()
  })
})
