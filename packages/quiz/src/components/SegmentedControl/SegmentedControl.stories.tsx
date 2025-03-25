import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'

import SegmentedControl, { SegmentedControlProps } from './SegmentedControl'

const SegmentedControlStoryComponent: FC<SegmentedControlProps> = (props) => {
  const [value, setValue] = useState<string>()

  return <SegmentedControl {...props} value={value} onChange={setValue} />
}

const meta = {
  title: 'Inputs/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  render: (props) => <SegmentedControlStoryComponent {...props} />,
} satisfies Meta<typeof SegmentedControl>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {
  args: {
    id: 'my-primary-normal-segmented-control',
    kind: 'primary',
    size: 'normal',
    values: [
      { key: 'first', value: 'first', valueLabel: 'First' },
      { key: 'second', value: 'second', valueLabel: 'Second' },
      { key: 'third', value: 'third', valueLabel: 'Third' },
    ],
  },
} satisfies Story

export const Secondary = {
  args: {
    id: 'my-secondary-normal-segmented-control',
    kind: 'secondary',
    size: 'normal',
    values: [
      { key: 'first', value: 'first', valueLabel: 'First' },
      { key: 'second', value: 'second', valueLabel: 'Second' },
      { key: 'third', value: 'third', valueLabel: 'Third' },
    ],
  },
} satisfies Story

export const PrimarySmall = {
  args: {
    id: 'my-primary-small-segmented-control',
    kind: 'primary',
    size: 'small',
    values: [
      { key: 'first', value: 'first', valueLabel: 'First' },
      { key: 'second', value: 'second', valueLabel: 'Second' },
      { key: 'third', value: 'third', valueLabel: 'Third' },
    ],
  },
} satisfies Story

export const SecondarySmall = {
  args: {
    id: 'my-secondary-small-segmented-control',
    kind: 'secondary',
    size: 'small',
    values: [
      { key: 'first', value: 'first', valueLabel: 'First' },
      { key: 'second', value: 'second', valueLabel: 'Second' },
      { key: 'third', value: 'third', valueLabel: 'Third' },
    ],
  },
} satisfies Story
