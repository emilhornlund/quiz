import type { Meta, StoryObj } from '@storybook/react'

import Select from './Select'

const meta = {
  title: 'Inputs/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    id: 'my-select',
    values: [
      { key: 'option-1', value: 'option-1', valueLabel: 'Option 1' },
      { key: 'option-2', value: 'option-2', valueLabel: 'Option 2' },
      { key: 'option-3', value: 'option-3', valueLabel: 'Option 3' },
    ],
  },
} satisfies Story

export const Disabled = {
  args: {
    id: 'my-select',
    values: [
      { key: 'option-1', value: 'option-1', valueLabel: 'Option 1' },
      { key: 'option-2', value: 'option-2', valueLabel: 'Option 2' },
      { key: 'option-3', value: 'option-3', valueLabel: 'Option 3' },
    ],
    disabled: true,
  },
} satisfies Story
