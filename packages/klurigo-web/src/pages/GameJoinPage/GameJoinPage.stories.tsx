import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { withMockAuth } from '../../../.storybook/mockAuthContext'

import GameJoinPage from './GameJoinPage'

const meta = {
  component: GameJoinPage,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GameJoinPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  decorators: [withMockAuth],
  args: {},
} satisfies Story

export const NotAuthenticated = {
  decorators: [],
  args: {},
} satisfies Story
