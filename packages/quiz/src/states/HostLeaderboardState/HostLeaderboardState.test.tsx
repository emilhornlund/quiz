import { GameEventType } from '@quiz/common'
import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let contextCompleteTask: any = vi.fn(() => Promise.resolve())
vi.mock('../../context/game', () => ({
  useGameContext: () => ({ completeTask: contextCompleteTask }),
}))

import HostLeaderboardState from './HostLeaderboardState'

describe('HostLeaderboardState', () => {
  it('should render HostLeaderboardState', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostLeaderboardState
          event={{
            type: GameEventType.GameLeaderboardHost,
            game: {
              pin: '123456',
            },
            leaderboard: [
              {
                position: 1,
                nickname: 'ShadowCyborg',
                score: 18456,
                streaks: 0,
              },
              { position: 2, nickname: 'Radar', score: 18398, streaks: 0 },
              {
                position: 3,
                nickname: 'ShadowWhirlwind',
                score: 15492,
                streaks: 0,
              },
              { position: 4, nickname: 'WhiskerFox', score: 14118, streaks: 0 },
              {
                position: 5,
                nickname: 'JollyNimbus',
                score: 13463,
                streaks: 0,
              },
              { position: 6, nickname: 'PuddingPop', score: 12459, streaks: 0 },
              { position: 7, nickname: 'MysticPine', score: 11086, streaks: 0 },
              { position: 8, nickname: 'FrostyBear', score: 10361, streaks: 0 },
              { position: 9, nickname: 'Willo', score: 9360, streaks: 0 },
              {
                position: 10,
                nickname: 'ScarletFlame',
                score: 6723,
                streaks: 0,
              },
            ],
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  const sampleEvent = {
    type: GameEventType.GameLeaderboardHost,
    game: { pin: '123456' },
    leaderboard: [
      { position: 1, nickname: 'ShadowCyborg', score: 18456, streaks: 0 },
      { position: 2, nickname: 'Radar', score: 18398, streaks: 0 },
    ],
    pagination: { current: 1, total: 20 },
  } as const

  beforeEach(() => {
    contextCompleteTask = vi.fn(() => Promise.resolve())
  })

  it('renders subtitle and leaderboard entries', () => {
    const { container } = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLeaderboardState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    expect(screen.getByText('Leaderboard')).toBeInTheDocument()
    expect(screen.getByText('ShadowCyborg')).toBeInTheDocument()
    expect(screen.getByText('Radar')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('clicks Next and calls completeTask', async () => {
    let resolve!: () => void
    contextCompleteTask = vi.fn(() => new Promise<void>((r) => (resolve = r)))
    const { container } = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLeaderboardState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    const next = container.querySelector('#next-button') as HTMLButtonElement
    fireEvent.click(next)
    expect(contextCompleteTask).toHaveBeenCalledTimes(1)
    resolve()
    expect(container).toMatchSnapshot()
  })

  it('clicks Next when completeTask is undefined', async () => {
    contextCompleteTask = undefined
    const { container } = render(
      <MemoryRouter>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <HostLeaderboardState event={sampleEvent as any} />
      </MemoryRouter>,
    )
    const next = container.querySelector('#next-button') as HTMLButtonElement
    fireEvent.click(next)
    expect(container).toMatchSnapshot()
  })
})
