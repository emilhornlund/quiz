import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { withMockAuth } from '../../../../../.storybook/mockAuthContext.tsx'

import ProfileUserPageUI from './ProfileUserPageUI.tsx'

const meta = {
  title: 'Pages/ProfileUserPage',
  component: ProfileUserPageUI,
  decorators: [withRouter, withMockAuth],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProfileUserPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    values: {
      email: '',
      unverifiedEmail: undefined,
      givenName: '',
      familyName: '',
      defaultNickname: '',
    },
    loading: false,
    loadingPassword: false,
    onChange: () => undefined,
    onChangePassword: () => undefined,
    onClickResendVerificationEmail: () => undefined,
  },
} satisfies Story
