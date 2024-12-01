import React, { FC } from 'react'

import { Page } from '../../components'

import { ProfileSubpage, QuizSubpage } from './components'

const ProfilePage: FC = () => {
  return (
    <Page>
      <ProfileSubpage />
      <QuizSubpage />
    </Page>
  )
}

export default ProfilePage
