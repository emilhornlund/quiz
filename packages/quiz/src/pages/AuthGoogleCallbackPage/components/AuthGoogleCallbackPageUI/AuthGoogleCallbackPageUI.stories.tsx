import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import AuthGoogleCallbackPageUI from './AuthGoogleCallbackPageUI'

const meta = {
  title: 'Pages/AuthGoogleCallbackPage',
  component: AuthGoogleCallbackPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthGoogleCallbackPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {},
} satisfies Story
