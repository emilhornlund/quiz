import type { Meta, StoryObj } from '@storybook/react'

import Confetti from './Confetti'

const meta = {
  component: Confetti,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Confetti>

export default meta
type Story = StoryObj<typeof meta>

export const Normal = {
  args: {
    trigger: true,
    intensity: 'normal',
  },
} satisfies Story

export const Major = {
  args: {
    trigger: true,
    intensity: 'major',
  },
} satisfies Story

export const Epic = {
  args: {
    trigger: true,
    intensity: 'epic',
  },
} satisfies Story

export const NotTriggered = {
  args: {
    trigger: false,
    intensity: 'normal',
  },
} satisfies Story
