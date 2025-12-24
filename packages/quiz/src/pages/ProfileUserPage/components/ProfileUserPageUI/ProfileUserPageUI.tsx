import { AuthProvider } from '@quiz/common'
import type { FC } from 'react'

import { Page, PageDivider } from '../../../../components'

import type {
  UpdateUserDetailsFormFields,
  UpdateUserPasswordFormFields,
} from './components'
import { UserDetailsForm, UserPasswordForm } from './components'

export interface ProfileUserPageUIProps {
  authProvider: AuthProvider
  values: UpdateUserDetailsFormFields
  loading: boolean
  loadingPassword: boolean
  onChange: (request: UpdateUserDetailsFormFields) => void
  onChangePassword: (request: UpdateUserPasswordFormFields) => void
  onClickResendVerificationEmail: () => void
}

const ProfileUserPageUI: FC<ProfileUserPageUIProps> = ({
  authProvider,
  values,
  loading,
  loadingPassword,
  onChange,
  onChangePassword,
  onClickResendVerificationEmail,
}) => (
  <Page align="start" discover profile>
    <UserDetailsForm
      authProvider={authProvider}
      values={values}
      loading={loading}
      onChange={onChange}
      onClickResendVerificationEmail={onClickResendVerificationEmail}
    />
    {authProvider === AuthProvider.Local && (
      <>
        <PageDivider />
        <UserPasswordForm
          loading={loadingPassword}
          onChange={onChangePassword}
        />
      </>
    )}
  </Page>
)

export default ProfileUserPageUI
