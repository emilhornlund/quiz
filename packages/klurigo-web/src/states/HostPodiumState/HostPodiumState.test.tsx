import { GameEventType } from '@klurigo/common'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  completeTask: vi.fn().mockResolvedValue(undefined),
  hasCompleteTask: true,
}))

vi.mock('../../context/game', () => ({
  useGameContext: () => ({
    completeTask: h.hasCompleteTask ? h.completeTask : undefined,
  }),
}))

import HostPodiumState from './HostPodiumState'

describe('HostPodiumState', () => {
  beforeEach(() => {
    h.hasCompleteTask = true
    h.completeTask.mockReset()
    h.completeTask.mockResolvedValue(undefined)

    vi.spyOn(Math, 'random').mockReturnValue(0.5)
  })

  it('should render HostPodiumState', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'ShadowCyborg', score: 18456 },
              { position: 2, nickname: 'Radar', score: 18398 },
              { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
              { position: 4, nickname: 'WhiskerFox', score: 14118 },
              { position: 5, nickname: 'JollyNimbus', score: 13463 },
              { position: 6, nickname: 'PuddingPop', score: 12459 },
              { position: 7, nickname: 'MysticPine', score: 11086 },
              { position: 8, nickname: 'FrostyBear', score: 10361 },
              { position: 9, nickname: 'Willo', score: 9360 },
              { position: 10, nickname: 'ScarletFlame', score: 6723 },
            ],
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render HostPodiumState without a full leaderboard', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'ShadowCyborg', score: 18456 },
              { position: 2, nickname: 'Radar', score: 18398 },
              { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
            ],
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('renders subtitle and leaderboard entries', () => {
    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'Alpha', score: 100 },
              { position: 2, nickname: 'Beta', score: 90 },
              { position: 3, nickname: 'Gamma', score: 80 },
            ],
          }}
        />
      </MemoryRouter>,
    )

    expect(screen.getByText('Podium')).toBeInTheDocument()
    expect(screen.getByText('Alpha')).toBeInTheDocument()
    expect(screen.getByText('Beta')).toBeInTheDocument()
    expect(screen.getByText('Gamma')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('clicks Game Results and calls completeTask', async () => {
    let resolve!: () => void
    h.completeTask.mockImplementation(
      () => new Promise<void>((r) => (resolve = r)),
    )

    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'Alpha', score: 100 },
              { position: 2, nickname: 'Beta', score: 90 },
              { position: 3, nickname: 'Gamma', score: 80 },
            ],
          }}
        />
      </MemoryRouter>,
    )

    const gameResultsBtn = container.querySelector(
      '#game-results-button',
    ) as HTMLButtonElement

    act(() => {
      fireEvent.click(gameResultsBtn)
    })

    expect(h.completeTask).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolve()
      await Promise.resolve()
    })

    expect(container).toMatchSnapshot()
  })

  it('clicks Game Results when completeTask is undefined', () => {
    h.hasCompleteTask = false

    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'Alpha', score: 100 },
              { position: 2, nickname: 'Beta', score: 90 },
              { position: 3, nickname: 'Gamma', score: 80 },
            ],
          }}
        />
      </MemoryRouter>,
    )

    const gameResultsBtn = container.querySelector(
      '#game-results-button',
    ) as HTMLButtonElement

    act(() => {
      fireEvent.click(gameResultsBtn)
    })

    expect(container).toMatchSnapshot()
  })

  it('should render HostPodiumState with only one player', async () => {
    const { container } = render(
      <MemoryRouter>
        <HostPodiumState
          event={{
            type: GameEventType.GamePodiumHost,
            leaderboard: [
              { position: 1, nickname: 'ShadowCyborg', score: 18456 },
            ],
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
