import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import tState from './PlayerLeaderboardState.tsx'

const meta = {
  component: tState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof tState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameLeaderboardPlayer,
      player: {
        nickname: 'FrostyBear',
        score: {
          position: 1,
          score: 10458,
          streaks: 3,
        },
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story
