import { MediaType, QuestionMediaEvent, QuestionType } from '@quiz/common'
import React, { FC, useMemo } from 'react'

import ResponsiveImage from '../../../components/ResponsiveImage'
import ResponsivePlayer from '../../../components/ResponsivePlayer'

import styles from './QuestionMedia.module.scss'

export type QuestionMediaProps = {
  type: QuestionType
  media?: QuestionMediaEvent
  alt?: string
}

const QuestionMedia: FC<QuestionMediaProps> = ({ type, media, alt }) => {
  const imageURL = useMemo(() => {
    if (type !== QuestionType.Pin && media?.type === MediaType.Image) {
      return media.url
    }
    return null
  }, [type, media])

  const audioOrVideoURL = useMemo(() => {
    if (
      type !== QuestionType.Pin &&
      (media?.type === MediaType.Audio || media?.type === MediaType.Video)
    ) {
      return media?.url
    }
    return null
  }, [type, media])

  if (!imageURL && !audioOrVideoURL) return null

  return (
    <div className={styles.questionMedia} data-testid="question-media">
      {imageURL && <ResponsiveImage imageURL={imageURL} alt={alt} />}
      {audioOrVideoURL && <ResponsivePlayer url={audioOrVideoURL} />}
    </div>
  )
}

export default QuestionMedia
