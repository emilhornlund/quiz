import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'

import HostGameBeginState from './HostGameBeginState'

const meta = {
  component: HostGameBeginState,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostGameBeginState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameBeginHost,
    },
  },
} satisfies Story
