import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import { Player } from '../../../../models'

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

const player: Player = {
  id: uuidv4(),
  nickname: 'FrostyBear',
}

export const Default = {
  args: {
    player,
    onNicknameChange: () => undefined,
  },
} satisfies Story
