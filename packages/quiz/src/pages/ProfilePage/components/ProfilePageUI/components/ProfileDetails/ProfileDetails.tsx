import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import {
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@quiz/common'
import React, { FC, FormEvent, useState } from 'react'

import { Button, TextField, Typography } from '../../../../../../components'
import { classNames } from '../../../../../../utils/helpers.ts'

import styles from './ProfileDetails.module.scss'

export interface ProfileDetailsProps {
  nickname?: string
  onChange: (nickname: string) => void
}

const ProfileDetails: FC<ProfileDetailsProps> = ({ nickname, onChange }) => {
  const [tmpNickname, setTmpNickname] = useState<string | undefined>(nickname)
  const [tmpNicknameValid, setTmpNicknameValid] = useState<boolean>(false)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (tmpNickname) {
      onChange(tmpNickname)
    }
  }

  return (
    <>
      <Typography variant="subtitle">Update Your Profile</Typography>
      <Typography variant="text" size="medium">
        Customize your player profile by updating your nickname. Your nickname
        is how other players will see you in quizzes.
      </Typography>
      <form className={styles.profileDetailsForm} onSubmit={handleSubmit}>
        <div className={styles.row}>
          <TextField
            id="nickname"
            type="text"
            placeholder="Nickname"
            value={tmpNickname ?? ''}
            minLength={PLAYER_NICKNAME_MIN_LENGTH}
            maxLength={PLAYER_NICKNAME_MAX_LENGTH}
            regex={PLAYER_NICKNAME_REGEX}
            onChange={(value) => setTmpNickname(value as string)}
            onValid={setTmpNicknameValid}
            required
          />
        </div>
        <div className={classNames(styles.row, styles.button)}>
          <Button
            id="update-player-button"
            type="submit"
            kind="call-to-action"
            size="small"
            value="Save"
            icon={faFloppyDisk}
            iconPosition="leading"
            disabled={!tmpNicknameValid}
            onClick={() => undefined}
          />
        </div>
      </form>
    </>
  )
}

export default ProfileDetails
