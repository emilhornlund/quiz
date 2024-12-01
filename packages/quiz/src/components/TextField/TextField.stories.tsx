import type { Meta, StoryObj } from '@storybook/react'

import TextField from './TextField.tsx'

const meta = {
  component: TextField,
  tags: ['autodocs'],
} satisfies Meta<typeof TextField>

export default meta
type Story = StoryObj<typeof meta>

export const Text = {
  args: {
    id: 'my-text-field',
    type: 'text',
    placeholder: 'Placeholder',
  },
} satisfies Story

export const Number = {
  args: {
    id: 'my-text-field',
    type: 'number',
    placeholder: 'Placeholder',
    min: 0,
    max: 100,
  },
} satisfies Story

export const Disabled = {
  args: {
    id: 'my-text-field',
    type: 'text',
    placeholder: 'Placeholder',
    disabled: true,
  },
} satisfies Story

export const Small = {
  args: {
    id: 'my-small-text-field',
    type: 'text',
    size: 'small',
    placeholder: 'Placeholder',
  },
} satisfies Story
