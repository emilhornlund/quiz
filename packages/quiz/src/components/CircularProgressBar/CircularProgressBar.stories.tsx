import type { Meta, StoryObj } from '@storybook/react'

import CircularProgressBar from './CircularProgressBar'
import { CircularProgressBarKind, CircularProgressBarSize } from './types.ts'

const meta = {
  component: CircularProgressBar,
  tags: ['autodocs'],
} satisfies Meta<typeof CircularProgressBar>

export default meta
type Story = StoryObj<typeof meta>

export const Small = {
  args: {
    progress: 65,
    size: CircularProgressBarSize.Small,
    showPercentage: true,
  },
} satisfies Story

export const SmallCorrect = {
  args: {
    progress: 65,
    kind: CircularProgressBarKind.Correct,
    size: CircularProgressBarSize.Small,
    showPercentage: true,
  },
} satisfies Story

export const Medium = {
  args: {
    progress: 65,
    size: CircularProgressBarSize.Medium,
    showPercentage: true,
  },
} satisfies Story

export const MediumCorrect = {
  args: {
    progress: 65,
    kind: CircularProgressBarKind.Correct,
    size: CircularProgressBarSize.Medium,
    showPercentage: true,
  },
} satisfies Story

export const Large = {
  args: {
    progress: 65,
    size: CircularProgressBarSize.Large,
    showPercentage: true,
  },
} satisfies Story

export const LargeCorrect = {
  args: {
    progress: 65,
    kind: CircularProgressBarKind.Correct,
    size: CircularProgressBarSize.Large,
    showPercentage: true,
  },
} satisfies Story
