import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import PlayerLobbyState from './PlayerLobbyState'

const meta = {
  component: PlayerLobbyState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlayerLobbyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameLobbyPlayer,
      nickname: 'FrostyBear',
    },
  },
} satisfies Story
