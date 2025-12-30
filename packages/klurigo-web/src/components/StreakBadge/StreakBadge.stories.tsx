import type { Meta, StoryObj } from '@storybook/react'

import StreakBadge from './StreakBadge'

const meta = {
  component: StreakBadge,
} satisfies Meta<typeof StreakBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    streak: 3,
  },
} satisfies Story

export const Label = {
  args: {
    streak: 3,
    children: 'Streak',
  },
} satisfies Story
