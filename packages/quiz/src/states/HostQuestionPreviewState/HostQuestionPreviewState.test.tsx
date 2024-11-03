import { GameEventType, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import HostQuestionPreviewState from './HostQuestionPreviewState'

describe('HostQuestionPreviewState', () => {
  it('should render HostQuestionPreviewState', () => {
    const { container } = render(
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
          progress: {
            value: 0.75,
          },
          pagination: { current: 1, total: 20 },
        }}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
