import { GameEventType } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { withMockGameHost } from '../../../.storybook/mockGameContext.tsx'

import HostGameBeginState from './HostGameBeginState'

const meta = {
  component: HostGameBeginState,
  decorators: [withRouter, withMockGameHost],
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
