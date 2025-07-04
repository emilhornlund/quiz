import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import PlayerAwaitingResultState from './PlayerAwaitingResultState'

const meta = {
  component: PlayerAwaitingResultState,
  decorators: [withRouter],
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
      player: {
        nickname: 'FrostyBear',
        score: {
          total: 10458,
        },
      },
      pagination: {
        current: 1,
        total: 20,
      },
    },
  },
} satisfies Story
