import { faCircleUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { PLAYER_NICKNAME_REGEX } from '@quiz/common'
import React, { FC, FormEvent, useEffect, useMemo, useState } from 'react'

import { Button, TextField } from '../../../../components'
import { useClientContext } from '../../../../context/client'

import styles from './ProfileSubpage.module.scss'

const ProfileSubpage: FC = () => {
  const { player } = useClientContext()

  const [nickname, setNickname] = useState<string>('')
  const [nicknameValid, setNicknameValid] = useState<boolean>(false)

  const isValid = useMemo<boolean>(() => nicknameValid, [nicknameValid])

  useEffect(() => {
    setNickname(player?.nickname ?? '')
  }, [player])

  const handlePlayerSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
  }

  return (
    <div className={styles.profileSubpage}>
      <div className={styles.avatar}>
        <FontAwesomeIcon icon={faCircleUser} />
      </div>
      <form className={styles.playerForm} onSubmit={handlePlayerSubmit}>
        <TextField
          id="nickname"
          type="text"
          placeholder="Nickname"
          value={nickname}
          regex={PLAYER_NICKNAME_REGEX}
          onChange={(value) => setNickname(value as string)}
          onValid={setNicknameValid}
          required
        />
        <Button
          id="save-button"
          type="submit"
          kind="secondary"
          value="Save"
          disabled={!isValid}
        />
      </form>
    </div>
  )
}

export default ProfileSubpage
