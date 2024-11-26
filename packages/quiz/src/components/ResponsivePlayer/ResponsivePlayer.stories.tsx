import type { Meta, StoryObj } from '@storybook/react'

import ResponsivePlayer from './ResponsivePlayer'

const meta = {
  component: ResponsivePlayer,
} satisfies Meta<typeof ResponsivePlayer>

export default meta
type Story = StoryObj<typeof meta>

export const Video = {
  args: {
    url: 'https://www.youtube.com/watch?v=LXb3EKWsInQ',
  },
} satisfies Story
