import React, { FC, useMemo, useState } from 'react'

import {
  IconButtonArrowRight,
  Page,
  RocketImage,
  TextField,
  Typography,
} from '../../components'

import styles from './HomePage.module.scss'

const MESSAGES = [
  'Ready to show off your skills? Let’s go!',
  'Think you’ve got what it takes?',
  'The clock is ticking! Are you prepared?',
  'Time to put your knowledge to the test!',
  'Get your game face on. It’s time to win!',
  'Eyes on the prize! Are you ready?',
]

const HomePage: FC = () => {
  const [gamePIN, setGamePIN] = useState<number>()

  const message = useMemo(
    () =>
      `Do you feel confident? ${MESSAGES[Math.floor(Math.random() * MESSAGES.length)]}`,
    [],
  )

  const handleGamePINChange = (newGamePIN: string) => {
    if (newGamePIN.length == 0) {
      setGamePIN(undefined)
    }
    const parsedGamePIN = parseInt(newGamePIN, 10)
    if (parsedGamePIN) {
      setGamePIN(parsedGamePIN)
    }
  }

  const handleJoinSubmit = () => undefined

  return (
    <Page
      header={
        <a
          href="https://github.com/emilhornlund/quiz"
          target="_blank"
          rel="noreferrer">
          GitHub
        </a>
      }>
      <RocketImage />
      <Typography variant="title" size="medium">
        Let’s play
      </Typography>
      <Typography variant="text" size="small">
        {message}
      </Typography>
      <form className={styles.joinForm} onSubmit={handleJoinSubmit}>
        <TextField
          id="game-pin"
          type="text"
          placeholder="Game PIN"
          value={gamePIN ?? ''}
          onChange={handleGamePINChange}
        />
        <IconButtonArrowRight
          id="join"
          type="submit"
          kind="secondary"
          value="Join the game"
        />
      </form>
    </Page>
  )
}

export default HomePage
