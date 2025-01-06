import type { Meta, StoryObj } from '@storybook/react'

import Textarea from './Textarea'

const meta = {
  title: 'Inputs/Textarea',
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

export const Code = {
  args: {
    id: 'my-text-field',
    type: 'code',
  },
} satisfies Story

export const Disabled = {
  args: {
    id: 'my-text-field',
    disabled: true,
  },
} satisfies Story
