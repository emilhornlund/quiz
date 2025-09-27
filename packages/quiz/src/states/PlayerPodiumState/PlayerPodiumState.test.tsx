import { GameEventType } from '@quiz/common'
import { fireEvent, render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  navigate: vi.fn(),
}))

vi.mock('react-router-dom', async (orig) => {
  const actual = await orig()
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return { ...actual, useNavigate: () => h.navigate }
})

vi.mock('./message.utils.ts', () => ({
  getPodiumPositionMessage: (pos: number) => `Message for position ${pos}`,
}))

import PlayerPodiumState from './PlayerPodiumState.tsx'

describe('PlayerPodiumState', () => {
  beforeEach(() => {
    h.navigate.mockClear()
  })

  it('renders name, badge, nickname, score, and message', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerPodiumState
          event={{
            type: GameEventType.GamePodiumPlayer,
            game: { name: 'Friday Office Quiz' },
            player: {
              nickname: 'ShadowCyborg',
              score: { total: 18456, position: 1 },
            },
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Friday Office Quiz')).toBeInTheDocument()
    expect(screen.getByText('ShadowCyborg')).toBeInTheDocument()
    expect(screen.getByText('18456')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('Message for position 1')).toBeInTheDocument()
    expect(container).toMatchSnapshot()
  })

  it('navigates home on End Game click', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerPodiumState
          event={{
            type: GameEventType.GamePodiumPlayer,
            game: { name: 'Quiz' },
            player: { nickname: 'Bob', score: { total: 10, position: 2 } },
          }}
        />
      </MemoryRouter>,
    )
    const endBtn = container.querySelector(
      '#end-game-button',
    ) as HTMLButtonElement
    fireEvent.click(endBtn)
    expect(h.navigate).toHaveBeenCalledWith('/')
    expect(container).toMatchSnapshot()
  })

  it('renders correct message for different position', () => {
    render(
      <MemoryRouter>
        <PlayerPodiumState
          event={{
            type: GameEventType.GamePodiumPlayer,
            game: { name: 'Quiz' },
            player: { nickname: 'Alice', score: { total: 999, position: 3 } },
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Message for position 3')).toBeInTheDocument()
  })
})
