import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import HostPodiumState from './HostPodiumState'

const meta = {
  component: HostPodiumState,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostPodiumState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GamePodiumHost,
      leaderboard: [
        { position: 1, nickname: 'ShadowCyborg', score: 18456 },
        { position: 2, nickname: 'Radar', score: 18398 },
        { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
        { position: 4, nickname: 'WhiskerFox', score: 14118 },
        { position: 5, nickname: 'JollyNimbus', score: 13463 },
        { position: 6, nickname: 'PuddingPop', score: 12459 },
        { position: 7, nickname: 'MysticPine', score: 11086 },
        { position: 8, nickname: 'FrostyBear', score: 10361 },
        { position: 9, nickname: 'Willo', score: 9360 },
        { position: 10, nickname: 'ScarletFlame', score: 6723 },
      ],
    },
    onComplete: () => undefined,
  },
} satisfies Story

export const ThreePlayers = {
  args: {
    event: {
      type: GameEventType.GamePodiumHost,
      leaderboard: [
        { position: 1, nickname: 'ShadowCyborg', score: 18456 },
        { position: 2, nickname: 'Radar', score: 18398 },
        { position: 3, nickname: 'ShadowWhirlwind', score: 15492 },
      ],
    },
    onComplete: () => undefined,
  },
} satisfies Story
