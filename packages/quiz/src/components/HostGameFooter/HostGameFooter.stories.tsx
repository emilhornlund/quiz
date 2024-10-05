import type { Meta, StoryObj } from '@storybook/react'

import HostGameFooter from './HostGameFooter'

const meta = {
  component: HostGameFooter,
} satisfies Meta<typeof HostGameFooter>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    gamePIN: '123456',
    currentQuestion: 1,
    totalQuestions: 20,
  },
} satisfies Story
