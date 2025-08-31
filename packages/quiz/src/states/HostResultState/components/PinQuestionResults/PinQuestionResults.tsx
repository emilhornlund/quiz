import { GameEventQuestionResultsPin } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import { PinColor, PinImage, PinImageValue } from '../../../../components'

import styles from './PinQuestionResults.module.scss'

export type PinQuestionResultsProps = {
  results: GameEventQuestionResultsPin
}

const toPinLocation = (position: string): { x: number; y: number } => {
  const [x, y] = position.split(',').map(Number)
  return { x, y }
}

const PinQuestionResults: FC<PinQuestionResultsProps> = ({ results }) => {
  const value = useMemo<PinImageValue>(
    () => ({
      x: results.positionX,
      y: results.positionY,
      tolerance: results.tolerance,
      color: PinColor.Blue,
    }),
    [results],
  )

  const values = useMemo<PinImageValue[]>(() => {
    return results.distribution.map(({ value, correct }) => ({
      ...toPinLocation(value),
      color: correct ? PinColor.Green : PinColor.Red,
    }))
  }, [results.distribution])

  return (
    <div className={styles.pinQuestionResults}>
      <PinImage
        value={value}
        values={values}
        imageURL={results.imageURL}
        disabled
      />
    </div>
  )
}

export default PinQuestionResults
