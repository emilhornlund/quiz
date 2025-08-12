import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import LegacyRedirectionPage from './LegacyRedirectionPage'

const meta = {
  component: LegacyRedirectionPage,
  decorators: [withRouter],
  parameters: { layout: 'fullscreen' },
  // Don’t navigate in stories by default
  args: { disableRedirect: true },
  argTypes: {
    disableRedirect: { control: 'boolean' },
    overrideMigrationToken: { control: 'text' },
  },
} satisfies Meta<typeof LegacyRedirectionPage>

export default meta
type Story = StoryObj<typeof meta>

export const WithoutToken = {
  name: 'Without migrationToken',
  args: { overrideMigrationToken: undefined },
} satisfies Story

export const WithToken = {
  name: 'With migrationToken',
  args: {
    overrideMigrationToken: 'jU4n2n9eC-8GEZhk8NcApcfNQF9xO0yQOeJUZQk4w-E',
  },
} satisfies Story
