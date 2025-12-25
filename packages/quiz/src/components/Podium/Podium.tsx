import type { CSSProperties, FC } from 'react'
import { useMemo } from 'react'

import Confetti, { type ConfettiIntensity } from '../Confetti'
import NicknameChip from '../NicknameChip'

import styles from './Podium.module.scss'

export interface PodiumValue {
  position: number
  nickname?: string
  score?: number
}

export interface PodiumProps {
  values: PodiumValue[]
}

interface StackProps extends PodiumValue {
  animationIndex: number
}

type CelebrationLevel = 'none' | ConfettiIntensity

const getCelebrationLevel = (position: number): CelebrationLevel => {
  switch (position) {
    case 1:
      return 'epic' // 1st place gets epic celebration
    case 2:
      return 'major' // 2nd place gets major celebration
    case 3:
      return 'normal' // 3rd place gets normal celebration
    default:
      return 'none'
  }
}

const Stack: FC<StackProps> = ({
  position,
  nickname,
  score,
  animationIndex,
}) => (
  <div
    className={styles.column}
    style={{ '--position-index': animationIndex } as CSSProperties}>
    {[...Array(position - 1).keys()].map((key) => (
      <div key={key} className={styles.spacer} />
    ))}
    <div className={styles.nickname}>
      {nickname && <NicknameChip value={nickname} />}
      {position === 1 && <div className={styles.crown}>👑</div>}
    </div>
    <div className={styles.stackContainer}>
      <div className={styles.stack}>
        <div
          className={`${styles.position} ${styles[`position-${position}`] || ''}`}>
          {position}
        </div>
        <div className={styles.score}>{score}</div>
        {position === 1 && (
          <div className={styles.sparkleContainer}>
            <div
              className={styles.sparkle}
              style={
                {
                  '--sparkle-delay': '0s',
                  '--sparkle-x': `50%`,
                  '--sparkle-y': `50%`,
                } as CSSProperties
              }
            />

            {[...Array(6)].map((_, i) => {
              // eslint-disable-next-line react-hooks/purity
              const x = 10 + Math.random() * 80
              // eslint-disable-next-line react-hooks/purity
              const y = 10 + Math.random() * 30

              return (
                <div
                  key={i}
                  className={styles.sparkle}
                  style={
                    {
                      '--sparkle-delay': `${i * 0.2}s`,
                      '--sparkle-x': `${x}%`,
                      '--sparkle-y': `${y}%`,
                    } as CSSProperties
                  }
                />
              )
            })}
          </div>
        )}
      </div>
    </div>
  </div>
)

const Podium: FC<PodiumProps> = ({ values }) => {
  const celebrationLevel = useMemo(() => {
    const level = getCelebrationLevel(1)
    if (level !== 'none') {
      return level
    }
    return undefined
  }, [])

  return (
    <div className={styles.main}>
      <Stack
        position={2}
        nickname={values?.[1]?.nickname}
        score={values?.[1]?.score}
        animationIndex={1}
      />
      <Stack
        position={1}
        nickname={values?.[0]?.nickname}
        score={values?.[0]?.score}
        animationIndex={2}
      />
      <Stack
        position={3}
        nickname={values?.[2]?.nickname}
        score={values?.[2]?.score}
        animationIndex={0}
      />
      {celebrationLevel && (
        <Confetti trigger={true} intensity={celebrationLevel} />
      )}
    </div>
  )
}

export default Podium
