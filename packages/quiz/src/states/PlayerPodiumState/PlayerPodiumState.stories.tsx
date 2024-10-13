import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import PlayerPodiumState from './PlayerPodiumState.tsx'

const meta = {
  component: PlayerPodiumState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof PlayerPodiumState>

export default meta
type Story = StoryObj<typeof meta>

export const FirstPlace = {
  args: {
    event: {
      type: GameEventType.GamePodiumPlayer,
      title: 'Friday Office Quiz',
      nickname: 'ShadowCyborg',
      position: 1,
      score: 18456,
    },
  },
} satisfies Story

export const SecondPlace = {
  args: {
    event: {
      type: GameEventType.GamePodiumPlayer,
      title: 'Friday Office Quiz',
      nickname: 'Radar',
      position: 2,
      score: 18398,
    },
  },
} satisfies Story

export const ThirdPlace = {
  args: {
    event: {
      type: GameEventType.GamePodiumPlayer,
      title: 'Friday Office Quiz',
      nickname: 'ShadowWhirlwind',
      position: 3,
      score: 15492,
    },
  },
} satisfies Story

export const FourthPlace = {
  args: {
    event: {
      type: GameEventType.GamePodiumPlayer,
      title: 'Friday Office Quiz',
      nickname: 'WhiskerFox',
      position: 4,
      score: 14118,
    },
  },
} satisfies Story
