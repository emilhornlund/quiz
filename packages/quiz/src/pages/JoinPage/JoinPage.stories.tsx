import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { withMockAuth } from '../../../.storybook/mockAuthContext.tsx'

import JoinPage from './JoinPage'

const meta = {
  component: JoinPage,
  decorators: [withRouter, withMockAuth],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof JoinPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {},
} satisfies Story
