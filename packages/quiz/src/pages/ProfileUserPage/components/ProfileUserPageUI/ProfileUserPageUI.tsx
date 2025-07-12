import React, { FC } from 'react'

import { Page, PageDivider } from '../../../../components'

import {
  UpdateUserDetailsFormFields,
  UpdateUserPasswordFormFields,
  UserDetailsForm,
  UserPasswordForm,
} from './components'

export interface ProfileUserPageUIProps {
  values: UpdateUserDetailsFormFields
  loading: boolean
  loadingPassword: boolean
  onChange: (request: UpdateUserDetailsFormFields) => void
  onChangePassword: (request: UpdateUserPasswordFormFields) => void
  onClickResendVerificationEmail: () => void
}

const ProfileUserPageUI: FC<ProfileUserPageUIProps> = ({
  values,
  loading,
  loadingPassword,
  onChange,
  onChangePassword,
  onClickResendVerificationEmail,
}) => (
  <Page align="start" discover profile>
    <UserDetailsForm
      values={values}
      loading={loading}
      onChange={onChange}
      onClickResendVerificationEmail={onClickResendVerificationEmail}
    />
    <PageDivider />
    <UserPasswordForm loading={loadingPassword} onChange={onChangePassword} />
  </Page>
)

export default ProfileUserPageUI
