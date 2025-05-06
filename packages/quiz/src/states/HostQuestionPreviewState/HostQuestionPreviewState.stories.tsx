import { GameEventType, GameMode, QuestionType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import HostQuestionPreviewState from './HostQuestionPreviewState'

const meta = {
  component: HostQuestionPreviewState,
  decorators: [withRouter],
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
        mode: GameMode.Classic,
        pin: '123456',
      },
      question: {
        type: QuestionType.MultiChoice,
        question: 'Who painted The Starry Night?',
        points: 1000,
      },
      countdown: {
        initiatedTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story
