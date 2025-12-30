import type { Meta, StoryObj } from '@storybook/react'

import NicknameTextField from './NicknameTextField'

const meta = {
  title: 'Inputs/NicknameTextField',
  component: NicknameTextField,
  tags: ['autodocs'],
} satisfies Meta<typeof NicknameTextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    value: 'FrostyBear',
    disabled: false,
    onChange: () => undefined,
    onValid: () => undefined,
  },
} satisfies Story

export const Disabled = {
  args: {
    value: 'FrostyBear',
    disabled: true,
    onChange: () => undefined,
    onValid: () => undefined,
  },
} satisfies Story
