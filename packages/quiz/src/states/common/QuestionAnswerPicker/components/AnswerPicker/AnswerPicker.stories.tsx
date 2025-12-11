import { QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'

import AnswerPicker, { AnswerPickerProps } from './AnswerPicker'

const AnswerPickerComponent: FC<AnswerPickerProps> = (props) => {
  const [submittedAnswer, setSubmittedAnswer] = useState<{
    type: QuestionType.MultiChoice
    value: number
  }>()
  const [interactive, setInteractive] = useState<boolean>(props.interactive)
  const [loading, setLoading] = useState<boolean>(props.loading)

  const onClick = (optionIndex: number) => {
    setLoading(true)
    setInterval(() => {
      setSubmittedAnswer({ type: QuestionType.MultiChoice, value: optionIndex })
      setLoading(false)
      setInteractive(false)
    }, 200)
  }

  return (
    <AnswerPicker
      {...props}
      submittedAnswer={submittedAnswer}
      interactive={interactive}
      loading={loading}
      onClick={onClick}
    />
  )
}

const meta = {
  title: 'Gameplay Components/AnswerPicker',
  component: AnswerPicker,
  render: (props) => <AnswerPickerComponent {...props} />,
} satisfies Meta<typeof AnswerPicker>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive = {
  name: 'Interactive',
  args: {
    answers: [
      'Vincent van Gogh',
      'Pablo Picasso',
      'Leonardo da Vinci',
      'Claude Monet',
    ],
    submittedAnswer: undefined,
    interactive: true,
    loading: false,
    onClick: () => undefined,
  },
} satisfies Story

export const NonInteractive = {
  name: 'Non Interactive',
  args: {
    answers: [
      'Vincent van Gogh',
      'Pablo Picasso',
      'Leonardo da Vinci',
      'Claude Monet',
    ],
    submittedAnswer: undefined,
    interactive: false,
    loading: false,
    onClick: () => undefined,
  },
} satisfies Story
