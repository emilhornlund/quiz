import { MessageDto } from '@quiz/common'
import React, { FC, useState } from 'react'

import viteLogo from '/vite.svg'

import reactLogo from '../../assets/react.svg'

import styles from './App.module.scss'

const App: FC = () => {
  const [message, setMessage] = useState<string>()

  const handleClickFetchMessage = () => {
    fetch('/quiz-service/api/hello')
      .then((response) => {
        if (response.ok) {
          return response.json()
        }
        throw new Error('Api Error')
      })
      .then((data) => data as MessageDto)
      .then(({ value }) => value)
      .then(setMessage)
  }

  return (
    <div className={styles.main}>
      <div>
        <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
          <img src={viteLogo} className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank" rel="noreferrer">
          <img
            src={reactLogo}
            className={[styles.logo, styles.react].join(' ')}
            alt="React logo"
          />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className={styles.card}>
        <button onClick={handleClickFetchMessage} data-testid="fetch-button">
          {message ?? 'Fetch'}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={styles.readTheDocs}>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  )
}

export default App
