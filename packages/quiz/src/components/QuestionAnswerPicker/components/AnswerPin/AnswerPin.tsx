import { faRocket } from '@fortawesome/free-solid-svg-icons'
import React, { FC, useState } from 'react'

import Button from '../../../Button'
import PinImage from '../../../PinImage'
import ResponsiveImage from '../../../ResponsiveImage'

import styles from './AnswerPin.module.scss'

export type AnswerPinProps = {
  imageURL: string
  interactive: boolean
  onSubmit: (pos: { x: number; y: number }) => void
}

const AnswerPin: FC<AnswerPinProps> = ({ imageURL, interactive, onSubmit }) => {
  const [position, setPosition] = useState<{ x: number; y: number }>({
    x: 0.5,
    y: 0.5,
  })

  const handleSubmit = () => {
    onSubmit(position)
  }

  return (
    <div className={styles.main}>
      {interactive ? (
        <div className={styles.interactive}>
          <PinImage
            value={{ x: 0.5, y: 0.5 }}
            imageURL={imageURL}
            onChange={setPosition}
          />
          <div className={styles.buttonWrapper}>
            <Button
              id="submit-button"
              type="button"
              kind="call-to-action"
              icon={faRocket}
              onClick={handleSubmit}>
              Submit My Pin
            </Button>
          </div>
        </div>
      ) : (
        <ResponsiveImage imageURL={imageURL} />
      )}
    </div>
  )
}

export default AnswerPin
