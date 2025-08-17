import { GameEventType, GameMode, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import PlayerQuestionPreviewState from './PlayerQuestionPreviewState'

const now = Date.now()

describe('PlayerQuestionPreviewState', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(now))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render PlayerQuestionPreviewState', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionPreviewState
          event={{
            type: GameEventType.GameQuestionPreviewPlayer,
            game: { mode: GameMode.Classic },
            player: {
              nickname: 'FrostyBear',
              score: 10458,
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
              points: 1000,
            },
            countdown: {
              initiatedTime: new Date(now).toISOString(),
              expiryTime: new Date(now + 60 * 1000).toISOString(),
              serverTime: new Date(now).toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
