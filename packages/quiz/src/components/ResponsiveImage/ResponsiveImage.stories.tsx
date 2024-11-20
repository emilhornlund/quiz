import type { Meta, StoryObj } from '@storybook/react'

import ResponsiveImage from './ResponsiveImage'

const meta = {
  component: ResponsiveImage,
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
