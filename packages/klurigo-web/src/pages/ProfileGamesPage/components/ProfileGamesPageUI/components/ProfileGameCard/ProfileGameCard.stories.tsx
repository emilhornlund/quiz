import { GameMode, GameParticipantType, GameStatus } from '@klurigo/common'
import type { Meta, StoryObj } from '@storybook/react'
import { withRouter } from 'storybook-addon-remix-react-router'
import { v4 as uuidv4 } from 'uuid'

import { withMockAuth } from '../../../../../../../.storybook/mockAuthContext'

import ProfileGameCard from './ProfileGameCard'

const makeGame = (overrides?: object) => ({
  id: uuidv4(),
  name: 'The Ultimate Geography Challenge',
  mode: GameMode.Classic,
  status: GameStatus.Completed,
  imageCoverURL: 'https://picsum.photos/seed/geo/400/250',
  participantType: GameParticipantType.PLAYER,
  rank: 1,
  score: 9200,
  created: new Date(Date.now() - 1000 * 60 * 60 * 2),
  ...overrides,
})

const meta = {
  title: 'Pages/ProfileGamesPage/ProfileGameCard',
  component: ProfileGameCard,
  decorators: [withRouter, withMockAuth],
  parameters: {
    layout: 'centered',
  },
  args: {
    onClick: () => undefined,
  },
} satisfies Meta<typeof ProfileGameCard>

export default meta
type Story = StoryObj<typeof meta>

export const CompletedPlayer = {
  args: {
    game: makeGame(),
  },
} satisfies Story

export const CompletedPlayerRank2 = {
  args: {
    game: makeGame({ rank: 2, score: 7400 }),
  },
} satisfies Story

export const CompletedHost = {
  args: {
    game: makeGame({
      participantType: GameParticipantType.HOST,
      name: 'Science Challenge',
      mode: GameMode.ZeroToOneHundred,
    }),
  },
} satisfies Story

export const ActiveGame = {
  args: {
    game: makeGame({
      status: GameStatus.Active,
      name: 'Math Marathon',
      created: new Date(Date.now() - 5 * 60 * 1000),
    }),
  },
} satisfies Story

export const NoCoverImage = {
  args: {
    game: makeGame({ imageCoverURL: undefined, name: 'World History Battle' }),
  },
} satisfies Story

export const LongTitle = {
  args: {
    game: makeGame({
      name: 'This is an extremely long game title that will definitely overflow and show ellipsis',
    }),
  },
} satisfies Story
