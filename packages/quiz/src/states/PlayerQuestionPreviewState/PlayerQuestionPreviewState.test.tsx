import { GameEventType, QuestionType } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import PlayerQuestionPreviewState from './PlayerQuestionPreviewState'

describe('PlayerQuestionPreviewState', () => {
  it('should render PlayerQuestionPreviewState', () => {
    const { container } = render(
      <PlayerQuestionPreviewState
        event={{
          type: GameEventType.GameQuestionPreviewPlayer,
          player: {
            nickname: 'FrostyBear',
            score: 10458,
          },
          question: {
            type: QuestionType.Multi,
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
