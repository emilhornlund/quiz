import type { Meta, StoryObj } from '@storybook/react'

import Card from './Card'

const meta = {
  title: 'Surfaces/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

const EXAMPLE_TEXT =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. '

export const Primary = {
  args: {
    kind: 'primary',
    center: false,
    children: <>{EXAMPLE_TEXT}</>,
  },
} satisfies Story

export const CallToAction = {
  args: {
    kind: 'call-to-action',
    center: false,
    children: <>{EXAMPLE_TEXT}</>,
  },
} satisfies Story

export const Success = {
  args: {
    kind: 'success',
    center: false,
    children: <>{EXAMPLE_TEXT}</>,
  },
} satisfies Story
