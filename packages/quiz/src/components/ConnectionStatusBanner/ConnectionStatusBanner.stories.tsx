import type { Meta, StoryObj } from '@storybook/react'

import { ConnectionStatus } from '../../utils/use-event-source.tsx'

import ConnectionStatusBanner from './ConnectionStatusBanner'

const meta = {
  component: ConnectionStatusBanner,
} satisfies Meta<typeof ConnectionStatusBanner>

export default meta
type Story = StoryObj<typeof meta>

export const Connected = {
  args: {
    status: ConnectionStatus.CONNECTED,
  },
} satisfies Story

export const Reconnecting = {
  args: {
    status: ConnectionStatus.RECONNECTING,
  },
} satisfies Story

export const ReconnectingFailed = {
  args: {
    status: ConnectionStatus.RECONNECTING_FAILED,
  },
} satisfies Story
