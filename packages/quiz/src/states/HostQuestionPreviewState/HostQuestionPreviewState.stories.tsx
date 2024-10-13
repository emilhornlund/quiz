import { GameEventType, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import HostQuestionPreviewState from './HostQuestionPreviewState'

const meta = {
  component: HostQuestionPreviewState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostQuestionPreviewState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameQuestionPreviewHost,
      game: {
        pin: '123456',
      },
      question: {
        type: QuestionType.Multi,
        question: 'Who painted The Starry Night?',
      },
      progress: {
        value: 0.75,
      },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story
