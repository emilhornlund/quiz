import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

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
        { nickname: 'ShadowCyborg' },
        { nickname: 'Radar' },
        { nickname: 'ShadowWhirlwind' },
        { nickname: 'WhiskerFox' },
        { nickname: 'JollyNimbus' },
        { nickname: 'PuddingPop' },
        { nickname: 'MysticPine' },
        { nickname: 'FrostyBear' },
        { nickname: 'Willo' },
        { nickname: 'ScarletFlame' },
      ],
    },
  },
} satisfies Story
