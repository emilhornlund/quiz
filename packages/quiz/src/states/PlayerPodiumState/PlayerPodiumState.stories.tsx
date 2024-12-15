import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import PlayerPodiumState from './PlayerPodiumState.tsx'

const meta = {
  component: PlayerPodiumState,
  decorators: [withRouter],
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
      game: {
        name: 'Friday Office Quiz',
      },
      player: {
        nickname: 'ShadowCyborg',
        score: {
          total: 18456,
          position: 1,
        },
      },
    },
  },
} satisfies Story

export const SecondPlace = {
  args: {
    event: {
      type: GameEventType.GamePodiumPlayer,
      game: {
        name: 'Friday Office Quiz',
      },
      player: {
        nickname: 'Radar',
        score: {
          total: 18398,
          position: 2,
        },
      },
    },
  },
} satisfies Story

export const ThirdPlace = {
  args: {
    event: {
      type: GameEventType.GamePodiumPlayer,
      game: {
        name: 'Friday Office Quiz',
      },
      player: {
        nickname: 'ShadowWhirlwind',
        score: {
          total: 15492,
          position: 3,
        },
      },
    },
  },
} satisfies Story

export const FourthPlace = {
  args: {
    event: {
      type: GameEventType.GamePodiumPlayer,
      game: {
        name: 'Friday Office Quiz',
      },
      player: {
        nickname: 'WhiskerFox',
        score: {
          total: 14118,
          position: 4,
        },
      },
    },
  },
} satisfies Story
