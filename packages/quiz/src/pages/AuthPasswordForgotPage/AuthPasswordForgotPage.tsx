import type { FC } from 'react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import type { AuthPasswordForgotFormFields } from './components'
import { AuthPasswordForgotPageUI } from './components'

const AuthPasswordForgotPage: FC = () => {
  const navigate = useNavigate()

  const { sendPasswordResetEmail } = useQuizServiceClient()

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = (values: AuthPasswordForgotFormFields): void => {
    setIsLoading(true)
    sendPasswordResetEmail({ email: values.email })
      .then(() => navigate('/'))
      .finally(() => setIsLoading(false))
  }

  return (
    <AuthPasswordForgotPageUI loading={isLoading} onSubmit={handleSubmit} />
  )
}

export default AuthPasswordForgotPage
