import {
  faPlus,
  faRetweet,
  faTrash,
  faWandMagicSparkles,
} from '@fortawesome/free-solid-svg-icons'
import {
  MediaType,
  QuestionImageRevealEffectType,
  QuestionMediaDto,
} from '@quiz/common'
import React, { FC, useMemo, useState } from 'react'

import {
  Button,
  MediaModal,
  ResponsiveImage,
  ResponsivePlayer,
} from '../../../../../../../../../components'
import { RevealEffect } from '../../../../../../../../../components/ResponsiveImage'
import { QuizQuestionValidationResult } from '../../../../../../../utils/QuestionDataSource'
import { getValidationErrorMessage } from '../../../../../../../validation-rules'

import { ImageEffectModal } from './components'
import styles from './MediaQuestionField.module.scss'

export interface MediaQuestionFieldProps {
  value?: QuestionMediaDto
  duration?: number
  validation: QuizQuestionValidationResult
  onChange: (value?: QuestionMediaDto) => void
}

const MediaQuestionField: FC<MediaQuestionFieldProps> = ({
  value,
  duration,
  validation,
  onChange,
}) => {
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [showImageEffectModal, setShowImageEffectModal] = useState(false)

  const handleDelete = () => {
    onChange(undefined)
  }

  const onChangeImageEffect = (
    effect: QuestionImageRevealEffectType | undefined,
  ) => {
    if (!value) return
    onChange({
      ...value,
      ...(value.type === MediaType.Image ? { effect } : {}),
    })
  }

  const revealEffect = useMemo<RevealEffect | undefined>(() => {
    if (value?.type !== MediaType.Image || !value.effect || !duration) {
      return undefined
    }
    const now = Date.now()
    return {
      type: value.effect,
      countdown: {
        initiatedTime: new Date(now).toISOString(),
        expiryTime: new Date(now + duration * 1000).toISOString(),
        serverTime: new Date(now).toISOString(),
      },
    }
  }, [value, duration])

  return (
    <>
      <div className={styles.mediaQuestionField}>
        {value ? (
          <div className={styles.previewWrapper}>
            <div className={styles.preview}>
              {value.type === MediaType.Image && (
                <ResponsiveImage
                  imageURL={value.url}
                  {...(value.effect ? { revealEffect } : {})}
                />
              )}
              {(value.type === MediaType.Video ||
                value.type === MediaType.Audio) && (
                <ResponsivePlayer
                  url={value.url}
                  grow={false}
                  playing={false}
                />
              )}
            </div>
            <div className={styles.actions}>
              <Button
                id="delete-media-button"
                type="button"
                kind="destructive"
                size="small"
                value="Delete"
                icon={faTrash}
                onClick={handleDelete}
              />
              <Button
                id="add-media-button"
                type="button"
                kind="call-to-action"
                size="small"
                value="Replace"
                icon={faRetweet}
                onClick={() => setShowMediaModal(true)}
              />
              {value.type === MediaType.Image && (
                <Button
                  id="add-image-effect-button"
                  type="button"
                  kind="primary"
                  size="small"
                  value="Image Effect"
                  icon={faWandMagicSparkles}
                  onClick={() => setShowImageEffectModal(true)}
                />
              )}
            </div>
          </div>
        ) : (
          <Button
            id="add-media-button"
            type="button"
            kind="call-to-action"
            size="small"
            value="Add media"
            icon={faPlus}
            onClick={() => setShowMediaModal(true)}
          />
        )}
      </div>
      {showMediaModal && (
        <MediaModal
          type={value?.type}
          url={value?.url}
          customErrorMessages={{
            type: getValidationErrorMessage(validation, 'media.type'),
            url: getValidationErrorMessage(validation, 'media.url'),
          }}
          onChange={onChange}
          onClose={() => setShowMediaModal(false)}
        />
      )}
      {value?.type === MediaType.Image && showImageEffectModal && (
        <ImageEffectModal
          value={value.effect}
          validation={validation}
          onClose={() => setShowImageEffectModal(false)}
          onChangeImageEffect={onChangeImageEffect}
        />
      )}
    </>
  )
}

export default MediaQuestionField
