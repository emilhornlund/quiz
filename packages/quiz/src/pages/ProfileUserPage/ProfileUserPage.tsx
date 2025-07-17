import { AuthProvider } from '@quiz/common'
import { useQuery } from '@tanstack/react-query'
import React, { FC, useState } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'

import { ProfileUserPageUI, UpdateUserDetailsFormFields } from './components'
import { UpdateUserPasswordFormFields } from './components/ProfileUserPageUI/components'

const ProfileUserPage: FC = () => {
  const {
    getUserProfile,
    updateUserProfile,
    updateUserPassword,
    resendVerificationEmail,
  } = useQuizServiceClient()

  const [isSavingUserProfile, setIsSavingUserProfile] = useState(false)
  const [isSavingUserPassword, setIsSavingUserPassword] = useState(false)

  const {
    data,
    isLoading: isLoadingUserProfile,
    isError,
  } = useQuery({
    queryKey: ['myUserProfile'],
    queryFn: getUserProfile,
  })

  const handleChange = (request: UpdateUserDetailsFormFields): void => {
    if (data?.authProvider) {
      setIsSavingUserProfile(true)
      updateUserProfile({
        ...(data.authProvider === AuthProvider.Local
          ? {
              authProvider: AuthProvider.Local,
              email: request.email,
              givenName: request.givenName,
              familyName: request.familyName,
              defaultNickname: request.defaultNickname,
            }
          : {
              authProvider: AuthProvider.Google,
              defaultNickname: request.defaultNickname,
            }),
      }).finally(() => setIsSavingUserProfile(false))
    }
  }

  const handlePasswordChange = (
    request: UpdateUserPasswordFormFields,
  ): void => {
    setIsSavingUserPassword(true)
    updateUserPassword(request).finally(() => setIsSavingUserPassword(false))
  }

  const handleResendVerificationEmail = () => {
    resendVerificationEmail().then(() => {})
  }

  if (!data || isLoadingUserProfile || isError) {
    return (
      <Page profile>
        <LoadingSpinner />
      </Page>
    )
  }

  return (
    <ProfileUserPageUI
      authProvider={data.authProvider}
      values={{
        email: data.unverifiedEmail ?? data.email,
        unverifiedEmail: data.unverifiedEmail,
        givenName: data.givenName,
        familyName: data.familyName,
        defaultNickname: data.defaultNickname,
      }}
      loading={isLoadingUserProfile || isSavingUserProfile}
      loadingPassword={isSavingUserPassword}
      onChange={handleChange}
      onChangePassword={handlePasswordChange}
      onClickResendVerificationEmail={handleResendVerificationEmail}
    />
  )
}

export default ProfileUserPage
