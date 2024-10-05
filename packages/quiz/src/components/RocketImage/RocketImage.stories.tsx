import type { Meta, StoryObj } from '@storybook/react'

import RocketImage from './RocketImage'

const meta = {
  component: RocketImage,
} satisfies Meta<typeof RocketImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {},
} satisfies Story
