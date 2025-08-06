import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import AuthLoginPageUI from './AuthLoginPageUI'

const meta = {
  title: 'Pages/AuthLoginPage',
  component: AuthLoginPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthLoginPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    loading: false,
    onSubmit: () => undefined,
    onGoogleClick: () => undefined,
  },
} satisfies Story
