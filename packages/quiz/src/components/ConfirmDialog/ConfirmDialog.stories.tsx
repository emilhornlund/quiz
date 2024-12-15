import type { Meta, StoryObj } from '@storybook/react'

import ConfirmDialog from './ConfirmDialog'

const meta = {
  component: ConfirmDialog,
} satisfies Meta<typeof ConfirmDialog>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    title: 'Confirm',
    message: 'Are you sure you want to do this?',
    open: true,
  },
} satisfies Story

export const Destructive = {
  args: {
    title: 'Delete Quiz',
    message: 'Are you sure you want to delete this quiz?',
    open: true,
    destructive: true,
  },
} satisfies Story
