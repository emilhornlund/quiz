import { QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'

import AnswerInput, { AnswerInputProps } from './AnswerInput'

const AnswerInputComponent: FC<AnswerInputProps> = (props) => {
  const [submittedAnswer, setSubmittedAnswer] = useState<{
    type: QuestionType.TypeAnswer
    value: string
  }>()
  const [interactive, setInteractive] = useState<boolean>(props.interactive)
  const [loading, setLoading] = useState<boolean>(props.loading)

  const onSubmit = (value: string) => {
    setLoading(true)
    setInterval(() => {
      setSubmittedAnswer({ type: QuestionType.TypeAnswer, value })
      setLoading(false)
      setInteractive(false)
    }, 200)
  }

  return (
    <AnswerInput
      {...props}
      submittedAnswer={submittedAnswer}
      interactive={interactive}
      loading={loading}
      onSubmit={onSubmit}
    />
  )
}

const meta = {
  title: 'Gameplay Components/AnswerInput',
  component: AnswerInput,
  render: (props) => <AnswerInputComponent {...props} />,
} satisfies Meta<typeof AnswerInput>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive = {
  name: 'Interactive',
  args: {
    submittedAnswer: undefined,
    interactive: true,
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story

export const NonInteractive = {
  name: 'Non Interactive',
  args: {
    submittedAnswer: undefined,
    interactive: false,
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story
