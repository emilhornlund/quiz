import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import LoginPageUI from './LoginPageUI'

const meta = {
  title: 'Pages/LoginPage',
  component: LoginPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof LoginPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story
