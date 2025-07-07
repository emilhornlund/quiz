import { useQuery } from '@tanstack/react-query'
import React, { FC, useState } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'

import { ProfileUserPageUI, UpdateUserDetailsFormFields } from './components'
import { UpdateUserPasswordFormFields } from './components/ProfileUserPageUI/components'

const ProfileUserPage: FC = () => {
  const { getUserProfile, updateUserProfile, updateUserPassword } =
    useQuizServiceClient()

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
    setIsSavingUserProfile(true)
    updateUserProfile(request).finally(() => setIsSavingUserProfile(false))
  }

  const handlePasswordChange = (
    request: UpdateUserPasswordFormFields,
  ): void => {
    setIsSavingUserPassword(true)
    updateUserPassword(request).finally(() => setIsSavingUserPassword(false))
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
      values={{
        email: data.email,
        givenName: data.givenName,
        familyName: data.familyName,
        defaultNickname: data.defaultNickname,
      }}
      loading={isLoadingUserProfile || isSavingUserProfile}
      loadingPassword={isSavingUserPassword}
      onChange={handleChange}
      onChangePassword={handlePasswordChange}
    />
  )
}

export default ProfileUserPage
