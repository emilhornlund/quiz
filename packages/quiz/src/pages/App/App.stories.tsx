import type { Meta, StoryObj } from '@storybook/react'

import App from './App.tsx'

const meta = {
  component: App,
} satisfies Meta<typeof App>

export default meta
type Story = StoryObj<typeof meta>

export const Example = {
  args: {
    primary: true,
    label: 'App',
  },
} satisfies Story
