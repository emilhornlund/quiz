import { GameEventType } from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import PlayerGameBeginState from './PlayerGameBeginState'

const meta = {
  component: PlayerGameBeginState,
  decorators: [withRouter],
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
