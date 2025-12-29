import { QuestionImageRevealEffectType } from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'

import ResponsiveImage from './ResponsiveImage'

const meta = {
  component: ResponsiveImage,
  parameters: { layout: 'fullscreen' },
  decorators: [
    (Story) => (
      <div style={{ height: '100vh', display: 'flex', minHeight: 0 }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Story />
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof ResponsiveImage>

export default meta
type Story = StoryObj<typeof meta>

export const Landscape = {
  args: {
    imageURL:
      'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
    alt: 'Who painted The Starry Night?',
  },
} satisfies Story

export const Square = {
  args: {
    imageURL: 'https://wallpapercave.com/wp/wp2824407.jpg',
    alt: 'Who painted The Starry Night?',
  },
} satisfies Story

export const Portrait = {
  args: {
    imageURL: 'https://wallpaperaccess.com/full/157316.jpg',
    alt: 'Who painted The Starry Night?',
  },
} satisfies Story

export const imageEffect = {
  args: {
    imageURL:
      'https://i.pinimg.com/originals/a6/60/72/a66072b0e88258f2898a76c3f3c01041.jpg',
    alt: 'Who painted The Starry Night?',
    revealEffect: {
      type: QuestionImageRevealEffectType.Blur,
      countdown: {
        initiatedTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 30 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
    },
  },
} satisfies Story

export const Error = {
  args: {
    imageURL: 'https://example.com/image.png',
    alt: 'Error loading image',
  },
} satisfies Story
