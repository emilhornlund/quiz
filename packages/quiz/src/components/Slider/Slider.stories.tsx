import { QuestionRangeAnswerMargin } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import React, { FC, useState } from 'react'

import Slider, { SliderProps } from './Slider'

const SliderStoryComponent: FC<SliderProps> = (props) => {
  const [value, setValue] = useState<number>()

  return (
    <div style={{ margin: '2rem 0' }}>
      <Slider {...props} value={value} onChange={setValue} />
    </div>
  )
}

const meta = {
  title: 'Inputs/Slider',
  component: Slider,
  tags: ['autodocs'],
  render: (props) => <SliderStoryComponent {...props} />,
} satisfies Meta<typeof Slider>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  name: 'Default',
  args: {
    id: 'my-slider',
    min: 0,
    max: 100,
    step: 2,
    value: 50,
  },
} satisfies Story

export const MarginMinMax = {
  name: 'Margin and MinMax',
  args: {
    id: 'my-slider',
    min: 0,
    max: 100,
    step: 2,
    value: 50,
    margin: QuestionRangeAnswerMargin.Medium,
    showMinMax: true,
  },
} satisfies Story

export const MinMax = {
  name: 'Show Min Max',
  args: {
    id: 'my-slider',
    min: 0,
    max: 100,
    step: 2,
    value: 50,
    showMinMax: true,
  },
} satisfies Story

export const Correct = {
  name: 'Correct with Margin',
  args: {
    id: 'my-slider',
    min: 0,
    max: 100,
    step: 2,
    value: 50,
    margin: QuestionRangeAnswerMargin.Medium,
    correct: true,
  },
} satisfies Story
