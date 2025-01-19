import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import HostLobbyState from './HostLobbyState'

const meta = {
  component: HostLobbyState,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostLobbyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameLobbyHost,
      game: { id: 'de6f4af5-f472-4e30-bbeb-97b881e0a569', pin: '123456' },
      players: [
        { id: uuidv4(), nickname: 'ShadowCyborg' },
        { id: uuidv4(), nickname: 'Radar' },
        { id: uuidv4(), nickname: 'ShadowWhirlwind' },
        { id: uuidv4(), nickname: 'WhiskerFox' },
        { id: uuidv4(), nickname: 'JollyNimbus' },
        { id: uuidv4(), nickname: 'PuddingPop' },
        { id: uuidv4(), nickname: 'MysticPine' },
        { id: uuidv4(), nickname: 'FrostyBear' },
        { id: uuidv4(), nickname: 'Willo' },
        { id: uuidv4(), nickname: 'ScarletFlame' },
      ],
    },
  },
} satisfies Story
