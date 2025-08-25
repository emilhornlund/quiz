import React, { FC } from 'react'

import ResponsiveImage from '../../../ResponsiveImage'

import styles from './AnswerPin.module.scss'

export type AnswerPinProps = {
  imageURL: string
  interactive: boolean
  onClick: (optionIndex: number) => void
}

const AnswerPin: FC<AnswerPinProps> = ({ imageURL, interactive, onClick }) => (
  <div className={styles.main}>
    {/*<ResponsiveImage imageURL={imageURL} />*/}#
  </div>
)

export default AnswerPin
