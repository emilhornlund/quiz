import React, { FC } from 'react'

import { Page } from '../../components'

import { Quizzes } from './components'

const ProfilePage: FC = () => (
  <Page align="start" discover profile>
    <Quizzes />
  </Page>
)

export default ProfilePage
