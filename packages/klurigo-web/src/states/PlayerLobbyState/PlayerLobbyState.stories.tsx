import { GameEventType } from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import PlayerLobbyState from './PlayerLobbyState'

const meta = {
  component: PlayerLobbyState,
  decorators: [withRouter],
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
      player: { nickname: 'FrostyBear' },
    },
  },
} satisfies Story
