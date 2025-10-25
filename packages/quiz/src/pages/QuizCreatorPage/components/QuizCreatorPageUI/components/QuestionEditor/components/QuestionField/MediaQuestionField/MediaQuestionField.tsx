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
import React, { FC, useState } from 'react'

import {
  Button,
  MediaModal,
  ResponsiveImage,
  ResponsivePlayer,
} from '../../../../../../../../../components'
import ImageEffectModal from '../../../../../../../../../components/ImageEffectModal/ImageEffectModal.tsx'

import styles from './MediaQuestionField.module.scss'

export interface MediaQuestionFieldProps {
  value?: QuestionMediaDto
  onChange: (value?: QuestionMediaDto) => void
  onValid: (valid: boolean) => void
}

const MediaQuestionField: FC<MediaQuestionFieldProps> = ({
  value,
  onChange,
  onValid,
}) => {
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [showImageEffectModal, setShowImageEffectModal] = useState(false)

  const handleDelete = () => {
    onChange(undefined)
    onValid(true)
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

  return (
    <>
      <div className={styles.mediaQuestionField}>
        {value ? (
          <div className={styles.previewWrapper}>
            <div className={styles.preview}>
              {value.type === MediaType.Image && (
                <ResponsiveImage
                  imageURL={value.url}
                  {...(value.effect
                    ? { revealEffect: { type: value.effect } }
                    : {})}
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
          onChange={onChange}
          onValid={onValid}
          onClose={() => setShowMediaModal(false)}
        />
      )}
      {showImageEffectModal && (
        <ImageEffectModal
          onClose={() => setShowImageEffectModal(false)}
          onChangeImageEffect={onChangeImageEffect}
        />
      )}
    </>
  )
}

export default MediaQuestionField
