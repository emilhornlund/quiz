import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import AuthRegisterPageUI from './AuthRegisterPageUI'

const meta = {
  title: 'Pages/AuthRegisterPage',
  component: AuthRegisterPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthRegisterPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story
