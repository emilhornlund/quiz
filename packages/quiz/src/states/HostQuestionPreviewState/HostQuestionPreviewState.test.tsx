import { GameEventType, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import HostQuestionPreviewState from './HostQuestionPreviewState'

describe('HostQuestionPreviewState', () => {
  it('should render HostQuestionPreviewState', () => {
    const { container } = render(
      <MemoryRouter>
        <HostQuestionPreviewState
          event={{
            type: GameEventType.GameQuestionPreviewHost,
            game: {
              pin: '123456',
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
