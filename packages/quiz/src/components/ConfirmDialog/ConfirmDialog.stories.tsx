import type { Meta, StoryObj } from '@storybook/react'

import ConfirmDialog from './ConfirmDialog'

const meta = {
  component: ConfirmDialog,
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Destructive = {
  args: {
    title: 'Delete Quiz',
    message: 'Are you sure you want to delete this quiz?',
    open: true,
  },
} satisfies Story
