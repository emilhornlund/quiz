import { GameEventType, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import PlayerQuestionPreviewState from './PlayerQuestionPreviewState'

const meta = {
  component: PlayerQuestionPreviewState,
  decorators: [withRouter],
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
        type: QuestionType.MultiChoice,
        question: 'Who painted The Starry Night?',
      },
      countdown: {
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story
