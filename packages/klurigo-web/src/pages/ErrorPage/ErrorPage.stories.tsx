import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import ErrorPage from './ErrorPage'

const meta = {
  component: ErrorPage,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ErrorPage>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {},
} satisfies Story
