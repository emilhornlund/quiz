import React, { FC, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { useAuthContext } from '../../context/auth'

import { AuthVerifyPageUI } from './components'

const AuthVerifyPage: FC = () => {
  const navigate = useNavigate()

  const { isUserAuthenticated } = useAuthContext()

  const [searchParams] = useSearchParams()

  const { verifyEmail } = useQuizServiceClient()

  const [isLoading, setLoading] = useState<boolean>(true)
  const [hasError, setHasError] = useState<boolean>(false)

  const hasVerifiedRef = useRef(false)

  const isVerified = useMemo(
    () => !isLoading && !hasError,
    [isLoading, hasError],
  )

  useEffect(() => {
    const token = searchParams.get('token') || undefined
    if (!token) {
      navigate('/')
    } else if (!hasVerifiedRef.current) {
      hasVerifiedRef.current = true
      setLoading(true)
      verifyEmail(token)
        .then(() => {
          setHasError(false)
        })
        .catch(() => setHasError(true))
        .finally(() => setLoading(false))
    }
  }, [searchParams, navigate, verifyEmail])

  return (
    <AuthVerifyPageUI
      verified={isVerified}
      loggedIn={isUserAuthenticated}
      error={hasError}
    />
  )
}

export default AuthVerifyPage
