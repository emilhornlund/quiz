import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import Badge from './Badge'

const meta = {
  component: Badge,
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Correct = {
  args: {
    size: 'large',
    backgroundColor: 'green',
    children: <FontAwesomeIcon icon={faCheck} />,
  },
} satisfies Story

export const Incorrect = {
  args: {
    size: 'large',
    backgroundColor: 'red',
    children: <FontAwesomeIcon icon={faXmark} />,
  },
} satisfies Story

export const Position1st = {
  args: {
    size: 'large',
    backgroundColor: 'gold',
    children: 1,
  },
} satisfies Story

export const Position2nd = {
  args: {
    size: 'large',
    backgroundColor: 'silver',
    children: 2,
  },
} satisfies Story

export const Position3rd = {
  args: {
    size: 'large',
    backgroundColor: 'bronze',
    children: 3,
  },
} satisfies Story

export const Position10th = {
  args: {
    size: 'large',
    backgroundColor: 'white',
    children: 10,
  },
} satisfies Story

export const Streak = {
  args: {
    size: 'small',
    backgroundColor: 'orange',
    children: 3,
  },
} satisfies Story

export const CelebrationNormal = {
  args: {
    size: 'large',
    backgroundColor: 'green',
    celebration: 'normal',
    children: <FontAwesomeIcon icon={faCheck} />,
  },
} satisfies Story

export const CelebrationMajor = {
  args: {
    size: 'large',
    backgroundColor: 'green',
    celebration: 'major',
    children: <FontAwesomeIcon icon={faCheck} />,
  },
} satisfies Story

export const CelebrationEpic = {
  args: {
    size: 'large',
    backgroundColor: 'green',
    celebration: 'epic',
    children: <FontAwesomeIcon icon={faCheck} />,
  },
} satisfies Story
