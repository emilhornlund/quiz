import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons'
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

export const CallToAction = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'call-to-action',
    value: 'Call To Action Button',
  },
} satisfies Story

export const Destructive = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'destructive',
    value: 'Destructive',
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

export const CallToActionSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'call-to-action',
    size: 'small',
    value: 'Call To Action Button',
  },
} satisfies Story

export const DestructiveSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'destructive',
    size: 'small',
    value: 'Destructive',
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

export const CallToActionDisabled = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'call-to-action',
    value: 'Call To Action Button',
    disabled: true,
  },
} satisfies Story

export const DestructiveDisabled = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'destructive',
    value: 'Destructive',
    disabled: true,
  },
} satisfies Story

export const ArrowIconLeft = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Arrow Left Button',
    icon: faArrowLeft,
    iconPosition: 'leading',
  },
} satisfies Story

export const ArrowIconRight = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Arrow Right Button',
    icon: faArrowRight,
    iconPosition: 'trailing',
  },
} satisfies Story
