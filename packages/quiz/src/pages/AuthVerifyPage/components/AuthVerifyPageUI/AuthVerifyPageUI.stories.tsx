import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import AuthVerifyPageUI from './AuthVerifyPageUI'

const meta = {
  title: 'Pages/AuthVerifyPage',
  component: AuthVerifyPageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof AuthVerifyPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Loading = {
  args: {
    verified: false,
    loggedIn: false,
    error: false,
  },
} satisfies Story

export const Verified = {
  args: {
    verified: true,
    loggedIn: false,
    error: false,
  },
} satisfies Story

export const VerifiedLoggedIn = {
  args: {
    verified: true,
    loggedIn: true,
    error: false,
  },
} satisfies Story

export const Error = {
  args: {
    verified: false,
    loggedIn: false,
    error: true,
  },
} satisfies Story
