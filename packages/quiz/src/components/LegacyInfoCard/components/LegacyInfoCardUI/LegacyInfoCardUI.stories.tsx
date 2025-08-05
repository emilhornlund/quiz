import type { Meta, StoryObj } from '@storybook/react'

import LegacyInfoCardUI from './LegacyInfoCardUI'

const meta = {
  title: 'Surfaces/LegacyInfoCard',
  component: LegacyInfoCardUI,
} satisfies Meta<typeof LegacyInfoCardUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    migrated: false,
    legacyDomain: 'quiz.emilhornlund.com',
    targetDomain: 'klurigo.com',
    onDismiss: () => undefined,
  },
} satisfies Story

export const MigratedButUserNotAuthenticated = {
  args: {
    migrated: true,
    legacyDomain: 'quiz.emilhornlund.com',
    targetDomain: 'klurigo.com',
    onDismiss: () => undefined,
  },
} satisfies Story
