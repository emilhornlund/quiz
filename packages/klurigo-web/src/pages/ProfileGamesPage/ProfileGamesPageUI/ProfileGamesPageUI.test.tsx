import { GameMode, GameParticipantType, GameStatus } from '@klurigo/common'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'

import ProfileGamesPageUI from './ProfileGamesPageUI'

const now = new Date('2025-04-27T09:54:14.000Z')

describe('ProfileGamesPageUI', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(now)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should render ProfileGamesPageUI with results', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileGamesPageUI
          items={[
            {
              id: '1de06ead-16f0-47af-b8ba-63279267ffd3',
              name: 'Math Marathon',
              mode: GameMode.ZeroToOneHundred,
              status: GameStatus.Active,
              imageCoverURL: undefined,
              participantType: GameParticipantType.PLAYER,
              rank: 1,
              score: 6400,
              created: new Date(now.getTime() - 5 * 60 * 1000), // 5 minutes ago
            },
            {
              id: '70f14923-6ae9-4daa-950d-56e2e0084c32',
              name: 'Science Challenge',
              mode: GameMode.ZeroToOneHundred,
              status: GameStatus.Completed,
              imageCoverURL: undefined,
              participantType: GameParticipantType.HOST,
              created: new Date(now.getTime() - 60 * 12 * 1000), // 12 minutes ago
            },
            {
              id: '4c14c469-dad1-4f32-8138-d251e8bf60cb',
              name: 'World History Battle',
              mode: GameMode.Classic,
              status: GameStatus.Completed,
              imageCoverURL: undefined,
              participantType: GameParticipantType.PLAYER,
              rank: 1,
              score: 9200,
              created: new Date(now.getTime() - 2 * 60 * 60 * 1000), // 2 hours ago
            },
            {
              id: '233f79b2-1b26-42eb-86bf-3097d3df789b',
              name: 'General Knowledge Quiz',
              mode: GameMode.Classic,
              status: GameStatus.Completed,
              imageCoverURL: undefined,
              participantType: GameParticipantType.PLAYER,
              rank: 2,
              score: 8500,
              created: new Date(now.getTime() - 4 * 60 * 60 * 1000), // 4 hours ago
            },
            {
              id: 'c5598fc1-3c15-45a7-83c8-55c1a1b7b8e9',
              name: 'Geography Explorer',
              mode: GameMode.Classic,
              status: GameStatus.Completed,
              imageCoverURL: undefined,
              participantType: GameParticipantType.PLAYER,
              rank: 5,
              score: 4200,
              created: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000), // 40 days ago
            },
          ]}
          total={10}
          limit={5}
          offset={0}
          onClick={() => undefined}
          onChangePagination={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render ProfileGamesPageUI with no results', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileGamesPageUI
          items={[]}
          total={0}
          limit={0}
          offset={0}
          onClick={() => undefined}
          onChangePagination={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
