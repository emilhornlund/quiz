import React, { FC } from 'react'

import { NicknameChip } from '../index.ts'

import styles from './Podium.module.scss'

export interface PodiumValue {
  position: number
  nickname?: string
  score?: number
}

export interface PodiumProps {
  values: PodiumValue[]
}

const Stack: FC<PodiumValue> = ({ position, nickname, score }) => (
  <div className={styles.column}>
    {[...Array(position - 1).keys()].map((key) => (
      <div key={key} className={styles.spacer} />
    ))}
    <div className={styles.nickname}>
      {nickname && <NicknameChip value={nickname} />}
    </div>
    <div className={styles.stack}>
      <div className={styles.position}>{position}</div>
      <div className={styles.score}>{score}</div>
    </div>
  </div>
)

const Podium: FC<PodiumProps> = ({ values }) => (
  <div className={styles.main}>
    <Stack
      position={2}
      nickname={values?.[1]?.nickname}
      score={values?.[1]?.score}
    />
    <Stack
      position={1}
      nickname={values?.[0]?.nickname}
      score={values?.[0]?.score}
    />
    <Stack
      position={3}
      nickname={values?.[2]?.nickname}
      score={values?.[2]?.score}
    />
  </div>
)

export default Podium
