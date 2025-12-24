import type { FC } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import type { CreateUserFormFields } from './components'
import { AuthRegisterPageUI } from './components'

const AuthRegisterPage: FC = () => {
  const navigate = useNavigate()

  const { login, register } = useQuizServiceClient()

  const [isLoading, setIsLoading] = useState<boolean>(false)

  const handleSubmit = (values: CreateUserFormFields) => {
    setIsLoading(true)
    register(values)
      .then(() => login({ email: values.email, password: values.password }))
      .then(() => navigate('/'))
      .finally(() => setIsLoading(false))
  }

  return <AuthRegisterPageUI loading={isLoading} onSubmit={handleSubmit} />
}

export default AuthRegisterPage
