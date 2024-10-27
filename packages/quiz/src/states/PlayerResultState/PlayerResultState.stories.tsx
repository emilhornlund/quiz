import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import tState from './PlayerResultState'

const meta = {
  component: tState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof tState>

export default meta
type Story = StoryObj<typeof meta>

export const Correct = {
  args: {
    event: {
      type: GameEventType.GameResultPlayer,
      player: {
        nickname: 'FrostyBear',
        score: {
          correct: true,
          last: 634,
          total: 10458,
          position: 1,
          streak: 3,
        },
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story

export const Incorrect = {
  args: {
    event: {
      type: GameEventType.GameResultPlayer,
      player: {
        nickname: 'FrostyBear',
        score: {
          correct: false,
          last: 0,
          total: 10458,
          position: 1,
          streak: 0,
        },
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story
