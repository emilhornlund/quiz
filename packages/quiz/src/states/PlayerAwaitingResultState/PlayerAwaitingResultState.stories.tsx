import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import PlayerAwaitingResultState from './PlayerAwaitingResultState'

const meta = {
  component: PlayerAwaitingResultState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlayerAwaitingResultState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameAwaitingResultPlayer,
      nickname: 'FrostyBear',
      score: {
        total: 10458,
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story
