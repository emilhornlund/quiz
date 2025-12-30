import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import AuthPasswordForgotPageUI from './AuthPasswordForgotPageUI'

const meta = {
  title: 'Pages/AuthPasswordForgotPage',
  component: AuthPasswordForgotPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthPasswordForgotPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story

export const Loading = {
  args: {
    loading: true,
    onSubmit: () => undefined,
  },
} satisfies Story
