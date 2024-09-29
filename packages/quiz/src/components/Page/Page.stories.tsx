import type { Meta, StoryObj } from '@storybook/react'
import React from 'react'

import Page from './Page'

const meta = {
  title: 'Components/Page',
  component: Page,
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
    children: <div>Content</div>,
  },
} satisfies Story
