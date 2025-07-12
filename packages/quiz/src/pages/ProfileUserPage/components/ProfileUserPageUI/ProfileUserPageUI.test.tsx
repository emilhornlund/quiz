import { render } from '@testing-library/react'
import React from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ProfileUserPageUI from './ProfileUserPageUI.tsx'

describe('ProfileUserPageUI', () => {
  it('should render ProfileUserPageUI', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          values={{
            email: '',
            unverifiedEmail: undefined,
            givenName: '',
            familyName: '',
            defaultNickname: '',
          }}
          loading={false}
          loadingPassword={false}
          onChange={() => undefined}
          onChangePassword={() => undefined}
          onClickResendVerificationEmail={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })

  it('should render ProfileUserPageUI with prepopulated values', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          values={{
            email: 'user@example.com',
            unverifiedEmail: undefined,
            givenName: 'John',
            familyName: 'Appleseed',
            defaultNickname: 'FrostyBear',
          }}
          loading={false}
          loadingPassword={false}
          onChange={() => undefined}
          onChangePassword={() => undefined}
          onClickResendVerificationEmail={() => undefined}
        />
      </MemoryRouter>,
    )

    expect(container).toMatchSnapshot()
  })
})
