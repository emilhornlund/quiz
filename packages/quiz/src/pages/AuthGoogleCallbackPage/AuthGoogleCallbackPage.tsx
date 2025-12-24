import type { FC } from 'react'
import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import { notifyError } from '../../utils/notification.ts'
import {
  GOOGLE_OAUTH_STORAGE_KEY,
  GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY,
  GOOGLE_OAUTH_STORAGE_STATE_KEY,
} from '../../utils/oauth.ts'

import { AuthGoogleCallbackPageUI } from './components'

const AuthGoogleCallbackPage: FC = () => {
  const navigate = useNavigate()

  const { googleExchangeCode } = useQuizServiceClient()

  const hasExchangedRef = useRef(false)

  const [searchParams] = useSearchParams()
  useEffect(() => {
    if (hasExchangedRef.current) {
      return
    }
    hasExchangedRef.current = true

    const code = searchParams.get('code') || undefined
    const state = searchParams.get('state') || undefined

    const googleOAuthStorage = JSON.parse(
      sessionStorage.getItem(GOOGLE_OAUTH_STORAGE_KEY) || '{}',
    ) as Record<string, string>

    const storedState =
      googleOAuthStorage?.[GOOGLE_OAUTH_STORAGE_STATE_KEY] || undefined
    const codeVerifier =
      googleOAuthStorage?.[GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY] || undefined

    if (!code || state !== storedState || !codeVerifier) {
      notifyError('Google OAuth error. Please try again.')
      navigate('/auth/login')
      return
    }

    googleExchangeCode({ code, codeVerifier })
      .then(() => navigate('/'))
      .catch(() => navigate('/auth/login'))
  }, [searchParams, navigate, googleExchangeCode])

  return <AuthGoogleCallbackPageUI />
}

export default AuthGoogleCallbackPage
