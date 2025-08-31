import type { Meta, StoryObj } from '@storybook/react'

import Typography from './Typography.tsx'

const meta = {
  title: 'Typography/Typography',
  component: Typography,
  tags: ['autodocs'],
} satisfies Meta<typeof Typography>

export default meta
type Story = StoryObj<typeof meta>

export const Title = {
  args: {
    variant: 'title',
    children: 'This is a title',
  },
} satisfies Story

export const Subtitle = {
  args: {
    variant: 'subtitle',
    children: 'This is a subtitle',
  },
} satisfies Story

export const Text = {
  args: {
    variant: 'text',
    children: 'This is regular text content.',
  },
} satisfies Story

export const Link = {
  args: {
    variant: 'link',
    children: 'This is a link',
  },
} satisfies Story

export const Hero = {
  args: {
    variant: 'hero',
    children: 'Think Fast. Score Big. Win Live.',
  },
} satisfies Story

export const Small = {
  args: {
    variant: 'text',
    size: 'small',
    children: 'This is small text',
  },
} satisfies Story

export const Medium = {
  args: {
    variant: 'text',
    size: 'medium',
    children: 'This is medium text',
  },
} satisfies Story

export const Full = {
  args: {
    variant: 'text',
    size: 'full',
    children: 'This is full width text',
  },
} satisfies Story
