import { QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import type { FC } from 'react'
import { useState } from 'react'

import AnswerSort, { type AnswerSortProps } from './AnswerSort'

const AnswerSortComponent: FC<AnswerSortProps> = (props) => {
  const [submittedAnswer, setSubmittedAnswer] = useState<{
    type: QuestionType.Puzzle
    value: string[]
  }>()
  const [interactive, setInteractive] = useState<boolean>(props.interactive)
  const [loading, setLoading] = useState<boolean>(props.loading)

  const onSubmit = (value: string[]) => {
    setLoading(true)
    setInterval(() => {
      setSubmittedAnswer({
        type: QuestionType.Puzzle,
        value,
      })
      setLoading(false)
      setInteractive(false)
    }, 200)
  }

  return (
    <AnswerSort
      {...props}
      submittedAnswer={submittedAnswer}
      interactive={interactive}
      loading={loading}
      onSubmit={onSubmit}
    />
  )
}

const meta = {
  title: 'Gameplay Components/AnswerSort',
  component: AnswerSort,
  render: (props) => <AnswerSortComponent {...props} />,
} satisfies Meta<typeof AnswerSort>

export default meta
type Story = StoryObj<typeof meta>

export const Interactive = {
  name: 'Interactive',
  args: {
    values: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
    submittedAnswer: undefined,
    interactive: true,
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story

export const NonInteractive = {
  name: 'Non Interactive',
  args: {
    values: ['Athens', 'Argos', 'Plovdiv', 'Lisbon'],
    submittedAnswer: undefined,
    interactive: false,
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story
