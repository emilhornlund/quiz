import { Authority, GameParticipantType } from '@quiz/common'
import { PartialStoryFn } from '@storybook/core/csf'
import type { Decorator, ReactRenderer, StoryContext } from '@storybook/react'
import React from 'react'

import { AuthContext, AuthContextType } from '../src/context/auth'

/**
 * Storybook decorator supplying a mock AuthContext with dummy tokens
 * and authentication flags for rendering components in isolation.
 */
const mockAuth: AuthContextType = {
  user: {
    ACCESS: {
      sub: 'MOCK',
      exp: -1,
      authorities: [
        Authority.Game,
        Authority.User,
        Authority.Quiz,
        Authority.Media,
      ],
      token: 'MOCK',
    },
    REFRESH: {
      sub: 'MOCK',
      exp: -1,
      authorities: [Authority.RefreshAuth],
      token: 'MOCK',
    },
  },
  game: {
    ACCESS: {
      sub: 'MOCK',
      exp: -1,
      authorities: [Authority.Game],
      token: 'MOCK',
      gameId: 'MOCK',
      participantType: GameParticipantType.HOST,
    },
    REFRESH: {
      sub: 'MOCK',
      exp: -1,
      authorities: [Authority.RefreshAuth],
      token: 'MOCK',
      gameId: 'MOCK',
      participantType: GameParticipantType.HOST,
    },
  },
  isUserAuthenticated: true,
  isGameAuthenticated: true,
  setTokenPair: () => undefined,
  revokeUser: () => undefined,
  revokeGame: () => undefined,
}

/**
 * Wraps a story in AuthContext.Provider using `mockAuth`.
 */
export const withMockAuth: Decorator = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Story: PartialStoryFn<ReactRenderer, any>,
  context: StoryContext,
) => (
  <AuthContext.Provider value={mockAuth}>
    <Story {...context} />
  </AuthContext.Provider>
)
