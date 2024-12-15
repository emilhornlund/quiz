import { GameEventType, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import PlayerQuestionPreviewState from './PlayerQuestionPreviewState'

describe('PlayerQuestionPreviewState', () => {
  it('should render PlayerQuestionPreviewState', () => {
    const { container } = render(
      <MemoryRouter>
        <PlayerQuestionPreviewState
          event={{
            type: GameEventType.GameQuestionPreviewPlayer,
            player: {
              nickname: 'FrostyBear',
              score: 10458,
            },
            question: {
              type: QuestionType.MultiChoice,
              question: 'Who painted The Starry Night?',
            },
            countdown: {
              expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
              serverTime: new Date().toISOString(),
            },
            pagination: { current: 1, total: 20 },
          }}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
