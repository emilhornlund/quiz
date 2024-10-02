import React, { FC, useMemo, useState } from 'react'

import RocketImage from '../../assets/images/rocket.svg'
import { Button, Page, TextField } from '../../components'

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
    <Page>
      <div className={styles.main}>
        <div className={styles.image}>
          <img src={RocketImage} alt="rocket" />
        </div>
        <div className={styles.title}>Let’s play</div>
        <div className={styles.message}>{message}</div>
        <div className={styles.form}>
          <form onSubmit={handleJoinSubmit}>
            <TextField
              id="game-pin"
              type="text"
              placeholder="Game PIN"
              value={gamePIN ?? ''}
              onChange={handleGamePINChange}
            />
            <Button id="join" type="submit" kind="secondary" value="Join" />
          </form>
        </div>
      </div>
    </Page>
  )
}

export default HomePage
