import React, { FC, FormEvent, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import {
  IconButtonArrowLeft,
  IconButtonArrowRight,
  Page,
  TextField,
} from '../../components'

import { getMessage, getTitle } from './helpers.ts'
import styles from './JoinPage.module.scss'

const JoinPage: FC = () => {
  const navigate = useNavigate()

  const [nickname, setNickname] = useState<string>()

  const title = useMemo<string>(() => getTitle(), [])
  const message = useMemo<string>(() => getMessage(), [])

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
  }

  return (
    <Page
      header={
        <IconButtonArrowLeft
          id="back-button"
          type="button"
          kind="secondary"
          size="small"
          value="Back"
          onClick={() => navigate(-1)}
        />
      }>
      <div className={styles.main}>
        <div className={styles.title}>{title}</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.form}>
          <form onSubmit={handleSubmit}>
            <TextField
              id="nickname"
              type="text"
              placeholder="Nickname"
              value={nickname ?? ''}
              onChange={setNickname}
            />
            <IconButtonArrowRight
              id="join"
              type="submit"
              kind="secondary"
              value="OK, Go!"
            />
          </form>
        </div>
      </div>
    </Page>
  )
}

export default JoinPage
