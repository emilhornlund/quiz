import type { Meta, StoryObj } from '@storybook/react'

import Button from './Button.tsx'

const meta = {
  component: Button,
  tags: ['autodocs'],
} satisfies Meta<typeof Button>

export default meta
type Story = StoryObj<typeof meta>

export const Primary = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Primary Button',
  },
} satisfies Story

export const Secondary = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'secondary',
    value: 'Secondary Button',
  },
} satisfies Story

export const PrimarySmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    size: 'small',
    value: 'Primary Small Button',
  },
} satisfies Story

export const SecondarySmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'secondary',
    size: 'small',
    value: 'Secondary Small Button',
  },
} satisfies Story

export const PrimaryDisabled = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Primary Disabled Button',
    disabled: true,
  },
} satisfies Story

export const SecondaryDisabled = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'secondary',
    value: 'Secondary Disabled Button',
    disabled: true,
  },
} satisfies Story

export const ArrowLeft = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Arrow Left Button',
    arrow: 'left',
  },
} satisfies Story

export const ArrowRight = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Arrow Right Button',
    arrow: 'right',
  },
} satisfies Story
