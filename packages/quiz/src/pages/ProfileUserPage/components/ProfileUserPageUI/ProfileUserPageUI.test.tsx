import { AuthProvider } from '@quiz/common'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'

import ProfileUserPageUI from './ProfileUserPageUI.tsx'

describe('ProfileUserPageUI', () => {
  it('should render ProfileUserPageUI for Local auth provider', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          authProvider={AuthProvider.Local}
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

  it('should render ProfileUserPageUI for Google auth provider', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          authProvider={AuthProvider.Google}
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

  it('should render ProfileUserPageUI with prepopulated values for Local auth provider', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          authProvider={AuthProvider.Local}
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

  it('should render ProfileUserPageUI with prepopulated values for Google auth provider', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          authProvider={AuthProvider.Google}
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

  it('should render ProfileUserPageUI with unverified email for Local auth provider', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          authProvider={AuthProvider.Local}
          values={{
            email: 'user@example.com',
            unverifiedEmail: 'user@example.com',
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

  it('should render ProfileUserPageUI with unverified email for Google auth provider', async () => {
    const { container } = render(
      <MemoryRouter>
        <ProfileUserPageUI
          authProvider={AuthProvider.Google}
          values={{
            email: 'user@example.com',
            unverifiedEmail: 'user@example.com',
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
