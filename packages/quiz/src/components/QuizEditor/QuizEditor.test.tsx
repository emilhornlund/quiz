import {
  GameMode,
  LanguageCode,
  QuizCategory,
  QuizVisibility,
} from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CLASSIC_MODE_QUESTIONS,
  DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
} from '../../utils/questions-template.ts'

import QuizEditor from './QuizEditor'

describe('QuizEditor', () => {
  it('should render QuizEditor for classic mode', async () => {
    const { container } = render(
      <QuizEditor
        quiz={{
          title: 'My Classic Quiz',
          mode: GameMode.Classic,
          visibility: QuizVisibility.Private,
          category: QuizCategory.GeneralKnowledge,
          languageCode: LanguageCode.English,
          questions: DEFAULT_CLASSIC_MODE_QUESTIONS,
        }}
        onChange={() => undefined}
        onValid={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render QuizEditor for zero to one hundred mode', async () => {
    const { container } = render(
      <QuizEditor
        quiz={{
          title: 'My ZeroToOneHundred Quiz',
          mode: GameMode.ZeroToOneHundred,
          visibility: QuizVisibility.Private,
          category: QuizCategory.GeneralKnowledge,
          languageCode: LanguageCode.English,
          questions: DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
        }}
        onChange={() => undefined}
        onValid={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
