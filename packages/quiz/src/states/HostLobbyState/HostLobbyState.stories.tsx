import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import HostLobbyState from './HostLobbyState'

const meta = {
  component: HostLobbyState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostLobbyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.LobbyHost,
      url: 'http://localhost:3000/join',
      pin: '123456',
      players: [
        'ShadowCyborg',
        'Radar',
        'ShadowWhirlwind',
        'WhiskerFox',
        'JollyNimbus',
        'PuddingPop',
        'MysticPine',
        'FrostyBear',
        'Willo',
        'ScarletFlame',
      ],
    },
  },
} satisfies Story
