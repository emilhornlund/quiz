import type { Meta, StoryObj } from '@storybook/react'

import LoadingSpinner from './LoadingSpinner'

const meta = {
  title: 'Components/LoadingSpinner',
  component: LoadingSpinner,
} satisfies Meta<typeof LoadingSpinner>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {},
} satisfies Story
