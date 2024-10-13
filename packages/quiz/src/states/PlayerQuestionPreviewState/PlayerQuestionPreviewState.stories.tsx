import { GameEventType, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import PlayerQuestionPreviewState from './PlayerQuestionPreviewState'

const meta = {
  component: PlayerQuestionPreviewState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlayerQuestionPreviewState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
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
    },
  },
} satisfies Story
