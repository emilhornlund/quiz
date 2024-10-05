import type { Meta, StoryObj } from '@storybook/react'

import PlayerGameFooter from './PlayerGameFooter'

const meta = {
  component: PlayerGameFooter,
} satisfies Meta<typeof PlayerGameFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    nickname: 'FrostyBear',
    totalScore: 10361,
  },
} satisfies Story
