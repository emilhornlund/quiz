import React, { FC } from 'react'

import { Page } from '../../components'

import { Quizzes } from './components'

const ProfilePage: FC = () => (
  <Page align="start" width="medium">
    <Quizzes />
  </Page>
)

export default ProfilePage
