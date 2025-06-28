import {
  CreateUserRequestDto,
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  FAMILY_NAME_MAX_LENGTH,
  FAMILY_NAME_REGEX,
  GIVEN_NAME_MAX_LENGTH,
  GIVEN_NAME_MIN_LENGTH,
  GIVEN_NAME_REGEX,
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_REGEX,
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@quiz/common'
import React, { FC, FormEvent, useMemo, useState } from 'react'

import { useQuizServiceClient } from '../../api/use-quiz-service-client.tsx'
import {
  IconButtonArrowRight,
  Page,
  TextField,
  Typography,
} from '../../components'

import styles from './CreateUserPage.module.scss'
import { getMessage, getTitle } from './helpers.ts'

const CreateUserPage: FC = () => {
  const { register } = useQuizServiceClient()

  const [formFields, setFormFields] = useState<CreateUserRequestDto>({
    email: '',
    password: '',
    givenName: '',
    familyName: '',
    defaultNickname: '',
  })

  const handleChangeFormField = <K extends keyof CreateUserRequestDto>(
    key: K,
    value: CreateUserRequestDto[K],
  ) => {
    setFormFields({ ...formFields, [key]: value })
  }

  const [validFormFields, setValidFormFields] = useState<{
    [key in keyof CreateUserRequestDto]: boolean
  }>({ email: false, password: false })

  const isFormValid = useMemo(
    () => Object.values(validFormFields).every((valid) => !!valid),
    [validFormFields],
  )

  const handleChangeValidFormField = <K extends keyof CreateUserRequestDto>(
    key: K,
    valid: boolean,
  ) => {
    setValidFormFields({ ...validFormFields, [key]: valid })
  }

  const [isCreatingUser, setIsCreatingUser] = useState(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    setIsCreatingUser(true)

    register({
      ...formFields,
      givenName: formFields.givenName || undefined,
      familyName: formFields.familyName || undefined,
      defaultNickname: formFields.defaultNickname || undefined,
    }).finally(() => setIsCreatingUser(false))
  }

  return (
    <Page>
      <Typography variant="title" size="medium">
        {getTitle()}
      </Typography>
      <Typography variant="text" size="small">
        {getMessage()}
      </Typography>
      <form className={styles.createUserForm} onSubmit={handleSubmit}>
        <TextField
          id="email"
          type="text"
          placeholder="Email"
          value={formFields.email}
          minLength={EMAIL_MIN_LENGTH}
          maxLength={EMAIL_MAX_LENGTH}
          regex={EMAIL_REGEX}
          disabled={isCreatingUser}
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
          disabled={isCreatingUser}
          onChange={(value) =>
            handleChangeFormField('password', value as string)
          }
          onValid={(valid) => handleChangeValidFormField('password', valid)}
          required
        />
        <TextField
          id="givenName"
          type="text"
          placeholder="Given Name"
          value={formFields.givenName}
          minLength={GIVEN_NAME_MIN_LENGTH}
          maxLength={GIVEN_NAME_MAX_LENGTH}
          regex={GIVEN_NAME_REGEX}
          disabled={isCreatingUser}
          onChange={(value) =>
            handleChangeFormField('givenName', value as string)
          }
          onValid={(valid) => handleChangeValidFormField('givenName', valid)}
        />
        <TextField
          id="familyName"
          type="text"
          placeholder="Family Name"
          value={formFields.familyName}
          minLength={FAMILY_NAME_MAX_LENGTH}
          maxLength={FAMILY_NAME_MAX_LENGTH}
          regex={FAMILY_NAME_REGEX}
          disabled={isCreatingUser}
          onChange={(value) =>
            handleChangeFormField('familyName', value as string)
          }
          onValid={(valid) => handleChangeValidFormField('familyName', valid)}
        />
        <TextField
          id="defaultNickname"
          type="text"
          placeholder="Default Nickname"
          value={formFields.defaultNickname}
          minLength={PLAYER_NICKNAME_MIN_LENGTH}
          maxLength={PLAYER_NICKNAME_MAX_LENGTH}
          regex={PLAYER_NICKNAME_REGEX}
          disabled={isCreatingUser}
          onChange={(value) =>
            handleChangeFormField('defaultNickname', value as string)
          }
          onValid={(valid) =>
            handleChangeValidFormField('defaultNickname', valid)
          }
        />
        <IconButtonArrowRight
          id="join"
          type="submit"
          kind="call-to-action"
          value="Let's go!"
          loading={isCreatingUser}
          disabled={!isFormValid || isCreatingUser}
        />
      </form>
    </Page>
  )
}

export default CreateUserPage
