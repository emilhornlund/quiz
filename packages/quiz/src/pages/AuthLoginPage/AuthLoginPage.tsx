import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import { AuthLoginPageUI, LoginFormFields } from './components'

const AuthLoginPage: FC = () => {
  const { login } = useQuizServiceClient()

  const navigate = useNavigate()

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (values: LoginFormFields) => {
    setIsLoading(true)
    login({ email: values.email, password: values.password })
      .then(() => {
        navigate('/')
      })
      .finally(() => setIsLoading(false))
  }

  return <AuthLoginPageUI loading={isLoading} onSubmit={handleSubmit} />
}

export default AuthLoginPage
