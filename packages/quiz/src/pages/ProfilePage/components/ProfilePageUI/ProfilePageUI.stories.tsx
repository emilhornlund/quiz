import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import ProfilePageUI from './ProfilePageUI'

const meta = {
  title: 'Pages/ProfilePage',
  component: ProfilePageUI,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof ProfilePageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    values: { email: '', givenName: '', familyName: '', defaultNickname: '' },
    loading: false,
    onChange: () => undefined,
  },
} satisfies Story
