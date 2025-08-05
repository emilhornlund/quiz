import { AuthProvider } from '@quiz/common'
import React, { FC } from 'react'

import { LegacyInfoCard, Page, PageDivider } from '../../../../components'

import {
  UpdateUserDetailsFormFields,
  UpdateUserPasswordFormFields,
  UserDetailsForm,
  UserPasswordForm,
} from './components'

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
    <LegacyInfoCard />
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
