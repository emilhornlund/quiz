import { PartialStoryFn } from '@storybook/core/csf'
import type { Decorator, ReactRenderer, StoryContext } from '@storybook/react'
import React from 'react'

import { AuthContext, AuthContextType } from '../src/context/auth'

const mockAuth: AuthContextType = {
  accessToken: 'MOCK',
  refreshToken: 'MOCK',
  isLoggedIn: true,
  setAuth: () => undefined,
  logout: () => undefined,
}

export const withMockAuth: Decorator = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Story: PartialStoryFn<ReactRenderer, any>,
  context: StoryContext,
) => (
  <AuthContext.Provider value={mockAuth}>
    <Story {...context} />
  </AuthContext.Provider>
)
