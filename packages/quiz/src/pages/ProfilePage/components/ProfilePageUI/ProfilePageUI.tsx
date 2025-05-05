import { faFloppyDisk } from '@fortawesome/free-solid-svg-icons'
import {
  PLAYER_NICKNAME_MAX_LENGTH,
  PLAYER_NICKNAME_MIN_LENGTH,
  PLAYER_NICKNAME_REGEX,
} from '@quiz/common'
import React, { FC, FormEvent, useEffect, useState } from 'react'

import { Button, Page, TextField, Typography } from '../../../../components'
import { Player } from '../../../../models'
import { classNames } from '../../../../utils/helpers.ts'

import styles from './ProfilePageUI.module.scss'

export interface ProfilePageUIProps {
  player?: Player
  onNicknameChange: (nickname: string) => void
}

const ProfilePageUI: FC<ProfilePageUIProps> = ({
  player,
  onNicknameChange,
}) => {
  const [tmpNickname, setTmpNickname] = useState<string | undefined>(
    player?.nickname,
  )
  const [tmpNicknameValid, setTmpNicknameValid] = useState<boolean>(false)

  useEffect(() => {
    setTmpNickname(player?.nickname)
  }, [player])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()

    if (tmpNickname) {
      onNicknameChange(tmpNickname)
    }
  }

  return (
    <Page align="center" discover profile>
      <Typography variant="subtitle">Update Your Profile</Typography>
      <Typography variant="text" size="medium">
        Customize your player profile by updating your nickname. Your nickname
        is how other players will see you in quizzes.
      </Typography>
      <form className={styles.profileDetailsForm} onSubmit={handleSubmit}>
        <div className={classNames(styles.column, styles.full)}>
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
        <div className={styles.column}>
          <Button
            id="update-player-button"
            type="submit"
            kind="call-to-action"
            size="normal"
            icon={faFloppyDisk}
            disabled={!tmpNicknameValid}
          />
        </div>
      </form>
    </Page>
  )
}

export default ProfilePageUI
