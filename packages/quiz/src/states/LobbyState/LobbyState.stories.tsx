import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import LobbyState from './LobbyState'

const meta = {
  component: LobbyState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LobbyState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.Lobby,
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
