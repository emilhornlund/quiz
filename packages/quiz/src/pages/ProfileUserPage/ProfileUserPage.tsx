import { useQuery } from '@tanstack/react-query'
import React, { FC, useState } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { LoadingSpinner, Page } from '../../components'

import { ProfileUserPageUI, UpdateUserProfileFormFields } from './components'

const ProfileUserPage: FC = () => {
  const { getUserProfile, updateUserProfile } = useQuizServiceClient()

  const [isSavingUserProfile, setIsSavingUserProfile] = useState(false)

  const {
    data,
    isLoading: isLoadingUserProfile,
    isError,
  } = useQuery({
    queryKey: ['myUserProfile'],
    queryFn: getUserProfile,
  })

  const handleChange = (request: UpdateUserProfileFormFields): void => {
    setIsSavingUserProfile(true)
    updateUserProfile(request).finally(() => setIsSavingUserProfile(false))
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
      onChange={handleChange}
    />
  )
}

export default ProfileUserPage
