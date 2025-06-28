import {
  AuthLoginRequestDto,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
} from '@quiz/common'
import React, { FC, FormEvent, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import {
  IconButtonArrowRight,
  Page,
  TextField,
  Typography,
} from '../../components'

import { getMessage, getTitle } from './helpers.ts'
import styles from './LoginPage.module.scss'

const LoginPage: FC = () => {
  const { login } = useQuizServiceClient()

  const navigate = useNavigate()

  const [formFields, setFormFields] = useState<AuthLoginRequestDto>({
    email: '',
    password: '',
  })

  const handleChangeFormField = <K extends keyof AuthLoginRequestDto>(
    key: K,
    value: AuthLoginRequestDto[K],
  ) => {
    setFormFields({ ...formFields, [key]: value })
  }

  const [validFormFields, setValidFormFields] = useState<{
    [key in keyof AuthLoginRequestDto]: boolean
  }>({ email: false, password: false })

  const isFormValid = useMemo(
    () => Object.values(validFormFields).every((valid) => !!valid),
    [validFormFields],
  )

  const handleChangeValidFormField = <K extends keyof AuthLoginRequestDto>(
    key: K,
    valid: boolean,
  ) => {
    setValidFormFields({ ...validFormFields, [key]: valid })
  }

  const [isLoggingIn, setIsLoggingIn] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    setIsLoggingIn(true)

    login({ email: formFields.email, password: formFields.password })
      .then(() => {
        navigate('/')
      })
      .finally(() => setIsLoggingIn(false))
  }

  return (
    <Page>
      <Typography variant="title" size="medium">
        {getTitle()}
      </Typography>
      <Typography variant="text" size="small">
        {getMessage()}
      </Typography>
      <form className={styles.loginForm} onSubmit={handleSubmit}>
        <TextField
          id="email"
          type="text"
          placeholder="Email"
          value={formFields.email}
          minLength={EMAIL_MIN_LENGTH}
          maxLength={EMAIL_MAX_LENGTH}
          regex={EMAIL_REGEX}
          disabled={isLoggingIn}
          onChange={(value) => handleChangeFormField('email', value as string)}
          onValid={(valid) => handleChangeValidFormField('email', valid)}
          required
        />
        <TextField
          id="password"
          type="password"
          placeholder="Password"
          value={formFields.password}
          minLength={PASSWORD_MIN_LENGTH}
          maxLength={PASSWORD_MAX_LENGTH}
          regex={{
            value: PASSWORD_REGEX,
            message:
              'Must include at least ≥2 uppercase, ≥2 lowercase, ≥2 digits, ≥2 symbols.',
          }}
          disabled={isLoggingIn}
          onChange={(value) =>
            handleChangeFormField('password', value as string)
          }
          onValid={(valid) => handleChangeValidFormField('password', valid)}
          required
        />
        <IconButtonArrowRight
          id="join"
          type="submit"
          kind="call-to-action"
          value="Let's go!"
          loading={isLoggingIn}
          disabled={!isFormValid || isLoggingIn}
        />
      </form>
      <Link to={'/auth/register'}>
        <Typography variant="link">
          Don&#39;t have an account yet? Create one!
        </Typography>
      </Link>
    </Page>
  )
}

export default LoginPage
