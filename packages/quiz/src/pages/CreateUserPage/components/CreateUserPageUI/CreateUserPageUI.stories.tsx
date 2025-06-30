import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import CreateUserPageUI from './CreateUserPageUI'

const meta = {
  title: 'Pages/CreateUserPage',
  component: CreateUserPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof CreateUserPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    loading: false,
    onSubmit: () => undefined,
  },
} satisfies Story
