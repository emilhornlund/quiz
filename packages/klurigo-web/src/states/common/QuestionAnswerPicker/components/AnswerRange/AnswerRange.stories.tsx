import { QuestionType } from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'
import type { FC } from 'react'
import { useState } from 'react'

import AnswerRange, { type AnswerRangeProps } from './AnswerRange'

const AnswerRangeComponent: FC<AnswerRangeProps> = (props) => {
  const [submittedAnswer, setSubmittedAnswer] = useState<{
    type: QuestionType.Range
    value: number
  }>()
  const [interactive, setInteractive] = useState<boolean>(props.interactive)
  const [loading, setLoading] = useState<boolean>(props.loading)

  const onSubmit = (value: number) => {
    setLoading(true)
    setInterval(() => {
      setSubmittedAnswer({ type: QuestionType.Range, value })
      setLoading(false)
      setInteractive(false)
    }, 200)
  }

  return (
    <AnswerRange
      {...props}
      submittedAnswer={submittedAnswer}
      interactive={interactive}
      loading={loading}
      onSubmit={onSubmit}
    />
  )
}

const meta = {
  title: 'Gameplay Components/AnswerRange',
  component: AnswerRange,
  render: (props) => <AnswerRangeComponent {...props} />,
} satisfies Meta<typeof AnswerRange>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive = {
  name: 'Interactive',
  args: {
    min: 0,
    max: 100,
    step: 1,
    submittedAnswer: undefined,
    interactive: true,
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story

export const NonInteractive = {
  name: 'Non Interactive',
  args: {
    min: 0,
    max: 100,
    step: 1,
    submittedAnswer: undefined,
    interactive: false,
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story
