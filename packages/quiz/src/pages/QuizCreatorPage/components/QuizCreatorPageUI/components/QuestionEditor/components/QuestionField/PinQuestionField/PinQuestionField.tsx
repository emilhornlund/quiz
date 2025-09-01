import { faPlus, faRetweet, faTrash } from '@fortawesome/free-solid-svg-icons'
import { MediaType, QuestionPinDto, QuestionPinTolerance } from '@quiz/common'
import React, { FC, useEffect, useState } from 'react'

import {
  Button,
  ConfirmDialog,
  MediaModal,
  PinImage,
} from '../../../../../../../../../components'

import styles from './PinQuestionField.module.scss'

export type PinQuestionFieldSubfields = Pick<
  QuestionPinDto,
  'imageURL' | 'positionX' | 'positionY'
>

export type PinQuestionFieldProps = {
  imageURL?: string
  position?: { x?: number; y?: number }
  tolerance?: QuestionPinTolerance
  onImageUrlChange: (value?: string) => void
  onImageUrlValid: (valid: boolean) => void
  onPositionChange: (value?: { x: number; y: number }) => void
  onPositionValid: (valid: boolean) => void
}

const PinQuestionField: FC<PinQuestionFieldProps> = ({
  imageURL,
  position,
  tolerance,
  onImageUrlChange,
  onImageUrlValid,
  onPositionChange,
  onPositionValid,
}) => {
  const [showMediaModal, setShowMediaModal] = useState(false)
  const [showConfirmDeleteImage, setShowConfirmDeleteImage] = useState(false)

  useEffect(() => {
    console.log('showMediaModal', showMediaModal)
  }, [showMediaModal])

  return (
    <>
      <div className={styles.pinQuestionField}>
        {imageURL ? (
          <PinImage
            imageURL={imageURL}
            value={{ x: position?.x ?? 0.5, y: position?.y ?? 0.5, tolerance }}
            alt={imageURL}
            onChange={onPositionChange}
            onValid={onPositionValid}>
            <div className={styles.overlay}>
              <div className={styles.actions}>
                <Button
                  id="replace-image-button"
                  type="button"
                  kind="call-to-action"
                  size="small"
                  icon={faRetweet}
                  onClick={() => {
                    console.log('FOOO')
                    setShowMediaModal(true)
                  }}
                />
                <Button
                  id="delete-image-button"
                  type="button"
                  kind="destructive"
                  size="small"
                  icon={faTrash}
                  onClick={() => setShowConfirmDeleteImage(true)}
                />
              </div>
            </div>
          </PinImage>
        ) : (
          <Button
            id="add-image-button"
            type="button"
            kind="call-to-action"
            size="small"
            value="Add Pin Image"
            icon={faPlus}
            onClick={() => setShowMediaModal(true)}
          />
        )}
      </div>
      {showMediaModal && (
        <MediaModal
          title="Add Pin Image"
          type={MediaType.Image}
          url={imageURL}
          onChange={(newValue) => onImageUrlChange(newValue?.url)}
          onValid={onImageUrlValid}
          onClose={() => setShowMediaModal(false)}
          imageOnly
        />
      )}

      <ConfirmDialog
        title="Confirm Remove Image"
        message="Are you sure you want to remove this image?"
        open={showConfirmDeleteImage}
        confirmTitle="Yes"
        closeTitle="No"
        onConfirm={() => {
          onImageUrlChange(undefined)
          onImageUrlValid(false)
          setShowConfirmDeleteImage(false)
        }}
        onClose={() => setShowConfirmDeleteImage(false)}
        destructive
      />
    </>
  )
}

export default PinQuestionField
