import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'
import { withRouter } from 'storybook-addon-remix-react-router'

import Page from './Page'

const meta = {
  title: 'Components/Page',
  component: Page,
  decorators: [withRouter],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Page>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    header: (
      <>
        <a>About</a>
        <a>GitHub</a>
      </>
    ),
    profile: true,
    children: <div>Content</div>,
  },
} satisfies Story
