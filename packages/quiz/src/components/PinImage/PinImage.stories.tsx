import { QuestionPinTolerance } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'

import PinImage, { PinImageProps } from './PinImage.tsx'
import { PinColor } from './types.ts'

const PinImageStoryComponent: FC<PinImageProps> = (props) => {
  const [value, setValue] = useState<{ x: number; y: number } | undefined>(
    props.value,
  )

  return (
    <div style={{ height: '100vh', display: 'flex', minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PinImage {...props} value={value} onChange={setValue} />
      </div>
    </div>
  )
}

const meta = {
  component: PinImage,
  parameters: { layout: 'fullscreen' },
  render: (props) => <PinImageStoryComponent {...props} />,
} satisfies Meta<typeof PinImage>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Europe_laea_location_map.svg/1401px-Europe_laea_location_map.svg.png',
    value: { x: 0.45838, y: 0.35438, tolerance: QuestionPinTolerance.Medium },
  },
} satisfies Story

export const NoPin = {
  name: 'No Pin',
  args: {
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Europe_laea_location_map.svg/1401px-Europe_laea_location_map.svg.png',
  },
} satisfies Story

export const NoTolerance = {
  name: 'No Tolerance',
  args: {
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Europe_laea_location_map.svg/1401px-Europe_laea_location_map.svg.png',
    value: { x: 0.45838, y: 0.35438 },
  },
} satisfies Story

export const Multiple = {
  name: 'Multiple Pins',
  args: {
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Europe_laea_location_map.svg/1401px-Europe_laea_location_map.svg.png',
    value: {
      x: 0.45838,
      y: 0.35438,
      tolerance: QuestionPinTolerance.Medium,
      color: PinColor.Blue,
    },
    values: [
      { x: 0.5, y: 0.45, color: PinColor.Green },
      { x: 0.3, y: 0.25, color: PinColor.Red },
      { x: 0.85, y: 0.75, color: PinColor.Red },
    ],
    disabled: true,
  },
} satisfies Story
