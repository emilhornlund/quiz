import { GameMode, GameParticipantType, GameStatus } from '@quiz/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import { withMockAuth } from '../../../../.storybook/mockAuthContext.tsx'

import GameHistoryPageUI from './GameHistoryPageUI'

const meta = {
  title: 'Pages/GameHistoryPage',
  component: GameHistoryPageUI,
  decorators: [withRouter, withMockAuth],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GameHistoryPageUI>

export default meta
type Story = StoryObj<typeof meta>

export const Default = {
  args: {
    items: [
      {
        id: uuidv4(),
        name: 'Math Marathon',
        mode: GameMode.ZeroToOneHundred,
        status: GameStatus.Active,
        imageCoverURL: undefined,
        participantType: GameParticipantType.PLAYER,
        rank: 1,
        score: 6400,
        created: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      },
      {
        id: uuidv4(),
        name: 'Science Challenge',
        mode: GameMode.ZeroToOneHundred,
        status: GameStatus.Completed,
        imageCoverURL: undefined,
        participantType: GameParticipantType.HOST,
        created: new Date(Date.now() - 60 * 12 * 1000), // 12 minutes ago
      },
      {
        id: uuidv4(),
        name: 'World History Battle',
        mode: GameMode.Classic,
        status: GameStatus.Completed,
        imageCoverURL: undefined,
        participantType: GameParticipantType.PLAYER,
        rank: 1,
        score: 9200,
        created: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      },
      {
        id: uuidv4(),
        name: 'General Knowledge Quiz',
        mode: GameMode.Classic,
        status: GameStatus.Completed,
        imageCoverURL: undefined,
        participantType: GameParticipantType.PLAYER,
        rank: 2,
        score: 8500,
        created: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
      },
      {
        id: uuidv4(),
        name: 'Geography Explorer',
        mode: GameMode.Classic,
        status: GameStatus.Completed,
        imageCoverURL: undefined,
        participantType: GameParticipantType.PLAYER,
        rank: 5,
        score: 4200,
        created: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
      },
    ],
    total: 10,
    limit: 5,
    offset: 0,
    onChangePagination: () => undefined,
  },
} satisfies Story

export const Empty = {
  args: {
    items: [],
    total: 0,
    limit: 0,
    offset: 0,
    onChangePagination: () => undefined,
  },
} satisfies Story
