import { GameEventType } from '@quiz/common'
import { render, screen } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  getPositionMessage: vi.fn(
    (pos: number, correct: boolean) =>
      `Message for ${pos} - ${correct ? 'correct' : 'incorrect'}`,
  ),
}))

vi.mock('./message.utils.ts', () => ({
  getPositionMessage: h.getPositionMessage,
}))

import PlayerResultState from './PlayerResultState'

describe('PlayerResultState', () => {
  beforeEach(() => {
    h.getPositionMessage.mockClear()
  })

  it('renders correct result with behind indicator', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerResultState
          event={{
            type: GameEventType.GameResultPlayer,
            player: {
              nickname: 'FrostyBear',
              score: {
                correct: true,
                last: 634,
                total: 10458,
                position: 1,
                streak: 3,
              },
              behind: { points: 123, nickname: 'WhiskerFox' },
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Correct')).toBeInTheDocument()
    expect(screen.getByText('Streak')).toBeInTheDocument()
    expect(screen.getByText('634')).toBeInTheDocument()
    expect(screen.getByText('Message for 1 - correct')).toBeInTheDocument()
    expect(screen.getByText(/points behind/i)).toBeInTheDocument()
    expect(h.getPositionMessage).toHaveBeenCalledWith(1, true)
    expect(container).toMatchSnapshot()
  })

  it('renders incorrect result without behind indicator', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerResultState
          event={{
            type: GameEventType.GameResultPlayer,
            player: {
              nickname: 'Radar',
              score: {
                correct: false,
                last: 50,
                total: 9000,
                position: 7,
                streak: 0,
              },
            },
            pagination: { current: 2, total: 20 },
          }}
        />
      </MemoryRouter>,
    )
    expect(screen.getByText('Incorrect')).toBeInTheDocument()
    expect(screen.getByText('50')).toBeInTheDocument()
    expect(screen.getByText('Message for 7 - incorrect')).toBeInTheDocument()
    expect(screen.queryByText(/points behind/i)).toBeNull()
    expect(h.getPositionMessage).toHaveBeenCalledWith(7, false)
    expect(container).toMatchSnapshot()
  })
})
