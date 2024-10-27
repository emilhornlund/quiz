import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import PlayerGameBeginState from './PlayerGameBeginState'

const meta = {
  component: PlayerGameBeginState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlayerGameBeginState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameBeginPlayer,
      player: { nickname: 'FrostyBear' },
    },
  },
} satisfies Story
