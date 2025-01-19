import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import type { Meta, StoryObj } from '@storybook/react'

import Button from './Button.tsx'

const meta = {
  title: 'Inputs/Button',
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

export const Success = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'success',
    value: 'Success Button',
  },
} satisfies Story

export const Destructive = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'destructive',
    value: 'Destructive Button',
  },
} satisfies Story

export const Plain = {
  args: {
    id: 'my-plain-button',
    type: 'button',
    kind: 'plain',
    value: 'Plain Button',
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
    value: 'Call To Action Small Button',
  },
} satisfies Story

export const SuccessSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'success',
    size: 'small',
    value: 'Success Small Button',
  },
} satisfies Story

export const DestructiveSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'destructive',
    size: 'small',
    value: 'Destructive Small Button',
  },
} satisfies Story

export const PlainSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'plain',
    size: 'small',
    value: 'Plain Small Button',
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
    value: 'Call To Action Disabled Button',
    disabled: true,
  },
} satisfies Story

export const SuccessDisabled = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'success',
    value: 'Success Disabled Button',
    disabled: true,
  },
} satisfies Story

export const DestructiveDisabled = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'destructive',
    value: 'Destructive Disabled Button',
    disabled: true,
  },
} satisfies Story

export const PrimaryIcon = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Primary Button',
    icon: faArrowLeft,
    iconPosition: 'leading',
  },
} satisfies Story

export const SecondaryIcon = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'secondary',
    value: 'Secondary Button',
    icon: faArrowLeft,
    iconPosition: 'leading',
  },
} satisfies Story

export const CallToActionIcon = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'call-to-action',
    value: 'CallToAction Button',
    icon: faArrowLeft,
    iconPosition: 'leading',
  },
} satisfies Story

export const SuccessIcon = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'success',
    value: 'Success Button',
    icon: faArrowLeft,
    iconPosition: 'leading',
  },
} satisfies Story

export const DestructiveIcon = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'destructive',
    value: 'Destructive Icon',
    icon: faArrowLeft,
    iconPosition: 'leading',
  },
} satisfies Story

export const PlainIcon = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'plain',
    value: 'Plain Icon',
    icon: faArrowLeft,
    iconPosition: 'leading',
  },
} satisfies Story

export const PrimaryLoading = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    value: 'Primary Button',
    loading: true,
  },
} satisfies Story

export const SecondaryLoading = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'secondary',
    value: 'Secondary Button',
    loading: true,
  },
} satisfies Story

export const CallToActionLoading = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'call-to-action',
    value: 'CallToAction Button',
    loading: true,
  },
} satisfies Story

export const PrimaryLoadingSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'primary',
    size: 'small',
    value: 'Primary Button',
    loading: true,
  },
} satisfies Story

export const SecondaryLoadingSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'secondary',
    size: 'small',
    value: 'Secondary Button',
    loading: true,
  },
} satisfies Story

export const CallToActionLoadingSmall = {
  args: {
    id: 'my-button',
    type: 'button',
    kind: 'call-to-action',
    size: 'small',
    value: 'CallToAction Button',
    loading: true,
  },
} satisfies Story
