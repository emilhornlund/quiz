import { GameEventType, GameMode, QuestionType } from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'

import { withMockGameHost } from '../../../.storybook/mockGameContext.tsx'

import HostQuestionPreviewState from './HostQuestionPreviewState'

const meta = {
  component: HostQuestionPreviewState,
  decorators: [withRouter, withMockGameHost],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof HostQuestionPreviewState>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    event: {
      type: GameEventType.GameQuestionPreviewHost,
      game: {
        mode: GameMode.Classic,
        pin: '123456',
      },
      question: {
        type: QuestionType.MultiChoice,
        question: 'Who painted The Starry Night?',
        points: 1000,
      },
      countdown: {
        initiatedTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story

export const ZeroToOneHundred = {
  name: '0-100',
  args: {
    event: {
      type: GameEventType.GameQuestionPreviewHost,
      game: {
        mode: GameMode.ZeroToOneHundred,
        pin: '123456',
      },
      question: {
        type: QuestionType.Range,
        question: "What percentage of the earth's surface is covered by water?",
      },
      countdown: {
        initiatedTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story

export const Long = {
  name: 'Long Question Text',
  args: {
    event: {
      type: GameEventType.GameQuestionPreviewHost,
      game: {
        mode: GameMode.Classic,
        pin: '123456',
      },
      question: {
        type: QuestionType.MultiChoice,
        question:
          'Which planet in our solar system has the shortest day, completing a full rotation faster than any other?',
        points: 1000,
      },
      countdown: {
        initiatedTime: new Date().toISOString(),
        expiryTime: new Date(Date.now() + 60 * 1000).toISOString(),
        serverTime: new Date().toISOString(),
      },
      pagination: { current: 1, total: 20 },
    },
  },
} satisfies Story
