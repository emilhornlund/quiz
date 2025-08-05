import React, { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import config from '../../config.ts'
import {
  generateRandomString,
  GOOGLE_OAUTH_STORAGE_KEY,
  GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY,
  GOOGLE_OAUTH_STORAGE_STATE_KEY,
  sha256,
} from '../../utils/oauth.ts'

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

  const handleGoogleLogin = async (): Promise<void> => {
    const state = generateRandomString(48)
    const pkceVerifier = generateRandomString(64)

    sessionStorage.setItem(
      GOOGLE_OAUTH_STORAGE_KEY,
      JSON.stringify({
        [GOOGLE_OAUTH_STORAGE_STATE_KEY]: state,
        [GOOGLE_OAUTH_STORAGE_PKCE_VERIFIER_KEY]: pkceVerifier,
      }),
    )

    const codeChallenge = await sha256(pkceVerifier)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: Record<string, any> = new URLSearchParams()
    params.append('client_id', config.googleClientId)
    params.append('redirect_uri', config.googleRedirectUri)
    params.append('response_type', 'code')
    params.append('scope', ['openid', 'profile', 'email'].join(' '))
    params.append('state', state)
    params.append('code_challenge', codeChallenge)
    params.append('code_challenge_method', 'S256')

    window.location.href = `https://accounts.google.com/o/oauth2/auth?${params}`
  }

  return (
    <AuthLoginPageUI
      loading={isLoading}
      onSubmit={handleSubmit}
      onGoogleClick={handleGoogleLogin}
    />
  )
}

export default AuthLoginPage
