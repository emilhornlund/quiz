import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import {
  EMAIL_MAX_LENGTH,
  EMAIL_MIN_LENGTH,
  EMAIL_REGEX,
  FAMILY_NAME_MAX_LENGTH,
  FAMILY_NAME_MIN_LENGTH,
  FAMILY_NAME_REGEX,
  GIVEN_NAME_MAX_LENGTH,
  GIVEN_NAME_MIN_LENGTH,
  GIVEN_NAME_REGEX,
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
  UpdateUserProfileRequestDto,
} from '@quiz/common'
import React, { FC, FormEvent, useEffect, useMemo, useState } from 'react'

import { Button, Page, TextField, Typography } from '../../../../components'

import styles from './ProfilePageUI.module.scss'

export type UpdateUserProfileFormFields = UpdateUserProfileRequestDto

export interface ProfilePageUIProps {
  values: UpdateUserProfileFormFields
  loading: boolean
  onChange: (request: UpdateUserProfileFormFields) => void
}

const ProfilePageUI: FC<ProfilePageUIProps> = ({
  values,
  loading,
  onChange,
}) => {
  const [formFields, setFormFields] =
    useState<UpdateUserProfileFormFields>(values)

  useEffect(() => {
    setFormFields(values)
  }, [values])

  const handleChangeFormField = <K extends keyof UpdateUserProfileFormFields>(
    key: K,
    value: UpdateUserProfileFormFields[K],
  ) => {
    setFormFields({ ...formFields, [key]: value })
  }

  const [validFormFields, setValidFormFields] = useState<{
    [key in keyof UpdateUserProfileFormFields]: boolean
  }>({
    email: false,
    givenName: false,
    familyName: false,
    defaultNickname: false,
  })

  const isFormValid = useMemo(
    () => Object.values(validFormFields).every((valid) => !!valid),
    [validFormFields],
  )

  const handleChangeValidFormField = <
    K extends keyof UpdateUserProfileFormFields,
  >(
    key: K,
    valid: boolean,
  ) => {
    if (validFormFields[key] !== valid) {
      setValidFormFields((prevState) => {
        return { ...prevState, [key]: valid }
      })
    }
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onChange(formFields)
  }

  return (
    <Page align="start" discover profile>
      <Typography variant="subtitle">Shape your quiz identity</Typography>
      <Typography variant="text" size="medium">
        Update your personal details to keep your profile up to date. Your
        information helps personalize your quiz experience and lets others
        recognize you during games.
      </Typography>
      <form className={styles.profileDetailsForm} onSubmit={handleSubmit}>
        <TextField
          id="email"
          type="text"
          placeholder="Email"
          value={formFields.email}
          minLength={EMAIL_MIN_LENGTH}
          maxLength={EMAIL_MAX_LENGTH}
          regex={EMAIL_REGEX}
          disabled={loading}
          onChange={(value) => handleChangeFormField('email', value as string)}
          onValid={(valid) => handleChangeValidFormField('email', valid)}
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
          disabled={loading}
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
          minLength={FAMILY_NAME_MIN_LENGTH}
          maxLength={FAMILY_NAME_MAX_LENGTH}
          regex={FAMILY_NAME_REGEX}
          disabled={loading}
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
          disabled={loading}
          onChange={(value) =>
            handleChangeFormField('defaultNickname', value as string)
          }
          onValid={(valid) =>
            handleChangeValidFormField('defaultNickname', valid)
          }
        />
        <Button
          id="update-user-button"
          type="submit"
          kind="call-to-action"
          size="normal"
          value="Save"
          icon={faFloppyDisk}
          loading={loading}
          disabled={!isFormValid || loading}
        />
      </form>
    </Page>
  )
}

export default ProfilePageUI
