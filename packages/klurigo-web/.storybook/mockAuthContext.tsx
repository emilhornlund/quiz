import { Authority, GameParticipantType } from '@klurigo/common'
import type { Decorator } from '@storybook/react'

import type { AuthContextType } from '../src/context/auth'
import { AuthContext } from '../src/context/auth'

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
  revokeUser: () => Promise.reject(),
  revokeGame: () => Promise.reject(),
}

/**
 * Wraps a story in AuthContext.Provider using `mockAuth`.
 */
export const withMockAuth: Decorator = (Story, context) => (
  <AuthContext.Provider value={mockAuth}>
    <Story {...context.args} />
  </AuthContext.Provider>
)
