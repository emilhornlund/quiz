import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import { CreateUserFormFields, CreateUserPageUI } from './components'

const CreateUserPage: FC = () => {
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

  return <CreateUserPageUI loading={isLoading} onSubmit={handleSubmit} />
}

export default CreateUserPage
