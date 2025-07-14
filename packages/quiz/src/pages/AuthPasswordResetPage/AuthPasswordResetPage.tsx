import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { isTokenExpired } from '../../api/api-utils.ts'
import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'

import {
  AuthPasswordResetFormFields,
  AuthPasswordResetPageUI,
} from './components'

const AuthPasswordResetPage: FC = () => {
  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const token = useMemo(
    () => searchParams.get('token') || undefined,
    [searchParams],
  )

  const { resetPassword } = useQuizServiceClient()

  const [isLoading, setIsLoading] = useState(false)
  const [hasError, setHasError] = useState<boolean>(false)
  const hasResetPasswordRef = useRef(false)

  useEffect(() => {
    setHasError(!token || isTokenExpired(token))
  }, [token])

  const handleSubmit = (values: AuthPasswordResetFormFields): void => {
    if (token && !isLoading && !hasResetPasswordRef.current) {
      setIsLoading(true)
      hasResetPasswordRef.current = true
      resetPassword(values, token)
        .then(() => {
          setHasError(false)
          navigate('/auth/login')
        })
        .catch(() => setHasError(true))
        .finally(() => setIsLoading(false))
    }
  }

  return (
    <AuthPasswordResetPageUI
      loading={isLoading}
      error={hasError}
      onSubmit={handleSubmit}
    />
  )
}

export default AuthPasswordResetPage
