import { GameMode } from '@quiz/common'
import { render } from '@testing-library/react'
import React from 'react'
import { describe, expect, it } from 'vitest'

import {
  DEFAULT_CLASSIC_MODE_QUESTIONS,
  DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS,
} from '../../utils/questions-template.ts'

import QuestionEditor, { QuestionEditorProps } from './QuestionEditor'

describe('QuestionEditor', () => {
  it('should render QuestionEditor for classic mode', async () => {
    const { container } = render(
      <QuestionEditor
        mode={GameMode.Classic}
        questions={DEFAULT_CLASSIC_MODE_QUESTIONS}
        onChange={(() => {}) as QuestionEditorProps['onChange']}
        onValid={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render QuestionEditor for zero to one hundred mode', async () => {
    const { container } = render(
      <QuestionEditor
        mode={GameMode.ZeroToOneHundred}
        questions={DEFAULT_ZERO_TO_ONE_HUNDRED_MODE_QUESTIONS}
        onChange={(() => {}) as QuestionEditorProps['onChange']}
        onValid={() => undefined}
      />,
    )

    expect(container).toMatchSnapshot()
  })
})
