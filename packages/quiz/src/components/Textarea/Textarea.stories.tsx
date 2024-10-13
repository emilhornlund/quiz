import type { Meta, StoryObj } from '@storybook/react'

import Textarea from './Textarea'

const meta = {
  component: Textarea,
  tags: ['autodocs'],
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    id: 'my-text-field',
  },
} satisfies Story
