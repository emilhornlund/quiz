import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'

import Dropzone, { DropzoneProps } from './Dropzone'

const DropzoneStoryComponent: FC<DropzoneProps> = (props) => {
  const [progress, setProgress] = useState<number>()

  const handleUpload = () => {
    setProgress(0)

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev === undefined) return 0
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return Math.min(prev + 5, 100)
      })
    }, 200)
  }

  return <Dropzone {...props} progress={progress} onUpload={handleUpload} />
}

const meta = {
  title: 'Inputs/Dropzone',
  component: Dropzone,
  render: (props) => <DropzoneStoryComponent {...props} />,
} satisfies Meta<typeof Dropzone>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {},
} satisfies Story
