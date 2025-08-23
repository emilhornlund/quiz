import { QuestionPinTolerance } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'

import PinImage, { PinImageProps } from './PinImage.tsx'

const PinImageStoryComponent: FC<PinImageProps> = (props) => {
  const [value, setValue] = useState<{ x: number; y: number }>({
    x: 0.5,
    y: 0.5,
  })

  return (
    <div style={{ height: '100vh', display: 'flex', minHeight: 0 }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <PinImage
          {...props}
          positionX={value.x}
          positionY={value.y}
          onChange={setValue}
        />
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
    positionX: 0.5,
    positionY: 0.5,
    tolerance: QuestionPinTolerance.Medium,
  },
} satisfies Story

export const NoTolerance = {
  name: 'No Tolerance',
  args: {
    imageURL:
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f7/Europe_laea_location_map.svg/1401px-Europe_laea_location_map.svg.png',
    positionX: 0.5,
    positionY: 0.5,
  },
} satisfies Story
