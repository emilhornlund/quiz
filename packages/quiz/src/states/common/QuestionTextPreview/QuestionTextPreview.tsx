import React, { FC } from 'react'

import { Typography } from '../../../components'

import styles from './QuestionTextPreview.module.scss'

export type QuestionTextPreviewProps = { text: string }

const QuestionTextPreview: FC<QuestionTextPreviewProps> = ({ text }) => {
  return (
    <div className={styles.questionTextContainer}>
      <Typography variant="title" size="medium">
        {text}
      </Typography>
    </div>
  )
}

export default QuestionTextPreview
